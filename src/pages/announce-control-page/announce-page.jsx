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
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="w-full text-center bg-fuchsia-900 py-2 mb-4 rounded-lg">
        <p className="text-fuchsia-200 text-sm">⚠️ This Page is currently in Beta Testing - Replace mockSupabase with your actual Supabase client</p>
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-500">
                Dashboard Center
              </span>
            </h1>
            <p className="text-fuchsia-200 max-w-2xl mx-auto">
              Manage announcements, blogs, and resources all in one place
            </p>
          </div>

          {/* Stats Cards */}
          {!isLoading && (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-blue-500/50 to-blue-600/50 border-blue-400 border text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Announcements</p>
                      <p className="text-3xl font-bold">{stats.totalAnnouncements}</p>
                    </div>
                    <Megaphone className="w-10 h-10 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/50 to-green-600/50 border-green-400 border text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Total Resources</p>
                      <p className="text-3xl font-bold">{stats.totalResources}</p>
                    </div>
                    <BookOpen className="w-10 h-10 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/50 to-purple-600/50 border-purple-400 border text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Total Blogs</p>
                      <p className="text-3xl font-bold">{stats.totalBlogs}</p>
                    </div>
                    <FileText className="w-10 h-10 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/50 to-orange-600/50 border-orange-400 border text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Active Events</p>
                      <p className="text-3xl font-bold">{stats.activeAnnouncements}</p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Main Tabs */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="view" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />View All
                  </TabsTrigger>
                  <TabsTrigger value="create" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />Create New
                  </TabsTrigger>
                </TabsList>

                {/* View Tab */}
                <TabsContent value="view">
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                    <CardContent className="p-6">
                      <Tabs value={activeViewTab} onValueChange={setActiveViewTab}>
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                          <TabsTrigger value="viewAnnouncement"><Megaphone className="w-4 h-4 mr-2" />Announcements</TabsTrigger>
                          <TabsTrigger value="viewBlogs"><FileText className="w-4 h-4 mr-2" />Blogs</TabsTrigger>
                          <TabsTrigger value="viewResources"><BookOpen className="w-4 h-4 mr-2" />Resources</TabsTrigger>
                        </TabsList>

                        <TabsContent value="viewAnnouncement">
                          <h3 className="text-xl font-bold text-white mb-4">All Announcements</h3>
                          {isLoading ? (
                            <div className="flex justify-center py-12">
                              <Loader2 className="w-8 h-8 animate-spin text-fuchsia-300" />
                            </div>
                          ) : announcements.length === 0 ? (
                            <Alert>
                              <AlertDescription className="text-center py-8">
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
                          <h3 className="text-xl font-bold text-white mb-4">All Blogs</h3>
                          {isLoading ? (
                            <div className="flex justify-center py-12">
                              <Loader2 className="w-8 h-8 animate-spin text-fuchsia-300" />
                            </div>
                          ) : blogs.length === 0 ? (
                            <Alert>
                              <AlertDescription className="text-center py-8">
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
                          <h3 className="text-xl font-bold text-white mb-4">All Resources</h3>
                          {isLoading ? (
                            <div className="flex justify-center py-12">
                              <Loader2 className="w-8 h-8 animate-spin text-fuchsia-300" />
                            </div>
                          ) : resources.length === 0 ? (
                            <Alert>
                              <AlertDescription className="text-center py-8">
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
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                    <CardContent className="p-6">
                      <Tabs value={activeCreateTab} onValueChange={setActiveCreateTab}>
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                          <TabsTrigger value="createAnnouncement"><Megaphone className="w-4 h-4 mr-2" />Announcement</TabsTrigger>
                          <TabsTrigger value="createBlogs"><FileText className="w-4 h-4 mr-2" />Blog</TabsTrigger>
                          <TabsTrigger value="createResources"><BookOpen className="w-4 h-4 mr-2" />Resource</TabsTrigger>
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
      </div>
    </div>
  )
}