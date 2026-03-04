"use client"

import { createContext, useContext, useState, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase"
import AchievementToast from "./acheivementToast"
import { AnimatePresence } from "framer-motion"

const AchievementContext = createContext(null)

export function AchievementProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const dismissTimers = useRef({})

  /**
   * Grant an achievement to a user.
   * Idempotent — calling it twice with the same achievementId is safe.
   *
   * @param {object} opts
   * @param {string}  opts.userId        - Supabase auth UUID
   * @param {string}  opts.achievementId - Unique snake_case key  e.g. "myth_buster"
   * @param {string}  opts.title         - Display name
   * @param {string}  opts.description   - Short flavour text
   * @param {number}  [opts.rewardPoints]
   * @param {string}  [opts.icon]        - Filename hint (optional, cosmetic only)
   */

  const dismissToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId))
    clearTimeout(dismissTimers.current[toastId])
    delete dismissTimers.current[toastId]
  }, [])

    const grantAchievement = useCallback(async ({
    userId,
    achievementId,
    title,
    description,
    rewardPoints = 0,
    icon = null,
  }) => {
    if (!userId || !achievementId) return

    try {
      // 1. Fetch current metadata
      const { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("achievements_metadata")
        .eq("user_id", userId)
        .single()

      if (fetchError) {
        console.error("[Achievement] fetch error:", fetchError)
        return
      }

      const existing = userData?.achievements_metadata ?? {}

      // 2. Already earned — skip silently
      if (existing[achievementId]) return

      // 3. Build new entry
      const entry = {
        title,
        description,
        reward_points: rewardPoints,
        icon: icon ?? null,
        earned_at: new Date().toISOString(),
      }

      // 4. Persist
      const { error: updateError } = await supabase
        .from("users")
        .update({
          achievements_metadata: { ...existing, [achievementId]: entry },
        })
        .eq("user_id", userId)

      if (updateError) {
        console.error("[Achievement] update error:", updateError)
        return
      }

      // 5. Show toast
      const toastId = `${achievementId}_${Date.now()}`
      setToasts((prev) => [
        ...prev,
        { id: toastId, title, description, rewardPoints, icon },
      ])

      // Auto-dismiss after 5 s
      dismissTimers.current[toastId] = setTimeout(() => {
        dismissToast(toastId)
      }, 5000)
    } catch (err) {
      console.error("[Achievement] unexpected error:", err)
    }
  }, [])

  return (
    <AchievementContext.Provider value={{ grantAchievement }}>
      {children}

      {/* Toast stack — fixed top-right */}
      <div
        className="fixed top-4 right-4 z-[200] flex flex-col gap-3 pointer-events-none"
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <AchievementToast
              key={toast.id}
              {...toast}
              onDismiss={() => dismissToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </AchievementContext.Provider>
  )
}

/** Use inside any component wrapped by AchievementProvider */
export function useAchievement() {
  const ctx = useContext(AchievementContext)
  if (!ctx) throw new Error("useAchievement must be used inside <AchievementProvider>")
  return ctx
}