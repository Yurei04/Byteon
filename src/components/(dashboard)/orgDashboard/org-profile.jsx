"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
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
  Award,
  User2,
  Building2,
  Palette,
  Save,
  X,
  LogOut,
  Mail,
  AtSign
} from "lucide-react"
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

import ResourceForm from "@/components/resourceHub/resource-form"
import BlogForm from "@/components/blog/blog-form"
import AnnounceForm from "@/components/(dashboard)/announce/announce-form"
import ResourceCard from "@/components/resourceHub/resourceHub-card"
import BlogCard from "@/components/blog/blogCard"
import AnnouncementCard from "@/components/(dashboard)/announce/announce-card"
import OrgProfileHeader from "./org-profile-header"
import OrgAboutSection from "./org-about-section"
import OrgAchievementsSection from "./org-achievement-section"
import OrgBrandIdentity from "./org-brand-identity"
import OrgQuickStats from "./org-quick-stats"
import DeleteAccountModal from "./delete-account"
import { availableOrgAchievements } from "./org-achievements"

const ITEMS_PER_PAGE = 6;

export default function OrganizationProfile() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("view")
  const [activeViewTab, setActiveViewTab] = useState("viewAnnouncement")
  const [activeCreateTab, setActiveCreateTab] = useState("createAnnouncement")
  
  const [announcements, setAnnouncements] = useState([])
  const [blogs, setBlogs] = useState([])
  const [resources, setResources] = useState([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAnnouncements: 0,
    totalBlogs: 0,
    totalResources: 0,
    activeAnnouncements: 0
  })

  const [currentPageAnnouncement, setCurrentPageAnnouncement] = useState(1);
  const [currentPageBlogs, setCurrentPageBlogs] = useState(1);
  const [currentPageResources, setCurrentPageResources] = useState(1);

  // Organization Profile State
  const [profile, setProfile] = useState(null)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [alert, setAlert] = useState(null)
  const [userId, setUserId] = useState(null)
  const [userEmail, setUserEmail] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
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
        setUserId(session.user.id)
        setUserEmail(session.user.email)
        await fetchOrgProfile(session.user.id)
        await fetchAllData(session.user.id)
      } else {
        setAlert({ type: 'error', message: 'You must be logged in to view this page.' })
        setIsLoading(false)
        router.push('/log-in')
      }
    }

    getAuthOrg()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Org Auth state changed:', event, session?.user?.id)
      if (session?.user) {
        setUserId(session.user.id)
        setUserEmail(session.user.email)
        await fetchOrgProfile(session.user.id)
        await fetchAllData(session.user.id)
      } else {
        setProfile(null)
        setUserId(null)
        setUserEmail(null)
        router.push('/log-in')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchOrgProfile = async (authUserId) => {
    setIsProfileLoading(true)
    try {
      console.log('Fetching org profile for user_id:', authUserId)
      
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('user_id', authUserId)
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
          description: data.description || "",
          author_name: data.author_name || "",
          primary_color: data.primary_color || "#000000",
          secondary_color: data.secondary_color || "#1F2937",
          color_scheme: data.color_scheme || "black",
          active: data.active !== false,
          achievements: orgAchievements,
        })
      } else {
        setAlert({ type: 'error', message: 'Organization profile not found. Please contact support.' })
      }
    } catch (error) {
      console.error('Error fetching org profile:', error.message)
      setAlert({ type: 'error', message: 'Failed to load organization profile.' })
    } finally {
      setIsProfileLoading(false)
    }
  }

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
  }

  const handleColorChange = (colorType, value) => {
    setFormData(prev => ({ ...prev, [colorType]: value }))
  }

  const handleProfileSubmit = async () => {
    if (!formData.name || !formData.description) {
      setAlert({ type: 'error', message: 'Organization Name and Description are required fields.' })
      return
    }

    if (!formData.author_name) {
      setAlert({ type: 'error', message: 'Username (Author Name) is required.' })
      return
    }

    if (!profile?.user_id) {
        setAlert({ type: 'error', message: 'Cannot update: Organization profile not found.' })
        return
    }

    setIsProfileLoading(true)
    setAlert(null)

    try {
      const profileUpdates = {
        name: formData.name,
        description: formData.description,
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
        .eq('user_id', profile.user_id)
        .select()
        .single()
      
      if (error) throw error

      setAlert({ type: 'success', message: 'Organization profile updated successfully!' })
      setIsEditing(false)
      setProfile(data)

      setTimeout(() => {
        setAlert(null)
      }, 2000)

    } catch (error) {
      console.error('Error updating profile:', error.message)
      setAlert({ type: 'error', message: `Failed to update profile: ${error.message}` })
    } finally {
      setIsProfileLoading(false)
    }
  }

  const handleProfileCancel = () => {
    setIsEditing(false)
    if (profile) {
      fetchOrgProfile(userId)
    }
  }

  const fetchAllData = async (authUserId) => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchAnnouncements(authUserId),
        fetchBlogs(authUserId),
        fetchResources(authUserId)
      ])
      setCurrentPageAnnouncement(1);
      setCurrentPageBlogs(1);
      setCurrentPageResources(1);
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAnnouncements = async (authUserId) => {
    const { data: orgData } = await supabase
      .from('organizations')
      .select('name')
      .eq('user_id', authUserId)
      .single()

    if (!orgData) return

    const { data } = await supabase
      .from('announcements')
      .select('*')
      .eq('organization', orgData.name)
      
    setAnnouncements(data || [])
    const now = new Date()
    const active = data?.filter(a => new Date(a.date_end) >= now).length || 0
    setStats(prev => ({ ...prev, totalAnnouncements: data?.length || 0, activeAnnouncements: active }))
  }

  const fetchBlogs = async (authUserId) => {
    const { data: orgData } = await supabase
      .from('organizations')
      .select('name')
      .eq('user_id', authUserId)
      .single()

    if (!orgData) return

    const { data } = await supabase
      .from('blogs')
      .select('*')
      .eq('organization', orgData.name)
      
    setBlogs(data || [])
    setStats(prev => ({ ...prev, totalBlogs: data?.length || 0 }))
  }

  const fetchResources = async (authUserId) => {
    const { data: orgData } = await supabase
      .from('organizations')
      .select('name')
      .eq('user_id', authUserId)
      .single()

    if (!orgData) return

    const { data } = await supabase
      .from('resource_hub')
      .select('*')
      .eq('organization', orgData.name)
      
    setResources(data || [])
    setStats(prev => ({ ...prev, totalResources: data?.length || 0 }))
  }

  const handleDelete = async (type, id) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return
    
    try {
      await supabase.from(type === 'announcement' ? 'announcements' : type === 'blog' ? 'blogs' : 'resource_hub').delete().eq('id', id)
      
      if (type === 'announcement') fetchAnnouncements(userId)
      else if (type === 'blog') fetchBlogs(userId)
      else fetchResources(userId)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const paginateData = (data, currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (data) => {
    return Math.ceil(data.length / ITEMS_PER_PAGE);
  };

  const generatePaginationItems = (totalPages, currentPage, onPageChange) => {
    const items = [];
    const maxVisiblePages = 5; 

    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={() => onPageChange(currentPage - 1)}
          isActive={currentPage > 1}
          className={currentPage > 1 ? "cursor-pointer hover:bg-fuchsia-800/20" : "pointer-events-none opacity-50"}
        />
      </PaginationItem>
    );

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => onPageChange(1)} className="cursor-pointer hover:bg-fuchsia-800/20">1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(<PaginationItem key="ellipsis-start"><PaginationEllipsis /></PaginationItem>);
      }
    }

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <PaginationItem key={page}>
          <PaginationLink 
            onClick={() => onPageChange(page)} 
            isActive={page === currentPage} 
            className={`cursor-pointer ${page === currentPage ? 'bg-fuchsia-600/50 text-white' : 'hover:bg-fuchsia-800/20'}`}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<PaginationItem key="ellipsis-end"><PaginationEllipsis /></PaginationItem>);
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => onPageChange(totalPages)} className="cursor-pointer hover:bg-fuchsia-800/20">{totalPages}</PaginationLink>
        </PaginationItem>
      );
    }

    items.push(
      <PaginationItem key="next">
        <PaginationNext
          onClick={() => onPageChange(currentPage + 1)}
          isActive={currentPage < totalPages}
          className={currentPage < totalPages ? "cursor-pointer hover:bg-fuchsia-800/20" : "pointer-events-none opacity-50"}
        />
      </PaginationItem>
    );

    return items;
  };
  
  const paginatedAnnouncements = useMemo(() => {
    return paginateData(announcements, currentPageAnnouncement, ITEMS_PER_PAGE);
  }, [announcements, currentPageAnnouncement]);

  const paginatedBlogs = useMemo(() => {
    return paginateData(blogs, currentPageBlogs, ITEMS_PER_PAGE);
  }, [blogs, currentPageBlogs]);

  const paginatedResources = useMemo(() => {
    return paginateData(resources, currentPageResources, ITEMS_PER_PAGE);
  }, [resources, currentPageResources]);

  const totalPagesAnnouncement = getTotalPages(announcements);
  const totalPagesBlogs = getTotalPages(blogs);
  const totalPagesResources = getTotalPages(resources);

  if (!userId) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-fuchsia-950 flex items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in as an organization to access the dashboard.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-fuchsia-950 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-purple-300 to-pink-300">
                Dashboard Center
              </span>
            </h1>
            <p className="text-fuchsia-200/80 max-w-2xl mx-auto text-lg">
              Manage your organization, announcements, blogs, and resources
            </p>
          </div>

          {!isLoading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
            >
              <Card className="group relative bg-gradient-to-br from-purple-900/40 via-violet-900/40 to-slate-950/40 backdrop-blur-xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-purple-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-violet-600/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="relative p-4 sm:p-6">
                  <div className="flex flex-col items-center justify-center text-center space-y-2">
                    <div className="p-3 bg-purple-500/20 rounded-full border border-purple-400/30">
                      <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-300" />
                    </div>
                    <div>
                      <p className="text-purple-200/70 text-xs sm:text-sm">Your Profile</p>
                      <p className="text-lg sm:text-xl font-bold text-purple-300">{formData.active ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group relative bg-gradient-to-br from-fuchsia-900/40 via-purple-900/40 to-slate-950/40 backdrop-blur-xl border border-fuchsia-500/30 hover:border-fuchsia-400/50 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-fuchsia-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/0 via-purple-600/5 to-fuchsia-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-fuchsia-200/70 text-sm mb-1">Announcements</p>
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
                      <p className="text-emerald-200/70 text-sm mb-1">Resources</p>
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
                      <p className="text-purple-200/70 text-sm mb-1">Blogs</p>
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
                      <Building2 className="w-4 h-4" />Profile
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

                  <TabsContent value="profile" className="mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-6">
                        {alert && (
                          <Alert variant={alert.type === 'error' ? "destructive" : "default"} className={`${alert.type === 'error' ? 'bg-red-500/20 border-red-500 text-red-100' : 'bg-green-500/20 border-green-500 text-green-100'}`}>
                            {alert.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            <AlertDescription>{alert.message}</AlertDescription>
                          </Alert>
                        )}

                        {isProfileLoading && !profile ? (
                          <div className="flex justify-center items-center p-12 text-white">
                            <Loader2 className="mr-2 h-8 w-8 animate-spin" /> Loading Organization Profile...
                          </div>
                        ) : (
                          <>
                            <OrgProfileHeader
                              formData={formData}
                              profile={profile}
                              isEditing={isEditing}
                              isLoading={isProfileLoading}
                              onEdit={() => setIsEditing(true)}
                              onSave={handleProfileSubmit}
                              onCancel={handleProfileCancel}
                            />

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              <div className="lg:col-span-2 space-y-6">
                                <OrgAboutSection
                                  formData={formData}
                                  isEditing={isEditing}
                                  onChange={handleProfileChange}
                                />

                                <Card className="bg-black/20 backdrop-blur-lg border border-purple-500/20">
                                  <CardContent className="p-6">
                                    <h3 className="text-xl font-bold text-purple-200 mb-4 flex items-center gap-2">
                                      <AtSign className="w-5 h-5" />
                                      Account Information
                                    </h3>
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-purple-300 mb-2 block flex items-center gap-2">
                                            <AtSign className="w-4 h-4" />
                                            Username (Author Name)
                                          </Label>
                                          {isEditing ? (
                                            <Input
                                              name="author_name"
                                              value={formData.author_name}
                                              onChange={handleProfileChange}
                                              className="bg-black/30 border-purple-500/30 text-white"
                                              placeholder="johndoe"
                                            />
                                          ) : (
                                            <p className="text-white p-2 bg-black/20 rounded border border-purple-500/20">
                                              {formData.author_name || "Not set"}
                                            </p>
                                          )}
                                        </div>
                                        <div>
                                          <Label className="text-purple-300 mb-2 block flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            Email (Login)
                                          </Label>
                                          <p className="text-white p-2 bg-black/20 rounded border border-purple-500/20">
                                            {userEmail}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                <OrgAchievementsSection
                                  achievements={formData.achievements}
                                  availableAchievements={availableOrgAchievements}
                                />
                              </div>

                              <div className="space-y-6">
                                <OrgBrandIdentity
                                  formData={formData}
                                  isEditing={isEditing}
                                  onChange={handleProfileChange}
                                  onColorChange={handleColorChange}
                                />

                                <OrgQuickStats
                                  formData={formData}
                                  totalAchievements={availableOrgAchievements.length}
                                />

                                <Card className="bg-gradient-to-br from-red-900/40 to-slate-950/40 backdrop-blur-lg border border-red-500/30">
                                  <CardContent className="p-6">
                                    <h3 className="text-xl font-bold text-red-300 mb-4 flex items-center gap-2">
                                      <AlertCircle className="w-5 h-5" />
                                      Danger Zone
                                    </h3>
                                    <Button
                                      onClick={() => setShowDeleteModal(true)}
                                      variant="destructive"
                                      className="w-full bg-red-600 hover:bg-red-700"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete Account
                                    </Button>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  </TabsContent>

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
                              Your Announcements
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
                                  {paginatedAnnouncements.map((item) => (
                                    <AnnouncementCard key={item.id} item={item} onUpdate={() => fetchAnnouncements(userId)} onDelete={(id) => handleDelete('announcement', id)} />
                                  ))}
                                </div>
                                
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

                          <TabsContent value="viewBlogs">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-6">
                              Your Blogs
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
                                  {paginatedBlogs.map((item) => (
                                    <BlogCard key={item.id} item={item} onUpdate={() => fetchBlogs(userId)} onDelete={(id) => handleDelete('blog', id)} />
                                  ))}
                                </div>

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

                          <TabsContent value="viewResources">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent mb-6">
                              Your Resources
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
                                  {paginatedResources.map((item) => (
                                    <ResourceCard key={item.id} item={item} onDelete={(id) => handleDelete('resource', id)} />
                                  ))}
                                </div>

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
                            <AnnounceForm onSuccess={() => fetchAllData(userId)} organizationName={profile?.name} />
                          </TabsContent>

                          <TabsContent value="createBlogs">
                            <BlogForm onSuccess={() => fetchAllData(userId)} organizationName={profile?.name} />
                          </TabsContent>

                          <TabsContent value="createResources">
                            <ResourceForm onSuccess={() => fetchAllData(userId)} organizationName={profile?.name} />
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

      {showDeleteModal && (
        <DeleteAccountModal
          organizationName={profile?.name}
          userId={userId}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  )
}