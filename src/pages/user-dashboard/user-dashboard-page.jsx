"use client"

import React, { useEffect, useState, useMemo, useRef } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import {
  Plus,
  FileText,
  TrendingUp,
  AlertCircle,
  User2,
  BookOpen,
  Eye,
  Loader2,
  Trophy,
  Star,
} from "lucide-react"

import UserProfile from "@/components/(dashboard)/userDashboard/profile"
import BlogEmpty from "@/components/blog/blog-empty"
import BlogCard from "@/components/blog/blogCard"
import BlogUserForm from "@/components/blog/blog-user-form"
import AchievementsTab from "@/components/achievements/achievementStab"
import { ReturnButton } from "@/components/return"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const ITEMS_PER_PAGE = 6

export default function UserDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const [blogs, setBlogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [userBigintId, setUserBigintId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [achievementsMetadata, setAchievementsMetadata] = useState({})
  const [stats, setStats] = useState({ totalBlogs: 0, totalViews: 0 })

  // Holds the realtime channel so we can clean it up on unmount / sign-out
  const realtimeChannelRef = useRef(null)

  // ── Realtime: watch the user's row for achievements_metadata changes.
  //    Whenever grantAchievement writes during gameplay this fires and
  //    updates the stat cards instantly — no tab switch or refresh needed. ──
  const subscribeToAchievements = (authUserId) => {
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current)
    }

    const channel = supabase
      .channel(`dashboard-achievements-${authUserId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `user_id=eq.${authUserId}`,
        },
        (payload) => {
          if (payload.new?.achievements_metadata !== undefined) {
            setAchievementsMetadata(payload.new.achievements_metadata ?? {})
          }
        }
      )
      .subscribe()

    realtimeChannelRef.current = channel
  }

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && userId) {
        if (userBigintId) {
          fetchBlogs(userBigintId)
        } else {
          fetchUserAndData(userId)
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [userId, userBigintId])

  useEffect(() => {
    getAuthUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUserId(session.user.id)
        // Only re-fetch on actual sign-in — getAuthUser already handles the initial load.
        // Without this guard, fetchUserAndData fires twice on every mount.
        if (event === "SIGNED_IN") {
          await fetchUserAndData(session.user.id)
          subscribeToAchievements(session.user.id)
        }
      } else {
        setUserId(null)
        setUserBigintId(null)
        setBlogs([])
        setAchievementsMetadata({})
        if (realtimeChannelRef.current) {
          supabase.removeChannel(realtimeChannelRef.current)
          realtimeChannelRef.current = null
        }
        router.push("/log-in")
      }
    })

    return () => {
      subscription.unsubscribe()
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current)
      }
    }
  }, [])

  const getAuthUser = async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Session error:", sessionError)
        setIsLoading(false)
        router.push("/log-in")
        return
      }

      if (session?.user) {
        setUserId(session.user.id)
        await fetchUserAndData(session.user.id)
        subscribeToAchievements(session.user.id)
      } else {
        setIsLoading(false)
        router.push("/log-in")
      }
    } catch (error) {
      console.error("Error in getAuthUser:", error)
      setIsLoading(false)
      router.push("/log-in")
    }
  }

  const fetchUserAndData = async (authUserId) => {
    setIsLoading(true)

    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, name, achievements_metadata")
        .eq("user_id", authUserId)
        .single()

      if (userError) throw userError

      if (!userData?.id) {
        setIsLoading(false)
        return
      }

      setUserBigintId(userData.id)
      setAchievementsMetadata(userData.achievements_metadata ?? {})

      await fetchBlogs(userData.id)

    } catch (error) {
      console.error("fetchUserAndData error:", error)
      setIsLoading(false)
    }
  }

  const fetchBlogs = async (bigintUserId) => {
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("user_id", bigintUserId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching blogs:", error)
        setIsLoading(false)
        return
      }

      setBlogs(data || [])
      const totalViews = data?.reduce((sum, blog) => sum + (blog.views || 0), 0) || 0
      setStats({ totalBlogs: data?.length || 0, totalViews })
    } catch (error) {
      console.error("Unexpected error in fetchBlogs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBlogUpdate = async () => {
    if (userBigintId) await fetchBlogs(userBigintId)
    else if (userId) await fetchUserAndData(userId)
  }

  const handleDelete = async (type, id) => {
    try {
      const { error } = await supabase.from("blogs").delete().eq("id", id)
      if (error) throw error
      await handleBlogUpdate()
    } catch (error) {
      console.error("Error deleting blog:", error)
    }
  }

  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return blogs.slice(start, start + ITEMS_PER_PAGE)
  }, [blogs, currentPage])

  const totalPages = Math.ceil(blogs.length / ITEMS_PER_PAGE)

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  const totalAchievements = Object.keys(achievementsMetadata).length
  const totalAchievementPoints = Object.values(achievementsMetadata).reduce(
    (sum, a) => sum + (a.reward_points ?? 0),
    0
  )

  if (!userId && !isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to access your dashboard.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-7xl mx-auto mb-6"
      >
        <div className="fixed inset-0 p-6 pointer-events-none z-50">
          <div className="pointer-events-auto w-fit">
            <ReturnButton />
          </div>
        </div>
        <div className="bg-gradient-to-r from-fuchsia-900/40 to-purple-900/40 backdrop-blur-lg border border-fuchsia-500/30 py-3 px-4 rounded-xl shadow-lg shadow-fuchsia-500/10">
          <p className="text-fuchsia-200 text-sm text-center flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>⚠️ This Page is currently in Beta Testing</span>
          </p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Title */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-purple-300 to-pink-300">
                User Dashboard
              </span>
            </h1>
            <p className="text-fuchsia-200/70 text-sm sm:text-base max-w-2xl mx-auto">
              Manage your profile, create engaging blog posts, and track your content all in one place
            </p>
          </div>

          {/* Stat cards */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-fuchsia-300" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
            >
              {/* Profile */}
              <Card className="group relative bg-gradient-to-br from-purple-900/40 via-violet-900/40 to-slate-950/40 backdrop-blur-xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-purple-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-violet-600/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="relative p-4 sm:p-6">
                  <div className="flex flex-col items-center justify-center text-center space-y-2">
                    <div className="p-3 bg-purple-500/20 rounded-full border border-purple-400/30">
                      <User2 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-300" />
                    </div>
                    <div>
                      <p className="text-purple-200/70 text-xs sm:text-sm">Your Profile</p>
                      <p className="text-lg sm:text-xl font-bold text-purple-300">Active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Blogs */}
              <Card className="group relative bg-gradient-to-br from-fuchsia-900/40 via-pink-900/40 to-slate-950/40 backdrop-blur-xl border border-fuchsia-500/30 hover:border-fuchsia-400/50 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-fuchsia-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/0 via-pink-600/5 to-fuchsia-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="relative p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-fuchsia-200/70 text-xs sm:text-sm mb-1">Total Blogs</p>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-pink-300">
                        {stats.totalBlogs}
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 bg-fuchsia-500/20 rounded-lg border border-fuchsia-400/30">
                      <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-fuchsia-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card
                className="group relative bg-gradient-to-br from-amber-900/40 via-yellow-900/40 to-slate-950/40 backdrop-blur-xl border border-amber-500/30 hover:border-amber-400/50 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-amber-500/20 cursor-pointer"
                onClick={() => setActiveTab("achievements")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600/0 via-yellow-600/5 to-amber-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="relative p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-200/70 text-xs sm:text-sm mb-1">Achievements</p>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-300">
                        {totalAchievements}
                      </p>
                      {totalAchievementPoints > 0 && (
                        <p className="text-xs text-amber-300/60 mt-0.5 flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {totalAchievementPoints} pts
                        </p>
                      )}
                    </div>
                    <div className="p-2 sm:p-3 bg-amber-500/20 rounded-lg border border-amber-400/30">
                      <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-amber-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Views */}
              <Card className="group relative bg-gradient-to-br from-emerald-900/40 via-green-900/40 to-slate-950/40 backdrop-blur-xl border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-emerald-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/0 via-green-600/5 to-emerald-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="relative p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-200/70 text-xs sm:text-sm mb-1">Total Views</p>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-300">
                        {stats.totalViews}
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
                      <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-fuchsia-950/40 via-purple-950/40 to-slate-950/40 backdrop-blur-xl border border-fuchsia-500/20 shadow-2xl">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6 sm:mb-8 bg-black/30 border border-fuchsia-500/20 p-1 h-auto rounded-xl">
                    <TabsTrigger
                      value="profile"
                      className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all rounded-lg py-3 text-xs sm:text-sm"
                    >
                      <User2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Profile</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="myBlog"
                      className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all rounded-lg py-3 text-xs sm:text-sm"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span className="hidden sm:inline">My Blogs</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="create"
                      className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all rounded-lg py-3 text-xs sm:text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Create</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Profile */}
                  <TabsContent value="profile" className="mt-0">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="bg-black/20 backdrop-blur-lg border border-fuchsia-500/10">
                        <CardContent className="p-4 sm:p-6">
                          <UserProfile 
                            currentUser={userId} 
                            authUserId={userBigintId}
                          />
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  {/* My Blogs */}
                  <TabsContent value="myBlog" className="mt-0">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="bg-black/20 backdrop-blur-lg border border-fuchsia-500/10">
                        <CardContent className="p-4 sm:p-6">
                          {isLoading ? (
                            <div className="flex justify-center py-12">
                              <Loader2 className="w-8 h-8 animate-spin text-fuchsia-300" />
                            </div>
                          ) : !blogs || blogs.length === 0 ? (
                            <BlogEmpty />
                          ) : (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {paginatedBlogs.map((item) => (
                                  <BlogCard
                                    key={item.id}
                                    item={item}
                                    onUpdate={handleBlogUpdate}
                                    onDelete={(id) => handleDelete("blog", id)}
                                  />
                                ))}
                              </div>
                              {totalPages > 1 && (
                                <Pagination>
                                  <PaginationContent>
                                    <PaginationItem>
                                      <PaginationPrevious
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        className={
                                          currentPage > 1
                                            ? "cursor-pointer hover:bg-fuchsia-800/20"
                                            : "pointer-events-none opacity-50"
                                        }
                                      />
                                    </PaginationItem>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                      <PaginationItem key={page}>
                                        <PaginationLink
                                          onClick={() => handlePageChange(page)}
                                          isActive={page === currentPage}
                                          className={`cursor-pointer ${
                                            page === currentPage
                                              ? "bg-fuchsia-600/50 text-white"
                                              : "hover:bg-fuchsia-800/20"
                                          }`}
                                        >
                                          {page}
                                        </PaginationLink>
                                      </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                      <PaginationNext
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        className={
                                          currentPage < totalPages
                                            ? "cursor-pointer hover:bg-fuchsia-800/20"
                                            : "pointer-events-none opacity-50"
                                        }
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

                  {/* Create */}
                  <TabsContent value="create" className="mt-0">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="bg-black/20 backdrop-blur-lg border border-fuchsia-500/10">
                        <CardContent className="p-4 sm:p-6">
                          <BlogUserForm
                            onSuccess={handleBlogUpdate}
                            currentUser={userId}
                            authUserId={userBigintId}
                          />
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