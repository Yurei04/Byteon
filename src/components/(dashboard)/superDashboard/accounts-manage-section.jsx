"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Users, Building2, Search, Trash2, ShieldOff, ShieldCheck,
  Loader2, AlertCircle, Calendar, User, RefreshCw,
} from "lucide-react"

export default function AccountManageSection() {
  const [users, setUsers]               = useState([])
  const [orgs, setOrgs]                 = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [search, setSearch]             = useState("")
  const [activeTab, setActiveTab]       = useState("users")
  const [actionLoading, setActionLoading] = useState(null)
  const [deleteDialog, setDeleteDialog] = useState(null)
  const [toast, setToast]               = useState(null)

  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [{ data: u, error: ue }, { data: o, error: oe }] = await Promise.all([
        supabase.from("users").select("*").order("created_at", { ascending: false }),
        supabase.from("organizations").select("*").order("created_at", { ascending: false }),
      ])
      if (ue) throw ue
      if (oe) throw oe
      setUsers(u || [])
      setOrgs(o || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const filteredUsers = useMemo(() =>
    users.filter((u) =>
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.affiliation || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.country || "").toLowerCase().includes(search.toLowerCase())
    ), [users, search])

  const filteredOrgs = useMemo(() =>
    orgs.filter((o) =>
      (o.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.author_name || "").toLowerCase().includes(search.toLowerCase())
    ), [orgs, search])

  const toggleActive = async (id, table, current) => {
    setActionLoading(id)
    const newState = !current
    try {
      const { error } = await supabase
        .from(table)
        .update({ active: newState })
        .eq("id", id)

      if (error) throw error

      // ── Re-fetch from DB to confirm actual state ──────────────────────────
      // Do NOT do optimistic update — re-fetch is the source of truth
      if (table === "users") {
        const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false })
        setUsers(data || [])
      } else {
        const { data } = await supabase.from("organizations").select("*").order("created_at", { ascending: false })
        setOrgs(data || [])
      }

      showToast(
        `Account ${newState ? "reactivated" : "suspended"} successfully. The user must log out and back in for changes to take effect.`,
        "success"
      )
    } catch (err) {
      showToast("Failed to update status: " + err.message, "error")
    } finally {
      setActionLoading(null)
    }
  }

  const confirmDelete = async () => {
    if (!deleteDialog) return
    const { id, table } = deleteDialog
    setActionLoading(id)
    try {
      const { error } = await supabase.from(table).delete().eq("id", id)
      if (error) throw error
      if (table === "users") setUsers((prev) => prev.filter((u) => u.id !== id))
      else setOrgs((prev) => prev.filter((o) => o.id !== id))
      showToast("Account deleted successfully.")
    } catch (err) {
      showToast("Failed to delete: " + err.message, "error")
    } finally {
      setActionLoading(null)
      setDeleteDialog(null)
    }
  }

  return (
    <>
      <div className="space-y-5">

        {/* Toast */}
        {toast && (
          <Alert className={`${toast.type === "error"
            ? "bg-red-900/30 border-red-500/40 text-red-200"
            : "bg-emerald-900/30 border-emerald-500/40 text-emerald-200"}`}>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{toast.msg}</AlertDescription>
          </Alert>
        )}

        {/* Search + Refresh */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fuchsia-400/60" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, affiliation, country…"
              className="pl-10 bg-black/20 border-fuchsia-500/20 text-white placeholder:text-white/30"
            />
          </div>
          <Button
            size="sm"
            onClick={fetchAll}
            disabled={loading}
            variant="outline"
            className="border-fuchsia-500/20 text-fuchsia-300 hover:bg-fuchsia-500/10 shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>

        {error && (
          <Alert className="bg-red-900/20 border-red-500/30">
            <AlertCircle className="w-4 h-4 text-red-300" />
            <AlertDescription className="text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-black/20 border border-fuchsia-500/20 p-1">
            <TabsTrigger value="users"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white flex items-center gap-2">
              <Users className="w-4 h-4" />Users
              <Badge className="ml-1 text-xs bg-blue-500/30 text-blue-200 border-0">{users.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="orgs"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600 data-[state=active]:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4" />Organizations
              <Badge className="ml-1 text-xs bg-fuchsia-500/30 text-fuchsia-200 border-0">{orgs.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-4">
            {loading ? (
              <LoadingState color="blue" />
            ) : filteredUsers.length === 0 ? (
              <EmptyState label="users" search={search} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredUsers.map((user) => (
                  <AccountCard
                    key={user.id}
                    item={user}
                    type="user"
                    actionLoading={actionLoading}
                    onToggle={() => toggleActive(user.id, "users", user.active)}
                    onDelete={() => setDeleteDialog({ id: user.id, name: user.name, table: "users" })}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Orgs Tab */}
          <TabsContent value="orgs" className="mt-4">
            {loading ? (
              <LoadingState color="fuchsia" />
            ) : filteredOrgs.length === 0 ? (
              <EmptyState label="organizations" search={search} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredOrgs.map((org) => (
                  <AccountCard
                    key={org.id}
                    item={org}
                    type="org"
                    actionLoading={actionLoading}
                    onToggle={() => toggleActive(org.id, "organizations", org.active)}
                    onDelete={() => setDeleteDialog({ id: org.id, name: org.name, table: "organizations" })}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDialog} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-900 via-red-900/40 to-rose-900 border-red-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-200">Delete Account</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Permanently delete <strong className="text-red-300">&quot;{deleteDialog?.name}&quot;</strong>?
              This cascades to all associated data and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={!!actionLoading}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function AccountCard({ item, type, actionLoading, onToggle, onDelete }) {
  const isUser   = type === "user"
  // Explicitly check for false — default to active if column missing
  const isActive = item.active !== false

  return (
    <Card className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 backdrop-blur-lg border border-white/10 hover:border-white/20 transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${
              isUser ? "bg-blue-500/20 border-blue-400/30" : "bg-fuchsia-500/20 border-fuchsia-400/30"
            }`}>
              {isUser
                ? <User className="w-5 h-5 text-blue-300" />
                : <Building2 className="w-5 h-5 text-fuchsia-300" />}
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">
                {item.name || <span className="italic text-white/30">Unnamed</span>}
              </p>
              <p className="text-white/40 text-xs">
                {isUser ? item.affiliation || item.country || "—" : item.author_name || "—"}
              </p>
            </div>
          </div>
          <Badge className={`text-xs border ${
            isActive
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              : "bg-red-500/20 text-red-300 border-red-500/30"
          }`}>
            {isActive ? "Active" : "Suspended"}
          </Badge>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-3 mb-4 text-xs text-white/40">
          {isUser ? (
            <>
              <span>Projects: <strong className="text-white/70">{item.total_projects ?? 0}</strong></span>
              <span>Hackathons: <strong className="text-white/70">{item.total_hackathons_joined ?? 0}</strong></span>
              <span>Blogs read: <strong className="text-white/70">{item.total_blogs_read ?? 0}</strong></span>
            </>
          ) : (
            <>
              <span>Posts: <strong className="text-white/70">{item.total_announcements ?? 0}</strong></span>
              <span>Blogs: <strong className="text-white/70">{item.total_blogs ?? 0}</strong></span>
              <span>Resources: <strong className="text-white/70">{item.total_resources ?? 0}</strong></span>
            </>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(item.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onToggle}
            disabled={actionLoading === item.id}
            className={`flex-1 text-xs h-8 ${
              isActive
                ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30"
                : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30"
            }`}
          >
            {actionLoading === item.id ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : isActive ? (
              <><ShieldOff className="w-3 h-3 mr-1" />Suspend</>
            ) : (
              <><ShieldCheck className="w-3 h-3 mr-1" />Reactivate</>
            )}
          </Button>
          <Button
            size="sm"
            onClick={onDelete}
            disabled={actionLoading === item.id}
            className="h-8 bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingState({ color }) {
  return (
    <div className="flex justify-center py-16">
      <Loader2 className={`w-8 h-8 animate-spin text-${color}-300`} />
    </div>
  )
}

function EmptyState({ label, search }) {
  return (
    <div className="text-center py-16 text-white/30">
      <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
      <p>{search ? `No ${label} match "${search}"` : `No ${label} found`}</p>
    </div>
  )
}