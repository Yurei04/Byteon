"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  ShieldCheck, LogOut, Palette, RotateCcw,
  Menu, X, ChevronRight, LayoutDashboard, Settings,
  ArrowUpRight, Activity,
  Monitor,
  ChevronDown,
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

import { Toast } from "../toast"  
import { useToast } from "@/components/use-toast"

import NotificationsTab from "@/components/notifications/notification-tab"
import { useNotifications } from "@/components/notifications/use-notification"
import { notifyContentDeletedByOrg } from "@/lib/notification"
import OrgViewableSection from "./org-view-section"
import WebsitePreviewSection, { WEBSITE_PAGES } from "@/components/preview/website-preview-section"

const ITEMS_PER_PAGE = 6

const DEFAULT_COLORS = {
  primary_color:               "#c026d3",
  secondary_color:             "#db2777",
  text_color:                  "#ffffff",
  text_secondary_color:        "#a1a1aa",
  heading_color:               "#f4f4f5",
  background_color:            "#020617",
  background_secondary_color:  "#0f172a",
  accent_color:                "#a855f7",
  border_color:                "#3f3f46",
  card_background_color:       "#18181b",
  button_text_color:           "#ffffff",
  button_background_color:     "#9333ea",
  navbar_background_color:     "#09090b",
  navbar_text_color:           "#e4e4e7",
  footer_background_color:     "#09090b",
  footer_text_color:           "#a1a1aa",
  success_color:               "#22c55e",
  warning_color:               "#f59e0b",
  error_color:                 "#ef4444",
  link_color:                  "#818cf8",
}

const COLOR_SCHEMES = [
  {
    id: "cosmic-purple", name: "Cosmic Purple", emoji: "🔮",
    preview: ["#c026d3", "#db2777", "#a855f7", "#0b0412", "#1f1130"],
    colors: { primary_color: "#c026d3", secondary_color: "#db2777", text_color: "#fafaff", text_secondary_color: "#c4b5fd", heading_color: "#ffffff", background_color: "#0b0412", background_secondary_color: "#140a1f", accent_color: "#a855f7", border_color: "#4c1d95", card_background_color: "#1f1130", button_text_color: "#ffffff", button_background_color: "#9333ea", navbar_background_color: "#0b0412", navbar_text_color: "#fafaff", footer_background_color: "#0b0412", footer_text_color: "#c4b5fd", success_color: "#22c55e", warning_color: "#f59e0b", error_color: "#ef4444", link_color: "#a5b4fc" },
  },
  {
    id: "ocean-blue", name: "Ocean Blue", emoji: "🌊",
    preview: ["#0ea5e9", "#06b6d4", "#38bdf8", "#031421", "#123457"],
    colors: { primary_color: "#0ea5e9", secondary_color: "#06b6d4", text_color: "#f8fdff", text_secondary_color: "#bae6fd", heading_color: "#ffffff", background_color: "#031421", background_secondary_color: "#0a2540", accent_color: "#38bdf8", border_color: "#1e40af", card_background_color: "#123457", button_text_color: "#ffffff", button_background_color: "#0284c7", navbar_background_color: "#031421", navbar_text_color: "#f8fdff", footer_background_color: "#031421", footer_text_color: "#bae6fd", success_color: "#34d399", warning_color: "#fbbf24", error_color: "#f87171", link_color: "#7dd3fc" },
  },
  {
    id: "emerald-forest", name: "Emerald Forest", emoji: "🌿",
    preview: ["#10b981", "#059669", "#34d399", "#021a12", "#065f46"],
    colors: { primary_color: "#10b981", secondary_color: "#059669", text_color: "#f4fff8", text_secondary_color: "#bbf7d0", heading_color: "#ffffff", background_color: "#021a12", background_secondary_color: "#053d2a", accent_color: "#34d399", border_color: "#166534", card_background_color: "#065f46", button_text_color: "#ffffff", button_background_color: "#047857", navbar_background_color: "#021a12", navbar_text_color: "#f4fff8", footer_background_color: "#021a12", footer_text_color: "#bbf7d0", success_color: "#4ade80", warning_color: "#facc15", error_color: "#f87171", link_color: "#6ee7b7" },
  },
  {
    id: "sunset-orange", name: "Sunset Orange", emoji: "🌅",
    preview: ["#f97316", "#ef4444", "#fb923c", "#1a0700", "#4a1a00"],
    colors: { primary_color: "#f97316", secondary_color: "#ef4444", text_color: "#fffaf5", text_secondary_color: "#fed7aa", heading_color: "#ffffff", background_color: "#1a0700", background_secondary_color: "#331000", accent_color: "#fb923c", border_color: "#9a3412", card_background_color: "#4a1a00", button_text_color: "#ffffff", button_background_color: "#ea580c", navbar_background_color: "#1a0700", navbar_text_color: "#fffaf5", footer_background_color: "#1a0700", footer_text_color: "#fed7aa", success_color: "#4ade80", warning_color: "#fbbf24", error_color: "#f43f5e", link_color: "#fb923c" },
  },
  {
    id: "rose-gold", name: "Rose Gold", emoji: "🌸",
    preview: ["#f43f5e", "#d4a373", "#fb7185", "#14030a", "#3f0f1f"],
    colors: { primary_color: "#f43f5e", secondary_color: "#d4a373", text_color: "#fff7f9", text_secondary_color: "#fecdd3", heading_color: "#ffffff", background_color: "#14030a", background_secondary_color: "#2a0a14", accent_color: "#fb7185", border_color: "#9f1239", card_background_color: "#3f0f1f", button_text_color: "#ffffff", button_background_color: "#e11d48", navbar_background_color: "#14030a", navbar_text_color: "#fff7f9", footer_background_color: "#14030a", footer_text_color: "#fecdd3", success_color: "#34d399", warning_color: "#d4a373", error_color: "#fb7185", link_color: "#fda4af" },
  },
  {
    id: "crimson-dark", name: "Crimson Dark", emoji: "🩸",
    preview: ["#dc2626", "#b91c1c", "#ef4444", "#140000", "#3f0000"],
    colors: { primary_color: "#dc2626", secondary_color: "#b91c1c", text_color: "#fff5f5", text_secondary_color: "#fecaca", heading_color: "#ffffff", background_color: "#140000", background_secondary_color: "#2a0000", accent_color: "#ef4444", border_color: "#7f1d1d", card_background_color: "#3f0000", button_text_color: "#ffffff", button_background_color: "#b91c1c", navbar_background_color: "#140000", navbar_text_color: "#fff5f5", footer_background_color: "#140000", footer_text_color: "#fecaca", success_color: "#4ade80", warning_color: "#fbbf24", error_color: "#f87171", link_color: "#fca5a5" },
  },
  {
    id: "golden-hour", name: "Golden Hour", emoji: "✨",
    preview: ["#f59e0b", "#d97706", "#fbbf24", "#1a1200", "#4d3800"],
    colors: { primary_color: "#f59e0b", secondary_color: "#d97706", text_color: "#fffdf7", text_secondary_color: "#fde68a", heading_color: "#ffffff", background_color: "#1a1200", background_secondary_color: "#332500", accent_color: "#fbbf24", border_color: "#78350f", card_background_color: "#4d3800", button_text_color: "#1c1400", button_background_color: "#f59e0b", navbar_background_color: "#1a1200", navbar_text_color: "#fffdf7", footer_background_color: "#1a1200", footer_text_color: "#fde68a", success_color: "#34d399", warning_color: "#f97316", error_color: "#f87171", link_color: "#fde68a" },
  },
  {
    id: "violet-nebula", name: "Violet Nebula", emoji: "🪐",
    preview: ["#a855f7", "#ec4899", "#6366f1", "#0a0612", "#1a1030"],
    colors: { primary_color: "#a855f7", secondary_color: "#ec4899", text_color: "#f8f7ff", text_secondary_color: "#c4b5fd", heading_color: "#ffffff", background_color: "#0a0612", background_secondary_color: "#1a1030", accent_color: "#6366f1", border_color: "#4c1d95", card_background_color: "#1a1030", button_text_color: "#ffffff", button_background_color: "#a855f7", navbar_background_color: "#0a0612", navbar_text_color: "#f8f7ff", footer_background_color: "#0a0612", footer_text_color: "#c4b5fd", success_color: "#22c55e", warning_color: "#fbbf24", error_color: "#ef4444", link_color: "#f0abfc" },
  },
]

const COLOR_GROUPS = [
  { label: "Brand", icon: "🎨", fields: [{ key: "primary_color", label: "Primary" }, { key: "secondary_color", label: "Secondary" }, { key: "accent_color", label: "Accent" }] },
  { label: "Typography", icon: "✏️", fields: [{ key: "text_color", label: "Body Text" }, { key: "text_secondary_color", label: "Secondary Text" }, { key: "heading_color", label: "Headings" }, { key: "link_color", label: "Links" }] },
  { label: "Backgrounds", icon: "🖼️", fields: [{ key: "background_color", label: "Page Background" }, { key: "background_secondary_color", label: "Section BG" }, { key: "card_background_color", label: "Card BG" }] },
  { label: "Buttons & Borders", icon: "🔲", fields: [{ key: "button_background_color", label: "Button Fill" }, { key: "button_text_color", label: "Button Text" }, { key: "border_color", label: "Borders" }] },
  { label: "Navigation", icon: "🧭", fields: [{ key: "navbar_background_color", label: "Navbar BG" }, { key: "navbar_text_color", label: "Navbar Text" }, { key: "footer_background_color", label: "Footer BG" }, { key: "footer_text_color", label: "Footer Text" }] },
  { label: "Feedback", icon: "🚦", fields: [{ key: "success_color", label: "Success" }, { key: "warning_color", label: "Warning" }, { key: "error_color", label: "Error" }] },
]

// ── ColorCustomizationSection ─────────────────────────────────────────────
function ColorCustomizationSection({ formData, isEditing, onChange, orgTheme, onResetDefaults, onApplyScheme }) {
  const [openGroup, setOpenGroup] = useState("Brand")
  const [activeSchemeId, setActiveSchemeId] = useState(null)
  const [pickerMode, setPickerMode] = useState("schemes")

  useEffect(() => {
    const match = COLOR_SCHEMES.find(s =>
      s.colors.primary_color === formData.primary_color &&
      s.colors.secondary_color === formData.secondary_color &&
      s.colors.background_color === formData.background_color
    )
    setActiveSchemeId(match ? match.id : null)
  }, [formData.primary_color, formData.secondary_color, formData.background_color])

  const handleApplyScheme = (scheme) => { setActiveSchemeId(scheme.id); onApplyScheme(scheme.colors) }
  const p = formData.primary_color   || DEFAULT_COLORS.primary_color
  const s = formData.secondary_color || DEFAULT_COLORS.secondary_color

  return (
    <div className="rounded-2xl p-6 relative overflow-hidden"
      style={{ background: "rgba(0,0,0,0.25)", border: `1px solid ${p}30`, boxShadow: `0 0 0 1px ${p}10, inset 0 1px 0 rgba(255,255,255,0.05)` }}>
      <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${p}15, transparent 70%)` }} />

      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold flex items-center gap-2.5" style={{ color: orgTheme.primaryText }}>
          <span className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: `${p}20`, border: `1px solid ${p}40` }}>
            <Palette className="w-4 h-4" style={{ color: p }} />
          </span>
          Color Customization
        </h3>
        {isEditing && (
          <button type="button" onClick={onResetDefaults}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: "rgba(255,255,255,0.05)", color: orgTheme.mutedText, border: "1px solid rgba(255,255,255,0.1)" }}>
            <RotateCcw className="w-3 h-3" /> Reset Defaults
          </button>
        )}
      </div>

      <div className="mb-5">
        <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: orgTheme.mutedText }}>Current Palette</p>
        <div className="flex gap-1.5 h-9 rounded-xl overflow-hidden p-0.5" style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${p}25` }}>
          {[formData.primary_color, formData.secondary_color, formData.accent_color, formData.background_color, formData.card_background_color, formData.success_color, formData.warning_color, formData.error_color].map((c, i) => (
            <div key={i} title={c} className="flex-1 rounded-lg transition-transform duration-200 hover:scale-y-110 cursor-default" style={{ background: c }} />
          ))}
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl mb-5 w-fit" style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {[{ id: "schemes", label: "🎨 Presets" }, { id: "custom", label: "🛠 Custom" }].map(({ id, label }) => (
          <button key={id} type="button" onClick={() => setPickerMode(id)}
            className="text-xs px-4 py-1.5 rounded-lg font-medium transition-all duration-200"
            style={pickerMode === id ? { background: `linear-gradient(135deg, ${p}, ${s})`, color: "#fff", boxShadow: `0 2px 12px ${p}50` } : { background: "transparent", color: orgTheme.mutedText }}>
            {label}
          </button>
        ))}
      </div>

      {pickerMode === "schemes" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COLOR_SCHEMES.map((scheme) => {
            const isActive = activeSchemeId === scheme.id
            const sp = scheme.colors.primary_color
            const ss = scheme.colors.secondary_color
            return (
              <button key={scheme.id} type="button" disabled={!isEditing} onClick={() => handleApplyScheme(scheme)}
                className="relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-250 group"
                style={{ background: isActive ? `linear-gradient(135deg, ${sp}18, ${ss}12)` : "rgba(255,255,255,0.03)", border: isActive ? `1.5px solid ${sp}80` : "1.5px solid rgba(255,255,255,0.07)", boxShadow: isActive ? `0 0 20px ${sp}30, inset 0 1px 0 ${sp}20` : "none", transform: isActive ? "translateY(-1px)" : "translateY(0)", opacity: !isEditing ? 0.55 : 1, cursor: !isEditing ? "default" : "pointer" }}>
                {isActive && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${sp}, ${ss})` }}>✓</div>
                )}
                <div className="flex gap-0.5 w-full justify-center h-4 rounded-md overflow-hidden">
                  {scheme.preview.map((color, i) => <div key={i} className="flex-1" style={{ background: color }} />)}
                </div>
                <span className="text-lg leading-none">{scheme.emoji}</span>
                <span className="text-[10px] font-semibold text-center leading-tight" style={{ color: isActive ? sp : orgTheme.mutedText }}>{scheme.name}</span>
              </button>
            )
          })}
        </div>
      )}

      {pickerMode === "custom" && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {COLOR_GROUPS.map(({ label, icon }) => (
              <button key={label} type="button" onClick={() => setOpenGroup(label)}
                className="cursor-pointer text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                style={openGroup === label ? { background: `linear-gradient(135deg, ${p}, ${s})`, color: "#fff", boxShadow: `0 2px 10px ${p}40` } : { background: "rgba(255,255,255,0.05)", color: orgTheme.mutedText, border: "1px solid rgba(255,255,255,0.08)" }}>
                {icon} {label}
              </button>
            ))}
          </div>
          {COLOR_GROUPS.filter(g => g.label === openGroup).map(({ fields }) => (
            <div key={openGroup} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {fields.map(({ key, label }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <Label className="text-xs" style={{ color: orgTheme.mutedText }}>{label}</Label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden ring-1 ring-white/10 shadow-md" title={formData[key]}>
                      {isEditing ? (
                        <input type="color" name={key} value={formData[key] || DEFAULT_COLORS[key]} onChange={onChange}
                          className="w-10 h-10 -m-1 cursor-pointer" style={{ border: "none", padding: 0 }} />
                      ) : (
                        <div className="w-full h-full" style={{ background: formData[key] || DEFAULT_COLORS[key] }} />
                      )}
                    </div>
                    {isEditing ? (
                      <input type="text" name={key} value={formData[key] || DEFAULT_COLORS[key]} onChange={onChange} maxLength={7}
                        className="flex-1 text-xs font-mono rounded-lg px-2.5 py-1.5 bg-black/30 text-white outline-none transition-all duration-200"
                        style={{ border: `1px solid ${p}35` }}
                        onFocus={e => e.target.style.boxShadow = `0 0 0 2px ${p}40`}
                        onBlur={e => e.target.style.boxShadow = "none"}
                        placeholder="#000000" />
                    ) : (
                      <span className="flex-1 text-xs font-mono px-2.5 py-1.5 rounded-lg cursor-pointer "
                        style={{ background: "rgba(0,0,0,0.2)", color: orgTheme.mutedText }}>
                        {formData[key] || DEFAULT_COLORS[key]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  )
}


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
 
 

// ── Sidebar Nav Item ─────────────────────────────────────────────────────────
function SidebarNavItem({ value, icon, label, isActive, onClick, p, s, orgTheme, badge }) {
  return (
    <button
      onClick={() => onClick(value)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative cursor-pointer "
      style={isActive ? {
        background: `linear-gradient(135deg, ${p}22, ${s}14)`,
        color: "#ffffff",
        border: `1px solid ${p}45`,
        boxShadow: `0 0 18px ${p}18, inset 0 1px 0 ${p}20`,
      } : {
        background: "transparent",
        color: orgTheme.mutedText,
        border: "1px solid transparent",
      }}
    >
      {/* Active indicator bar */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
          style={{ background: `linear-gradient(to bottom, ${p}, ${s})`, boxShadow: `0 0 8px ${p}` }} />
      )}
      <span className="flex-shrink-0 transition-colors duration-200"
        style={{ color: isActive ? p : "inherit" }}>
        {icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {badge != null && badge > 0 && (
        <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-white text-[10px] font-bold px-1"
          style={{ background: `linear-gradient(135deg, ${p}, ${s})`, boxShadow: `0 0 8px ${p}60` }}>
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function OrgDashboardPage() {
  const router = useRouter()
  const { profile, role, loading: authLoading, isLoggedIn, session, refreshProfile } = useAuth()

  const [activeTab, setActiveTab]             = useState("overview")
  const [activeCreateTab, setActiveCreateTab] = useState("createAnnouncement")
  const [sidebarOpen, setSidebarOpen]         = useState(false)

  const [announcements, setAnnouncements] = useState([])
  const [blogs, setBlogs]                 = useState([])
  const [resources, setResources]         = useState([])

  const [contentLoading, setContentLoading] = useState(false)
  const [stats, setStats] = useState({
    totalAnnouncements: 0, totalBlogs: 0, totalResources: 0, activeAnnouncements: 0,
  })
  const [websitePage, setWebsitePage] = useState(WEBSITE_PAGES[0])
  const [currentPageAnnouncement, setCurrentPageAnnouncement] = useState(1)
  const [currentPageBlogs, setCurrentPageBlogs]               = useState(1)
  const [currentPageResources, setCurrentPageResources]       = useState(1)

  const [isEditing, setIsEditing]             = useState(false)
  const [isProfileSaving, setIsProfileSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [formData, setFormData] = useState({
    name: "", description: "", author_name: "", contact_email: "",
    color_scheme: "black", active: true, achievements: [],
    ...DEFAULT_COLORS,
  })

  const orgTheme = useMemo(
    () => buildTheme(
      profile?.primary_color   ?? formData.primary_color,
      profile?.secondary_color ?? formData.secondary_color,
    ),
    [profile?.primary_color, profile?.secondary_color, formData.primary_color, formData.secondary_color],
  )

  const p = formData.primary_color   || DEFAULT_COLORS.primary_color
  const s = formData.secondary_color || DEFAULT_COLORS.secondary_color

  const { toasts, addToast, removeToast } = useToast()
  const { unreadCount } = useNotifications({ userId: session?.user?.id, role: "org_admin" })

  const dynamicStyles = useMemo(() => `
    .org-tab[data-state=active] {
      background: linear-gradient(135deg, ${p}, ${s}) !important;
      color: #ffffff !important;
      border: none !important;
      box-shadow: 0 2px 12px ${p}50, 0 0 0 1px ${p}30 !important;
    }
    .org-tab { transition: all 0.2s ease !important; }
    .org-tab:hover:not([data-state=active]) { background: ${p}15 !important; color: #fff !important; }
    .org-page-link[data-active=true] {
      background: ${p}25 !important; color: #fff !important;
      border-color: ${p}50 !important; box-shadow: 0 0 10px ${p}30 !important;
    }
    .org-card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease !important; will-change: transform; }
    .org-card-hover:hover { transform: translateY(-3px) !important; border-color: ${p} !important; box-shadow: 0 12px 32px ${p}25, 0 0 0 1px ${p}20 !important; }
    .org-section-divider { height: 1px; background: linear-gradient(to right, ${p}60, ${s}40, transparent); }
    .org-input:focus { outline: none !important; border-color: ${p}60 !important; box-shadow: 0 0 0 3px ${p}20 !important; }
    .org-sub-tabs { background: rgba(0,0,0,0.25) !important; border: 1px solid ${p}20 !important; }
    .sidebar-scrollbar::-webkit-scrollbar { width: 3px; }
    .sidebar-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .sidebar-scrollbar::-webkit-scrollbar-thumb { background: ${p}40; border-radius: 10px; }
    .content-scrollbar::-webkit-scrollbar { width: 5px; }
    .content-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .content-scrollbar::-webkit-scrollbar-thumb { background: ${p}30; border-radius: 10px; }
  `, [p, s])

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return
    if (isLoggedIn && role === null) return
    if (!isLoggedIn) { router.push("/log-in"); return }
    if (role !== "org_admin") { router.push("/unauthorized"); return }
  }, [authLoading, isLoggedIn, role, router])

  useEffect(() => {
    if (!profile) return
    const orgAchievements = profile.achievements
      ? (typeof profile.achievements === "string" ? JSON.parse(profile.achievements) : profile.achievements) : []
    setFormData({
      name:         profile.name         || "",
      description:  profile.description  || "",
      author_name:  profile.author_name  || "",
      color_scheme: profile.color_scheme || "black",
      active:       profile.active !== false,
      achievements: orgAchievements,
      ...Object.fromEntries(Object.keys(DEFAULT_COLORS).map(k => [k, profile[k] || DEFAULT_COLORS[k]])),
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

  const fetchAllData = async (orgId) => {
    setContentLoading(true)
    await Promise.all([fetchAnnouncements(orgId), fetchBlogs(orgId), fetchResources(orgId)])
    setCurrentPageAnnouncement(1); setCurrentPageBlogs(1); setCurrentPageResources(1)
    setContentLoading(false)
  }
  const fetchAnnouncements = async (orgId) => {
    const { data, error } = await supabase.from("announcements").select("*").eq("organization_id", orgId).order("created_at", { ascending: false })
    if (error) { console.error(error); return }
    setAnnouncements(data || [])
    setStats(prev => ({ ...prev, totalAnnouncements: data?.length || 0, activeAnnouncements: data?.filter(a => new Date(a.date_end) >= new Date()).length || 0 }))
  }
  const fetchBlogs = async (orgId) => {
    const { data, error } = await supabase.from("blogs").select("*").eq("organization_id", orgId).order("created_at", { ascending: false })
    if (error) { console.error(error); return }
    setBlogs(data || [])
    setStats(prev => ({ ...prev, totalBlogs: data?.length || 0 }))
  }
  const fetchResources = async (orgId) => {
    const { data, error } = await supabase.from("resource_hub").select("*").eq("organization_id", orgId).order("created_at", { ascending: false })
    if (error) { console.error(error); return }
    setResources(data || [])
    setStats(prev => ({ ...prev, totalResources: data?.length || 0 }))
  }

  const refreshAnnouncements = () => profile?.id && fetchAnnouncements(profile.id)
  const refreshBlogs         = () => profile?.id && fetchBlogs(profile.id)
  const refreshResources     = () => profile?.id && fetchResources(profile.id)
  const refreshAll           = () => profile?.id && fetchAllData(profile.id)

  const handleProfileChange  = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }
  const handleResetColors  = () => setFormData(prev => ({ ...prev, ...DEFAULT_COLORS }))
  const handleApplyScheme  = (schemeColors) => setFormData(prev => ({ ...prev, ...schemeColors }))

  const handleProfileSubmit = async () => {
    if (!formData.name || !formData.description) { addToast("error", "Organization Name and Description are required."); return }
    if (!formData.author_name) { addToast("error", "Username (Author Name) is required."); return }
    setIsProfileSaving(true)
    try {
      const colorPayload = Object.fromEntries(Object.keys(DEFAULT_COLORS).map(k => [k, formData[k]]))
      const { error } = await supabase.from("organizations").update({
        name: formData.name, description: formData.description, author_name: formData.author_name,
        color_scheme: formData.color_scheme, active: formData.active,
        achievements: JSON.stringify(formData.achievements), updated_at: new Date().toISOString(), ...colorPayload,
      }).eq("user_id", profile.user_id)
      if (error) throw error
      await refreshProfile()
      addToast("success", "Organization profile updated successfully!")
      setIsEditing(false)
    } catch (error) { addToast("error", `Failed to update profile: ${error.message}`) }
    finally { setIsProfileSaving(false) }
  }

  const handleProfileCancel = () => {
    setIsEditing(false)
    if (profile) {
      const orgAchievements = profile.achievements
        ? (typeof profile.achievements === "string" ? JSON.parse(profile.achievements) : profile.achievements) : []
      setFormData({
        name: profile.name || "", description: profile.description || "", author_name: profile.author_name || "",
        color_scheme: profile.color_scheme || "black", active: profile.active !== false, achievements: orgAchievements,
        ...Object.fromEntries(Object.keys(DEFAULT_COLORS).map(k => [k, profile[k] || DEFAULT_COLORS[k]])),
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
      await notifyContentDeletedByOrg({ orgName: profile?.name || "An organization", contentType: type, contentTitle: item?.title || "Untitled" })
    } catch (error) { console.error("Delete error:", error) }
  }

  const paginateData  = (data, page) => data.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  const getTotalPages = (data) => Math.ceil(data.length / ITEMS_PER_PAGE)

  const generatePaginationItems = (totalPages, currentPage, onPageChange) => {
    const items = []; const maxVisible = 5
    items.push(<PaginationItem key="prev"><PaginationPrevious onClick={() => currentPage > 1 && onPageChange(currentPage - 1)} className={currentPage > 1 ? "cursor-pointer" : "pointer-events-none opacity-50"} style={{ color: orgTheme.primaryText }} /></PaginationItem>)
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2)); let end = Math.min(totalPages, start + maxVisible - 1)
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1)
    if (start > 1) { items.push(<PaginationItem key={1}><PaginationLink onClick={() => onPageChange(1)} className="cursor-pointer">1</PaginationLink></PaginationItem>); if (start > 2) items.push(<PaginationItem key="e1"><PaginationEllipsis /></PaginationItem>) }
    for (let pg = start; pg <= end; pg++) {
      items.push(<PaginationItem key={pg}><PaginationLink onClick={() => onPageChange(pg)} isActive={pg === currentPage} className="cursor-pointer org-page-link" data-active={pg === currentPage} style={pg === currentPage ? { background: `${p}22`, color: orgTheme.primaryText, borderColor: `${p}45`, boxShadow: `0 0 10px ${p}25` } : { color: orgTheme.mutedText }}>{pg}</PaginationLink></PaginationItem>)
    }
    if (end < totalPages) { if (end < totalPages - 1) items.push(<PaginationItem key="e2"><PaginationEllipsis /></PaginationItem>); items.push(<PaginationItem key={totalPages}><PaginationLink onClick={() => onPageChange(totalPages)} className="cursor-pointer">{totalPages}</PaginationLink></PaginationItem>) }
    items.push(<PaginationItem key="next"><PaginationNext onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)} className={currentPage < totalPages ? "cursor-pointer" : "pointer-events-none opacity-50"} style={{ color: orgTheme.primaryText }} /></PaginationItem>)
    return items
  }

  const paginatedAnnouncements = useMemo(() => paginateData(announcements, currentPageAnnouncement), [announcements, currentPageAnnouncement])
  const paginatedBlogs         = useMemo(() => paginateData(blogs, currentPageBlogs), [blogs, currentPageBlogs])
  const paginatedResources     = useMemo(() => paginateData(resources, currentPageResources), [resources, currentPageResources])

  if (authLoading || (isLoggedIn && role === null)) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0b0f1a" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${p}30, ${s}20)`, border: `1px solid ${p}50` }}>
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: p }} />
          </div>
          <p className="text-sm" style={{ color: "#ffffff60" }}>Loading dashboard…</p>
        </div>
      </div>
    )
  }
  if (!isLoggedIn || role !== "org_admin") return null

  // ── Nav items ─────────────────────────────────────────────────────────────
  const navItems = [
    { value: "overview",       icon: <LayoutDashboard className="w-4 h-4" />, label: "Overview"      },
    { value: "view",           icon: <FileText         className="w-4 h-4" />, label: "All Content"   },
    { value: "create",         icon: <Plus             className="w-4 h-4" />, label: "Create"        },
    { value: "posters",        icon: <Sparkles         className="w-4 h-4" />, label: "Poster Maker"  },
    { value: "profile",        icon: <Settings         className="w-4 h-4" />, label: "Settings"      },
    { value: "notifications",  icon: <Bell             className="w-4 h-4" />, label: "Notifications", badge: unreadCount },
  ]

  const createSubTabs = [
    { tab: "createAnnouncement", icon: <Megaphone className="w-4 h-4 mr-2" />, label: "Announcement", content: <PendingAnnounceForm onSuccess={refreshAll} currentOrg={profile} authUserId={profile?.user_id} addToast={addToast} /> },
    { tab: "createBlogs",        icon: <FileText   className="w-4 h-4 mr-2" />, label: "Blog",         content: <PendingBlogOrgForm   onSuccess={refreshAll} currentOrg={profile} authUserId={profile?.user_id} addToast={addToast} /> },
    { tab: "createResources",    icon: <BookOpen   className="w-4 h-4 mr-2" />, label: "Resource",     content: <PendingResourceForm  onSuccess={refreshAll} currentOrg={profile} authUserId={profile?.user_id} addToast={addToast} /> },
  ]

  const statCards = [
    { label: "Announcements", count: stats.totalAnnouncements,  Icon: Megaphone,  desc: "total posted",     trend: "+2 this week"  },
    { label: "Resources",     count: stats.totalResources,      Icon: BookOpen,   desc: "shared items",     trend: "shared items"  },
    { label: "Blogs",         count: stats.totalBlogs,          Icon: FileText,   desc: "articles written", trend: "published"     },
    { label: "Active Events", count: stats.activeAnnouncements, Icon: Activity,   desc: "live right now",   trend: "live now"      },
  ]

  const pageTitles = {
    overview:      { title: "Overview",      sub: "Your organization at a glance" },
    view:          { title: "All Content",   sub: "Browse and manage published content" },
    create:        { title: "Create",        sub: "Publish new announcements, blogs & resources" },
    posters:       { title: "Poster Maker",  sub: "Design promotional materials" },
    profile:       { title: "Settings",      sub: "Manage your organization profile & branding" },
    website:         { title: "Website Preview", sub: "View-only preview — navigation via sidebar" },
    notifications: { title: "Notifications", sub: "Approval decisions and account alerts" },
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#0b0f1a", ...orgTheme.cssVars }}>
      <style>{dynamicStyles}</style>
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* ── Mobile overlay ── */}
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
      <motion.aside
        initial={false}
        className={`fixed lg:static inset-y-0 left-0 z-30 flex flex-col w-60 xl:w-64 flex-shrink-0 transition-transform duration-300 ease-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          background: "rgba(5,5,15,0.92)",
          borderRight: `1px solid ${p}18`,
          backdropFilter: "blur(24px)",
        }}
      >
        {/* Sidebar top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, ${p}12, transparent)` }} />

        {/* ── Org brand ── */}
        <div className="relative flex items-center gap-3 p-5 pb-4"
          style={{ borderBottom: `1px solid ${p}15` }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${p}, ${s})`, boxShadow: `0 4px 14px ${p}50` }}>
            <Building2 className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate leading-tight" style={{ color: "#ffffff" }}>
              {profile?.name || "Organization"}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#22c55e" }} />
              <p className="text-[10px]" style={{ color: orgTheme.mutedText }}>Active</p>
            </div>
          </div>
          <button className="lg:hidden p-1.5 rounded-lg flex-shrink-0" onClick={() => setSidebarOpen(false)}
            style={{ color: orgTheme.mutedText }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Nav section label ── */}
        <div className="px-4 pt-5 pb-2">
          <p className="text-[9px] uppercase tracking-[0.18em] font-semibold" style={{ color: `${p}80` }}>
            Navigation
          </p>
        </div>

        {/* ── Nav items ── */}
        
        <nav className="flex-1 px-3 pb-3 space-y-0.5 overflow-y-auto sa-scrollbar cursor-pointer">
          {navItems.map(({ value, icon, label, badge, pulse }) => (
              <SidebarNavItem
                key={value}
                value={value}
                icon={icon}
                label={label}
                isActive={activeTab === value}
                badge={badge}
                pulse={pulse}
                p={p}
                s={s}
                orgTheme={orgTheme}
                onClick={(v) => {
                  setActiveTab(v)
                  setSidebarOpen(false)
                }}
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

        {/* ── Sidebar footer ── */}
        <div className="p-3 space-y-1" style={{ borderTop: `1px solid ${p}15` }}>
          <ReturnButton primaryC={p} secondaryC={s} />
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-red-500/10 mt-1"
            style={{ color: "#f87171", border: "1px solid transparent" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}
          >
            <LogOut className="w-4 h-4" />Sign Out
          </button>
        </div>
      </motion.aside>

      {/* ════════════════════ MAIN AREA ════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Top header bar ── */}
        <header className="flex-shrink-0 flex items-center justify-between px-5 sm:px-7 h-[60px]"
          style={{
            background: "rgba(5,5,15,0.75)",
            borderBottom: `1px solid ${p}18`,
            backdropFilter: "blur(16px)",
          }}>

          {/* Left: mobile toggle + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-xl transition-all duration-200"
              onClick={() => setSidebarOpen(true)}
              style={{ background: `${p}15`, border: `1px solid ${p}30`, color: p }}
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-xs" style={{ color: orgTheme.mutedText }}>
              <span style={{ color: p, fontWeight: 600 }}>{profile?.name || "Org"}</span>
              <ChevronRight className="w-3 h-3" />
              <span style={{ color: "#ffffff90" }}>{pageTitles[activeTab]?.title}</span>
            </div>
            <div className="sm:hidden">
              <span className="text-sm font-semibold" style={{ color: "#ffffff" }}>
                {pageTitles[activeTab]?.title}
              </span>
            </div>
          </div>

          {/* Right: quick actions */}
          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button
              onClick={() => setActiveTab("notifications")}
              className="relative p-2 rounded-xl transition-all duration-200"
              style={{
                background: activeTab === "notifications" ? `${p}20` : "rgba(255,255,255,0.04)",
                border: `1px solid ${activeTab === "notifications" ? `${p}40` : "rgba(255,255,255,0.08)"}`,
                color: activeTab === "notifications" ? p : orgTheme.mutedText,
              }}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full text-white text-[9px] font-bold px-1"
                  style={{ background: `linear-gradient(135deg, ${p}, ${s})`, boxShadow: `0 0 8px ${p}` }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Create shortcut */}
            <button
              onClick={() => setActiveTab("create")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{ background: `linear-gradient(135deg, ${p}, ${s})`, color: "#ffffff", boxShadow: `0 2px 12px ${p}40` }}
            >
              <Plus className="w-3.5 h-3.5" /> Create
            </button>

            {/* Admin badge */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${p}25` }}>
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: p }} />
              <span className="text-xs font-medium" style={{ color: orgTheme.primaryText }}>Admin</span>
            </div>
          </div>
        </header>

        {/* ── Scrollable content ── */}
        <main
          className="flex-1 overflow-y-auto content-scrollbar"
          style={{
            backgroundImage: `
              radial-gradient(#ffffff18 1px, transparent 1px),
              radial-gradient(circle at 15% 0%, ${p}30 0%, transparent 40%),
              radial-gradient(circle at 85% 100%, ${s}22 0%, transparent 45%)
            `,
            backgroundSize: "24px 24px, auto, auto",
            backgroundColor: "#0b0f1a",
          }}
        >
          <div className="p-5 sm:p-7 max-w-7xl mx-auto w-full">

            {/* ── Page heading ── */}
            <motion.div
              key={`heading-${activeTab}`}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mb-6 flex items-center justify-between"
            >
              <div>
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "#ffffff" }}>
                  {pageTitles[activeTab]?.title}
                </h1>
                <p className="text-xs sm:text-sm mt-0.5" style={{ color: orgTheme.mutedText }}>
                  {pageTitles[activeTab]?.sub}
                </p>
              </div>
              {/* Page-level accent line */}
              <div className="hidden sm:block h-8 w-px" style={{ background: `linear-gradient(to bottom, transparent, ${p}70, transparent)` }} />
            </motion.div>

            {/* ══ OVERVIEW / STATS (shown on overview tab, or as a compact strip on others) ══ */}
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* ── Big stat cards ── */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {statCards.map(({ label, count, Icon, desc, trend }, i) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        className="rounded-2xl p-5 relative overflow-hidden group cursor-default"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: `1px solid ${p}25`,
                          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05)`,
                          transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = `${p}60`
                          e.currentTarget.style.transform = "translateY(-2px)"
                          e.currentTarget.style.boxShadow = `0 8px 28px ${p}20, inset 0 1px 0 rgba(255,255,255,0.06)`
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = `${p}25`
                          e.currentTarget.style.transform = "translateY(0)"
                          e.currentTarget.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.05)`
                        }}
                      >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                          style={{ background: `radial-gradient(circle at 70% 10%, ${p}12, transparent 65%)` }} />
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: `${p}cc` }}>
                            {label}
                          </p>
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: `${p}18`, border: `1px solid ${p}35` }}>
                            <Icon className="w-4 h-4" style={{ color: p }} />
                          </div>
                        </div>
                        <div className="flex items-end justify-between">
                          <span className="text-3xl sm:text-4xl font-bold leading-none text-transparent bg-clip-text"
                            style={{ backgroundImage: `linear-gradient(135deg, #ffffff, ${p})` }}>
                            {count}
                          </span>
                          <span className="text-[10px] flex items-center gap-1 mb-1" style={{ color: "#22c55e" }}>
                            <ArrowUpRight className="w-3 h-3" />{trend}
                          </span>
                        </div>
                        <p className="text-[10px] mt-2" style={{ color: `${orgTheme.mutedText}80` }}>{desc}</p>
                        <div className="absolute bottom-0 left-0 right-0 h-px"
                          style={{ background: `linear-gradient(to right, transparent, ${p}50, transparent)` }} />
                      </motion.div>
                    ))}
                  </div>

                  {/* ── Quick actions ── */}
                  <div className="mb-6">
                    <p className="text-[10px] uppercase tracking-[0.18em] mb-3 font-semibold" style={{ color: `${p}80` }}>
                      Quick Actions
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "New Announcement", icon: <Megaphone className="w-5 h-5" />, tab: "create", sub: "createAnnouncement" },
                        { label: "Write a Blog",     icon: <FileText   className="w-5 h-5" />, tab: "create", sub: "createBlogs"        },
                        { label: "Add Resource",     icon: <BookOpen   className="w-5 h-5" />, tab: "create", sub: "createResources"    },
                        { label: "Make a Poster",    icon: <Sparkles   className="w-5 h-5" />, tab: "posters"                           },
                      ].map(({ label, icon, tab, sub }) => (
                        <button key={label}
                          onClick={() => { setActiveTab(tab); if (sub) setActiveCreateTab(sub) }}
                          className="flex flex-col items-center gap-3 p-4 rounded-2xl text-sm font-medium transition-all duration-200 group"
                          style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${p}20` }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = `linear-gradient(135deg, ${p}18, ${s}10)`
                            e.currentTarget.style.borderColor = `${p}50`
                            e.currentTarget.style.transform = "translateY(-2px)"
                            e.currentTarget.style.boxShadow = `0 8px 24px ${p}18`
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.03)"
                            e.currentTarget.style.borderColor = `${p}20`
                            e.currentTarget.style.transform = "translateY(0)"
                            e.currentTarget.style.boxShadow = "none"
                          }}
                        >
                          <span style={{ color: p }}>{icon}</span>
                          <span className="text-xs text-center leading-tight" style={{ color: "#ffffff90" }}>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Recent activity strip ── */}
                  <div className="rounded-2xl p-5"
                    style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${p}18` }}>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold" style={{ color: "#ffffff" }}>Recent Content</p>
                      <button onClick={() => setActiveTab("view")} className="text-xs flex items-center gap-1 transition-colors duration-200"
                        style={{ color: p }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                        View all <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    {contentLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin" style={{ color: p }} />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {[...announcements.slice(0,2).map(a => ({ ...a, _type: "Announcement" })),
                          ...blogs.slice(0,2).map(b => ({ ...b, _type: "Blog" })),
                          ...resources.slice(0,1).map(r => ({ ...r, _type: "Resource" })),
                        ].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0,5).map((item) => (
                          <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
                            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = `${p}30`}
                            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"}
                          >
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: `${p}18`, border: `1px solid ${p}30` }}>
                              {item._type === "Announcement" ? <Megaphone className="w-3.5 h-3.5" style={{ color: p }} />
                               : item._type === "Blog"       ? <FileText  className="w-3.5 h-3.5" style={{ color: p }} />
                               :                               <BookOpen  className="w-3.5 h-3.5" style={{ color: p }} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate" style={{ color: "#ffffff90" }}>{item.title || "Untitled"}</p>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
                              style={{ background: `${p}15`, color: p, border: `1px solid ${p}30` }}>
                              {item._type}
                            </span>
                          </div>
                        ))}
                        {(announcements.length + blogs.length + resources.length) === 0 && (
                          <p className="text-center text-sm py-6" style={{ color: orgTheme.mutedText }}>No content yet. Start by creating something!</p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ════ VIEW ALL ════ */}
              {activeTab === "view" && (
                <motion.div key="view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  {/* Compact stat strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {statCards.map(({ label, count, Icon }) => (
                      <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${p}20` }}>
                        <Icon className="w-4 h-4 flex-shrink-0" style={{ color: p }} />
                        <div>
                          <p className="text-base font-bold leading-none" style={{ color: "#ffffff" }}>{count}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: orgTheme.mutedText }}>{label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${p}18` }}>
                    <OrgViewableSection currentOrg={profile} authUserId={profile?.user_id} primaryColor={p} secondaryColor={s} addToast={addToast} />
                  </div>
                </motion.div>
              )}

              {/* ════ CREATE ════ */}
              {activeTab === "create" && (
                <motion.div key="create" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${p}18` }}>
                    <div className="p-5">
                      <Tabs value={activeCreateTab} onValueChange={setActiveCreateTab}>
                        <TabsList className="grid w-full grid-cols-3 mb-6 p-1 rounded-xl org-sub-tabs h-auto gap-1">
                          {createSubTabs.map(({ tab, icon, label }) => (
                            <TabsTrigger key={tab} value={tab}
                              className="org-tab flex items-center rounded-lg transition-all py-2 text-xs sm:text-sm"
                              style={{ color: orgTheme.mutedText }}>
                              {icon}{label}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        {createSubTabs.map(({ tab, content }) => (
                          <TabsContent key={tab} value={tab}>{content}</TabsContent>
                        ))}
                      </Tabs>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ════ POSTER MAKER ════ */}
              {activeTab === "posters" && (
                <motion.div key="posters" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${p}20` }}>
                    <PosterMaker embedded />
                  </div>
                </motion.div>
              )}

              {/* ════ PROFILE / SETTINGS ════ */}
              {activeTab === "profile" && (
                <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <div className="space-y-6">
                    <OrgProfileHeader
                      formData={formData} profile={profile}
                      isEditing={isEditing} isLoading={isProfileSaving}
                      onEdit={() => setIsEditing(true)}
                      onSave={handleProfileSubmit}
                      onCancel={handleProfileCancel}
                      orgTheme={orgTheme} primaryC={p} secondaryC={s} addToast={addToast}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-6">
                        <OrgAboutSection formData={formData} isEditing={isEditing} onChange={handleProfileChange} orgTheme={orgTheme} primaryC={p} secondaryC={s} />

                        {/* Account info */}
                        <div className="rounded-2xl p-6 relative overflow-hidden"
                          style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${p}25`, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04)` }}>
                          <div className="flex items-center gap-2.5 mb-1">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg" style={{ background: `${p}18`, border: `1px solid ${p}35` }}>
                              <AtSign className="w-3.5 h-3.5" style={{ color: p }} />
                            </span>
                            <h3 className="text-base font-semibold" style={{ color: orgTheme.primaryText }}>Account Information</h3>
                          </div>
                          <div className="org-section-divider mb-5 mt-3" />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="mb-2 text-xs flex items-center gap-1.5" style={{ color: orgTheme.mutedText }}>
                                <AtSign className="w-3.5 h-3.5" />Username (Author Name)
                              </Label>
                              {isEditing
                                ? <Input name="author_name" value={formData.author_name} onChange={handleProfileChange} className="org-input bg-black/30 text-white rounded-xl h-10" style={{ border: `1px solid ${p}35` }} placeholder="johndoe" />
                                : <p className="text-sm px-3 py-2.5 rounded-xl" style={{ background: "rgba(0,0,0,0.25)", color: orgTheme.primaryText, border: `1px solid ${p}15` }}>{formData.author_name || <span style={{ color: orgTheme.mutedText }}>Not set</span>}</p>
                              }
                            </div>
                            <div>
                              <Label className="mb-2 text-xs flex items-center gap-1.5" style={{ color: orgTheme.mutedText }}>
                                <Mail className="w-3.5 h-3.5" />Email (Login)
                              </Label>
                              <p className="text-sm px-3 py-2.5 rounded-xl" style={{ background: "rgba(0,0,0,0.25)", color: orgTheme.mutedText, border: `1px solid ${p}15` }}>{session?.user?.email}</p>
                            </div>
                          </div>
                        </div>

                        {isEditing ? (
                          <ColorCustomizationSection
                            formData={formData}
                            isEditing={isEditing}
                            onChange={handleProfileChange}
                            orgTheme={orgTheme}
                            onResetDefaults={handleResetColors}
                            onApplyScheme={handleApplyScheme}
                          />
                        ) : (
                          <div
                            className="rounded-2xl p-6"
                            style={{
                              background: "rgba(0,0,0,0.25)",
                              border: `1px solid ${p}30`,
                            }}
                          >
                            <h3
                              className="text-lg font-semibold flex items-center gap-2.5 mb-5"
                              style={{ color: orgTheme.primaryText }}
                            >
                              <span
                                className="flex items-center justify-center w-8 h-8 rounded-lg"
                                style={{ background: `${p}20`, border: `1px solid ${p}40` }}
                              >
                                <Palette className="w-4 h-4" style={{ color: p }} />
                              </span>
                              Color Customization
                            </h3>

                            <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: orgTheme.mutedText }}>
                              Current Palette
                            </p>
                            <div
                              className="flex gap-1.5 h-9 rounded-xl overflow-hidden p-0.5"
                              style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${p}25` }}
                            >
                              {[
                                formData.primary_color,
                                formData.secondary_color,
                                formData.accent_color,
                                formData.background_color,
                                formData.card_background_color,
                                formData.success_color,
                                formData.warning_color,
                                formData.error_color,
                              ].map((c, i) => (
                                <div
                                  key={i}
                                  title={c}
                                  className="flex-1 rounded-lg"
                                  style={{ background: c }}
                                />
                              ))}
                            </div>

                            <p className="text-[10px] mt-3 flex items-center gap-1.5" style={{ color: orgTheme.mutedText }}>
                              <Palette className="w-3 h-3" />
                              Enable edit mode to customize colors
                            </p>
                          </div>
                        )}
                        {isEditing && (
                          <button type="button" onClick={handleProfileSubmit}
                            style={{ borderColor: `${p}80`, color: "#ffffff", background: `linear-gradient(135deg, ${p}30, ${s}25)`, boxShadow: `0 0 0 1px ${p}30, 0 8px 20px ${p}20` }}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all duration-200 backdrop-blur-md"
                            onMouseEnter={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${p}55, ${s}45)`; e.currentTarget.style.borderColor = p; e.currentTarget.style.boxShadow = `0 0 0 1px ${p}, 0 10px 30px ${p}40`; e.currentTarget.style.transform = "translateY(-1px)" }}
                            onMouseLeave={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${p}30, ${s}25)`; e.currentTarget.style.borderColor = `${p}80`; e.currentTarget.style.boxShadow = `0 0 0 1px ${p}30, 0 8px 20px ${p}20`; e.currentTarget.style.transform = "translateY(0)" }}>
                            <Plus className="w-4 h-4" />Save Changes
                          </button>
                        )}
                      </div>

                      {/* Danger zone */}
                      <div className="space-y-6">
                        <div className="rounded-2xl p-6 relative overflow-hidden"
                          style={{ background: "rgba(127,17,17,0.12)", border: "1px solid rgba(239,68,68,0.25)", boxShadow: "inset 0 1px 0 rgba(239,68,68,0.08)" }}>
                          <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
                            style={{ background: "radial-gradient(circle at top right, rgba(239,68,68,0.1), transparent 70%)" }} />
                          <h3 className="text-base font-semibold text-red-300 mb-1 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />Danger Zone
                          </h3>
                          <div className="h-px mb-4" style={{ background: "linear-gradient(to right, rgba(239,68,68,0.5), transparent)" }} />
                          <p className="text-xs text-red-400/70 mb-4">Permanently delete this organization and all its data. This cannot be undone.</p>
                          <Button onClick={() => setShowDeleteModal(true)}
                            className="w-full h-9 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-95"
                            style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", color: "#fca5a5", boxShadow: "none" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.3)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(239,68,68,0.25)" }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; e.currentTarget.style.boxShadow = "none" }}>
                            <Trash2 className="w-4 h-4 mr-2" />Delete Account
                          </Button>
                        </div>
                      </div>
                    </div>
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
                  <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${p}18` }}>
                    <div className="mb-5">
                      <h3 className="text-base font-bold" style={{ color: "#ffffff" }}>All Notifications</h3>
                      <p className="text-xs mt-1" style={{ color: orgTheme.mutedText }}>Approval decisions, content alerts, and account status updates.</p>
                      <div className="org-section-divider mt-4" />
                    </div>
                    <NotificationsTab userId={session?.user?.id} role="org_admin" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom padding */}
            <div className="h-8" />
          </div>
        </main>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal organizationName={profile?.name} userId={profile?.user_id} onClose={() => setShowDeleteModal(false)} />
      )}
    </div>
  )
}

function hexToRgb(hex) {
  if (!hex) return "192, 38, 211"
  const clean = hex.replace("#", "")
  if (clean.length !== 6) return "192, 38, 211"
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `${r}, ${g}, ${b}`
}