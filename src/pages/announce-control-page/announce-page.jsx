"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  Edit
} from "lucide-react"
import AnnounceForm from "@/components/announce/announce-form"
import AnnounceCard from "@/components/announce/announce-card"
import { supabase } from "@/lib/supabase"

export default function AnnouncePage() {
  const [activeTab, setActiveTab] = useState("announcements")
  const [announcements, setAnnouncements] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAnnouncements: 0,
    activeAnnouncements: 0,
    totalChecks: 0,
    totalOrganizations: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchAnnouncements(),
        fetchOrganizations(),
        fetchStats()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAnnouncements(data || [])
    } catch (error) {
      console.error('Error fetching announcements:', error)
    }
  }

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organization')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrganizations(data || [])
    } catch (error) {
      console.error('Error fetching organizations:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const { data: announcementData } = await supabase
        .from('announcements')
        .select('record, record_after, date_end')

      const { data: orgData } = await supabase
        .from('organization')
        .select('id')
        .eq('active', true)

      const now = new Date()
      const active = announcementData?.filter(a => new Date(a.date_end) >= now).length || 0
      const totalChecks = announcementData?.reduce((sum, a) => 
        sum + (a.record || 0) + (a.record_after || 0), 0) || 0

      setStats({
        totalAnnouncements: announcementData?.length || 0,
        activeAnnouncements: active,
        totalChecks: totalChecks,
        totalOrganizations: orgData?.length || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleCheckClick = async (announcementId, isExpired) => {
    try {
      const field = isExpired ? 'record_after' : 'record'
      const announcement = announcements.find(a => a.id === announcementId)
      
      const { error } = await supabase
        .from('announcements')
        .update({ [field]: (announcement[field] || 0) + 1 })
        .eq('id', announcementId)

      if (error) throw error
      
      await fetchAnnouncements()
      await fetchStats()
    } catch (error) {
      console.error('Error updating check count:', error)
    }
  }

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcementId)

      if (error) throw error
      
      await fetchAnnouncements()
      await fetchStats()
    } catch (error) {
      console.error('Error deleting announcement:', error)
    }
  }

  const handleAnnouncementCreated = () => {
    fetchData()
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.25 }}
          className="mb-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-500">
                Control Center
              </span>
            </h1>
            <p className="text-fuchsia-200 max-w-2xl mx-auto text-lg">
              Manage announcements, blogs, and resources all in one place
            </p>
          </div>

          {/* Stats Cards */}
          {!isLoading && (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
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

              <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Active Now</p>
                      <p className="text-3xl font-bold">{stats.activeAnnouncements}</p>
                    </div>
                    <Calendar className="w-10 h-10 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Total Checks</p>
                      <p className="text-3xl font-bold">{stats.totalChecks}</p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Organizations</p>
                      <p className="text-3xl font-bold">{stats.totalOrganizations}</p>
                    </div>
                    <Users className="w-10 h-10 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Tabs */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="announcements" className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4" />
                    Announcements
                  </TabsTrigger>
                  <TabsTrigger value="blogs" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Blogs
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Resources
                  </TabsTrigger>
                </TabsList>

                {/* Announcements Tab */}
                <TabsContent value="announcements" className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Announcements</h2>
                  </div>

                  {/* Create Form */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <AnnounceForm 
                      supabase={supabase}
                      onSuccess={handleAnnouncementCreated}
                    />
                  </motion.div>

                  {/* Announcements List */}
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-white mb-4">All Announcements</h3>
                    {isLoading ? (
                      <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-fuchsia-300" />
                      </div>
                    ) : announcements.length === 0 ? (
                      <Alert>
                        <AlertDescription className="text-center py-8">
                          No announcements yet. Create your first one above!
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {announcements.map((announcement) => (
                          <motion.div
                            key={announcement.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="relative"
                          >
                            <AnnounceCard
                              announcement={announcement}
                              onCheckClick={handleCheckClick}
                              colorScheme={announcement.color_scheme || 'blue'}
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 z-10"
                              onClick={() => handleDeleteAnnouncement(announcement.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Blogs Tab */}
                <TabsContent value="blogs" className="space-y-6">
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-fuchsia-300" />
                    <h3 className="text-2xl font-bold text-white mb-2">Blog Management</h3>
                    <p className="text-fuchsia-200 mb-6">Coming soon...</p>
                  </div>
                </TabsContent>

                {/* Resources Tab */}
                <TabsContent value="resources" className="space-y-6">
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-fuchsia-300" />
                    <h3 className="text-2xl font-bold text-white mb-2">Resource Management</h3>
                    <p className="text-fuchsia-200 mb-6">Coming soon...</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}