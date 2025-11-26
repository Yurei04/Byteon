"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Plus, 
  FileText, 
  Megaphone, 
  BookOpen,
  Calendar,
  Users,
  TrendingUp,
  Loader2,
  Trash2,
  Edit,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Award
} from "lucide-react"
import ResourceForm from "@/components/resourceHub/resource-form"
import BlogForm from "@/components/blog/blog-form"
import AnnounceForm from "@/components/announce/announce-form"
import ResourceCard from "@/components/resourceHub/resourceHub-card"
import BlogCard from "@/components/blog/blogCard"
import AnnouncementCard from "@/components/announce/announce-card"

export default function DashboardCenter() {
  const [activeTab, setActiveTab] = useState("view")
  const [activeViewTab, setActiveViewTab] = useState("viewAnnouncement")
  const [activeCreateTab, setActiveCreateTab] = useState("createAnnouncement")
  
  const [announcements, setAnnouncements] = useState([])
  const [blogs, setBlogs] = useState([])
  const [resources, setResources] = useState([])
  const [organizations, setOrganizations] = useState([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAnnouncements: 0,
    totalBlogs: 0,
    totalResources: 0,
    activeAnnouncements: 0
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchAnnouncements(),
        fetchBlogs(),
        fetchResources(),
        fetchOrganizations()
      ])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAnnouncements = async () => {
    const { data } = await supabase.from('announcements').select('*')
    setAnnouncements(data || [])
    console.log('Fetched announcements:', data)
    const now = new Date()
    const active = data?.filter(a => new Date(a.date_end) >= now).length || 0
    setStats(prev => ({ ...prev, totalAnnouncements: data?.length || 0, activeAnnouncements: active }))
  }

  const fetchBlogs = async () => {
    const { data } = await supabase.from('blogs').select('*')
    setBlogs(data || [])
    setStats(prev => ({ ...prev, totalBlogs: data?.length || 0 }))
  }

  const fetchResources = async () => {
    const { data } = await supabase.from('resource_hub').select('*')
    setResources(data || [])
    setStats(prev => ({ ...prev, totalResources: data?.length || 0 }))
  }

  const fetchOrganizations = async () => {
    const { data } = await supabase.from('organization').select('*')
    setOrganizations(data || [])
  }

  const handleDelete = async (type, id) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return
    
    try {
      await supabase.from(type === 'announcement' ? 'announcements' : type === 'blog' ? 'blogs' : 'resource_hub').delete().eq('id', id)
      
      if (type === 'announcement') fetchAnnouncements()
      else if (type === 'blog') fetchBlogs()
      else fetchResources()
    } catch (error) {
      console.error('Error:', error)
    }
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
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-purple-300 to-pink-300">
                Dashboard Center
              </span>
            </h1>
            <p className="text-fuchsia-200/80 max-w-2xl mx-auto text-lg">
              Manage announcements, blogs, and resources all in one place
            </p>
          </div>

          {/* Stats Cards */}
          {!isLoading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              <Card className="group relative bg-gradient-to-br from-fuchsia-900/40 via-purple-900/40 to-slate-950/40 backdrop-blur-xl border border-fuchsia-500/30 hover:border-fuchsia-400/50 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-fuchsia-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/0 via-purple-600/5 to-fuchsia-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-fuchsia-200/70 text-sm mb-1">Total Announcements</p>
                      <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-300">
                        {stats.totalAnnouncements}
                      </p>
                    </div>
                    <div className="p-3 bg-fuchsia-500/20 rounded-lg border border-fuchsia-400/30">
                      <Megaphone className="w-8 h-8 text-fuchsia-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group relative bg-gradient-to-br from-emerald-900/40 via-green-900/40 to-slate-950/40 backdrop-blur-xl border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-emerald-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/0 via-green-600/5 to-emerald-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-200/70 text-sm mb-1">Total Resources</p>
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

              <Card className="group relative bg-gradient-to-br from-orange-900/40 via-amber-900/40 to-slate-950/40 backdrop-blur-xl border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-orange-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/0 via-amber-600/5 to-orange-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-200/70 text-sm mb-1">Active Events</p>
                      <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-amber-300">
                        {stats.activeAnnouncements}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-500/20 rounded-lg border border-orange-400/30">
                      <TrendingUp className="w-8 h-8 text-orange-300" />
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
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-black/20 border border-fuchsia-500/20 p-1">
                    <TabsTrigger 
                      value="view" 
                      className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all"
                    >
                      <FileText className="w-4 h-4" />View All
                    </TabsTrigger>
                    <TabsTrigger 
                      value="create" 
                      className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all"
                    >
                      <Plus className="w-4 h-4" />Create New
                    </TabsTrigger>
                  </TabsList>

                  {/* View Tab */}
                  <TabsContent value="view">
                    <Card className="bg-black/20 backdrop-blur-lg border border-fuchsia-500/10">
                      <CardContent className="p-6">
                        <Tabs value={activeViewTab} onValueChange={setActiveViewTab}>
                          <TabsList className="grid w-full grid-cols-3 mb-6 bg-black/20 border border-purple-500/20 p-1">
                            <TabsTrigger 
                              value="viewAnnouncement"
                              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                            >
                              <Megaphone className="w-4 h-4 mr-2" />Announcements
                            </TabsTrigger>
                            <TabsTrigger 
                              value="viewBlogs"
                              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
                            >
                              <FileText className="w-4 h-4 mr-2" />Blogs
                            </TabsTrigger>
                            <TabsTrigger 
                              value="viewResources"
                              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white"
                            >
                              <BookOpen className="w-4 h-4 mr-2" />Resources
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="viewAnnouncement">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-300 to-purple-300 bg-clip-text text-transparent mb-6">
                              All Announcements
                            </h3>
                            {isLoading ? (
                              <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-fuchsia-300" />
                              </div>
                            ) : announcements.length === 0 ? (
                              <Alert className="bg-fuchsia-900/20 border-fuchsia-500/30">
                                <AlertCircle className="w-4 h-4 text-fuchsia-300" />
                                <AlertDescription className="text-center py-8 text-fuchsia-200">
                                  No announcements yet. Create your first one!
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {announcements.map((item) => (
                                  <AnnouncementCard key={item.id} item={item} onDelete={(id) => handleDelete('announcement', id)} />
                                ))}
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent value="viewBlogs">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-6">
                              All Blogs
                            </h3>
                            {isLoading ? (
                              <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-300" />
                              </div>
                            ) : blogs.length === 0 ? (
                              <Alert className="bg-purple-900/20 border-purple-500/30">
                                <AlertCircle className="w-4 h-4 text-purple-300" />
                                <AlertDescription className="text-center py-8 text-purple-200">
                                  No blogs yet. Create your first one!
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {blogs.map((item) => (
                                  <BlogCard key={item.id} item={item} onDelete={(id) => handleDelete('blog', id)} />
                                ))}
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent value="viewResources">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent mb-6">
                              All Resources
                            </h3>
                            {isLoading ? (
                              <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-emerald-300" />
                              </div>
                            ) : resources.length === 0 ? (
                              <Alert className="bg-emerald-900/20 border-emerald-500/30">
                                <AlertCircle className="w-4 h-4 text-emerald-300" />
                                <AlertDescription className="text-center py-8 text-emerald-200">
                                  No resources yet. Create your first one!
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {resources.map((item) => (
                                  <ResourceCard key={item.id} item={item} onDelete={(id) => handleDelete('resource', id)} />
                                ))}
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Create Tab */}
                  <TabsContent value="create">
                    <Card className="bg-black/20 backdrop-blur-lg border border-fuchsia-500/10">
                      <CardContent className="p-6">
                        <Tabs value={activeCreateTab} onValueChange={setActiveCreateTab}>
                          <TabsList className="grid w-full grid-cols-3 mb-6 bg-black/20 border border-purple-500/20 p-1">
                            <TabsTrigger 
                              value="createAnnouncement"
                              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                            >
                              <Megaphone className="w-4 h-4 mr-2" />Announcement
                            </TabsTrigger>
                            <TabsTrigger 
                              value="createBlogs"
                              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
                            >
                              <FileText className="w-4 h-4 mr-2" />Blog
                            </TabsTrigger>
                            <TabsTrigger 
                              value="createResources"
                              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white"
                            >
                              <BookOpen className="w-4 h-4 mr-2" />Resource
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="createAnnouncement">
                            <AnnounceForm onSuccess={fetchAllData} />
                          </TabsContent>

                          <TabsContent value="createBlogs">
                            <BlogForm onSuccess={fetchAllData} />
                          </TabsContent>

                          <TabsContent value="createResources">
                            <ResourceForm onSuccess={fetchAllData} />
                          </TabsContent>
                        </Tabs>
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