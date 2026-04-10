"use client"

import React, { useEffect, useState, useMemo, useRef } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import {
  Plus, FileText, User2,
  BookOpen, Eye, Loader2, Bell,
  ShieldAlert, XCircle, Trash2,
  LogOut,
  ShieldCheck,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"

import { useAuth }            from "@/components/(auth)/authContext"
import UserProfile            from "@/components/(dashboard)/userDashboard/profile"
import BlogEmpty              from "@/components/blog/blog-empty"
import BlogCard               from "@/components/blog/blogCard"
import PendingBlogUserForm    from "@/components/blog/blog-pending-user"
import { ReturnButton }       from "@/components/return"
import NotificationsTab          from "@/components/notifications/notification-tab"
import { useNotifications }      from "@/components/notifications/use-notification"
import { notifyBlogDeletedByUser } from "@/lib/notification"

import { Toast } from "../toast"
import { useToast } from "@/components/use-toast"

const ITEMS_PER_PAGE = 6

export default function UserDashboardPage() {
  const router = useRouter()
  const { profile, role, loading: authLoading, isLoggedIn } = useAuth()

  const [activeTab, setActiveTab]       = useState("profile")
  const [blogs, setBlogs]               = useState([])
  const [blogsLoading, setBlogsLoading] = useState(false)
  const [currentPage, setCurrentPage]   = useState(1)

  const realtimeChannelRef = useRef(null)

  const { unreadCount } = useNotifications({ userId: profile?.user_id || null, role: "user" })

  const [deleteDialog, setDeleteDialog]   = useState(null)
  const [deleteReason, setDeleteReason]   = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  const { toasts, addToast, removeToast } = useToast()

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return
    if (isLoggedIn && role === null) return
    if (!isLoggedIn) { router.push("/log-in"); return }
    if (role !== "user") { router.push("/unauthorized"); return }
  }, [authLoading, isLoggedIn, role, router])

  useEffect(() => {
    if (!profile?.id || !profile?.user_id) return
    fetchBlogs(profile.id)
    return () => { if (realtimeChannelRef.current) supabase.removeChannel(realtimeChannelRef.current) }
  }, [profile?.id, profile?.user_id])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && profile?.id) fetchBlogs(profile.id)
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [profile?.id])

  const fetchBlogs = async (bigintUserId) => {
    setBlogsLoading(true)
    try {
      const { data, error } = await supabase
        .from("blogs").select("*").eq("user_id", bigintUserId).order("created_at", { ascending: false })
      if (error) throw error
      setBlogs(data || [])
    } catch (err) { console.error("fetchBlogs error:", err) }
    finally { setBlogsLoading(false) }
  }

  const handleBlogUpdate = () => profile?.id && fetchBlogs(profile.id)

  const openDeleteDialog = (id) => {
    const blog = blogs.find((b) => b.id === id)
    if (!blog) return
    setDeleteReason("")
    setDeleteDialog(blog)
  }

  const handleConfirmedDelete = async () => {
    if (!deleteDialog?.id) return
    setActionLoading(true)
    try {
      const { error } = await supabase.from("blogs").delete().eq("id", deleteDialog.id)
      if (error) throw error
      handleBlogUpdate()
      await notifyBlogDeletedByUser({
        userName:  profile?.name  || "A user",
        blogTitle: deleteDialog.title || "Untitled",
      })
      setDeleteDialog(null)
      setDeleteReason("")
      addToast("success", "Blog deleted successfully.")
    } catch (err) {
      console.error("Delete error:", err)
      addToast("error", "Failed to delete. Please try again.")
    } finally {
      setActionLoading(false)
    }
  }

  const closeDeleteDialog = () => {
    if (actionLoading) return
    setDeleteDialog(null)
    setDeleteReason("")
  }

  const paginatedBlogs   = useMemo(() =>
    blogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [blogs, currentPage]
  )
  const totalPages       = Math.ceil(blogs.length / ITEMS_PER_PAGE)
  const handlePageChange = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page) }

  if (authLoading || (isLoggedIn && role === null)) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-fuchsia-300" />
      </div>
    )
  }
  if (!isLoggedIn || role !== "user") return null

  const TABS = [
    { value: "profile",       icon: <User2    className="w-4 h-4" />, label: "Profile"  },
    { value: "myBlog",        icon: <BookOpen className="w-4 h-4" />, label: "My Blogs" },
    { value: "create",        icon: <Plus     className="w-4 h-4" />, label: "Create"   },
    {
      value: "notifications",
      icon:  <Bell className="w-4 h-4" />,
      label: (
        <span className="flex items-center gap-1">
          Alerts
          {unreadCount > 0 && (
            <span className="min-w-[17px] h-[17px] flex items-center justify-center rounded-full
              bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white text-[10px] font-bold px-1
              shadow-sm shadow-fuchsia-500/40">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </span>
      ),
    },
  ]

  return (
    <div className="w-full min-h-screen p-4 md:p-6 lg:p-8">
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* ── Top bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full flex justify-between items-center max-w-7xl mx-auto mb-6 gap-4"
      >
        <ReturnButton />
        <div className="flex-1 bg-gradient-to-r from-fuchsia-900/40 to-purple-900/40 backdrop-blur-lg border border-fuchsia-500/30 py-2.5 px-4 rounded-lg shadow-lg shadow-fuchsia-500/10">
          <p className="text-fuchsia-200 text-sm text-center flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-fuchsia-400" />
            Participants Panel
          </p>
        </div>
        <Button
          onClick={() => router.push("/log-in")}
          variant="outline" size="sm"
          className="shrink-0 border-red-500/40 text-red-300 hover:bg-red-500/20 hover:border-red-400 hover:text-red-200 transition-all gap-2"
        >
          <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Sign Out</span>
        </Button>
      </motion.div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* ── HEADER ── */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-purple-300 to-pink-300">
                Participant&apos;s Dashboard
              </span>
            </h1>
            <p className="text-fuchsia-200/70 text-sm sm:text-base max-w-2xl mx-auto">
              Manage your profile, create engaging blog posts, and track your content all in one place
            </p>
          </div>

          {/* ── MAIN TABS ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-fuchsia-950/40 via-purple-950/40 to-slate-950/40 backdrop-blur-xl border border-fuchsia-500/20 shadow-2xl">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-6 sm:mb-8 bg-black/30 border border-fuchsia-500/20 p-1 h-auto rounded-xl">
                    {TABS.map(({ value, icon, label }) => (
                      <TabsTrigger key={value} value={value}
                        className="flex items-center justify-center gap-2
                          data-[state=active]:bg-gradient-to-r
                          data-[state=active]:from-fuchsia-600
                          data-[state=active]:to-purple-600
                          data-[state=active]:text-white
                          transition-all rounded-lg py-3 text-xs sm:text-sm">
                        {icon}
                        <span className="hidden sm:inline">{label}</span>
                        <span className="sm:hidden">{label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* ── Profile ── */}
                  <TabsContent value="profile" className="mt-0">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="bg-black/20 backdrop-blur-lg border border-fuchsia-500/10">
                        <CardContent className="p-4 sm:p-6">
                          <UserProfile
                            currentUser={profile?.user_id}
                            authUserId={profile?.id}
                          />
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  {/* ── My Blogs ── */}
                  <TabsContent value="myBlog" className="mt-0">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="bg-black/20 backdrop-blur-lg border border-fuchsia-500/10">
                        <CardContent className="p-4 sm:p-6">
                          {blogsLoading ? (
                            <div className="flex justify-center py-12">
                              <Loader2 className="w-8 h-8 animate-spin text-fuchsia-300" />
                            </div>
                          ) : blogs.length === 0 ? (
                            <BlogEmpty />
                          ) : (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {paginatedBlogs.map((item) => (
                                  <BlogCard
                                    key={item.id}
                                    item={item}
                                    onUpdate={handleBlogUpdate}
                                    onDelete={(id) => openDeleteDialog(id)}
                                  />
                                ))}
                              </div>
                              {totalPages > 1 && (
                                <Pagination>
                                  <PaginationContent>
                                    <PaginationItem>
                                      <PaginationPrevious
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        className={currentPage > 1 ? "cursor-pointer hover:bg-fuchsia-800/20" : "pointer-events-none opacity-50"}
                                      />
                                    </PaginationItem>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                      <PaginationItem key={page}>
                                        <PaginationLink
                                          onClick={() => handlePageChange(page)}
                                          isActive={page === currentPage}
                                          className={`cursor-pointer ${page === currentPage ? "bg-fuchsia-600/50 text-white" : "hover:bg-fuchsia-800/20"}`}
                                        >
                                          {page}
                                        </PaginationLink>
                                      </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                      <PaginationNext
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        className={currentPage < totalPages ? "cursor-pointer hover:bg-fuchsia-800/20" : "pointer-events-none opacity-50"}
                                      />
                                    </PaginationItem>
                                  </PaginationContent>
                                </Pagination>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  {/* ── Create ── */}
                  <TabsContent value="create" className="mt-0">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="bg-black/20 backdrop-blur-lg border border-fuchsia-500/10">
                        <CardContent className="p-4 sm:p-6">
                          <PendingBlogUserForm
                            onSuccess={handleBlogUpdate}
                            currentUser={profile}
                            addToast={addToast}
                            authUserId={profile?.id}
                          />
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  {/* ── Notifications ── */}
                  <TabsContent value="notifications" className="mt-0">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="bg-black/20 backdrop-blur-lg border border-fuchsia-500/10">
                        <CardContent className="p-4 sm:p-6">
                          <div className="mb-4">
                            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-pink-300">
                              Your Notifications
                            </h3>
                            <p className="text-white/35 text-xs mt-1">
                              Account status updates and platform alerts from admins.
                            </p>
                          </div>
                          <NotificationsTab userId={profile?.user_id} role="user" />
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

        </motion.div>
      </div>

      {/* ── DELETE DIALOG ── */}
      <AlertDialog open={!!deleteDialog} onOpenChange={(open) => { if (!open) closeDeleteDialog() }}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-950 via-rose-950/25 to-slate-950 backdrop-blur-xl border border-red-500/20 shadow-2xl shadow-red-900/25 max-w-md">
          <AlertDialogHeader className="gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <AlertDialogTitle className="text-red-200 text-base font-semibold">
                  Delete Blog Post
                </AlertDialogTitle>
                <p className="text-white/30 text-xs mt-0.5">Platform admins will be notified</p>
              </div>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-sm">
                <div className="px-3 py-2.5 rounded-lg bg-white/3 border border-white/8 text-white/40 text-xs leading-relaxed">
                  Permanently deleting{" "}
                  <span className="text-white font-medium">"{deleteDialog?.title}"</span>.
                  This cannot be undone.
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/30 flex items-center gap-2">
                    <XCircle className="w-3 h-3 shrink-0" />
                    Reason
                    <span className="text-white/18 font-normal normal-case tracking-normal">(optional)</span>
                  </label>
                  <Textarea
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="e.g. Outdated content, no longer relevant…"
                    className="bg-black/40 border border-red-500/15 text-white/70 placeholder:text-white/18 text-xs resize-none focus:border-red-400/30 focus:ring-0 rounded-lg"
                    rows={3}
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-1">
            <AlertDialogCancel
              disabled={actionLoading}
              onClick={closeDeleteDialog}
              className="cursor-pointer bg-white/5 hover:bg-white/8 text-white/55 hover:text-white border border-white/10 text-sm transition-all"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleConfirmedDelete}
              disabled={actionLoading}
              className="cursor-pointer bg-gradient-to-r from-pink-600 via-fuchsia-600 to-rose-600
                hover:from-pink-500 hover:via-fuchsia-500 hover:to-rose-500
                active:scale-[0.97] text-white border-0 gap-2 text-sm transition-all
                shadow-lg hover:shadow-pink-500/25"
            >
              {actionLoading
                ? <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                : <Trash2  className="w-4 h-4 shrink-0" />
              }
              Delete Permanently
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}