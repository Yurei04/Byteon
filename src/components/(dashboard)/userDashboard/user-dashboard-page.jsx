"use client"

import React, { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import {
  Plus, User2, BookOpen, Loader2, Bell, LogOut,
  LayoutDashboard, ChevronRight, Menu, X, FileText,
  Clock, CheckCircle2, AlertCircle, Sparkles,
  ArrowUpRight, PenLine,
} from "lucide-react"

import { useAuth }            from "@/components/(auth)/authContext"
import UserProfile            from "@/components/(dashboard)/userDashboard/profile"
import BlogEmpty              from "@/components/blog/blog-empty"
import PendingBlogUserForm    from "@/components/blog/blog-pending-user"
import { ReturnButton }       from "@/components/return"
import NotificationsTab       from "@/components/notifications/notification-tab"
import { useNotifications }   from "@/components/notifications/use-notification"
import { Toast }              from "../toast"
import { useToast }           from "@/components/use-toast"
import UserViewableSection    from "./user-viewable"

// ── Design tokens ─────────────────────────────────────────────────────────────
const P  = "#c026d3"  // primary
const S  = "#a855f7"  // secondary
const BG = "#00091d"  // background

// ── Status pill ───────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const map = {
    published: { label: "Published", bg: "rgba(34,197,94,0.12)",  color: "#4ade80", border: "rgba(34,197,94,0.25)"  },
    pending:   { label: "Pending",   bg: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "rgba(245,158,11,0.25)" },
    draft:     { label: "Draft",     bg: "rgba(255,255,255,0.06)",color: "rgba(255,255,255,0.35)", border: "rgba(255,255,255,0.1)" },
  }
  const s = map[status] || map.draft
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      {s.label}
    </span>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent, delay = 0, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl p-4 flex items-center gap-4 group"
      style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${accent}25`, cursor: onClick ? "pointer" : "default", transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={e => { if (!onClick) return; e.currentTarget.style.borderColor = `${accent}55`; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${accent}18` }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = `${accent}25`; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none" }}
    >
      {/* glow blob */}
      <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none"
        style={{ background: accent }} />
      <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${accent}18`, border: `1px solid ${accent}35` }}>
        <Icon className="w-5 h-5" style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-white leading-none">{value}</p>
        <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
      </div>
      <div className="absolute bottom-0 left-4 right-4 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${accent}40, transparent)` }} />
    </motion.div>
  )
}

// ── Sidebar nav item ──────────────────────────────────────────────────────────
function NavItem({ icon: Icon, label, badge, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group"
      style={active ? {
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
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
          style={{ background: `linear-gradient(to bottom, ${P}, ${S})`, boxShadow: `0 0 8px ${P}` }} />
      )}
      <Icon className="w-4 h-4 flex-shrink-0 transition-colors duration-200" style={{ color: active ? P : "inherit" }} />
      <span className="flex-1 text-left">{label}</span>
      {badge > 0 && (
        <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-white text-[10px] font-bold px-1"
          style={{ background: `linear-gradient(135deg, ${P}, ${S})`, boxShadow: `0 0 8px ${P}60` }}>
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function SectionWrapper({ children }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${P}18` }}>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  )
}

// ── Sidebar content ───────────────────────────────────────────────────────────
function SidebarContent({ nav, activeTab, setActiveTab, profile, onClose, router }) {
  return (
    <div className="flex flex-col h-full py-5 px-3 relative">
      {/* Top gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: `linear-gradient(to bottom, ${P}12, transparent)` }} />

      {/* Brand */}
      <div className="relative flex items-center gap-3 pb-4 mb-2 px-2" style={{ borderBottom: `1px solid ${P}18` }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${P}, ${S})`, boxShadow: `0 4px 14px ${P}50` }}>
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white leading-tight truncate">
            {profile?.full_name?.split(" ")[0] || "Participant"}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e" }} />
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>Active</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg lg:hidden"
            style={{ color: "rgba(255,255,255,0.35)" }}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav label */}
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] px-3 mb-2 mt-3"
        style={{ color: `${P}80` }}>Menu</p>

      {/* Nav items */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {nav.map(({ value, icon, label, badge }) => (
          <NavItem key={value} icon={icon} label={label} badge={badge}
            active={activeTab === value} onClick={() => setActiveTab(value)} />
        ))}
      </nav>

      {/* Footer */}
      <div className="space-y-2 pt-3" style={{ borderTop: `1px solid ${P}15` }}>
        {/* User chip */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${P}18` }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${P}, ${S})` }}>
            {profile?.full_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white/80 truncate">{profile?.full_name || "Participant"}</p>
            <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.3)" }}>{profile?.email || ""}</p>
          </div>
        </div>

        <ReturnButton />
      </div>
    </div>
  )
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function UserDashboardPage() {
  const router = useRouter()
  const { profile, role, loading: authLoading, isLoggedIn } = useAuth()

  const [activeTab, setActiveTab]       = useState("overview")
  const [blogs, setBlogs]               = useState([])
  const [blogsLoading, setBlogsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen]   = useState(false)

  const realtimeChannelRef = useRef(null)
  const { unreadCount }                = useNotifications({ userId: profile?.user_id || null, role: "user" })
  const { toasts, addToast, removeToast } = useToast()

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return
    if (isLoggedIn && role === null) return
    if (!isLoggedIn) { router.push("/log-in"); return }
    if (role !== "user") { router.push("/unauthorized"); return }
  }, [authLoading, isLoggedIn, role, router])

  useEffect(() => {
    if (!profile?.id || !profile?.user_id) return
    fetchBlogs(profile.id)
    return () => { if (realtimeChannelRef.current) supabase.removeChannel(realtimeChannelRef.current) }
  }, [profile?.id, profile?.user_id])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && profile?.id) fetchBlogs(profile.id)
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [profile?.id])

  const fetchBlogs = async (bigintUserId) => {
    setBlogsLoading(true)
    try {
      const { data, error } = await supabase
        .from("blogs").select("*").eq("user_id", bigintUserId).order("created_at", { ascending: false })
      if (error) throw error
      setBlogs(data || [])
    } catch (err) { console.error("fetchBlogs error:", err) }
    finally { setBlogsLoading(false) }
  }

  const handleBlogUpdate = () => profile?.id && fetchBlogs(profile.id)

  if (authLoading || (isLoggedIn && role === null)) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${P}30, ${S}20)`, border: `1px solid ${P}50` }}>
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: P }} />
          </div>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Loading your dashboard…</p>
        </div>
      </div>
    )
  }
  if (!isLoggedIn || role !== "user") return null

  // Derived stats
  const publishedCount = blogs.filter(b => b.status === "published").length
  const pendingCount   = blogs.filter(b => b.status === "pending").length
  const totalCount     = blogs.length

  const NAV = [
    { value: "overview",       icon: LayoutDashboard, label: "Overview"                    },
    { value: "profile",        icon: User2,           label: "Profile"                     },
    { value: "myBlog",         icon: BookOpen,        label: "My Posts",  badge: totalCount },
    { value: "create",         icon: Plus,            label: "New Post"                    },
    { value: "notifications",  icon: Bell,            label: "Notifications",    badge: unreadCount },
  ]

  const PAGE_TITLES = {
    overview:      { title: "Overview",      sub: "Your writing activity at a glance"        },
    profile:       { title: "Profile",       sub: "Manage your personal information"          },
    myBlog:        { title: "My Posts",      sub: "View, manage and track your content"       },
    create:        { title: "New Post",      sub: "Write and submit a blog post for review"   },
    notifications: { title: "Notifications", sub: "Status updates and alerts from admins"     },
  }

  return (
    <div className="flex w-fu h-screen overflow-hidden" style={{ background: BG }}>

      <style>{`
        .user-content-scroll::-webkit-scrollbar { width: 4px; }
        .user-content-scroll::-webkit-scrollbar-track { background: transparent; }
        .user-content-scroll::-webkit-scrollbar-thumb { background: ${P}30; border-radius: 10px; }
        .user-sidebar-scroll::-webkit-scrollbar { width: 3px; }
        .user-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .user-sidebar-scroll::-webkit-scrollbar-thumb { background: ${P}30; border-radius: 10px; }
      `}</style>

      {/* Dot grid + ambient glows */}
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: `radial-gradient(#ffffff13 1px, ${BG} 1px)`, backgroundSize: "22px 22px" }} />
      <div className="fixed top-[-8%] left-[15%] w-[520px] h-[520px] rounded-full pointer-events-none z-0"
        style={{ background: `${P}10`, filter: "blur(120px)" }} />
      <div className="fixed bottom-[-5%] right-[8%] w-[400px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: `${S}0c`, filter: "blur(100px)" }} />

      <Toast toasts={toasts} onRemove={removeToast} />

      {/* ════ Mobile overlay ════ */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ════ SIDEBAR — mobile ════ */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed top-0 left-0 h-full w-60 z-50 lg:hidden flex flex-col user-sidebar-scroll"
        style={{ background: "rgba(3,5,18,0.97)", borderRight: `1px solid ${P}15`, backdropFilter: "blur(24px)" }}
      >
        <SidebarContent
          nav={NAV} activeTab={activeTab}
          setActiveTab={(v) => { setActiveTab(v); setSidebarOpen(false) }}
          profile={profile} onClose={() => setSidebarOpen(false)} router={router}
        />
      </motion.aside>

      {/* ════ SIDEBAR — desktop ════ */}
      <aside
        className="hidden lg:flex flex-col w-60 xl:w-64 flex-shrink-0 relative z-10 user-sidebar-scroll"
        style={{ background: "rgba(3,5,18,0.75)", borderRight: `1px solid ${P}15`, backdropFilter: "blur(20px)" }}
      >
        <SidebarContent nav={NAV} activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} router={router} />
      </aside>

      {/* ════ MAIN AREA ════ */}
      <div className="flex-1 flex flex-col min-w-0 w-full relative z-10 overflow-hidden">

        {/* ── Header ── */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 h-[60px]"
          style={{
            background: "rgba(3,5,18,0.75)",
            borderBottom: `1px solid ${P}15`,
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl transition-all duration-200"
              style={{ background: `${P}18`, border: `1px solid ${P}35`, color: P }}>
              <Menu className="w-4 h-4" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              <span style={{ color: P, fontWeight: 600 }}>Dashboard</span>
              <ChevronRight className="w-3 h-3" />
              <span style={{ color: "rgba(255,255,255,0.7)" }}>{PAGE_TITLES[activeTab]?.title}</span>
            </div>
            <div className="sm:hidden">
              <span className="text-sm font-semibold text-white">{PAGE_TITLES[activeTab]?.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick create */}
            <button onClick={() => setActiveTab("create")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{ background: `linear-gradient(135deg, ${P}, ${S})`, color: "#ffffff", boxShadow: `0 2px 12px ${P}40` }}>
              <PenLine className="w-3.5 h-3.5" /> Write
            </button>

            {/* Notification bell */}
            <button onClick={() => setActiveTab("notifications")}
              className="relative p-2 rounded-xl transition-all duration-200"
              style={{
                background: activeTab === "notifications" ? `${P}20` : "rgba(255,255,255,0.04)",
                border: `1px solid ${activeTab === "notifications" ? `${P}40` : "rgba(255,255,255,0.08)"}`,
                color: activeTab === "notifications" ? P : "rgba(255,255,255,0.4)",
              }}>
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full text-white text-[9px] font-bold px-1"
                  style={{ background: `linear-gradient(135deg, ${P}, ${S})`, boxShadow: `0 0 8px ${P}` }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Avatar chip */}
            <button onClick={() => setActiveTab("profile")}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${P}22`,
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = `${P}50`}
              onMouseLeave={e => e.currentTarget.style.borderColor = `${P}22`}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${P}, ${S})` }}>
                {profile?.full_name?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="text-xs hidden sm:inline max-w-[90px] truncate" style={{ color: "rgba(255,255,255,0.55)" }}>
                {profile?.full_name || "Participant"}
              </span>
            </button>
          </div>
        </header>

        {/* ── Content ── */}
        <main className=" flex-1 w-full overflow-y-auto user-content-scroll px-4 sm:px-6 lg:px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
            >

              {/* ════ OVERVIEW ════ */}
              {activeTab === "overview" && (
                <div className="space-y-6 ">

                  {/* Welcome */}
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Welcome back,{" "}
                      <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(135deg, ${P}, ${S})` }}>
                        {profile?.full_name?.split(" ")[0] || "Participant"}
                      </span>{" "}
                      👋
                    </h2>
                    <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                      Here's what's happening with your content.
                    </p>
                  </div>

                  {/* Stat cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard icon={FileText}     label="Total Posts"   value={totalCount}     accent={P}         delay={0.05} onClick={() => setActiveTab("myBlog")} />
                    <StatCard icon={CheckCircle2} label="Published"      value={publishedCount} accent="#22c55e"   delay={0.10} onClick={() => setActiveTab("myBlog")} />
                    <StatCard icon={Clock}        label="Pending Review" value={pendingCount}   accent="#f59e0b"   delay={0.15} onClick={() => setActiveTab("myBlog")} />
                    <StatCard icon={Bell}         label="Unread Alerts"  value={unreadCount}    accent="#ec4899"   delay={0.20} onClick={() => setActiveTab("notifications")} />
                  </div>

                  {/* Pending notice */}
                  {pendingCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                      style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.28)" }}>
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ background: "#f59e0b" }} />
                      <p className="text-sm" style={{ color: "#fbbf24" }}>
                        <span className="font-semibold">{pendingCount} post{pendingCount !== 1 ? "s" : ""}</span> pending admin review
                      </p>
                    </motion.div>
                  )}

                  {/* Quick actions */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-3" style={{ color: `${P}80` }}>
                      Quick Actions
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { icon: PenLine,  label: "Write a Post",   sub: "Share your thoughts",     tab: "create",  accent: P       },
                        { icon: BookOpen, label: "Browse My Posts", sub: "View & manage content",   tab: "myBlog",  accent: S       },
                        { icon: User2,    label: "Edit Profile",   sub: "Update your information",  tab: "profile", accent: "#ec4899" },
                      ].map(({ icon: Icon, label, sub, tab, accent }) => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                          className="relative overflow-hidden rounded-2xl p-4 text-left group"
                          style={{ background: "rgba(255,255,255,0.025)", border: `1px solid rgba(255,255,255,0.06)`, transition: "all 0.2s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = `${accent}10`; e.currentTarget.style.borderColor = `${accent}40`; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${accent}15` }}
                          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.025)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none" }}
                        >
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                            style={{ background: `${accent}18`, border: `1px solid ${accent}35` }}>
                            <Icon className="w-4.5 h-4.5" style={{ color: accent }} />
                          </div>
                          <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{label}</p>
                          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{sub}</p>
                          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-200"
                            style={{ color: "rgba(255,255,255,0.2)" }}
                            onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recent posts */}
                  {blogs.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: `${P}80` }}>
                          Recent Posts
                        </p>
                        <button onClick={() => setActiveTab("myBlog")}
                          className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
                          style={{ color: P }}>
                          View all <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="rounded-2xl overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${P}15` }}>
                        {blogs.slice(0, 5).map((blog, i) => (
                          <motion.div
                            key={blog.id}
                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                            className="flex items-center gap-3 px-4 py-3 transition-colors duration-150"
                            style={{ borderBottom: i < Math.min(blogs.length, 5) - 1 ? `1px solid ${P}10` : "none" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: `${P}18`, border: `1px solid ${P}30` }}>
                              <FileText className="w-3.5 h-3.5" style={{ color: P }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate" style={{ color: "rgba(255,255,255,0.8)" }}>
                                {blog.title || "Untitled"}
                              </p>
                              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>
                                {blog.created_at ? new Date(blog.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                              </p>
                            </div>
                            <StatusPill status={blog.status} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {blogs.length === 0 && !blogsLoading && (
                    <div className="flex flex-col items-center justify-center py-12 rounded-2xl text-center"
                      style={{ background: "rgba(255,255,255,0.02)", border: `1px dashed ${P}25` }}>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                        style={{ background: `${P}18`, border: `1px solid ${P}35` }}>
                        <PenLine className="w-5 h-5" style={{ color: P }} />
                      </div>
                      <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>No posts yet</p>
                      <p className="text-xs mt-1 mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>Write your first post to get started</p>
                      <button onClick={() => setActiveTab("create")}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                        style={{ background: `linear-gradient(135deg, ${P}, ${S})`, boxShadow: `0 4px 14px ${P}40` }}>
                        <Plus className="w-4 h-4" /> Write your first post
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ════ PROFILE ════ */}
              {activeTab === "profile" && (
                <div className="space-y-4">
                  <SectionWrapper>
                    <UserProfile currentUser={profile?.user_id} authUserId={profile?.id} />
                  </SectionWrapper>
                </div>
              )}

              {/* ════ MY POSTS ════ */}
              {activeTab === "myBlog" && (
                <div className="max-w-5xl space-y-4">
                  {/* Compact stat strip */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Total",     value: totalCount,     accent: P         },
                      { label: "Published", value: publishedCount, accent: "#22c55e" },
                      { label: "Pending",   value: pendingCount,   accent: "#f59e0b" },
                    ].map(({ label, value, accent }) => (
                      <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${accent}25` }}>
                        <div>
                          <p className="text-base font-bold leading-none text-white">{value}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <SectionWrapper>
                    {!blogsLoading && blogs.length === 0
                      ? <BlogEmpty />
                      : <UserViewableSection
                          blogs={blogs} blogsLoading={blogsLoading}
                          profile={profile} onBlogUpdate={handleBlogUpdate} addToast={addToast}
                        />
                    }
                  </SectionWrapper>
                </div>
              )}

              {/* ════ CREATE ════ */}
              {activeTab === "create" && (
                <div className="w-full">
                  <SectionWrapper>
                    <PendingBlogUserForm
                      onSuccess={handleBlogUpdate} currentUser={profile}
                      addToast={addToast} authUserId={profile?.id}
                    />
                  </SectionWrapper>
                </div>
              )}

              {/* ════ NOTIFICATIONS ════ */}
              {activeTab === "notifications" && (
                <div className="w-full">
                  <SectionWrapper>
                    <div className="mb-5">
                      <p className="text-[10px] uppercase tracking-widest mb-1 font-semibold" style={{ color: `${P}80` }}>
                        Activity Feed
                      </p>
                      <div className="h-px" style={{ background: `linear-gradient(to right, ${P}60, ${S}40, transparent)` }} />
                    </div>
                    <NotificationsTab userId={profile?.user_id} role="user" />
                  </SectionWrapper>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          <div className="h-8" />
        </main>
      </div>
    </div>
  )
}