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
  CheckCircle,
  Award,
  User2,
  BookOpen
} from "lucide-react"

import UserProfile from "@/components/(dashboard)/userDashboard/profile"
import BlogEmpty from "@/components/blog/blog-empty"

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

  const fetchBlogs = async () => {
    const { data } = await supabase.from('blogs').select('*')
    setBlogs(data || [])
    setStats(prev => ({ ...prev, totalBlogs: data?.length || 0 }))
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-fuchsia-950 p-6">
      {/* Beta Warning Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-7xl mx-auto mb-6"
      >
        <div className="bg-gradient-to-r from-fuchsia-900/40 to-purple-900/40 backdrop-blur-lg border border-fuchsia-500/30 py-3 px-4 rounded-lg shadow-lg shadow-fuchsia-500/10">
          <p className="text-fuchsia-200 text-sm text-center flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            ⚠️ This Page is currently in Beta Testing 
          </p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-purple-300 to-pink-300">
                User Profile Dashboard Center
              </span>
            </h1>
          </div>

          {/* Stats Cards */}
          {!isLoading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              <Card className="group relative bg-gradient-to-br from-purple-900/40 via-violet-900/40 to-slate-950/40 backdrop-blur-xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-purple-500/20 rounded-full">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-violet-600/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 " />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-center">
                    <User2 className="w-1/2 h-1/2 " />
                  </div>
                </CardContent>
              </Card>

              <Card className="group relative bg-gradient-to-br from-purple-900/40 via-violet-900/40 to-slate-950/40 backdrop-blur-xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-purple-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-violet-600/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200/70 text-sm mb-1">Total Blogs</p>
                      <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-violet-300">
                        {stats.totalBlogs}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-500/20 rounded-lg border border-purple-400/30">
                      <FileText className="w-8 h-8 text-purple-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="w-full group relative bg-gradient-to-br from-orange-900/40 via-amber-900/40 to-slate-950/40 backdrop-blur-xl border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-orange-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/0 via-amber-600/5 to-orange-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="w-full relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-200/70 text-sm mb-1">Active Events</p>
                      <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-amber-300">
                        {stats.totalBlogs}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-500/20 rounded-lg border border-orange-400/30">
                      <TrendingUp className="w-8 h-8 text-orange-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group relative bg-gradient-to-br from-emerald-900/40 via-green-900/40 to-slate-950/40 backdrop-blur-xl border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-emerald-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/0 via-green-600/5 to-emerald-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-200/70 text-sm mb-1">Views</p>
                      <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-300">
                        {stats.totalResources}
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
                      <BookOpen className="w-8 h-8 text-emerald-300" />
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
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-fuchsia-950/40 via-purple-950/40 to-slate-950/40 backdrop-blur-xl border border-fuchsia-500/20">
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 mb-6 bg-black/20 border border-fuchsia-500/20 p-1">
                    <TabsTrigger 
                      value="profile" 
                      className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all"
                    >
                      <FileText className="w-4 h-4" />Profile
                    </TabsTrigger>
                    <TabsTrigger 
                      value="myBlog" 
                      className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all"
                    >
                      <Plus className="w-4 h-4" />My Blogs
                    </TabsTrigger>
                    <TabsTrigger 
                      value="create" 
                      className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all"
                    >
                      <Plus className="w-4 h-4" />Create A Blog
                    </TabsTrigger>
                  </TabsList>

                  {/* View Tab */}
                  <TabsContent value="profile">
                    <Card className="bg-black/20 backdrop-blur-lg border border-fuchsia-500/10">
                      <CardContent className="p-6">
                        <UserProfile />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="myblog">
                    <Card className="bg-black/20 backdrop-blur-lg border border-fuchsia-500/10">
                      <CardContent className="p-6">
                        <UserProfile />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Create Tab */}
                  <TabsContent value="create">
                    <Card className="bg-black/20 backdrop-blur-lg border border-fuchsia-500/10">
                      <CardContent className="p-6">
                        <BlogEmpty />
                      </CardContent>
                    </Card>
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