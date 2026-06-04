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
  Sun,
  Moon,
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
import { useTheme } from "next-themes"

// ── Status pill ───────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const map = {
    published: { label: "Published", bg: "rgba(34,197,94,0.12)",  color: "#16a34a", border: "rgba(34,197,94,0.25)"  },
    pending:   { label: "Pending",   bg: "rgba(245,158,11,0.12)", color: "#d97706", border: "rgba(245,158,11,0.25)" },
    draft:     { label: "Draft",     bg: "rgba(100,100,120,0.08)",color: "var(--dash-text-muted)", border: "rgba(100,100,120,0.15)" },
  }
  const s = map[status] || map.draft
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      {s.label}
    </span>
  )
}

// ── Theme Toggle Switch ───────────────────────────────────────────────────────
function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div className="w-full flex items-center gap-3 px-3 py-2.5">
      <Sun
        className="w-[18px] h-[18px] shrink-0 transition-colors duration-300"
        style={{ color: isDark ? "var(--dash-text-faint)" : "#f59e0b" }}
      />
      <button
        role="switch"
        aria-checked={isDark}
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="relative shrink-0 rounded-full transition-all duration-300 focus-visible:outline-none"
        style={{
          width: 36,
          height: 20,
          background: isDark
            ? "linear-gradient(135deg, rgb(var(--accent-500)), rgb(var(--brand-500)))"
            : "rgb(var(--surface-border))",
          boxShadow: isDark ? "0 0 8px rgb(var(--brand-500) / 0.4)" : "none",
          border: isDark
            ? "1px solid rgb(var(--brand-500) / 0.4)"
            : "1px solid rgb(var(--surface-border))",
        }}
      >
        <span
          className="absolute top-[2px] flex items-center justify-center rounded-full bg-white transition-all duration-300"
          style={{
            width: 16,
            height: 16,
            left: isDark ? "calc(100% - 18px)" : "2px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
          }}
        >
          {isDark
            ? <Moon className="w-2.5 h-2.5" style={{ color: "rgb(var(--brand-600))" }} />
            : <Sun  className="w-2.5 h-2.5" style={{ color: "#f59e0b" }} />
          }
        </span>
      </button>
      <Moon
        className="w-[18px] h-[18px] shrink-0 transition-colors duration-300"
        style={{ color: isDark ? "rgb(var(--brand-400))" : "var(--dash-text-faint)" }}
      />
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent, delay = 0, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      onClick={onClick}
      className="dash-card relative overflow-hidden rounded-2xl p-4 flex items-center gap-4 group"
      style={{
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
        "--card-accent": accent,
      }}
      onMouseEnter={e => { if (!onClick) return; e.currentTarget.style.borderColor = `${accent}55`; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${accent}18` }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none" }}
    >
      <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full blur-2xl opacity-10 pointer-events-none"
        style={{ background: accent }} />
      <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${accent}18`, border: `1px solid ${accent}35` }}>
        <Icon className="w-5 h-5" style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-none" style={{ color: "var(--dash-text-primary)" }}>{value}</p>
        <p className="text-xs mt-0.5 truncate" style={{ color: "var(--dash-text-muted)" }}>{label}</p>
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
        background: "var(--dash-nav-active-bg)",
        color: "var(--dash-nav-active-text)",
        border: "var(--dash-nav-active-border)",
        boxShadow: "var(--dash-nav-active-shadow)",
      } : {
        background: "transparent",
        color: "var(--dash-nav-inactive-text)",
        border: "1px solid transparent",
      }}
    >
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full dash-nav-indicator" />
      )}
      <Icon className="w-4 h-4 flex-shrink-0 transition-colors duration-200"
        style={{ color: active ? "var(--dash-brand)" : "inherit" }} />
      <span className="flex-1 text-left">{label}</span>
      {badge > 0 && (
        <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-white text-[10px] font-bold px-1 dash-badge">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function SectionWrapper({ children }) {
  return (
    <div className="dash-section-wrapper rounded-2xl overflow-hidden">
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  )
}

// ── Sidebar content ───────────────────────────────────────────────────────────
function SidebarContent({ nav, activeTab, setActiveTab, profile, onClose, router }) {
  return (
    <div className="flex flex-col h-full py-5 px-3 relative">
      {/* Top gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none dash-sidebar-top-glow" />

      {/* Brand */}
      <div className="relative flex items-center gap-3 pb-4 mb-2 px-2 dash-sidebar-brand-border">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 dash-brand-icon">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight truncate" style={{ color: "var(--dash-text-primary)" }}>
            {profile?.full_name?.split(" ")[0] || "Participant"}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e" }} />
            <p className="text-[10px]" style={{ color: "var(--dash-text-faint)" }}>Active</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg lg:hidden"
            style={{ color: "var(--dash-text-faint)" }}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav label */}
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] px-3 mb-2 mt-3 dash-section-label">
        Menu
      </p>

      {/* Nav items */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {nav.map(({ value, icon, label, badge }) => (
          <NavItem key={value} icon={icon} label={label} badge={badge}
            active={activeTab === value} onClick={() => setActiveTab(value)} />
        ))}
      </nav>

      {/* Footer */}
      <div className="space-y-2 pt-3 dash-footer-border">
        {/* Theme toggle */}
        <div className="rounded-xl mb-1 dash-theme-toggle-wrap">
          <ThemeToggle />
        </div>

        {/* User chip */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl dash-user-chip">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 dash-avatar">
            {profile?.full_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: "var(--dash-text-primary)" }}>
              {profile?.full_name || "Participant"}
            </p>
            <p className="text-[10px] truncate" style={{ color: "var(--dash-text-faint)" }}>
              {profile?.email || ""}
            </p>
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
  const { theme } = useTheme()

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
      <div className="w-full min-h-screen flex items-center justify-center dash-root">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center dash-loader-wrap">
            <Loader2 className="w-6 h-6 animate-spin dash-brand-color" />
          </div>
          <p className="text-sm" style={{ color: "var(--dash-text-faint)" }}>Loading your dashboard…</p>
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
    { value: "overview",       icon: LayoutDashboard, label: "Overview"                         },
    { value: "profile",        icon: User2,           label: "Profile"                          },
    { value: "myBlog",         icon: BookOpen,        label: "My Posts",  badge: totalCount      },
    { value: "create",         icon: Plus,            label: "New Post"                         },
    { value: "notifications",  icon: Bell,            label: "Notifications", badge: unreadCount },
  ]

  const PAGE_TITLES = {
    overview:      { title: "Overview",      sub: "Your writing activity at a glance"        },
    profile:       { title: "Profile",       sub: "Manage your personal information"          },
    myBlog:        { title: "My Posts",      sub: "View, manage and track your content"       },
    create:        { title: "New Post",      sub: "Write and submit a blog post for review"   },
    notifications: { title: "Notifications", sub: "Status updates and alerts from admins"     },
  }

  return (
    <div className="flex w-full h-screen overflow-hidden dash-root">

      <style>{`
        /* ═══════════════════════════════════════════════
           DASHBOARD CSS TOKENS — light & dark
           ═══════════════════════════════════════════════ */

        /* ── Light ── */
        :root {
          --dash-brand:   #c026d3;
          --dash-secondary: #a855f7;

          --dash-bg:           #fdf4ff;
          --dash-sidebar-bg:   rgba(255,255,255,0.92);
          --dash-header-bg:    rgba(255,255,255,0.88);
          --dash-sidebar-border: rgba(192,38,211,0.12);
          --dash-header-border:  rgba(192,38,211,0.12);

          --dash-text-primary:   #1e0320;
          --dash-text-secondary: #701976;
          --dash-text-muted:     #a11bb0;
          --dash-text-faint:     #c026d3;

          --dash-dot-color:      rgba(192,38,211,0.12);
          --dash-dot-bg:         #fdf4ff;
          --dash-glow-1:         rgba(192,38,211,0.08);
          --dash-glow-2:         rgba(168,85,247,0.06);

          --dash-card-bg:        rgba(255,255,255,0.80);
          --dash-card-border:    rgba(192,38,211,0.14);
          --dash-card-shadow:    0 2px 16px rgba(192,38,211,0.07);

          --dash-section-bg:     rgba(255,255,255,0.75);
          --dash-section-border: rgba(192,38,211,0.14);

          --dash-nav-active-bg:     linear-gradient(135deg, rgba(192,38,211,0.12), rgba(168,85,247,0.08));
          --dash-nav-active-text:   #1e0320;
          --dash-nav-active-border: 1px solid rgba(192,38,211,0.32);
          --dash-nav-active-shadow: 0 0 18px rgba(192,38,211,0.10), inset 0 1px 0 rgba(192,38,211,0.12);
          --dash-nav-inactive-text: rgba(112,25,118,0.55);

          --dash-section-label-color: rgba(192,38,211,0.55);

          --dash-user-chip-bg:     rgba(253,244,255,0.8);
          --dash-user-chip-border: rgba(192,38,211,0.15);

          --dash-recent-row-hover: rgba(192,38,211,0.04);
          --dash-recent-border:    rgba(192,38,211,0.10);

          --dash-quick-action-bg:     rgba(255,255,255,0.6);
          --dash-quick-action-border: rgba(0,0,0,0.06);

          --dash-empty-border: rgba(192,38,211,0.20);
          --dash-empty-bg:     rgba(192,38,211,0.03);

          --dash-pending-bg:     rgba(245,158,11,0.08);
          --dash-pending-border: rgba(245,158,11,0.28);
          --dash-pending-text:   #b45309;

          --dash-theme-toggle-bg:     rgba(250,232,255,0.7);
          --dash-theme-toggle-border: rgba(192,38,211,0.18);

          --dash-footer-border-color: rgba(192,38,211,0.12);
          --dash-brand-border-color:  rgba(192,38,211,0.14);
        }

        /* ── Dark ── */
        .dark {
          --dash-brand:     #c026d3;
          --dash-secondary: #a855f7;

          --dash-bg:           #00091d;
          --dash-sidebar-bg:   rgba(3,5,18,0.75);
          --dash-header-bg:    rgba(3,5,18,0.75);
          --dash-sidebar-border: rgba(192,38,211,0.15);
          --dash-header-border:  rgba(192,38,211,0.15);

          --dash-text-primary:   #ffffff;
          --dash-text-secondary: rgba(255,255,255,0.65);
          --dash-text-muted:     rgba(255,255,255,0.45);
          --dash-text-faint:     rgba(255,255,255,0.35);

          --dash-dot-color:   rgba(255,255,255,0.07);
          --dash-dot-bg:      #00091d;
          --dash-glow-1:      rgba(192,38,211,0.10);
          --dash-glow-2:      rgba(168,85,247,0.08);

          --dash-card-bg:        rgba(255,255,255,0.03);
          --dash-card-border:    rgba(192,38,211,0.14);
          --dash-card-shadow:    none;

          --dash-section-bg:     rgba(255,255,255,0.025);
          --dash-section-border: rgba(192,38,211,0.18);

          --dash-nav-active-bg:     linear-gradient(135deg, rgba(192,38,211,0.22), rgba(168,85,247,0.14));
          --dash-nav-active-text:   #ffffff;
          --dash-nav-active-border: 1px solid rgba(192,38,211,0.45);
          --dash-nav-active-shadow: 0 0 18px rgba(192,38,211,0.18), inset 0 1px 0 rgba(192,38,211,0.20);
          --dash-nav-inactive-text: rgba(255,255,255,0.45);

          --dash-section-label-color: rgba(192,38,211,0.65);

          --dash-user-chip-bg:     rgba(255,255,255,0.04);
          --dash-user-chip-border: rgba(192,38,211,0.18);

          --dash-recent-row-hover: rgba(255,255,255,0.03);
          --dash-recent-border:    rgba(192,38,211,0.10);

          --dash-quick-action-bg:     rgba(255,255,255,0.025);
          --dash-quick-action-border: rgba(255,255,255,0.06);

          --dash-empty-border: rgba(192,38,211,0.25);
          --dash-empty-bg:     rgba(255,255,255,0.02);

          --dash-pending-bg:     rgba(245,158,11,0.08);
          --dash-pending-border: rgba(245,158,11,0.28);
          --dash-pending-text:   #fbbf24;

          --dash-theme-toggle-bg:     rgba(255,255,255,0.06);
          --dash-theme-toggle-border: rgba(192,38,211,0.20);

          --dash-footer-border-color: rgba(192,38,211,0.15);
          --dash-brand-border-color:  rgba(192,38,211,0.18);
        }

        /* ── Scrollbars ── */
        .user-content-scroll::-webkit-scrollbar { width: 4px; }
        .user-content-scroll::-webkit-scrollbar-track { background: transparent; }
        .user-content-scroll::-webkit-scrollbar-thumb { background: rgba(192,38,211,0.25); border-radius: 10px; }
        .user-sidebar-scroll::-webkit-scrollbar { width: 3px; }
        .user-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .user-sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(192,38,211,0.25); border-radius: 10px; }

        /* ── Themed helpers ── */
        .dash-root {
          background: var(--dash-bg);
          transition: background 0.3s ease;
        }
        .dash-dot-grid {
          background:
            radial-gradient(var(--dash-dot-color) 1px, var(--dash-dot-bg) 1px);
          background-size: 22px 22px;
        }
        .dash-sidebar-top-glow {
          background: linear-gradient(to bottom, var(--dash-glow-1), transparent);
        }
        .dash-sidebar-brand-border {
          border-bottom: 1px solid var(--dash-brand-border-color);
        }
        .dash-footer-border {
          border-top: 1px solid var(--dash-footer-border-color);
        }
        .dash-brand-icon {
          background: linear-gradient(135deg, #c026d3, #a855f7);
          box-shadow: 0 4px 14px rgba(192,38,211,0.40);
        }
        .dash-section-label {
          color: var(--dash-section-label-color);
        }
        .dash-nav-indicator {
          background: linear-gradient(to bottom, #c026d3, #a855f7);
          box-shadow: 0 0 8px #c026d3;
        }
        .dash-badge {
          background: linear-gradient(135deg, #c026d3, #a855f7);
          box-shadow: 0 0 8px rgba(192,38,211,0.55);
          color: #fff;
        }
        .dash-theme-toggle-wrap {
          background: var(--dash-theme-toggle-bg);
          border: 1px solid var(--dash-theme-toggle-border);
        }
        .dash-user-chip {
          background: var(--dash-user-chip-bg);
          border: 1px solid var(--dash-user-chip-border);
        }
        .dash-avatar {
          background: linear-gradient(135deg, #c026d3, #a855f7);
        }
        .dash-card {
          background: var(--dash-card-bg);
          border: 1px solid var(--dash-card-border);
          box-shadow: var(--dash-card-shadow);
        }
        .dash-section-wrapper {
          background: var(--dash-section-bg);
          border: 1px solid var(--dash-section-border);
        }
        .dash-loader-wrap {
          background: linear-gradient(135deg, rgba(192,38,211,0.25), rgba(168,85,247,0.15));
          border: 1px solid rgba(192,38,211,0.40);
        }
        .dash-brand-color { color: #c026d3; }
        .dash-header-write-btn {
          background: linear-gradient(135deg, #c026d3, #a855f7);
          color: #fff;
          box-shadow: 0 2px 12px rgba(192,38,211,0.35);
        }
        .dash-glow-blob-1 {
          background: var(--dash-glow-1);
          filter: blur(120px);
        }
        .dash-glow-blob-2 {
          background: var(--dash-glow-2);
          filter: blur(100px);
        }
      `}</style>

      {/* Dot grid + ambient glows */}
      <div className="fixed inset-0 z-0 pointer-events-none dash-dot-grid" />
      <div className="fixed top-[-8%] left-[15%] w-[520px] h-[520px] rounded-full pointer-events-none z-0 dash-glow-blob-1" />
      <div className="fixed bottom-[-5%] right-[8%] w-[400px] h-[400px] rounded-full pointer-events-none z-0 dash-glow-blob-2" />

      <Toast toasts={toasts} onRemove={removeToast} />

      {/* ════ Mobile overlay ════ */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
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
        style={{
          background: "var(--dash-sidebar-bg)",
          borderRight: "1px solid var(--dash-sidebar-border)",
          backdropFilter: "blur(24px)",
        }}
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
        style={{
          background: "var(--dash-sidebar-bg)",
          borderRight: "1px solid var(--dash-sidebar-border)",
          backdropFilter: "blur(20px)",
        }}
      >
        <SidebarContent nav={NAV} activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} router={router} />
      </aside>

      {/* ════ MAIN AREA ════ */}
      <div className="flex-1 flex flex-col min-w-0 w-full relative z-10 overflow-hidden">

        {/* ── Header ── */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 h-[60px]"
          style={{
            background: "var(--dash-header-bg)",
            borderBottom: "1px solid var(--dash-header-border)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl transition-all duration-200"
              style={{
                background: "rgba(192,38,211,0.12)",
                border: "1px solid rgba(192,38,211,0.30)",
                color: "#c026d3",
              }}>
              <Menu className="w-4 h-4" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-xs" style={{ color: "var(--dash-text-faint)" }}>
              <span style={{ color: "#c026d3", fontWeight: 600 }}>Dashboard</span>
              <ChevronRight className="w-3 h-3" />
              <span style={{ color: "var(--dash-text-secondary)" }}>{PAGE_TITLES[activeTab]?.title}</span>
            </div>
            <div className="sm:hidden">
              <span className="text-sm font-semibold" style={{ color: "var(--dash-text-primary)" }}>
                {PAGE_TITLES[activeTab]?.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick create */}
            <button onClick={() => setActiveTab("create")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 dash-header-write-btn">
              <PenLine className="w-3.5 h-3.5" /> Write
            </button>

            {/* Notification bell */}
            <button onClick={() => setActiveTab("notifications")}
              className="relative p-2 rounded-xl transition-all duration-200"
              style={{
                background: activeTab === "notifications" ? "rgba(192,38,211,0.14)" : "var(--dash-card-bg)",
                border: `1px solid ${activeTab === "notifications" ? "rgba(192,38,211,0.38)" : "var(--dash-card-border)"}`,
                color: activeTab === "notifications" ? "#c026d3" : "var(--dash-text-muted)",
              }}>
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full text-white text-[9px] font-bold px-1 dash-badge">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Avatar chip */}
            <button onClick={() => setActiveTab("profile")}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full transition-all duration-200"
              style={{
                background: "var(--dash-card-bg)",
                border: "1px solid var(--dash-card-border)",
              }}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 dash-avatar">
                {profile?.full_name?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="text-xs hidden sm:inline max-w-[90px] truncate" style={{ color: "var(--dash-text-secondary)" }}>
                {profile?.full_name || "Participant"}
              </span>
            </button>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex-1 w-full overflow-y-auto user-content-scroll px-4 sm:px-6 lg:px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
            >

              {/* ════ OVERVIEW ════ */}
              {activeTab === "overview" && (
                <div className="space-y-6">

                  {/* Welcome */}
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
                      Welcome back,{" "}
                      <span className="text-transparent bg-clip-text"
                        style={{ backgroundImage: "linear-gradient(135deg, #c026d3, #a855f7)" }}>
                        {profile?.full_name?.split(" ")[0] || "Participant"}
                      </span>{" "}
                      👋
                    </h2>
                    <p className="text-sm mt-0.5" style={{ color: "var(--dash-text-faint)" }}>
                      Here's what's happening with your content.
                    </p>
                  </div>

                  {/* Stat cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard icon={FileText}     label="Total Posts"   value={totalCount}     accent="#c026d3"  delay={0.05} onClick={() => setActiveTab("myBlog")} />
                    <StatCard icon={CheckCircle2} label="Published"      value={publishedCount} accent="#16a34a"  delay={0.10} onClick={() => setActiveTab("myBlog")} />
                    <StatCard icon={Clock}        label="Pending Review" value={pendingCount}   accent="#d97706"  delay={0.15} onClick={() => setActiveTab("myBlog")} />
                    <StatCard icon={Bell}         label="Unread Alerts"  value={unreadCount}    accent="#db2777"  delay={0.20} onClick={() => setActiveTab("notifications")} />
                  </div>

                  {/* Pending notice */}
                  {pendingCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                      style={{
                        background: "var(--dash-pending-bg)",
                        border: "1px solid var(--dash-pending-border)",
                      }}>
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ background: "#f59e0b" }} />
                      <p className="text-sm" style={{ color: "var(--dash-pending-text)" }}>
                        <span className="font-semibold">{pendingCount} post{pendingCount !== 1 ? "s" : ""}</span> pending admin review
                      </p>
                    </motion.div>
                  )}

                  {/* Quick actions */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-3 dash-section-label">
                      Quick Actions
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { icon: PenLine,  label: "Write a Post",    sub: "Share your thoughts",    tab: "create",  accent: "#c026d3" },
                        { icon: BookOpen, label: "Browse My Posts", sub: "View & manage content",  tab: "myBlog",  accent: "#a855f7" },
                        { icon: User2,    label: "Edit Profile",    sub: "Update your information", tab: "profile", accent: "#db2777" },
                      ].map(({ icon: Icon, label, sub, tab, accent }) => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                          className="relative overflow-hidden rounded-2xl p-4 text-left group"
                          style={{
                            background: "var(--dash-quick-action-bg)",
                            border: "1px solid var(--dash-quick-action-border)",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = `${accent}10`
                            e.currentTarget.style.borderColor = `${accent}40`
                            e.currentTarget.style.transform = "translateY(-2px)"
                            e.currentTarget.style.boxShadow = `0 8px 24px ${accent}15`
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = "var(--dash-quick-action-bg)"
                            e.currentTarget.style.borderColor = "var(--dash-quick-action-border)"
                            e.currentTarget.style.transform = "translateY(0)"
                            e.currentTarget.style.boxShadow = "none"
                          }}
                        >
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                            style={{ background: `${accent}18`, border: `1px solid ${accent}35` }}>
                            <Icon className="w-4.5 h-4.5" style={{ color: accent }} />
                          </div>
                          <p className="text-sm font-semibold" style={{ color: "var(--dash-text-primary)" }}>{label}</p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--dash-text-faint)" }}>{sub}</p>
                          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-200"
                            style={{ color: "var(--dash-text-faint)" }} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recent posts */}
                  {blogs.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] dash-section-label">
                          Recent Posts
                        </p>
                        <button onClick={() => setActiveTab("myBlog")}
                          className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
                          style={{ color: "#c026d3" }}>
                          View all <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="rounded-2xl overflow-hidden dash-section-wrapper">
                        {blogs.slice(0, 5).map((blog, i) => (
                          <motion.div
                            key={blog.id}
                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                            className="flex items-center gap-3 px-4 py-3 transition-colors duration-150"
                            style={{
                              borderBottom: i < Math.min(blogs.length, 5) - 1
                                ? "1px solid var(--dash-recent-border)"
                                : "none",
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "var(--dash-recent-row-hover)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: "rgba(192,38,211,0.12)", border: "1px solid rgba(192,38,211,0.25)" }}>
                              <FileText className="w-3.5 h-3.5" style={{ color: "#c026d3" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate" style={{ color: "var(--dash-text-primary)" }}>
                                {blog.title || "Untitled"}
                              </p>
                              <p className="text-xs mt-0.5" style={{ color: "var(--dash-text-faint)" }}>
                                {blog.created_at
                                  ? new Date(blog.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                  : "—"}
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
                      style={{
                        background: "var(--dash-empty-bg)",
                        border: "1px dashed var(--dash-empty-border)",
                      }}>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                        style={{ background: "rgba(192,38,211,0.12)", border: "1px solid rgba(192,38,211,0.30)" }}>
                        <PenLine className="w-5 h-5" style={{ color: "#c026d3" }} />
                      </div>
                      <p className="text-sm font-semibold" style={{ color: "var(--dash-text-secondary)" }}>No posts yet</p>
                      <p className="text-xs mt-1 mb-4" style={{ color: "var(--dash-text-faint)" }}>Write your first post to get started</p>
                      <button onClick={() => setActiveTab("create")}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white dash-brand-icon"
                        style={{ boxShadow: "0 4px 14px rgba(192,38,211,0.35)" }}>
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
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Total",     value: totalCount,     accent: "#c026d3" },
                      { label: "Published", value: publishedCount, accent: "#16a34a" },
                      { label: "Pending",   value: pendingCount,   accent: "#d97706" },
                    ].map(({ label, value, accent }) => (
                      <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl dash-card">
                        <div>
                          <p className="text-base font-bold leading-none" style={{ color: "var(--dash-text-primary)" }}>{value}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: "var(--dash-text-faint)" }}>{label}</p>
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
                      <p className="text-[10px] uppercase tracking-widest mb-1 font-semibold dash-section-label">
                        Activity Feed
                      </p>
                      <div className="h-px"
                        style={{ background: "linear-gradient(to right, #c026d380, #a855f760, transparent)" }} />
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