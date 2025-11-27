"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { 
  Plus, 
  FileText, 
  TrendingUp,
  AlertCircle,
  User2,
  BookOpen,
  Eye
} from "lucide-react"

import UserProfile from "@/components/(dashboard)/userDashboard/profile"
import BlogEmpty from "@/components/blog/blog-empty"
import MyBlogs from "@/components/blog/blog-user"
import BlogUserForm from "@/components/blog/blog-user-form"
import { ReturnButton } from "@/components/return"

export default function UserDashboardPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [blogs, setBlogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBlogs: 0,
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchBlogs(),
      ])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }
  const userId = 2;


  const fetchBlogs = async () => {
    const { data } = await supabase.from('blogs').select('*').eq("user_id", userId)
    setBlogs(data || [])
    setStats(prev => ({ ...prev, totalBlogs: data?.length || 0 }))
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-fuchsia-950 p-4 md:p-6 lg:p-8">
      {/* Beta Warning Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-7xl mx-auto mb-6"
      >
        <div className="fixed inset-0 p-6">
          <ReturnButton />
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
          {/* Header */}
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

          {/* Stats Cards */}
          {!isLoading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
            >
              {/* Profile Card */}
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

              {/* Total Blogs Card */}
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

              {/* Published Card */}
              <Card className="group relative bg-gradient-to-br from-orange-900/40 via-amber-900/40 to-slate-950/40 backdrop-blur-xl border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-orange-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/0 via-amber-600/5 to-orange-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="relative p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-200/70 text-xs sm:text-sm mb-1">Published</p>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-amber-300">
                        {stats.totalBlogs}
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 bg-orange-500/20 rounded-lg border border-orange-400/30">
                      <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-orange-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Views Card */}
              <Card className="group relative bg-gradient-to-br from-emerald-900/40 via-green-900/40 to-slate-950/40 backdrop-blur-xl border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-emerald-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/0 via-green-600/5 to-emerald-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="relative p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-200/70 text-xs sm:text-sm mb-1">Total Views</p>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-300">
                        0
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

          {/* Main Tabs */}
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

                  {/* Profile Tab */}
                  <TabsContent value="profile" className="mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="bg-black/20 backdrop-blur-lg border border-fuchsia-500/10">
                        <CardContent className="p-4 sm:p-6">
                          <UserProfile />
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  {/* My Blogs Tab */}
                  <TabsContent value="myBlog" className="mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="bg-black/20 backdrop-blur-lg border border-fuchsia-500/10">
                        <CardContent className="p-4 sm:p-6">
                          {!blogs || blogs.length === 0 ? (
                            <BlogEmpty />
                          ) : (
                            <MyBlogs blogs={blogs} onBlogDeleted={fetchBlogs} />
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  {/* Create Tab */}
                  <TabsContent value="create" className="mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="bg-black/20 backdrop-blur-lg border border-fuchsia-500/10">
                        <CardContent className="p-4 sm:p-6">
                          <BlogUserForm onSuccess={fetchBlogs} />
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