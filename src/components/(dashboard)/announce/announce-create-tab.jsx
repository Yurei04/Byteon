"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import AnnounceForm from "./announce-form"
import { supabase } from "@/lib/supabase"
import BlogForm from "../../blog/blog-form"

export default function AnnounceCreateTab (

) {
    const [activeCreateTab, setActiveCreateTab] = useState("createAnnouncement")
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
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <Tabs value={activeCreateTab} onValueChange={setActiveCreateTab}>
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="createAnnouncement" className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4" />
                    Announcements
                  </TabsTrigger>
                  <TabsTrigger value="createBlogs" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Blogs
                  </TabsTrigger>
                  <TabsTrigger value="createResources" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Resources
                  </TabsTrigger>
                  <TabsTrigger value="createAnalytics" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Analytics
                  </TabsTrigger>
                </TabsList>

                {/* Announcements Tab */}
                <TabsContent value="createAnnouncement" className="space-y-6">
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
                </TabsContent>

                {/* Blogs Tab */}
                <TabsContent value="createBlogs" className="space-y-6">
                  <BlogForm />
                </TabsContent>

                {/* Resources Tab */}
                <TabsContent value="createResources" className="space-y-6">
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-fuchsia-300" />
                    <h3 className="text-2xl font-bold text-white mb-2">Resource Management</h3>
                    <p className="text-fuchsia-200 mb-6">Coming soon...</p>
                  </div>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="createAnalytics" className="space-y-6">
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-fuchsia-300" />
                    <h3 className="text-2xl font-bold text-white mb-2">Analytics Management</h3>
                    <p className="text-fuchsia-200 mb-6">Coming soon...</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
    )
}