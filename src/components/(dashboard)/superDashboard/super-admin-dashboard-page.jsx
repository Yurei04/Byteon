"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/(auth)/authContext"
import { ReturnButton } from "@/components/return"
import {
  ShieldCheck, Users, Building2, FileText, Megaphone,
  BookOpen, TrendingUp, Clock, Eye, CheckSquare,
  AlertCircle, Loader2, LogOut, History, Bell,
  Menu, X, ChevronRight, LayoutDashboard, ArrowUpRight,
  Activity, Sparkles,
  Monitor,
  ChevronDown,
} from "lucide-react"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import WebsitePreviewSection, { WEBSITE_PAGES } from "@/components/preview/website-preview-section"
import OrgPendingApproval from "../orgDashboard/org-pending-approval" 
import OrgRegistrationApprovals from "./org-registration-approval"
import SuperProfile         from "./super-profile,"
import AccountManageSection from "./accounts-manage-section"
import ApprovalSection      from "./approval-section"
import ViewableSection      from "./viewable-section"
import AnnounceForm         from "../announce/announce-form"
import BlogOrgForm          from "@/components/blog/blog-edit-user"
import ResourceForm         from "@/components/resourceHub/resource-form"
import HistorySection       from "./historyRecordsSection"
import NotificationsTab     from "@/components/notifications/notification-tab"
import { useNotifications } from "@/components/notifications/use-notification"
import { Toast }            from "../toast"
import { useToast }         from "@/components/use-toast"

// ── Design tokens ─────────────────────────────────────────────────────────────
const P  = "#c026d3"   // primary   (fuchsia)
const S  = "#a855f7"   // secondary (purple)
const BG = "#09050f"   // page bg




function SidebarWebsiteGroup({ isExpanded, activeTab, websitePage, onParentClick, onPageClick }) {
  const P = "#c026d3"
  const S = "#a855f7"
  const isActive = activeTab === "website"
 
  return (
    <div>
      {/* Parent row */}
      <button
        onClick={onParentClick}
        className="w-full flex cursor-pointer items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group"
        style={isActive ? {
          background: `linear-gradient(135deg, ${P}22, ${S}14)`,
          color: "#ffffff",
          border: `1px solid ${P}45`,
          boxShadow: `0 0 18px ${P}18, inset 0 1px 0 ${P}20`,
        } : {
          background: "transparent",
          color: "rgba(255,255,255,0.45)",
          border: "1px solid transparent",
        }}
      >
        {isActive && (
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
            style={{ background: `linear-gradient(to bottom, ${P}, ${S})`, boxShadow: `0 0 8px ${P}` }}
          />
        )}
        <span className="flex-shrink-0" style={{ color: isActive ? P : "inherit" }}>
          <Monitor className="w-4 h-4" />
        </span>
        <span className="flex-1 text-left">Website</span>
        <ChevronDown
          className="w-3 h-3 transition-transform duration-200 flex-shrink-0"
          style={{
            color: isActive ? P : "rgba(255,255,255,0.3)",
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
 
      {/* Sub-items — smooth expand */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isExpanded ? `${WEBSITE_PAGES.length * 44}px` : "0px", opacity: isExpanded ? 1 : 0 }}
      >
        <div className="pl-4 pr-1 pt-0.5 pb-1 space-y-0.5">
          {WEBSITE_PAGES.map(page => {
            const isSubActive = isActive && websitePage.href === page.href
            return (
              <button
                key={page.href}
                onClick={() => onPageClick(page)}
                className="w-full flex cursor-pointer items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200"
                style={isSubActive ? {
                  background: `${page.accent}18`,
                  color: "#ffffff",
                  border: `1px solid ${page.accent}40`,
                } : {
                  background: "transparent",
                  color: "rgba(255,255,255,0.38)",
                  border: "1px solid transparent",
                }}
              >
                {/* Color dot */}
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-200"
                  style={{ background: isSubActive ? page.accent : "rgba(255,255,255,0.2)" }}
                />
                {page.label}
                {isSubActive && (
                  <span
                    className="ml-auto text-[9px] px-1.5 py-0.5 rounded-md font-semibold"
                    style={{ background: `${page.accent}25`, color: page.accent }}
                  >
                    live
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Sidebar nav item ──────────────────────────────────────────────────────────
function SidebarNavItem({ value, icon, label, isActive, onClick, badge, pulse }) {
  return (
    <button
      onClick={() => onClick(value)}
      className="w-full flex cursor-pointer  items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group"
      style={isActive ? {
        background: `linear-gradient(135deg, ${P}22, ${S}14)`,
        color: "#ffffff",
        border: `1px solid ${P}45`,
        boxShadow: `0 0 18px ${P}18, inset 0 1px 0 ${P}20`,
      } : {
        background: "transparent",
        color: "rgba(255,255,255,0.45)",
        border: "1px solid transparent",
      }}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
          style={{ background: `linear-gradient(to bottom, ${P}, ${S})`, boxShadow: `0 0 8px ${P}` }} />
      )}
      <span className="flex-shrink-0 transition-colors duration-200" style={{ color: isActive ? P : "inherit" }}>
        {icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {badge != null && badge > 0 && (
        <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-white text-[10px] font-bold px-1"
          style={{ background: `linear-gradient(135deg, ${P}, ${S})`, boxShadow: `0 0 8px ${P}60` }}>
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      {pulse && !badge && (
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#f59e0b" }} />
      )}
    </button>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
function SuperAdminDashboardPage() {
  const { profile, session, logout } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab]               = useState("overview")
  const [sidebarOpen, setSidebarOpen]           = useState(false)
  const [pendingCount, setPendingCount]         = useState(0)
  const [showSignOutDialog, setShowSignOutDialog] = useState(false)
  const [signingOut, setSigningOut]             = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0, totalOrgs: 0, totalAnnouncements: 0,
    totalBlogs: 0, totalResources: 0, activeAnnouncements: 0,
  })
  const [pendingOrgCount, setPendingOrgCount] = useState(0)
  const [statsLoading, setStatsLoading] = useState(true)
  const [websitePage, setWebsitePage] = useState(WEBSITE_PAGES[0])
  const userId      = session?.user?.id
  const platformOrg = profile?.linkedOrg

  const { toasts, addToast, removeToast } = useToast()
  const { unreadCount } = useNotifications({ userId, role: "super_admin" })

  const handleSignOut = async () => {
    setSigningOut(true)
    try { await logout(); router.push("/") }
    catch (err) { console.error(err); setSigningOut(false); setShowSignOutDialog(false) }
  }

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const now = new Date().toISOString()
      const [
        { count: uCount }, { count: oCount }, { count: annCount },
        { count: blogCount }, { count: resCount }, { count: activeAnn },
        { count: pAnn }, { count: pBlog }, { count: pRes }, { count: pendingOrgCount },
      ] = await Promise.all([
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase.from("organizations").select("id", { count: "exact", head: true }),
        supabase.from("announcements").select("id", { count: "exact", head: true }),
        supabase.from("blogs").select("id", { count: "exact", head: true }),
        supabase.from("resource_hub").select("id", { count: "exact", head: true }),
        supabase.from("announcements").select("id", { count: "exact", head: true }).gte("date_end", now),
        supabase.from("pending_announcements").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("pending_blogs").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("pending_resources").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("organizations").select("id", { count: "exact", head: true }).eq("approval_status", "pending"),
      ])
      setStats({
        totalUsers: uCount || 0, totalOrgs: oCount || 0,
        totalAnnouncements: annCount || 0, totalBlogs: blogCount || 0,
        totalResources: resCount || 0, activeAnnouncements: activeAnn || 0,
      })
      setPendingOrgCount(pendingOrgCount || 0)
      setPendingCount((pAnn || 0) + (pBlog || 0) + (pRes || 0))
    } catch {}
    finally { setStatsLoading(false) }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  // ── Nav items ─────────────────────────────────────────────────────────────
  const navItems = [
    { value: "overview",       icon: <LayoutDashboard className="w-4 h-4" />, label: "Overview"   },
    { value: "accounts",       icon: <Users           className="w-4 h-4" />, label: "Accounts"   },
    { value: "approval",       icon: <CheckSquare     className="w-4 h-4" />, label: "Approval",   badge: pendingCount > 0 ? pendingCount : null, pulse: pendingCount > 0 },
    { value: "view",           icon: <Eye             className="w-4 h-4" />, label: "All Content" },
    { value: "history",        icon: <History         className="w-4 h-4" />, label: "Archives"    },
    { value: "profile",        icon: <ShieldCheck     className="w-4 h-4" />, label: "Profile"     },
    { value: "notifications",  icon: <Bell            className="w-4 h-4" />, label: "Notifications",     badge: unreadCount > 0 ? unreadCount : null },
    { value: "org-approvals",icon: <Building2 className="w-4 h-4" />, label: "Org Approvals", badge: pendingOrgCount > 0 ? pendingOrgCount : null, pulse: pendingOrgCount > 0, },
  ]

  const pageTitles = {
    overview:      { title: "Overview",       sub: "Platform at a glance"                          },
    accounts:      { title: "Accounts",       sub: "Manage users and organizations"                },
    approval:      { title: "Approval Queue", sub: "Review pending submissions"                    },
    view:          { title: "All Content",    sub: "Browse and moderate published content"          },
    history:       { title: "Archives",       sub: "Historical records"                            },
    profile:       { title: "Profile",        sub: "Your super admin profile and settings"         },
    notifications: { title: "Alerts",         sub: "Platform activity, org deletions, and events"  },
    website:         { title: "Website Preview", sub: "View-only preview — navigation via sidebar" },
    "org-approvals": { title: "Org Approvals", sub: "Review organization registration requests" },
  }

  const statCards = [
    { label: "Total Users",    value: stats.totalUsers,          Icon: Users,      accent: "#3b82f6" },
    { label: "Organizations",  value: stats.totalOrgs,           Icon: Building2,  accent: "#c026d3" },
    { label: "Pending Review", value: pendingCount,              Icon: Clock,      accent: "#f59e0b", pulse: true },
    { label: "Announcements",  value: stats.totalAnnouncements,  Icon: Megaphone,  accent: "#a855f7" },
    { label: "Blogs",          value: stats.totalBlogs,          Icon: FileText,   accent: "#ec4899" },
    { label: "Resources",      value: stats.totalResources,      Icon: BookOpen,   accent: "#10b981" },
    { label: "Active Events",  value: stats.activeAnnouncements, Icon: Activity,   accent: "#f97316" },
  ]

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: BG }}>

      {/* Global styles */}
      <style>{`
        .sa-tab[data-state=active] {
          background: linear-gradient(135deg, ${P}, ${S}) !important;
          color: #ffffff !important; border: none !important;
          box-shadow: 0 2px 12px ${P}50 !important;
        }
        .sa-tab { transition: all 0.2s ease !important; }
        .sa-tab:hover:not([data-state=active]) { background: ${P}18 !important; color: #fff !important; }
        .sa-scrollbar::-webkit-scrollbar { width: 3px; }
        .sa-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .sa-scrollbar::-webkit-scrollbar-thumb { background: ${P}40; border-radius: 10px; }
        .sa-content-scroll::-webkit-scrollbar { width: 5px; }
        .sa-content-scroll::-webkit-scrollbar-track { background: transparent; }
        .sa-content-scroll::-webkit-scrollbar-thumb { background: ${P}30; border-radius: 10px; }
      `}</style>

      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black/60 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ════════════════════ SIDEBAR ════════════════════ */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 flex flex-col w-60 xl:w-64 flex-shrink-0 transition-transform duration-300 ease-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          background: "rgba(5,0,14,0.94)",
          borderRight: `1px solid ${P}18`,
          backdropFilter: "blur(24px)",
        }}
      >
        {/* Top gradient */}
        <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, ${P}15, transparent)` }} />

        {/* Brand */}
        <div className="relative flex items-center gap-3 p-5 pb-4" style={{ borderBottom: `1px solid ${P}18` }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${P}, ${S})`, boxShadow: `0 4px 14px ${P}50` }}>
            <ShieldCheck className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-tight text-white truncate">
              {profile?.name || "Super Admin"}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e" }} />
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>Full Access</p>
            </div>
          </div>
          <button className="lg:hidden p-1.5 rounded-lg" style={{ color: "rgba(255,255,255,0.4)" }}
            onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav label */}
        <div className="px-4 pt-5 pb-2">
          <p className="text-[9px] uppercase tracking-[0.18em] font-semibold" style={{ color: `${P}80` }}>
            Navigation
          </p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 pb-3 space-y-0.5 overflow-y-auto sa-scrollbar cursor-pointer ">
          {navItems.map(({ value, icon, label, badge, pulse }) => (
            <SidebarNavItem
              key={value} value={value} icon={icon} label={label}
              isActive={activeTab === value} badge={badge} pulse={pulse}
              onClick={(v) => { setActiveTab(v); setSidebarOpen(false) }}
            />
          ))}

            {/* ── Website group ── */}
            <SidebarWebsiteGroup
              isExpanded={activeTab === "website"}
              activeTab={activeTab}
              websitePage={websitePage}
              onParentClick={() => {
                setActiveTab("website")
                setSidebarOpen(false)
              }}
              onPageClick={(page) => {
                setWebsitePage(page)
                setActiveTab("website")
                setSidebarOpen(false)
              }}
            />
        </nav>

        {/* Sidebar footer */}
        <div className="p-3 space-y-1" style={{ borderTop: `1px solid ${P}15` }}>
          <ReturnButton className="mb-2" />
          <button
            onClick={() => setShowSignOutDialog(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-red-500/10 mt-1"
            style={{ color: "#f87171", border: "1px solid transparent" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}
          >
            <LogOut className="w-4 h-4" />Sign Out
          </button>
        </div>
      </aside>

      {/* ════════════════════ MAIN ════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Header bar ── */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-5 sm:px-7 h-[60px]"
          style={{
            background: "rgba(5,0,14,0.75)",
            borderBottom: `1px solid ${P}18`,
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-xl transition-all duration-200"
              onClick={() => setSidebarOpen(true)}
              style={{ background: `${P}18`, border: `1px solid ${P}35`, color: P }}>
              <Menu className="w-4 h-4" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              <span style={{ color: P, fontWeight: 600 }}>Super Admin</span>
              <ChevronRight className="w-3 h-3" />
              <span style={{ color: "rgba(255,255,255,0.7)" }}>{pageTitles[activeTab]?.title}</span>
            </div>
            <div className="sm:hidden">
              <span className="text-sm font-semibold text-white">{pageTitles[activeTab]?.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Pending pill */}
            {pendingCount > 0 && (
              <button onClick={() => setActiveTab("approval")}
                className="hidden cursor-pointer  sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
                style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.35)", color: "#fbbf24" }}>
                <Clock className="w-3.5 h-3.5 " />
                {pendingCount} pending
              </button>
            )}

            {/* Notifications */}
            <button onClick={() => setActiveTab("notifications")}
              className="relative p-2 rounded-xl transition-all duration-200"
              style={{
                background: activeTab === "notifications" ? `${P}20` : "rgba(255,255,255,0.04)",
                border: `1px solid ${activeTab === "notifications" ? `${P}40` : "rgba(255,255,255,0.08)"}`,
                color: activeTab === "notifications" ? P : "rgba(255,255,255,0.4)",
              }}>
              <Bell className="w-4 h-4 cursor-pointer " />
              {unreadCount > 0 && (
                <span className="absolute  -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full text-white text-[9px] font-bold px-1"
                  style={{ background: `linear-gradient(135deg, ${P}, ${S})`, boxShadow: `0 0 8px ${P}` }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Admin badge */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${P}28` }}>
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: P }} />
              <span className="text-xs font-semibold text-white">Super Admin</span>
            </div>
          </div>
        </header>

        {/* ── Scrollable content ── */}
        <main
          className="flex-1 overflow-y-auto sa-content-scroll"
          style={{
            backgroundImage: `
              radial-gradient(#ffffff14 1px, transparent 1px),
              radial-gradient(circle at 15% 0%, ${P}28 0%, transparent 40%),
              radial-gradient(circle at 85% 100%, ${S}20 0%, transparent 45%)
            `,
            backgroundSize: "24px 24px, auto, auto",
            backgroundColor: BG,
          }}
        >
          <div className="p-5 sm:p-7 max-w-7xl mx-auto w-full">

            {/* Page heading */}
            <motion.div
              key={`heading-${activeTab}`}
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
              className="mb-6 flex items-center justify-between"
            >
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">{pageTitles[activeTab]?.title}</h1>
                <p className="text-xs sm:text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {pageTitles[activeTab]?.sub}
                </p>
              </div>
              <div className="hidden sm:block h-8 w-px"
                style={{ background: `linear-gradient(to bottom, transparent, ${P}70, transparent)` }} />
            </motion.div>

            <AnimatePresence mode="wait">

              {/* ════ OVERVIEW ════ */}
              {activeTab === "overview" && (
                <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

                  {/* Stat cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
                    {statCards.map(({ label, value, Icon, accent, pulse }, i) => (
                      <motion.div key={label}
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className="relative flex flex-col items-center text-center gap-2 p-4 rounded-2xl group cursor-default"
                        style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${accent}28`, transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}60`; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${accent}20` }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = `${accent}28`; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none" }}
                      >
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${accent}18`, border: `1px solid ${accent}35` }}>
                          <Icon className="w-4 h-4" style={{ color: accent }} />
                        </div>
                        <span className="text-2xl font-bold leading-none" style={{ color: accent }}>
                          {statsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : value}
                        </span>
                        <span className="text-[10px] leading-tight" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
                        {pulse && pendingCount > 0 && (
                          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />
                        )}
                        <div className="absolute bottom-0 left-4 right-4 h-px"
                          style={{ background: `linear-gradient(to right, transparent, ${accent}40, transparent)` }} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Quick actions */}
                  <div className="mb-6">
                    <p className="text-[10px] uppercase tracking-[0.18em] mb-3 font-semibold" style={{ color: `${P}80` }}>
                      Quick Actions
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Review Approvals", icon: <CheckSquare className="w-5 h-5" />, tab: "approval",  accent: "#f59e0b" },
                        { label: "Manage Accounts",  icon: <Users       className="w-5 h-5" />, tab: "accounts",  accent: "#3b82f6" },
                        { label: "View Content",     icon: <Eye         className="w-5 h-5" />, tab: "view",      accent: "#c026d3" },
                        { label: "View Archives",    icon: <History     className="w-5 h-5" />, tab: "history",   accent: "#10b981" },
                      ].map(({ label, icon, tab, accent }) => (
                        <button key={label} onClick={() => setActiveTab(tab)}
                          className="cursor-pointer flex flex-col items-center gap-3 p-4 rounded-2xl text-sm font-medium transition-all duration-200"
                          style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.06)` }}
                          onMouseEnter={e => { e.currentTarget.style.background = `${accent}12`; e.currentTarget.style.borderColor = `${accent}40`; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${accent}15` }}
                          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none" }}
                        >
                          <span style={{ color: accent }}>{icon}</span>
                          <span className="text-xs text-center leading-tight" style={{ color: "rgba(255,255,255,0.6)" }}>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status overview */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Pending alert */}
                    <div className="rounded-2xl p-5 col-span-1"
                      style={{
                        background: pendingCount > 0 ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.02)",
                        border: `1px solid ${pendingCount > 0 ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.07)"}`,
                      }}>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#f59e0b" }}>Approval Queue</p>
                        <Clock className="w-4 h-4" style={{ color: "#f59e0b" }} />
                      </div>
                      <p className="text-3xl font-bold" style={{ color: pendingCount > 0 ? "#fbbf24" : "rgba(255,255,255,0.3)" }}>
                        {statsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : pendingCount}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {pendingCount > 0 ? "items awaiting review" : "queue is clear"}
                      </p>
                      {pendingCount > 0 && (
                        <button onClick={() => setActiveTab("approval")}
                          className="mt-3 flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70 cursor-pointer "
                          style={{ color: "#fbbf24" }}>
                          Review now <ArrowUpRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Platform health */}
                    <div className="rounded-2xl p-5 sm:col-span-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: `${P}cc` }}>Platform Summary</p>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: "Users",   value: stats.totalUsers,    accent: "#3b82f6" },
                          { label: "Orgs",    value: stats.totalOrgs,     accent: P         },
                          { label: "Content", value: stats.totalAnnouncements + stats.totalBlogs + stats.totalResources, accent: "#10b981" },
                        ].map(({ label, value, accent }) => (
                          <div key={label} className="text-center">
                            <p className="text-2xl font-bold" style={{ color: accent }}>
                              {statsLoading ? "—" : value}
                            </p>
                            <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ════ ACCOUNTS ════ */}
              {activeTab === "accounts" && (
                <motion.div key="accounts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${P}18` }}>
                    <AccountManageSection addToast={addToast} />
                  </div>
                </motion.div>
              )}

              {/* ════ APPROVAL ════ */}
              {activeTab === "approval" && (
                <motion.div key="approval" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  {pendingCount > 0 && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4"
                      style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}>
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#f59e0b" }} />
                      <p className="text-sm" style={{ color: "#fbbf24" }}>
                        <span className="font-bold">{pendingCount}</span> item{pendingCount !== 1 ? "s" : ""} waiting for your review
                      </p>
                    </div>
                  )}
                  <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${P}18` }}>
                    <ApprovalSection addToast={addToast} onApprovalChange={(count) => setPendingCount(count)} />
                  </div>
                </motion.div>
              )}

              {/* ════ VIEW ════ */}
              {activeTab === "view" && (
                <motion.div key="view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  {/* Compact stat strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    {[
                      { label: "Announcements", value: stats.totalAnnouncements, Icon: Megaphone, accent: "#a855f7" },
                      { label: "Blogs",         value: stats.totalBlogs,         Icon: FileText,  accent: "#ec4899" },
                      { label: "Resources",     value: stats.totalResources,     Icon: BookOpen,  accent: "#10b981" },
                      { label: "Active Events", value: stats.activeAnnouncements,Icon: Activity,  accent: "#f97316" },
                    ].map(({ label, value, Icon, accent }) => (
                      <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${accent}25` }}>
                        <Icon className="w-4 h-4 flex-shrink-0" style={{ color: accent }} />
                        <div>
                          <p className="text-base font-bold leading-none text-white">{statsLoading ? "—" : value}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${P}18` }}>
                    <ViewableSection addToast={addToast} />
                  </div>
                </motion.div>
              )}

              {/* ════ HISTORY / ARCHIVES ════ */}
              {activeTab === "history" && (
                <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${P}18` }}>
                    {!platformOrg ? (
                      <Alert className="rounded-xl" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}>
                        <AlertCircle className="w-4 h-4" style={{ color: "#f59e0b" }} />
                        <AlertDescription style={{ color: "#fbbf24" }}>
                          No platform organization linked. Add an <code className="bg-black/30 px-1 rounded">organization_id</code> to your <code className="bg-black/30 px-1 rounded">super_admins</code> row to enable this section.
                        </AlertDescription>
                      </Alert>
                    ) : <HistorySection />}
                  </div>
                </motion.div>
              )}

              {/* ════ PROFILE ════ */}
              {activeTab === "profile" && (
                <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${P}18` }}>
                    <SuperProfile profile={profile} session={session} stats={{ ...stats, totalPending: pendingCount }} />
                  </div>
                </motion.div>
              )}
               {activeTab === "website" && (
                  <motion.div
                    key="website"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* Active page label */}
                    <div className="flex items-center gap-2 mb-4">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: websitePage.accent }}
                      />
                      <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>
                        Previewing:
                      </span>
                      <span className="text-xs font-bold" style={{ color: websitePage.accent }}>
                        {websitePage.label}
                      </span>
                    </div>
                
                    <WebsitePreviewSection href={websitePage.href} />
                  </motion.div>
                )}
    
              

              {/* ════ NOTIFICATIONS ════ */}
              {activeTab === "notifications" && (
                <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${P}18` }}>
                    <div className="mb-5">
                      <p className="text-xs uppercase tracking-widest mb-1 font-semibold" style={{ color: `${P}80` }}>
                        Activity Feed
                      </p>
                      <div className="h-px" style={{ background: `linear-gradient(to right, ${P}60, ${S}40, transparent)` }} />
                    </div>
                    <NotificationsTab userId={userId} role="super_admin" />
                  </div>
                </motion.div>
              )}

              {activeTab === "org-approvals" && (
                  <motion.div
                    key="org-approvals"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div
                      className="rounded-2xl p-5"
                      style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${P}18` }}
                    >
                      <OrgRegistrationApprovals addToast={addToast} />
                    </div>
                  </motion.div>
                )}

            </AnimatePresence>

            <div className="h-8" />
          </div>
        </main>
      </div>

      {/* ── Sign Out Dialog ── */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent className="border-red-500/30"
          style={{ background: "linear-gradient(135deg, #0d0014, #1a0008)", backdropFilter: "blur(20px)" }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-200 flex items-center gap-2">
              <LogOut className="w-5 h-5" />Sign Out
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to sign out of the Super Admin panel?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={signingOut}
              className="bg-white/5 hover:bg-white/10 text-white border-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut} disabled={signingOut}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white border-none">
              {signingOut
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Signing out…</>
                : <><LogOut className="w-4 h-4 mr-2" />Sign Out</>}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default SuperAdminDashboardPage