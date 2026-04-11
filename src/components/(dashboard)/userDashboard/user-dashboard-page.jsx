"use client"

import React, { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import {
  Plus, User2, BookOpen, Loader2, Bell, LogOut, ShieldCheck,
} from "lucide-react"

import { useAuth }            from "@/components/(auth)/authContext"
import UserProfile            from "@/components/(dashboard)/userDashboard/profile"
import BlogEmpty              from "@/components/blog/blog-empty"
import PendingBlogUserForm    from "@/components/blog/blog-pending-user"
import { ReturnButton }       from "@/components/return"
import NotificationsTab       from "@/components/notifications/notification-tab"
import { useNotifications }   from "@/components/notifications/use-notification"
import { Toast }              from "../toast"
import { useToast }           from "@/components/use-toast"

import UserViewableSection from "./user-viewable" 

export default function UserDashboardPage() {
  const router = useRouter()
  const { profile, role, loading: authLoading, isLoggedIn } = useAuth()

  const [activeTab, setActiveTab]       = useState("profile")
  const [blogs, setBlogs]               = useState([])
  const [blogsLoading, setBlogsLoading] = useState(false)

  const realtimeChannelRef = useRef(null)

  const { unreadCount }                = useNotifications({ userId: profile?.user_id || null, role: "user" })
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

  if (authLoading || (isLoggedIn && role === null)) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-fuchsia-300" />
      </div>
    )
  }
  if (!isLoggedIn || role !== "user") return null

  const TABS = [
    { value: "profile", icon: <User2    className="w-4 h-4" />, label: "Profile"  },
    { value: "myBlog",  icon: <BookOpen className="w-4 h-4" />, label: "My Blogs" },
    { value: "create",  icon: <Plus     className="w-4 h-4" />, label: "Create"   },
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

      <div class="absolute inset-0">
        <div class="absolute top-0 z-[-2] h-screen w-screen bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px]"></div>
      </div>

      <div className=" max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
          <ReturnButton/>
          <div className="text-center space-y-2 mt-2">

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-purple-300 to-pink-300">
                Participant&apos;s Dashboard
              </span>
            </h1>
            <p className="text-fuchsia-200/70 text-sm sm:text-base max-w-2xl mx-auto">
              Manage your profile, create engaging blog posts, and track your content all in one place
            </p>
          </div>

          {/* ── Main card ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-fuchsia-950/40 via-purple-950/40 to-slate-950/40 backdrop-blur-xl border border-fuchsia-500/20 shadow-2xl">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

                  <TabsList className="grid w-full grid-cols-4 mb-6 sm:mb-8 bg-black/30 border border-fuchsia-500/20 p-1 h-auto rounded-xl">
                    {TABS.map(({ value, icon, label }) => (
                      <TabsTrigger key={value} value={value}
                        className="flex items-center justify-center gap-2
                          data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-600
                          data-[state=active]:to-purple-600 data-[state=active]:text-white
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
                          <UserProfile currentUser={profile?.user_id} authUserId={profile?.id} />
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  {/* ── My Blogs — split-screen viewer ── */}
                  <TabsContent value="myBlog" className="mt-0">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="bg-black/20 backdrop-blur-lg border border-fuchsia-500/10">
                        <CardContent className="p-4 sm:p-6">
                          {!blogsLoading && blogs.length === 0 ? (
                            // Empty state from the existing BlogEmpty component
                            <BlogEmpty />
                          ) : (
                            // ✅ Split-screen: left list + right detail + delete dialog + notify
                            <UserViewableSection
                              blogs={blogs}
                              blogsLoading={blogsLoading}
                              profile={profile}
                              onBlogUpdate={handleBlogUpdate}
                              addToast={addToast}
                            />
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
    </div>
  )
}