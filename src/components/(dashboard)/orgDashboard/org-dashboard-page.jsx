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
import { buildTheme } from "@/lib/blog-color"
import { useRouter } from "next/navigation"
import {
  Plus, FileText, Megaphone, BookOpen, TrendingUp,
  Loader2, Trash2, AlertCircle, CheckCircle,
  Building2, AtSign, Mail, Sparkles, Bell,
  ShieldCheck,
  LogOut,
} from "lucide-react"
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis,
} from "@/components/ui/pagination"

import { useAuth } from "@/components/(auth)/authContext"

import PendingAnnounceForm from "../announce/announce-pending"
import PendingBlogOrgForm  from "@/components/blog/blog-pending"
import PendingResourceForm from "@/components/resourceHub/resource-pending"

import ResourceCard     from "@/components/resourceHub/resourceHub-card"
import BlogCard         from "@/components/blog/blogCard"
import AnnouncementCard from "@/components/(dashboard)/announce/announce-card"
import OrgProfileHeader from "./org-profile-header"
import OrgAboutSection  from "./org-about-section"
import DeleteAccountModal from "./delete-account"
import { availableOrgAchievements } from "./org-achievements"
import { ReturnButton } from "@/components/return"
import PosterMaker      from "@/components/poster-maker/poster-maker"

import NotificationsTab from "@/components/notifications/notification-tab"
import { useNotifications } from "@/components/notifications/use-notification"
import { notifyContentDeletedByOrg } from "@/lib/notification"

const ITEMS_PER_PAGE = 6

export default function OrgDashboardPage() {
  const router = useRouter()
  const { profile, role, loading: authLoading, isLoggedIn, session, refreshProfile } = useAuth()

  const [activeTab, setActiveTab]             = useState("profile")
  const [activeViewTab, setActiveViewTab]     = useState("viewAnnouncement")
  const [activeCreateTab, setActiveCreateTab] = useState("createAnnouncement")

  const [announcements, setAnnouncements] = useState([])
  const [blogs, setBlogs]                 = useState([])
  const [resources, setResources]         = useState([])

  const [contentLoading, setContentLoading] = useState(false)
  const [stats, setStats] = useState({
    totalAnnouncements: 0, totalBlogs: 0, totalResources: 0, activeAnnouncements: 0,
  })

  const [currentPageAnnouncement, setCurrentPageAnnouncement] = useState(1)
  const [currentPageBlogs, setCurrentPageBlogs]               = useState(1)
  const [currentPageResources, setCurrentPageResources]       = useState(1)

  const [isEditing, setIsEditing]             = useState(false)
  const [isProfileSaving, setIsProfileSaving] = useState(false)
  const [alert, setAlert]                     = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [formData, setFormData] = useState({
    name: "", description: "", author_name: "",
    primary_color: "#c026d3", secondary_color: "#db2777",
    color_scheme: "black", active: true, achievements: [],
  })

  // ── Derive org theme from profile colors ───────────────────────────────────
  const orgTheme = useMemo(
    () => buildTheme(
      profile?.primary_color   ?? formData.primary_color,
      profile?.secondary_color ?? formData.secondary_color,
    ),
    [profile?.primary_color, profile?.secondary_color, formData.primary_color, formData.secondary_color],
  )

  // ── Dynamic CSS injected once per theme change ─────────────────────────────
  // Overrides all Radix tab active states and org-themed utility classes
  const dynamicStyles = useMemo(() => `
    .org-tab[data-state=active] {
      background: linear-gradient(to right, ${orgTheme.primaryFull}, ${orgTheme.secondaryFull}) !important;
      color: #ffffff !important;
      border: none !important;
    }
    .org-badge {
      background: linear-gradient(to right, ${orgTheme.primaryFull}, ${orgTheme.secondaryFull});
    }
    .org-page-link[data-active=true] {
      background: ${orgTheme.badgeBgPrimary};
      color: ${orgTheme.primaryText};
    }
    .org-card-hover:hover {
      border-color: ${orgTheme.primary30} !important;
      box-shadow: ${orgTheme.cardShadow} !important;
    }
    .org-spinner { color: ${orgTheme.primaryText}; }
  `, [orgTheme])

  const { unreadCount } = useNotifications({ userId: session?.user?.id, role: "org_admin" })

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return
    if (isLoggedIn && role === null) return
    if (!isLoggedIn) { router.push("/log-in"); return }
    if (role !== "org_admin") { router.push("/unauthorized"); return }
  }, [authLoading, isLoggedIn, role, router])

  useEffect(() => {
    if (!profile) return
    const orgAchievements = profile.achievements
      ? (typeof profile.achievements === "string" ? JSON.parse(profile.achievements) : profile.achievements)
      : []
    setFormData({
      name: profile.name || "", description: profile.description || "",
      author_name: profile.author_name || "",
      primary_color:   profile.primary_color   || "#c026d3",
      secondary_color: profile.secondary_color || "#db2777",
      color_scheme: profile.color_scheme || "black",
      active: profile.active !== false, achievements: orgAchievements,
    })
  }, [profile])

  useEffect(() => { if (!profile?.id) return; fetchAllData(profile.id) }, [profile?.id])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && profile?.id) fetchAllData(profile.id)
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [profile?.id])

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchAllData = async (orgId) => {
    setContentLoading(true)
    await Promise.all([fetchAnnouncements(orgId), fetchBlogs(orgId), fetchResources(orgId)])
    setCurrentPageAnnouncement(1); setCurrentPageBlogs(1); setCurrentPageResources(1)
    setContentLoading(false)
  }

  const fetchAnnouncements = async (orgId) => {
    const { data, error } = await supabase.from("announcements").select("*").eq("organization_id", orgId).order("created_at", { ascending: false })
    if (error) { console.error("fetchAnnouncements:", error); return }
    setAnnouncements(data || [])
    setStats(prev => ({
      ...prev,
      totalAnnouncements: data?.length || 0,
      activeAnnouncements: data?.filter(a => new Date(a.date_end) >= new Date()).length || 0,
    }))
  }
  const fetchBlogs = async (orgId) => {
    const { data, error } = await supabase.from("blogs").select("*").eq("organization_id", orgId).order("created_at", { ascending: false })
    if (error) { console.error("fetchBlogs:", error); return }
    setBlogs(data || [])
    setStats(prev => ({ ...prev, totalBlogs: data?.length || 0 }))
  }
  const fetchResources = async (orgId) => {
    const { data, error } = await supabase.from("resource_hub").select("*").eq("organization_id", orgId).order("created_at", { ascending: false })
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
    setIsProfileSaving(true); setAlert(null)
    try {
      const { error } = await supabase.from("organizations").update({
        name: formData.name, description: formData.description, author_name: formData.author_name,
        primary_color: formData.primary_color, secondary_color: formData.secondary_color,
        color_scheme: formData.color_scheme, active: formData.active,
        achievements: JSON.stringify(formData.achievements), updated_at: new Date().toISOString(),
      }).eq("user_id", profile.user_id)
      if (error) throw error
      await refreshProfile()
      setAlert({ type: "success", message: "Organization profile updated successfully!" })
      setIsEditing(false)
      setTimeout(() => setAlert(null), 2000)
    } catch (error) {
      setAlert({ type: "error", message: `Failed to update profile: ${error.message}` })
    } finally { setIsProfileSaving(false) }
  }

  const handleProfileCancel = () => {
    setIsEditing(false)
    if (profile) {
      const orgAchievements = profile.achievements
        ? (typeof profile.achievements === "string" ? JSON.parse(profile.achievements) : profile.achievements) : []
      setFormData({
        name: profile.name || "", description: profile.description || "",
        author_name: profile.author_name || "",
        primary_color:   profile.primary_color   || "#c026d3",
        secondary_color: profile.secondary_color || "#db2777",
        color_scheme: profile.color_scheme || "black",
        active: profile.active !== false, achievements: orgAchievements,
      })
    }
  }

  const handleDelete = async (type, id) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return
    const sourceArr = type === "announcement" ? announcements : type === "blog" ? blogs : resources
    const item      = sourceArr.find((i) => i.id === id)
    const table     = type === "announcement" ? "announcements" : type === "blog" ? "blogs" : "resource_hub"
    try {
      const { error } = await supabase.from(table).delete().eq("id", id)
      if (error) throw error
      if (type === "announcement") refreshAnnouncements()
      else if (type === "blog")    refreshBlogs()
      else                         refreshResources()
      await notifyContentDeletedByOrg({
        orgName: profile?.name || "An organization",
        contentType: type,
        contentTitle: item?.title || "Untitled",
      })
    } catch (error) { console.error("Delete error:", error) }
  }

  // ── Pagination ─────────────────────────────────────────────────────────────
  const paginateData  = (data, page) => data.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  const getTotalPages = (data) => Math.ceil(data.length / ITEMS_PER_PAGE)

  const generatePaginationItems = (totalPages, currentPage, onPageChange) => {
    const items = []
    const maxVisible = 5
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          className={currentPage > 1 ? "cursor-pointer" : "pointer-events-none opacity-50"}
          style={{ color: orgTheme.primaryText }}
        />
      </PaginationItem>
    )
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let end   = Math.min(totalPages, start + maxVisible - 1)
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1)
    if (start > 1) {
      items.push(<PaginationItem key={1}><PaginationLink onClick={() => onPageChange(1)} className="cursor-pointer">1</PaginationLink></PaginationItem>)
      if (start > 2) items.push(<PaginationItem key="e1"><PaginationEllipsis /></PaginationItem>)
    }
    for (let p = start; p <= end; p++) {
      items.push(
        <PaginationItem key={p}>
          <PaginationLink
            onClick={() => onPageChange(p)}
            isActive={p === currentPage}
            className="cursor-pointer org-page-link"
            data-active={p === currentPage}
            style={p === currentPage ? {
              background: orgTheme.badgeBgPrimary,
              color: orgTheme.primaryText,
              borderColor: orgTheme.primary30,
            } : { color: orgTheme.mutedText }}
          >
            {p}
          </PaginationLink>
        </PaginationItem>
      )
    }
    if (end < totalPages) {
      if (end < totalPages - 1) items.push(<PaginationItem key="e2"><PaginationEllipsis /></PaginationItem>)
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => onPageChange(totalPages)} className="cursor-pointer">{totalPages}</PaginationLink>
        </PaginationItem>
      )
    }
    items.push(
      <PaginationItem key="next">
        <PaginationNext
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          className={currentPage < totalPages ? "cursor-pointer" : "pointer-events-none opacity-50"}
          style={{ color: orgTheme.primaryText }}
        />
      </PaginationItem>
    )
    return items
  }

  const paginatedAnnouncements = useMemo(() => paginateData(announcements, currentPageAnnouncement), [announcements, currentPageAnnouncement])
  const paginatedBlogs         = useMemo(() => paginateData(blogs, currentPageBlogs),               [blogs, currentPageBlogs])
  const paginatedResources     = useMemo(() => paginateData(resources, currentPageResources),       [resources, currentPageResources])

  if (authLoading || (isLoggedIn && role === null)) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: orgTheme.primaryText }} />
      </div>
    )
  }
  if (!isLoggedIn || role !== "org_admin") return null

  // ── Tab definitions ────────────────────────────────────────────────────────
  const mainTabs = [
    { value: "profile",       icon: <Building2 className="w-4 h-4" />, label: "Profile"      },
    { value: "view",          icon: <FileText   className="w-4 h-4" />, label: "View All"     },
    { value: "create",        icon: <Plus       className="w-4 h-4" />, label: "Create New"   },
    { value: "posters",       icon: <Sparkles   className="w-4 h-4" />, label: "Poster Maker" },
    {
      value: "notifications",
      icon: <Bell className="w-4 h-4" />,
      label: (
        <span className="flex items-center gap-1">
          Alerts
          {unreadCount > 0 && (
            <span className="org-badge min-w-[17px] h-[17px] flex items-center justify-center
              rounded-full text-white text-[10px] font-bold px-1 shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </span>
      ),
    },
  ]

  // ── View sub-tabs ──────────────────────────────────────────────────────────
  const viewSubTabs = [
    {
      tab: "viewAnnouncement", icon: <Megaphone className="w-4 h-4 mr-2" />, label: "Announcements",
      data: paginatedAnnouncements, total: announcements, page: currentPageAnnouncement, setPage: setCurrentPageAnnouncement,
      contentLabel: "Announcements",
      renderCard: (item) => <AnnouncementCard key={item.id} item={item} onUpdate={refreshAnnouncements} onDelete={(id) => handleDelete("announcement", id)} />,
    },
    {
      tab: "viewBlogs", icon: <FileText className="w-4 h-4 mr-2" />, label: "Blogs",
      data: paginatedBlogs, total: blogs, page: currentPageBlogs, setPage: setCurrentPageBlogs,
      contentLabel: "Blogs",
      renderCard: (item) => <BlogCard key={item.id} item={item} onUpdate={refreshBlogs} onDelete={(id) => handleDelete("blog", id)} />,
    },
    {
      tab: "viewResources", icon: <BookOpen className="w-4 h-4 mr-2" />, label: "Resources",
      data: paginatedResources, total: resources, page: currentPageResources, setPage: setCurrentPageResources,
      contentLabel: "Resources",
      renderCard: (item) => <ResourceCard key={item.id} item={item} onDelete={(id) => handleDelete("resource", id)} />,
    },
  ]

  const createSubTabs = [
    { tab: "createAnnouncement", icon: <Megaphone className="w-4 h-4 mr-2" />, label: "Announcement", content: <PendingAnnounceForm onSuccess={refreshAll} currentOrg={profile} authUserId={profile?.user_id} /> },
    { tab: "createBlogs",        icon: <FileText   className="w-4 h-4 mr-2" />, label: "Blog",         content: <PendingBlogOrgForm   onSuccess={refreshAll} currentOrg={profile} authUserId={profile?.user_id} /> },
    { tab: "createResources",    icon: <BookOpen   className="w-4 h-4 mr-2" />, label: "Resource",     content: <PendingResourceForm  onSuccess={refreshAll} currentOrg={profile} authUserId={profile?.user_id} /> },
  ]

  const statCards = [
    { label: "Announcements", count: stats.totalAnnouncements, Icon: Megaphone  },
    { label: "Resources",     count: stats.totalResources,     Icon: BookOpen   },
    { label: "Blogs",         count: stats.totalBlogs,         Icon: FileText   },
    { label: "Active Events", count: stats.activeAnnouncements,Icon: TrendingUp },
  ]

  return (
    // ── Root: spread CSS vars so every child can read --p, --s, etc. ────────
    <div
      className="w-full min-h-screen p-6"
      style={{
        ...orgTheme.cssVars,
        background: `linear-gradient(135deg, #020617 0%, rgba(${hexToRgb(formData.primary_color)},0.12) 50%, #020617 100%)`,
      }}
    >
      {/* Inject dynamic overrides for tab active states */}
      <style>{dynamicStyles}</style>

      {/* Top bar */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full flex justify-between items-center max-w-7xl mx-auto mb-6 gap-4">
        <ReturnButton />
        <div className="flex-1 bg-gradient-to-r from-fuchsia-900/40 to-purple-900/40 backdrop-blur-lg border border-fuchsia-500/30 py-2.5 px-4 rounded-lg shadow-lg shadow-fuchsia-500/10">
          <p className="text-fuchsia-200 text-sm text-center flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-fuchsia-400" />
            Organization Panel
          </p>
        </div>
        <Button onClick={() => setShowSignOutDialog(true)} variant="outline" size="sm"
          className="shrink-0 border-red-500/40 text-red-300 hover:bg-red-500/20 hover:border-red-400 hover:text-red-200 transition-all gap-2">
          <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Sign Out</span>
        </Button>
      </motion.div>

      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-8">

          {/* ── Title ── */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: orgTheme.textGradient }}
              >
                Organization Dashboard
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg" style={{ color: orgTheme.mutedText }}>
              Manage your organization, announcements, blogs, and resources
            </p>
          </div>

          {/* ── Stat Cards ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {/* Dynamic stat cards */}
            {statCards.map(({ label, count, Icon }) => (
              <div
                key={label}
                className="org-card-hover rounded-xl transition-all duration-300"
                style={{ background: orgTheme.cardBg, border: orgTheme.borderColor }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm mb-1" style={{ color: orgTheme.mutedText }}>{label}</p>
                      <p
                        className="text-4xl font-bold text-transparent bg-clip-text"
                        style={{ backgroundImage: orgTheme.textGradient }}
                      >
                        {count}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ background: orgTheme.badgeBgPrimary, border: orgTheme.borderColorLight }}>
                      <Icon className="w-8 h-8" style={{ color: orgTheme.primaryText }} />
                    </div>
                  </div>
                </CardContent>
              </div>
            ))}
          </motion.div>

          {/* ── Main Tabs ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div
              className="rounded-xl backdrop-blur-xl"
              style={{ background: orgTheme.cardBg, border: orgTheme.borderColor }}
            >
              <div className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>

                  <TabsList
                    className="grid w-full grid-cols-5 mb-6 p-1 rounded-lg"
                    style={{ background: "rgba(0,0,0,0.3)", border: orgTheme.borderColorFaint }}
                  >
                    {mainTabs.map(({ value, icon, label }) => (
                      <TabsTrigger
                        key={value}
                        value={value}
                        className="org-tab flex items-center gap-2 transition-all text-xs sm:text-sm rounded-md"
                        style={{ color: orgTheme.mutedText }}
                      >
                        {icon}
                        <span className="hidden sm:inline">{label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* ── Profile Tab ── */}
                  <TabsContent value="profile" className="mt-0">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="space-y-6">
                        {alert && (
                          <Alert className={alert.type === "error"
                            ? "bg-red-500/20 border-red-500 text-red-100"
                            : "bg-green-500/20 border-green-500 text-green-100"}>
                            {alert.type === "error"
                              ? <AlertCircle className="h-4 w-4" />
                              : <CheckCircle className="h-4 w-4" />}
                            <AlertDescription>{alert.message}</AlertDescription>
                          </Alert>
                        )}

                        <OrgProfileHeader
                          formData={formData} profile={profile}
                          isEditing={isEditing} isLoading={isProfileSaving}
                          onEdit={() => setIsEditing(true)}
                          onSave={handleProfileSubmit}
                          onCancel={handleProfileCancel}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-2 space-y-6">
                            <OrgAboutSection formData={formData} isEditing={isEditing} onChange={handleProfileChange} />

                            <div
                              className="rounded-xl backdrop-blur-lg p-6"
                              style={{ background: "rgba(0,0,0,0.2)", border: orgTheme.borderColorLight }}
                            >
                              <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: orgTheme.primaryText }}>
                                <AtSign className="w-5 h-5" />Account Information
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label className="mb-2 flex items-center gap-2" style={{ color: orgTheme.secondaryText }}>
                                    <AtSign className="w-4 h-4" />Username (Author Name)
                                  </Label>
                                  {isEditing
                                    ? <Input name="author_name" value={formData.author_name} onChange={handleProfileChange}
                                        className="bg-black/30 text-white"
                                        style={{ borderColor: orgTheme.primary30 }}
                                        placeholder="johndoe" />
                                    : <p className="text-white p-2 bg-black/20 rounded"
                                        style={{ border: orgTheme.borderColorFaint }}>
                                        {formData.author_name || "Not set"}
                                      </p>
                                  }
                                </div>
                                <div>
                                  <Label className="mb-2 flex items-center gap-2" style={{ color: orgTheme.secondaryText }}>
                                    <Mail className="w-4 h-4" />Email (Login)
                                  </Label>
                                  <p className="text-white p-2 bg-black/20 rounded" style={{ border: orgTheme.borderColorFaint }}>
                                    {session?.user?.email}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="rounded-xl backdrop-blur-lg p-6 bg-red-950/40 border border-red-500/30">
                              <h3 className="text-xl font-bold text-red-300 mb-4 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />Danger Zone
                              </h3>
                              <Button
                                onClick={() => setShowDeleteModal(true)}
                                variant="destructive"
                                className="w-full bg-red-600 hover:bg-red-700"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />Delete Account
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* ── View All Tab ── */}
                  <TabsContent value="view">
                    <div className="rounded-xl backdrop-blur-lg p-6" style={{ background: "rgba(0,0,0,0.15)", border: orgTheme.borderColorFaint }}>
                      <Tabs value={activeViewTab} onValueChange={setActiveViewTab}>
                        <TabsList
                          className="grid w-full grid-cols-3 mb-6 p-1 rounded-lg"
                          style={{ background: "rgba(0,0,0,0.2)", border: orgTheme.borderColorFaint }}
                        >
                          {viewSubTabs.map(({ tab, icon, label }) => (
                            <TabsTrigger key={tab} value={tab}
                              className="org-tab flex items-center transition-all rounded-md"
                              style={{ color: orgTheme.mutedText }}
                            >
                              {icon}{label}
                            </TabsTrigger>
                          ))}
                        </TabsList>

                        {viewSubTabs.map(({ tab, contentLabel, data, total, page, setPage, renderCard }) => (
                          <TabsContent key={tab} value={tab}>
                            <h3
                              className="text-2xl font-bold bg-clip-text text-transparent mb-6"
                              style={{ backgroundImage: orgTheme.textGradient }}
                            >
                              Your {contentLabel}
                            </h3>

                            {contentLoading ? (
                              <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin org-spinner" />
                              </div>
                            ) : data.length === 0 ? (
                              <div className="rounded-lg p-6 text-center" style={{ background: orgTheme.badgeBgPrimary, border: orgTheme.borderColorLight }}>
                                <AlertCircle className="w-6 h-6 mx-auto mb-2" style={{ color: orgTheme.primaryText }} />
                                <p style={{ color: orgTheme.mutedText }}>
                                  No {contentLabel.toLowerCase()} yet. Create your first one!
                                </p>
                              </div>
                            ) : (
                              <>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  {data.map(renderCard)}
                                </div>
                                {getTotalPages(total) > 1 && (
                                  <Pagination className="mt-8">
                                    <PaginationContent>
                                      {generatePaginationItems(getTotalPages(total), page, setPage)}
                                    </PaginationContent>
                                  </Pagination>
                                )}
                              </>
                            )}
                          </TabsContent>
                        ))}
                      </Tabs>
                    </div>
                  </TabsContent>

                  {/* ── Create Tab ── */}
                  <TabsContent value="create">
                    <div className="rounded-xl backdrop-blur-lg p-6" style={{ background: "rgba(0,0,0,0.15)", border: orgTheme.borderColorFaint }}>
                      <Tabs value={activeCreateTab} onValueChange={setActiveCreateTab}>
                        <TabsList
                          className="grid w-full grid-cols-3 mb-6 p-1 rounded-lg"
                          style={{ background: "rgba(0,0,0,0.2)", border: orgTheme.borderColorFaint }}
                        >
                          {createSubTabs.map(({ tab, icon, label }) => (
                            <TabsTrigger key={tab} value={tab}
                              className="org-tab flex items-center transition-all rounded-md"
                              style={{ color: orgTheme.mutedText }}
                            >
                              {icon}{label}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        {createSubTabs.map(({ tab, content }) => (
                          <TabsContent key={tab} value={tab}>{content}</TabsContent>
                        ))}
                      </Tabs>
                    </div>
                  </TabsContent>

                  {/* ── Poster Maker Tab ── */}
                  <TabsContent value="posters" className="mt-0">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="rounded-xl overflow-hidden" style={{ border: orgTheme.borderColorFaint }}>
                        <PosterMaker embedded />
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* ── Notifications Tab ── */}
                  <TabsContent value="notifications" className="mt-0">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="rounded-xl backdrop-blur-lg p-4 sm:p-6" style={{ background: "rgba(0,0,0,0.15)", border: orgTheme.borderColorFaint }}>
                        <div className="mb-4">
                          <h3
                            className="text-lg font-bold text-transparent bg-clip-text"
                            style={{ backgroundImage: orgTheme.textGradient }}
                          >
                            Notifications
                          </h3>
                          <p className="text-xs mt-1" style={{ color: orgTheme.mutedText }}>
                            Approval decisions, content alerts, and account status updates.
                          </p>
                        </div>
                        <NotificationsTab userId={session?.user?.id} role="org_admin" />
                      </div>
                    </motion.div>
                  </TabsContent>

                </Tabs>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal
          organizationName={profile?.name}
          userId={profile?.user_id}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  )
}

// ── Utility: "#rrggbb" → "r, g, b" for use inside rgba() ──────────────────────
function hexToRgb(hex) {
  if (!hex) return "192, 38, 211"
  const clean = hex.replace("#", "")
  if (clean.length !== 6) return "192, 38, 211"
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `${r}, ${g}, ${b}`
}