// components/notifications/useNotifications.js
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase"

/**
 * @param {string} userId   - auth.users UUID (session.user.id)
 * @param {string} role     - 'user' | 'org_admin' | 'super_admin'
 */
export function useNotifications({ userId, role }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(true)
  const channelRef                        = useRef(null)

  // ── Helper: is this notification considered "read" by the current user? ──
  const isReadByMe = useCallback((n) => {
    if (n.recipient_user_id === null) {
      // broadcast: check read_by array
      return Array.isArray(n.read_by) && n.read_by.includes(userId)
    }
    return n.is_read
  }, [userId])

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!userId || !role) return
    setLoading(true)
    try {
      let query = supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(60)

      if (role === "super_admin") {
        // targeted to me OR broadcasts to super_admin role
        query = query.or(`recipient_user_id.eq.${userId},and(recipient_user_id.is.null,recipient_role.eq.super_admin)`)
      } else {
        query = query.eq("recipient_user_id", userId)
      }

      const { data, error } = await query
      if (error) throw error
      setNotifications(data || [])
    } catch (err) {
      console.error("[useNotifications] fetch error:", err.message)
    } finally {
      setLoading(false)
    }
  }, [userId, role])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // ── Realtime subscription (free tier — no filter, client-side guard) ──────
  useEffect(() => {
    if (!userId || !role) return

    // Tear down old channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    channelRef.current = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const n = payload.new
          // Is this notification meant for me?
          const isForMe =
            n.recipient_user_id === userId ||
            (n.recipient_user_id === null && n.recipient_role === role)
          if (isForMe) {
            setNotifications((prev) => [n, ...prev])
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications" },
        (payload) => {
          const n = payload.new
          setNotifications((prev) =>
            prev.map((item) => (item.id === n.id ? n : item))
          )
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "notifications" },
        (payload) => {
          setNotifications((prev) => prev.filter((item) => item.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [userId, role])

  // ── Mark single notification as read ─────────────────────────────────────
  const markRead = useCallback(async (id) => {
    const notif = notifications.find((n) => n.id === id)
    if (!notif || isReadByMe(notif)) return

    if (notif.recipient_user_id === null) {
      // Broadcast: append current userId to read_by array
      const newReadBy = [...(notif.read_by || []), userId]
      const { error } = await supabase
        .from("notifications")
        .update({ read_by: newReadBy })
        .eq("id", id)
      if (!error) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read_by: newReadBy } : n))
        )
      }
    } else {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
      if (!error) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        )
      }
    }
  }, [notifications, userId, isReadByMe])

  // ── Mark all as read ──────────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    const unread = notifications.filter((n) => !isReadByMe(n))
    if (unread.length === 0) return

    // Targeted notifications
    const targetedIds = unread
      .filter((n) => n.recipient_user_id !== null)
      .map((n) => n.id)

    // Broadcast notifications
    const broadcastIds = unread
      .filter((n) => n.recipient_user_id === null)
      .map((n) => n.id)

    const promises = []

    if (targetedIds.length > 0) {
      promises.push(
        supabase.from("notifications").update({ is_read: true }).in("id", targetedIds)
      )
    }

    for (const id of broadcastIds) {
      const notif = notifications.find((n) => n.id === id)
      const newReadBy = [...(notif?.read_by || []), userId]
      promises.push(
        supabase.from("notifications").update({ read_by: newReadBy }).eq("id", id)
      )
    }

    await Promise.all(promises)

    // Update local state
    setNotifications((prev) =>
      prev.map((n) => {
        if (targetedIds.includes(n.id)) return { ...n, is_read: true }
        if (broadcastIds.includes(n.id)) {
          return { ...n, read_by: [...(n.read_by || []), userId] }
        }
        return n
      })
    )
  }, [notifications, userId, isReadByMe])

  // ── Delete a single notification ──────────────────────────────────────────
  const deleteOne = useCallback(async (id) => {
    await supabase.from("notifications").delete().eq("id", id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  // ── Clear all (targeted only — don't delete shared broadcasts) ───────────
  const clearAll = useCallback(async () => {
    const targeted = notifications.filter((n) => n.recipient_user_id === userId)
    if (targeted.length === 0) return
    await supabase.from("notifications").delete().in("id", targeted.map((n) => n.id))
    setNotifications((prev) => prev.filter((n) => n.recipient_user_id !== userId))
  }, [notifications, userId])

  // ── Derived counts ────────────────────────────────────────────────────────
  const unreadCount = notifications.filter((n) => !isReadByMe(n)).length

  return {
    notifications,
    unreadCount,
    loading,
    isReadByMe,
    markRead,
    markAllRead,
    deleteOne,
    clearAll,
    refetch: fetchNotifications,
  }
}