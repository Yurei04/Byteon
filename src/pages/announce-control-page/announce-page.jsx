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
import AnnounceViewTab from "@/components/announce/announce-view-tab"
import AnnounceCreateTab from "@/components/announce/announce-create-tab"

export default function AnnouncePage() {
  const [activeViewTab, setActiveViewTab] = useState("viewAnnouncement")
  const [activeCreateTab, setActiveCreateTab] = useState("createAnnouncement")
  const [activeTab, setActiveTab] = useState("view")
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

  return (
    <div className="w-full min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="w-full text-center bg-fuchsia-900">
        <p className="text-fuchsia-200 max-w-2xl mx-auto text-md">
          This Page is currently in Beta Testing 
        </p>
      </div>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.25 }}
          className="mb-8"
        >
          <div className="text-center mb-8 mt-8">
            <h1 className="text-2xl sm:text-5xl lg:text-6xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-500">
                Dashboard Center
              </span>
            </h1>
            <p className="text-fuchsia-200 max-w-2xl mx-auto text-md">
              Welcome Back {organizations.name} Manage announcements, blogs, and resources all in one place 
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
                      <p className="text-green-100 text-sm">Resource</p>
                      <p className="text-3xl font-bold">{stats.activeAnnouncements}</p>
                    </div>
                    <Calendar className="w-10 h-10 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/50 to-purple-600/50 border-purple-400 border text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Blogs</p>
                      <p className="text-3xl font-bold">{stats.totalChecks}</p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/50 to-orange-600/50 border-orange-400 border text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Total Visits</p>
                      <p className="text-3xl font-bold">{stats.totalOrganizations}</p>
                    </div>
                    <Users className="w-10 h-10 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex justify-center ">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="create" className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4" />
                    Create
                  </TabsTrigger>
                  <TabsTrigger value="view" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    View
                  </TabsTrigger>
                </TabsList>

                {/* View Tab */}
                <TabsContent value="view" className="space-y-6">
                  <AnnounceViewTab />
                </TabsContent>

                {/* Blogs Tab */}
                <TabsContent value="create" className="space-y-6">
                  <AnnounceCreateTab />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Tabs */}
          
        </motion.div>
      </div>
    </div>
  )
}