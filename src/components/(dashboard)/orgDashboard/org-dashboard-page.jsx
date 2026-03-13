"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { 
  Plus, FileText, Megaphone, BookOpen, TrendingUp,
  Loader2, Trash2, AlertCircle, CheckCircle,
  Building2, AtSign, Mail
} from "lucide-react"
import { 
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis,
} from "@/components/ui/pagination"

import { useAuth } from "@/components/(auth)/authContext" 
import ResourceForm from "@/components/resourceHub/resource-form"
import BlogForm from "@/components/blog/blog-form"
import AnnounceForm from "@/components/(dashboard)/announce/announce-form"
import ResourceCard from "@/components/resourceHub/resourceHub-card"
import BlogCard from "@/components/blog/blogCard"
import AnnouncementCard from "@/components/(dashboard)/announce/announce-card"
import OrgProfileHeader from "./org-profile-header"
import OrgAboutSection from "./org-about-section"
import OrgQuickStats from "./org-quick-stats"
import DeleteAccountModal from "./delete-account"
import { availableOrgAchievements } from "./org-achievements"
import { ReturnButton } from "@/components/return"

const ITEMS_PER_PAGE = 6

export default function OrgDashboardPage() {
  const router = useRouter()
  const { profile, role, loading: authLoading, isLoggedIn, session, refreshProfile } = useAuth()

  const [activeTab, setActiveTab] = useState("view")
  const [activeViewTab, setActiveViewTab] = useState("viewAnnouncement")
  const [activeCreateTab, setActiveCreateTab] = useState("createAnnouncement")

  const [announcements, setAnnouncements] = useState([])
  const [blogs, setBlogs] = useState([])
  const [resources, setResources] = useState([])

  const [contentLoading, setContentLoading] = useState(false)
  const [stats, setStats] = useState({ totalAnnouncements: 0, totalBlogs: 0, totalResources: 0, activeAnnouncements: 0 })

  const [currentPageAnnouncement, setCurrentPageAnnouncement] = useState(1)
  const [currentPageBlogs, setCurrentPageBlogs] = useState(1)
  const [currentPageResources, setCurrentPageResources] = useState(1)

  const [isEditing, setIsEditing] = useState(false)
  const [isProfileSaving, setIsProfileSaving] = useState(false)
  const [alert, setAlert] = useState(null)
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

  // Redirect if not org_admin
  useEffect(() => {
    if (authLoading) return
    if (!isLoggedIn) { router.push("/log-in"); return }
    if (role !== "org_admin") { router.push("/unauthorized"); return }
  }, [authLoading, isLoggedIn, role, router])

  // Seed form from context profile
  useEffect(() => {
    if (!profile) return

    const orgAchievements = profile.achievements
      ? (typeof profile.achievements === "string" ? JSON.parse(profile.achievements) : profile.achievements)
      : []

    setFormData({
      name: profile.name || "",
      description: profile.description || "",
      author_name: profile.author_name || "",
      primary_color: profile.primary_color || "#000000",
      secondary_color: profile.secondary_color || "#1F2937",
      color_scheme: profile.color_scheme || "black",
      active: profile.active !== false,
      achievements: orgAchievements,
    })
  }, [profile])

  // Fetch content once profile.id is available
  useEffect(() => {
    if (!profile?.id) return
    fetchAllData(profile.id)
  }, [profile?.id])

  // Re-fetch on tab visibility
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && profile?.id) {
        fetchAllData(profile.id)
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [profile?.id])

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchAllData = async (orgId) => {
    setContentLoading(true)
    await Promise.all([
      fetchAnnouncements(orgId),
      fetchBlogs(orgId),
      fetchResources(orgId),
    ])
    setCurrentPageAnnouncement(1)
    setCurrentPageBlogs(1)
    setCurrentPageResources(1)
    setContentLoading(false)
  }

  const fetchAnnouncements = async (orgId) => {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
    if (error) { console.error("fetchAnnouncements:", error); return }
    setAnnouncements(data || [])
    const active = data?.filter(a => new Date(a.date_end) >= new Date()).length || 0
    setStats(prev => ({ ...prev, totalAnnouncements: data?.length || 0, activeAnnouncements: active }))
  }

  const fetchBlogs = async (orgId) => {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
    if (error) { console.error("fetchBlogs:", error); return }
    setBlogs(data || [])
    setStats(prev => ({ ...prev, totalBlogs: data?.length || 0 }))
  }

  const fetchResources = async (orgId) => {
    const { data, error } = await supabase
      .from("resource_hub")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
    if (error) { console.error("fetchResources:", error); return }
    setResources(data || [])
    setStats(prev => ({ ...prev, totalResources: data?.length || 0 }))
  }

  const refreshAnnouncements = () => profile?.id && fetchAnnouncements(profile.id)
  const refreshBlogs         = () => profile?.id && fetchBlogs(profile.id)
  const refreshResources     = () => profile?.id && fetchResources(profile.id)
  const refreshAll           = () => profile?.id && fetchAllData(profile.id)

  // ── Profile editing ────────────────────────────────────────────────────────

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  const handleProfileSubmit = async () => {
    if (!formData.name || !formData.description) {
      setAlert({ type: "error", message: "Organization Name and Description are required." }); return
    }
    if (!formData.author_name) {
      setAlert({ type: "error", message: "Username (Author Name) is required." }); return
    }

    setIsProfileSaving(true)
    setAlert(null)
    try {
      const { error } = await supabase
        .from("organizations")
        .update({
          name: formData.name,
          description: formData.description,
          author_name: formData.author_name,
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          color_scheme: formData.color_scheme,
          active: formData.active,
          achievements: JSON.stringify(formData.achievements),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", profile.user_id)

      if (error) throw error

      // Refresh the context cache so navbar + other components stay in sync
      await refreshProfile()
      setAlert({ type: "success", message: "Organization profile updated successfully!" })
      setIsEditing(false)
      setTimeout(() => setAlert(null), 2000)
    } catch (error) {
      setAlert({ type: "error", message: `Failed to update profile: ${error.message}` })
    } finally {
      setIsProfileSaving(false)
    }
  }

  const handleProfileCancel = () => {
    setIsEditing(false)
    // Reset form back to context values
    if (profile) {
      const orgAchievements = profile.achievements
        ? (typeof profile.achievements === "string" ? JSON.parse(profile.achievements) : profile.achievements)
        : []
      setFormData({
        name: profile.name || "",
        description: profile.description || "",
        author_name: profile.author_name || "",
        primary_color: profile.primary_color || "#000000",
        secondary_color: profile.secondary_color || "#1F2937",
        color_scheme: profile.color_scheme || "black",
        active: profile.active !== false,
        achievements: orgAchievements,
      })
    }
  }

  const handleDelete = async (type, id) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return
    const table = type === "announcement" ? "announcements" : type === "blog" ? "blogs" : "resource_hub"
    try {
      const { error } = await supabase.from(table).delete().eq("id", id)
      if (error) throw error
      if (type === "announcement") refreshAnnouncements()
      else if (type === "blog") refreshBlogs()
      else refreshResources()
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  // ── Pagination helpers ─────────────────────────────────────────────────────

  const paginateData = (data, page) => data.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  const getTotalPages = (data) => Math.ceil(data.length / ITEMS_PER_PAGE)

  const generatePaginationItems = (totalPages, currentPage, onPageChange) => {
    const items = []
    const maxVisible = 5

    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          className={currentPage > 1 ? "cursor-pointer hover:bg-fuchsia-800/20" : "pointer-events-none opacity-50"}
        />
      </PaginationItem>
    )

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1)

    if (start > 1) {
      items.push(<PaginationItem key={1}><PaginationLink onClick={() => onPageChange(1)} className="cursor-pointer">1</PaginationLink></PaginationItem>)
      if (start > 2) items.push(<PaginationItem key="e1"><PaginationEllipsis /></PaginationItem>)
    }

    for (let p = start; p <= end; p++) {
      items.push(
        <PaginationItem key={p}>
          <PaginationLink onClick={() => onPageChange(p)} isActive={p === currentPage}
            className={`cursor-pointer ${p === currentPage ? "bg-fuchsia-600/50 text-white" : "hover:bg-fuchsia-800/20"}`}>
            {p}
          </PaginationLink>
        </PaginationItem>
      )
    }

    if (end < totalPages) {
      if (end < totalPages - 1) items.push(<PaginationItem key="e2"><PaginationEllipsis /></PaginationItem>)
      items.push(<PaginationItem key={totalPages}><PaginationLink onClick={() => onPageChange(totalPages)} className="cursor-pointer">{totalPages}</PaginationLink></PaginationItem>)
    }

    items.push(
      <PaginationItem key="next">
        <PaginationNext
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          className={currentPage < totalPages ? "cursor-pointer hover:bg-fuchsia-800/20" : "pointer-events-none opacity-50"}
        />
      </PaginationItem>
    )

    return items
  }

  const paginatedAnnouncements = useMemo(() => paginateData(announcements, currentPageAnnouncement), [announcements, currentPageAnnouncement])
  const paginatedBlogs         = useMemo(() => paginateData(blogs, currentPageBlogs), [blogs, currentPageBlogs])
  const paginatedResources     = useMemo(() => paginateData(resources, currentPageResources), [resources, currentPageResources])

  // ── Guards ─────────────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-fuchsia-300" />
      </div>
    )
  }

  if (!isLoggedIn || role !== "org_admin") return null

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-fuchsia-950 p-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full flex justify-between max-w-7xl mx-auto mb-6 p-2">
        <div className="p-2"><ReturnButton /></div>
        <div className="w-full bg-gradient-to-r from-fuchsia-900/40 to-purple-900/40 backdrop-blur-lg border border-fuchsia-500/30 py-3 px-3 rounded-lg shadow-lg shadow-fuchsia-500/10">
          <p className="text-fuchsia-200 text-sm text-center flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />⚠️ This Page is currently in Beta Testing
          </p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-purple-300 to-pink-300">Dashboard Center</span>
            </h1>
            <p className="text-fuchsia-200/80 max-w-2xl mx-auto text-lg">Manage your organization, announcements, blogs, and resources</p>
          </div>

          {/* Stat Cards */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card className="group relative bg-gradient-to-br from-purple-900/40 via-violet-900/40 to-slate-950/40 backdrop-blur-xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-purple-500/20">
              <CardContent className="relative p-4 sm:p-6">
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                  <div className="p-3 bg-purple-500/20 rounded-full border border-purple-400/30">
                    <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-300" />
                  </div>
                  <div>
                    <p className="text-purple-200/70 text-xs sm:text-sm">Your Profile</p>
                    <p className="text-lg sm:text-xl font-bold text-purple-300">{formData.active ? "Active" : "Inactive"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {[
              { label: "Announcements", count: stats.totalAnnouncements, Icon: Megaphone,   color: "fuchsia" },
              { label: "Resources",     count: stats.totalResources,     Icon: BookOpen,    color: "emerald" },
              { label: "Blogs",         count: stats.totalBlogs,         Icon: FileText,    color: "purple"  },
              { label: "Active Events", count: stats.activeAnnouncements,Icon: TrendingUp,  color: "orange"  },
            ].map(({ label, count, Icon, color }) => (
              <Card key={label} className={`group relative bg-gradient-to-br from-${color}-900/40 to-slate-950/40 backdrop-blur-xl border border-${color}-500/30 hover:border-${color}-400/50 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-${color}-500/20`}>
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-${color}-200/70 text-sm mb-1`}>{label}</p>
                      <p className={`text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-${color}-300 to-${color}-300`}>{count}</p>
                    </div>
                    <div className={`p-3 bg-${color}-500/20 rounded-lg border border-${color}-400/30`}>
                      <Icon className={`w-8 h-8 text-${color}-300`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Main Tabs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-br from-fuchsia-950/40 via-purple-950/40 to-slate-950/40 backdrop-blur-xl border border-fuchsia-500/20">
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 mb-6 bg-black/20 border border-fuchsia-500/20 p-1">
                    {[
                      { value: "profile", icon: <Building2 className="w-4 h-4" />, label: "Profile" },
                      { value: "view",    icon: <FileText   className="w-4 h-4" />, label: "View All" },
                      { value: "create",  icon: <Plus       className="w-4 h-4" />, label: "Create New" },
                    ].map(({ value, icon, label }) => (
                      <TabsTrigger key={value} value={value}
                        className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all">
                        {icon}{label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* ── Profile Tab ── */}
                  <TabsContent value="profile" className="mt-0">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="space-y-6">
                        {alert && (
                          <Alert className={alert.type === "error" ? "bg-red-500/20 border-red-500 text-red-100" : "bg-green-500/20 border-green-500 text-green-100"}>
                            {alert.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            <AlertDescription>{alert.message}</AlertDescription>
                          </Alert>
                        )}

                        <OrgProfileHeader
                          formData={formData} profile={profile} isEditing={isEditing}
                          isLoading={isProfileSaving} onEdit={() => setIsEditing(true)}
                          onSave={handleProfileSubmit} onCancel={handleProfileCancel}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-2 space-y-6">
                            <OrgAboutSection formData={formData} isEditing={isEditing} onChange={handleProfileChange} />
                            <Card className="bg-black/20 backdrop-blur-lg border border-purple-500/20">
                              <CardContent className="p-6">
                                <h3 className="text-xl font-bold text-purple-200 mb-4 flex items-center gap-2">
                                  <AtSign className="w-5 h-5" />Account Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-purple-300 mb-2 block flex items-center gap-2">
                                      <AtSign className="w-4 h-4" />Username (Author Name)
                                    </Label>
                                    {isEditing ? (
                                      <Input name="author_name" value={formData.author_name} onChange={handleProfileChange}
                                        className="bg-black/30 border-purple-500/30 text-white" placeholder="johndoe" />
                                    ) : (
                                      <p className="text-white p-2 bg-black/20 rounded border border-purple-500/20">
                                        {formData.author_name || "Not set"}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <Label className="text-purple-300 mb-2 block flex items-center gap-2">
                                      <Mail className="w-4 h-4" />Email (Login)
                                    </Label>
                                    <p className="text-white p-2 bg-black/20 rounded border border-purple-500/20">
                                      {session?.user?.email}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                          <div className="space-y-6">
                            <OrgQuickStats formData={formData} totalAchievements={availableOrgAchievements.length} />
                            <Card className="bg-gradient-to-br from-red-900/40 to-slate-950/40 backdrop-blur-lg border border-red-500/30">
                              <CardContent className="p-6">
                                <h3 className="text-xl font-bold text-red-300 mb-4 flex items-center gap-2">
                                  <AlertCircle className="w-5 h-5" />Danger Zone
                                </h3>
                                <Button onClick={() => setShowDeleteModal(true)} variant="destructive" className="w-full bg-red-600 hover:bg-red-700">
                                  <Trash2 className="w-4 h-4 mr-2" />Delete Account
                                </Button>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* ── View All Tab ── */}
                  <TabsContent value="view">
                    <Card className="bg-black/20 backdrop-blur-lg border border-fuchsia-500/10">
                      <CardContent className="p-6">
                        <Tabs value={activeViewTab} onValueChange={setActiveViewTab}>
                          <TabsList className="grid w-full grid-cols-3 mb-6 bg-black/20 border border-purple-500/20 p-1">
                            <TabsTrigger value="viewAnnouncement" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                              <Megaphone className="w-4 h-4 mr-2" />Announcements
                            </TabsTrigger>
                            <TabsTrigger value="viewBlogs" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                              <FileText className="w-4 h-4 mr-2" />Blogs
                            </TabsTrigger>
                            <TabsTrigger value="viewResources" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white">
                              <BookOpen className="w-4 h-4 mr-2" />Resources
                            </TabsTrigger>
                          </TabsList>

                          {[
                            { tab: "viewAnnouncement", label: "Your Announcements", gradient: "from-fuchsia-300 to-purple-300", spinner: "fuchsia",
                              data: paginatedAnnouncements, totalPages: getTotalPages(announcements),
                              currentPage: currentPageAnnouncement, setPage: setCurrentPageAnnouncement,
                              renderCard: (item) => <AnnouncementCard key={item.id} item={item} onUpdate={refreshAnnouncements} onDelete={(id) => handleDelete("announcement", id)} /> },
                            { tab: "viewBlogs", label: "Your Blogs", gradient: "from-purple-300 to-pink-300", spinner: "purple",
                              data: paginatedBlogs, totalPages: getTotalPages(blogs),
                              currentPage: currentPageBlogs, setPage: setCurrentPageBlogs,
                              renderCard: (item) => <BlogCard key={item.id} item={item} onUpdate={refreshBlogs} onDelete={(id) => handleDelete("blog", id)} /> },
                            { tab: "viewResources", label: "Your Resources", gradient: "from-emerald-300 to-green-300", spinner: "emerald",
                              data: paginatedResources, totalPages: getTotalPages(resources),
                              currentPage: currentPageResources, setPage: setCurrentPageResources,
                              renderCard: (item) => <ResourceCard key={item.id} item={item} onDelete={(id) => handleDelete("resource", id)} /> },
                          ].map(({ tab, label, gradient, data, totalPages, currentPage, setPage, spinner, renderCard }) => (
                            <TabsContent key={tab} value={tab}>
                              <h3 className={`text-2xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-6`}>{label}</h3>
                              {contentLoading ? (
                                <div className="flex justify-center py-12">
                                  <Loader2 className={`w-8 h-8 animate-spin text-${spinner}-300`} />
                                </div>
                              ) : data.length === 0 ? (
                                <Alert className={`bg-${spinner}-900/20 border-${spinner}-500/30`}>
                                  <AlertCircle className={`w-4 h-4 text-${spinner}-300`} />
                                  <AlertDescription className="text-center py-8">
                                    No {label.split(" ")[1].toLowerCase()} yet. Create your first one!
                                  </AlertDescription>
                                </Alert>
                              ) : (
                                <>
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{data.map(renderCard)}</div>
                                  {totalPages > 1 && (
                                    <Pagination className="mt-8">
                                      <PaginationContent>{generatePaginationItems(totalPages, currentPage, setPage)}</PaginationContent>
                                    </Pagination>
                                  )}
                                </>
                              )}
                            </TabsContent>
                          ))}
                        </Tabs>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ── Create Tab ── */}
                  <TabsContent value="create">
                    <Card className="bg-black/20 backdrop-blur-lg border border-fuchsia-500/10">
                      <CardContent className="p-6">
                        <Tabs value={activeCreateTab} onValueChange={setActiveCreateTab}>
                          <TabsList className="grid w-full grid-cols-3 mb-6 bg-black/20 border border-purple-500/20 p-1">
                            <TabsTrigger value="createAnnouncement" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                              <Megaphone className="w-4 h-4 mr-2" />Announcement
                            </TabsTrigger>
                            <TabsTrigger value="createBlogs" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                              <FileText className="w-4 h-4 mr-2" />Blog
                            </TabsTrigger>
                            <TabsTrigger value="createResources" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white">
                              <BookOpen className="w-4 h-4 mr-2" />Resource
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="createAnnouncement">
                            <AnnounceForm onSuccess={refreshAll} currentOrg={profile} authUserId={profile?.user_id} />
                          </TabsContent>
                          <TabsContent value="createBlogs">
                            <BlogForm onSuccess={refreshAll} currentOrg={profile} authUserId={profile?.user_id} />
                          </TabsContent>
                          <TabsContent value="createResources">
                            <ResourceForm onSuccess={refreshAll} currentOrg={profile} authUserId={profile?.user_id} />
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
        <DeleteAccountModal organizationName={profile?.name} userId={profile?.user_id} onClose={() => setShowDeleteModal(false)} />
      )}
    </div>
  )
}