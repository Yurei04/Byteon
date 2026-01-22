"use client"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import OrgProfileHeader from "./org-profile-header"
import OrgAboutSection from "./org-about-section"
import OrgAchievementsSection from "./org-achievement-section"
import OrgBrandIdentity from "./org-brand-identity"
import OrgQuickStats from "./org-quick-stats"
import { availableOrgAchievements } from "./org-achievements"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ResourceForm from "@/components/resourceHub/resource-form"
import BlogForm from "@/components/blog/blog-form"
import AnnounceForm from "@/components/(dashboard)/announce/announce-form"
import ResourceCard from "@/components/resourceHub/resourceHub-card"
import BlogCard from "@/components/blog/blogCard"
import AnnouncementCard from "@/components/(dashboard)/announce/announce-card"
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

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
  Award,
  User2
} from "lucide-react"

export default function OrganizationProfile({ onSuccess }) {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [alert, setAlert] = useState(null)
  const [orgId, setOrgId] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    des: "",
    author_name: "",
    primary_color: "#000000",
    secondary_color: "#1F2937",
    color_scheme: "black",
    active: true,
    achievements: [],
  })


  useEffect(() => {
    const getAuthOrg = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setOrgId(session.user.id)
        await fetchOrgProfile(session.user.id)
      } else {
        setAlert({ type: 'error', message: 'You must be logged in to view this page.' })
        setIsLoading(false)
      }
    }

    getAuthOrg()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Org Auth state changed:', event, session?.user?.id)
      if (session?.user) {
        setOrgId(session.user.id)
        await fetchOrgProfile(session.user.id)
      } else {
        setProfile(null)
        setOrgId(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchOrgProfile = async (authOrgId) => {
    setIsLoading(true)
    try {
      console.log('Fetching org profile for:', authOrgId)
      
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('org_id', authOrgId)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setProfile(data)
        
        let orgAchievements = []
        if (data.achievements) {
          orgAchievements = typeof data.achievements === 'string' 
            ? JSON.parse(data.achievements) 
            : data.achievements
        }
        
        setFormData({
          name: data.name || "",
          des: data.des || "",
          author_name: data.author_name || "",
          primary_color: data.primary_color || "#000000",
          secondary_color: data.secondary_color || "#1F2937",
          color_scheme: data.color_scheme || "black",
          active: data.active !== false,
          achievements: orgAchievements,
        })
      } else {
        // Create org profile if doesn't exist
        await createOrgProfile(authOrgId)
      }
    } catch (error) {
      console.error('Error fetching org profile:', error.message)
      setAlert({ type: 'error', message: 'Failed to load organization profile.' })
    } finally {
      setIsLoading(false)
    }
  }

  const createOrgProfile = async (authOrgId) => {
    try {
      const { data: authUser } = await supabase.auth.getUser()
      
      const newProfile = {
        org_id: authOrgId,
        name: authUser.user?.user_metadata?.organization_name || "Organization",
        des: "",
        achievements: JSON.stringify([]),
        active: true,
        created_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('organizations')
        .insert([newProfile])
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      setFormData({
        name: data.name,
        des: "",
        author_name: "",
        primary_color: "#000000",
        secondary_color: "#1F2937",
        color_scheme: "black",
        active: true,
        achievements: [],
      })
      
      setAlert({ type: 'success', message: 'Organization profile created! Please complete your information.' })
      setIsEditing(true)
    } catch (error) {
      console.error('Error creating org profile:', error.message)
      setAlert({ type: 'error', message: 'Failed to create organization profile.' })
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
  }

  const handleColorChange = (colorType, value) => {
    setFormData(prev => ({ ...prev, [colorType]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.des) {
      setAlert({ type: 'error', message: 'Organization Name and Description are required fields.' })
      return
    }

    if (!profile?.org_id) {
        setAlert({ type: 'error', message: 'Cannot update: Organization profile not found.' })
        return
    }

    setIsLoading(true)
    setAlert(null)

    try {
      const profileUpdates = {
        name: formData.name,
        des: formData.des,
        author_name: formData.author_name,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        color_scheme: formData.color_scheme,
        active: formData.active,
        achievements: JSON.stringify(formData.achievements),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('organizations')
        .update(profileUpdates)
        .eq('org_id', profile.org_id)
        .select()
        .single()
      
      if (error) throw error

      setAlert({ type: 'success', message: 'Organization profile updated successfully!' })
      setIsEditing(false)
      setProfile(data)

      setTimeout(() => {
        setAlert(null)
        if (onSuccess) onSuccess()
      }, 2000)

    } catch (error) {
      console.error('Error updating profile:', error.message)
      setAlert({ type: 'error', message: `Failed to update profile: ${error.message}` })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (profile) {
      fetchOrgProfile(orgId)
    }
  }

  if (isLoading && !profile) {
    return (
      <div className="flex justify-center items-center p-12 text-white">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" /> Loading Organization Profile...
      </div>
    )
  }
  
  if (!orgId) {
    return (
      <div className="flex justify-center items-center p-12">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in as an organization to view this page.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {alert && (
        <Alert variant={alert.type === 'error' ? "destructive" : "default"} className={`${alert.type === 'error' ? 'bg-red-500/20 border-red-500 text-red-100' : 'bg-green-500/20 border-green-500 text-green-100'}`}>
          {alert.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <OrgProfileHeader
        formData={formData}
        profile={profile}
        isEditing={isEditing}
        isLoading={isLoading}
        onEdit={() => setIsEditing(true)}
        onSave={handleSubmit}
        onCancel={handleCancel}
      />

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

                          {/* --- View Announcement Tab Content with Pagination --- */}
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
                              <>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  {/* Render only the paginated items */}
                                  {paginatedAnnouncements.map((item) => (
                                      <AnnouncementCard key={item.id} item={item} onUpdate={fetchAnnouncements} onDelete={(id) => handleDelete('announcements', id)} />
                                    ))}
                                </div>
                                
                                {/* Pagination Component */}
                                {totalPagesAnnouncement > 1 && (
                                  <Pagination className="mt-8">
                                    <PaginationContent>
                                      {generatePaginationItems(
                                        totalPagesAnnouncement, 
                                        currentPageAnnouncement, 
                                        setCurrentPageAnnouncement
                                      )}
                                    </PaginationContent>
                                  </Pagination>
                                )}
                              </>
                            )}
                          </TabsContent>

                          {/* --- View Blogs Tab Content with Pagination --- */}
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
                              <>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  {/* Render only the paginated items */}
                                  {paginatedBlogs.map((item) => (
                                    <BlogCard key={item.id} item={item} onUpdate={fetchBlogs} onDelete={(id) => handleDelete('blog', id)} />
                                  ))}
                                </div>

                                {/* Pagination Component */}
                                {totalPagesBlogs > 1 && (
                                  <Pagination className="mt-8">
                                    <PaginationContent>
                                      {generatePaginationItems(
                                        totalPagesBlogs, 
                                        currentPageBlogs, 
                                        setCurrentPageBlogs
                                      )}
                                    </PaginationContent>
                                  </Pagination>
                                )}
                              </>
                            )}
                          </TabsContent>

                          {/* --- View Resources Tab Content with Pagination --- */}
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
                              <>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  {/* Render only the paginated items */}
                                  {paginatedResources.map((item) => (
                                    <ResourceCard key={item.id} item={item} onDelete={(id) => handleDelete('resource', id)} />
                                  ))}
                                </div>

                                {/* Pagination Component */}
                                {totalPagesResources > 1 && (
                                  <Pagination className="mt-8">
                                    <PaginationContent>
                                      {generatePaginationItems(
                                        totalPagesResources, 
                                        currentPageResources, 
                                        setCurrentPageResources
                                      )}
                                    </PaginationContent>
                                  </Pagination>
                                )}
                              </>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <OrgAboutSection
            formData={formData}
            isEditing={isEditing}
            onChange={handleChange}
          />

          <OrgAchievementsSection
            achievements={formData.achievements}
            availableAchievements={availableOrgAchievements}
          />
        </div>

        <div className="space-y-6">
          <OrgBrandIdentity
            formData={formData}
            isEditing={isEditing}
            onChange={handleChange}
            onColorChange={handleColorChange}
          />

          <OrgQuickStats
            formData={formData}
            totalAchievements={availableOrgAchievements.length}
          />
        </div>
      </div>
    </div>
  )
}