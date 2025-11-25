"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

export default function AnnounceViewTab (

) {
    const [activeViewTab, setActiveViewTab] = useState("viewAnnouncement")
    const [isLoading, setIsLoading] = useState(true)
    const [announcements, setAnnouncements] = useState([])
    const [organizations, setOrganizations] = useState([])
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

    return (
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <Tabs value={activeViewTab} onValueChange={setActiveViewTab}>
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="viewAnnouncement" className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4" />
                    Announcements
                  </TabsTrigger>
                  <TabsTrigger value="viewBlogs" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Blogs
                  </TabsTrigger>
                  <TabsTrigger value="viewResources" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Resources
                  </TabsTrigger>
                  <TabsTrigger value="viewAnalytics" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Analytics
                  </TabsTrigger>
                </TabsList>

                {/* Announcements Tab */}
                <TabsContent value="viewAnnouncement" className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Announcements Created</h2>
                  </div>

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
                <TabsContent value="viewBlogs" className="space-y-6">
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
                </TabsContent>

                {/* Resources Tab */}
                <TabsContent value="viewResources" className="space-y-6">
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
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="viewAnalytics" className="space-y-6">
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
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
    )
}