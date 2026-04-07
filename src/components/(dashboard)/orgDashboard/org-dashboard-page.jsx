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
  ShieldCheck, LogOut, Palette, RotateCcw,
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
import OrgViewableSection from "./org-view-section"

const ITEMS_PER_PAGE = 6

// ── Default color palette ──────────────────────────────────────────────────
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
    id: "cosmic-purple",
    name: "Cosmic Purple",
    emoji: "🔮",
    preview: ["#c026d3", "#db2777", "#a855f7", "#0b0412", "#1f1130"],
    colors: {
      primary_color: "#c026d3",
      secondary_color: "#db2777",
      text_color: "#fafaff",
      text_secondary_color: "#c4b5fd",
      heading_color: "#ffffff",
      background_color: "#0b0412",
      background_secondary_color: "#140a1f",
      accent_color: "#a855f7",
      border_color: "#4c1d95",
      card_background_color: "#1f1130",
      button_text_color: "#ffffff",
      button_background_color: "#9333ea",
      navbar_background_color: "#0b0412",
      navbar_text_color: "#fafaff",
      footer_background_color: "#0b0412",
      footer_text_color: "#c4b5fd",
      success_color: "#22c55e",
      warning_color: "#f59e0b",
      error_color: "#ef4444",
      link_color: "#a5b4fc",
    },
  },

  {
    id: "ocean-blue",
    name: "Ocean Blue",
    emoji: "🌊",
    preview: ["#0ea5e9", "#06b6d4", "#38bdf8", "#031421", "#123457"],
    colors: {
      primary_color: "#0ea5e9",
      secondary_color: "#06b6d4",
      text_color: "#f8fdff",
      text_secondary_color: "#bae6fd",
      heading_color: "#ffffff",
      background_color: "#031421",
      background_secondary_color: "#0a2540",
      accent_color: "#38bdf8",
      border_color: "#1e40af",
      card_background_color: "#123457",
      button_text_color: "#ffffff",
      button_background_color: "#0284c7",
      navbar_background_color: "#031421",
      navbar_text_color: "#f8fdff",
      footer_background_color: "#031421",
      footer_text_color: "#bae6fd",
      success_color: "#34d399",
      warning_color: "#fbbf24",
      error_color: "#f87171",
      link_color: "#7dd3fc",
    },
  },

  {
    id: "emerald-forest",
    name: "Emerald Forest",
    emoji: "🌿",
    preview: ["#10b981", "#059669", "#34d399", "#021a12", "#065f46"],
    colors: {
      primary_color: "#10b981",
      secondary_color: "#059669",
      text_color: "#f4fff8",
      text_secondary_color: "#bbf7d0",
      heading_color: "#ffffff",
      background_color: "#021a12",
      background_secondary_color: "#053d2a",
      accent_color: "#34d399",
      border_color: "#166534",
      card_background_color: "#065f46",
      button_text_color: "#ffffff",
      button_background_color: "#047857",
      navbar_background_color: "#021a12",
      navbar_text_color: "#f4fff8",
      footer_background_color: "#021a12",
      footer_text_color: "#bbf7d0",
      success_color: "#4ade80",
      warning_color: "#facc15",
      error_color: "#f87171",
      link_color: "#6ee7b7",
    },
  },

  {
    id: "sunset-orange",
    name: "Sunset Orange",
    emoji: "🌅",
    preview: ["#f97316", "#ef4444", "#fb923c", "#1a0700", "#4a1a00"],
    colors: {
      primary_color: "#f97316",
      secondary_color: "#ef4444",
      text_color: "#fffaf5",
      text_secondary_color: "#fed7aa",
      heading_color: "#ffffff",
      background_color: "#1a0700",
      background_secondary_color: "#331000",
      accent_color: "#fb923c",
      border_color: "#9a3412",
      card_background_color: "#4a1a00",
      button_text_color: "#ffffff",
      button_background_color: "#ea580c",
      navbar_background_color: "#1a0700",
      navbar_text_color: "#fffaf5",
      footer_background_color: "#1a0700",
      footer_text_color: "#fed7aa",
      success_color: "#4ade80",
      warning_color: "#fbbf24",
      error_color: "#f43f5e",
      link_color: "#fb923c",
    },
  },

  {
    id: "rose-gold",
    name: "Rose Gold",
    emoji: "🌸",
    preview: ["#f43f5e", "#d4a373", "#fb7185", "#14030a", "#3f0f1f"],
    colors: {
      primary_color: "#f43f5e",
      secondary_color: "#d4a373",
      text_color: "#fff7f9",
      text_secondary_color: "#fecdd3",
      heading_color: "#ffffff",
      background_color: "#14030a",
      background_secondary_color: "#2a0a14",
      accent_color: "#fb7185",
      border_color: "#9f1239",
      card_background_color: "#3f0f1f",
      button_text_color: "#ffffff",
      button_background_color: "#e11d48",
      navbar_background_color: "#14030a",
      navbar_text_color: "#fff7f9",
      footer_background_color: "#14030a",
      footer_text_color: "#fecdd3",
      success_color: "#34d399",
      warning_color: "#d4a373",
      error_color: "#fb7185",
      link_color: "#fda4af",
    },
  },

  {
    id: "crimson-dark",
    name: "Crimson Dark",
    emoji: "🩸",
    preview: ["#dc2626", "#b91c1c", "#ef4444", "#140000", "#3f0000"],
    colors: {
      primary_color: "#dc2626",
      secondary_color: "#b91c1c",
      text_color: "#fff5f5",
      text_secondary_color: "#fecaca",
      heading_color: "#ffffff",
      background_color: "#140000",
      background_secondary_color: "#2a0000",
      accent_color: "#ef4444",
      border_color: "#7f1d1d",
      card_background_color: "#3f0000",
      button_text_color: "#ffffff",
      button_background_color: "#b91c1c",
      navbar_background_color: "#140000",
      navbar_text_color: "#fff5f5",
      footer_background_color: "#140000",
      footer_text_color: "#fecaca",
      success_color: "#4ade80",
      warning_color: "#fbbf24",
      error_color: "#f87171",
      link_color: "#fca5a5",
    },
  },

  {
    id: "golden-hour",
    name: "Golden Hour",
    emoji: "✨",
    preview: ["#f59e0b", "#d97706", "#fbbf24", "#1a1200", "#4d3800"],
    colors: {
      primary_color: "#f59e0b",
      secondary_color: "#d97706",
      text_color: "#fffdf7",
      text_secondary_color: "#fde68a",
      heading_color: "#ffffff",
      background_color: "#1a1200",
      background_secondary_color: "#332500",
      accent_color: "#fbbf24",
      border_color: "#78350f",
      card_background_color: "#4d3800",
      button_text_color: "#1c1400",
      button_background_color: "#f59e0b",
      navbar_background_color: "#1a1200",
      navbar_text_color: "#fffdf7",
      footer_background_color: "#1a1200",
      footer_text_color: "#fde68a",
      success_color: "#34d399",
      warning_color: "#f97316",
      error_color: "#f87171",
      link_color: "#fde68a",
    },
  },

  // NEW: Replaces Midnight Slate
  {
    id: "violet-nebula",
    name: "Violet Nebula",
    emoji: "🪐",
    preview: ["#a855f7", "#ec4899", "#6366f1", "#0a0612", "#1a1030"],
    colors: {
      primary_color: "#a855f7",
      secondary_color: "#ec4899",
      text_color: "#f8f7ff",
      text_secondary_color: "#c4b5fd",
      heading_color: "#ffffff",
      background_color: "#0a0612",
      background_secondary_color: "#1a1030",
      accent_color: "#6366f1",
      border_color: "#4c1d95",
      card_background_color: "#1a1030",
      button_text_color: "#ffffff",
      button_background_color: "#a855f7",
      navbar_background_color: "#0a0612",
      navbar_text_color: "#f8f7ff",
      footer_background_color: "#0a0612",
      footer_text_color: "#c4b5fd",
      success_color: "#22c55e",
      warning_color: "#fbbf24",
      error_color: "#ef4444",
      link_color: "#f0abfc",
    },
  },
];

const COLOR_GROUPS = [
  {
    label: "Brand", icon: "🎨",
    fields: [
      { key: "primary_color",   label: "Primary"   },
      { key: "secondary_color", label: "Secondary" },
      { key: "accent_color",    label: "Accent"    },
    ],
  },
  {
    label: "Typography", icon: "✏️",
    fields: [
      { key: "text_color",           label: "Body Text"      },
      { key: "text_secondary_color", label: "Secondary Text" },
      { key: "heading_color",        label: "Headings"       },
      { key: "link_color",           label: "Links"          },
    ],
  },
  {
    label: "Backgrounds", icon: "🖼️",
    fields: [
      { key: "background_color",           label: "Page Background" },
      { key: "background_secondary_color", label: "Section BG"      },
      { key: "card_background_color",      label: "Card BG"         },
    ],
  },
  {
    label: "Buttons & Borders", icon: "🔲",
    fields: [
      { key: "button_background_color", label: "Button Fill" },
      { key: "button_text_color",       label: "Button Text" },
      { key: "border_color",            label: "Borders"     },
    ],
  },
  {
    label: "Navigation", icon: "🧭",
    fields: [
      { key: "navbar_background_color", label: "Navbar BG"   },
      { key: "navbar_text_color",       label: "Navbar Text" },
      { key: "footer_background_color", label: "Footer BG"   },
      { key: "footer_text_color",       label: "Footer Text" },
    ],
  },
  {
    label: "Feedback", icon: "🚦",
    fields: [
      { key: "success_color", label: "Success" },
      { key: "warning_color", label: "Warning" },
      { key: "error_color",   label: "Error"   },
    ],
  },
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveSchemeId(match ? match.id : null)
  }, [formData.primary_color, formData.secondary_color, formData.background_color])

  const handleApplyScheme = (scheme) => {
    setActiveSchemeId(scheme.id)
    onApplyScheme(scheme.colors)
  }

  const p  = formData.primary_color   || DEFAULT_COLORS.primary_color
  const s  = formData.secondary_color || DEFAULT_COLORS.secondary_color

  return (
    <div
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        background: "rgba(0,0,0,0.25)",
        border: `1px solid ${p}30`,
        boxShadow: `0 0 0 1px ${p}10, inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      {/* Subtle corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${p}15, transparent 70%)` }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold flex items-center gap-2.5" style={{ color: orgTheme.primaryText }}>
          <span className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ background: `${p}20`, border: `1px solid ${p}40` }}>
            <Palette className="w-4 h-4" style={{ color: p }} />
          </span>
          Color Customization
        </h3>
        {isEditing && (
          <button
            type="button"
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: "rgba(255,255,255,0.05)",
              color: orgTheme.mutedText,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <RotateCcw className="w-3 h-3" /> Reset Defaults
          </button>
        )}
      </div>

      {/* Live color swatch bar */}
      <div className="mb-5">
        <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: orgTheme.mutedText }}>Current Palette</p>
        <div className="flex gap-1.5 h-9 rounded-xl overflow-hidden p-0.5"
          style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${p}25` }}>
          {[
            formData.primary_color, formData.secondary_color, formData.accent_color,
            formData.background_color, formData.card_background_color,
            formData.success_color, formData.warning_color, formData.error_color,
          ].map((c, i) => (
            <div key={i} title={c}
              className="flex-1 rounded-lg transition-transform duration-200 hover:scale-y-110 cursor-default"
              style={{ background: c }} />
          ))}
        </div>
      </div>

      {/* Mode switcher */}
      <div className="flex gap-1 p-1 rounded-xl mb-5 w-fit"
        style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {[
          { id: "schemes", label: "🎨 Presets" },
          { id: "custom",  label: "🛠 Custom"  },
        ].map(({ id, label }) => (
          <button key={id} type="button" onClick={() => setPickerMode(id)}
            className="text-xs px-4 py-1.5 rounded-lg font-medium transition-all duration-200"
            style={pickerMode === id ? {
              background: `linear-gradient(135deg, ${p}, ${s})`,
              color: "#fff",
              boxShadow: `0 2px 12px ${p}50`,
            } : {
              background: "transparent",
              color: orgTheme.mutedText,
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── PRESET SCHEMES ── */}
      {pickerMode === "schemes" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COLOR_SCHEMES.map((scheme) => {
            const isActive = activeSchemeId === scheme.id
            const sp = scheme.colors.primary_color
            const ss = scheme.colors.secondary_color
            return (
              <button key={scheme.id} type="button"
                disabled={!isEditing}
                onClick={() => handleApplyScheme(scheme)}
                className="relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-250 group"
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${sp}18, ${ss}12)`
                    : "rgba(255,255,255,0.03)",
                  border: isActive
                    ? `1.5px solid ${sp}80`
                    : "1.5px solid rgba(255,255,255,0.07)",
                  boxShadow: isActive
                    ? `0 0 20px ${sp}30, inset 0 1px 0 ${sp}20`
                    : "none",
                  transform: isActive ? "translateY(-1px)" : "translateY(0)",
                  opacity: !isEditing ? 0.55 : 1,
                  cursor: !isEditing ? "default" : "pointer",
                }}>
                {isActive && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${sp}, ${ss})` }}>
                    ✓
                  </div>
                )}
                <div className="flex gap-0.5 w-full justify-center h-4 rounded-md overflow-hidden">
                  {scheme.preview.map((color, i) => (
                    <div key={i} className="flex-1" style={{ background: color }} />
                  ))}
                </div>
                <span className="text-lg leading-none">{scheme.emoji}</span>
                <span className="text-[10px] font-semibold text-center leading-tight"
                  style={{ color: isActive ? sp : orgTheme.mutedText }}>
                  {scheme.name}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* ── CUSTOM PICKER ── */}
      {pickerMode === "custom" && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {COLOR_GROUPS.map(({ label, icon }) => (
              <button key={label} type="button" onClick={() => setOpenGroup(label)}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                style={openGroup === label ? {
                  background: `linear-gradient(135deg, ${p}, ${s})`,
                  color: "#fff",
                  boxShadow: `0 2px 10px ${p}40`,
                } : {
                  background: "rgba(255,255,255,0.05)",
                  color: orgTheme.mutedText,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}>
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
                    <div className="w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden ring-1 ring-white/10 shadow-md"
                      title={formData[key]}>
                      {isEditing ? (
                        <input type="color" name={key}
                          value={formData[key] || DEFAULT_COLORS[key]}
                          onChange={onChange}
                          className="w-10 h-10 -m-1 cursor-pointer" style={{ border: "none", padding: 0 }} />
                      ) : (
                        <div className="w-full h-full" style={{ background: formData[key] || DEFAULT_COLORS[key] }} />
                      )}
                    </div>
                    {isEditing ? (
                      <input type="text" name={key}
                        value={formData[key] || DEFAULT_COLORS[key]}
                        onChange={onChange} maxLength={7}
                        className="flex-1 text-xs font-mono rounded-lg px-2.5 py-1.5 bg-black/30 text-white outline-none transition-all duration-200"
                        style={{ border: `1px solid ${p}35`, boxShadow: "none" }}
                        onFocus={e => e.target.style.boxShadow = `0 0 0 2px ${p}40`}
                        onBlur={e => e.target.style.boxShadow = "none"}
                        placeholder="#000000" />
                    ) : (
                      <span className="flex-1 text-xs font-mono px-2.5 py-1.5 rounded-lg"
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

// ─────────────────────────────────────────────────────────────────────────────

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
  const [showSignOutDialog, setShowSignOutDialog] = useState(false)

  const [formData, setFormData] = useState({
    name: "", description: "", author_name: "",
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

  // ── All primary/secondary for dynamic use ────────────────────────────────
  const p = formData.primary_color   || DEFAULT_COLORS.primary_color
  const s = formData.secondary_color || DEFAULT_COLORS.secondary_color

  // ── Dynamic stylesheet (org-color-aware) ─────────────────────────────────
  const dynamicStyles = useMemo(() => `
    /* Tab active states */
    .org-tab[data-state=active] {
      background: linear-gradient(135deg, ${p}, ${s}) !important;
      color: #ffffff !important;
      border: none !important;
      box-shadow: 0 2px 12px ${p}50, 0 0 0 1px ${p}30 !important;
    }
    .org-tab {
      transition: all 0.2s ease !important;
    }
    .org-tab:hover:not([data-state=active]) {
      background: ${p}15 !important;
      color: ${orgTheme.primaryText} !important;
    }

    /* Notification badge */
    .org-badge {
      background: linear-gradient(135deg, ${p}, ${s});
      box-shadow: 0 0 8px ${p}70;
    }

    /* Pagination active link */
    .org-page-link[data-active=true] {
      background: ${p}25 !important;
      color: ${orgTheme.primaryText} !important;
      border-color: ${p}50 !important;
      box-shadow: 0 0 10px ${p}30 !important;
    }

    /* Card hover: lift + glow */
    .org-card-hover {
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease !important;
      will-change: transform;
    }
    .org-card-hover:hover {
      transform: translateY(-3px) !important;
      border-color: ${p}!important;
      box-shadow: 0 12px 32px ${p}25, 0 0 0 1px ${p}20 !important;
    }

    /* Spinner */
    .org-spinner { color: ${p}; }

    /* Stat card icon ring pulse */
    @keyframes org-pulse-ring {
      0%   { box-shadow: 0 0 0 0 ${p}50; }
      70%  { box-shadow: 0 0 0 8px ${p}00; }
      100% { box-shadow: 0 0 0 0 ${p}00; }
    }
    .org-icon-ring { animation: org-pulse-ring 2.8s ease-out infinite; }

    /* Section heading gradient line */
    .org-section-divider {
      height: 1px;
      background: linear-gradient(to right, ${p}60, ${s}40, transparent);
    }

    /* Input focus ring */
    .org-input:focus {
      outline: none !important;
      border-color: ${p}60 !important;
      box-shadow: 0 0 0 3px ${p}20 !important;
    }

    /* Glow button */
    .org-btn-primary {
      background: linear-gradient(135deg, ${p}, ${s}) !important;
      box-shadow: 0 4px 18px ${p}45 !important;
      transition: all 0.2s ease !important;
    }
    .org-btn-primary:hover {
      transform: translateY(-1px) !important;
      box-shadow: 0 6px 24px ${p}60 !important;
    }
    .org-btn-primary:active {
      transform: translateY(0) !important;
    }

    /* Sub-tab list */
    .org-sub-tabs {
      background: rgba(0,0,0,0.25) !important;
      border: 1px solid ${p}20 !important;
    }
  `, [p, s, orgTheme.primaryText])

  const { unreadCount } = useNotifications({ userId: session?.user?.id, role: "org_admin" })

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return
    if (isLoggedIn && role === null) return
    if (!isLoggedIn) { router.push("/log-in"); return }
    if (role !== "org_admin") { router.push("/unauthorized"); return }
  }, [authLoading, isLoggedIn, role, router])

  // ── Sync profile → formData ───────────────────────────────────────────────
  useEffect(() => {
    if (!profile) return
    const orgAchievements = profile.achievements
      ? (typeof profile.achievements === "string" ? JSON.parse(profile.achievements) : profile.achievements)
      : []
    setFormData({
      name:         profile.name         || "",
      description:  profile.description  || "",
      author_name:  profile.author_name  || "",
      color_scheme: profile.color_scheme || "black",
      active:       profile.active !== false,
      achievements: orgAchievements,
      ...Object.fromEntries(
        Object.keys(DEFAULT_COLORS).map(k => [k, profile[k] || DEFAULT_COLORS[k]])
      ),
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

  // ── Data fetching ─────────────────────────────────────────────────────────
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

  // ── Profile editing ───────────────────────────────────────────────────────
  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }
  const handleResetColors  = () => setFormData(prev => ({ ...prev, ...DEFAULT_COLORS }))
  const handleApplyScheme  = (schemeColors) => setFormData(prev => ({ ...prev, ...schemeColors }))

  const handleProfileSubmit = async () => {
    if (!formData.name || !formData.description) {
      setAlert({ type: "error", message: "Organization Name and Description are required." }); return
    }
    if (!formData.author_name) {
      setAlert({ type: "error", message: "Username (Author Name) is required." }); return
    }
    setIsProfileSaving(true); setAlert(null)
    try {
      const colorPayload = Object.fromEntries(Object.keys(DEFAULT_COLORS).map(k => [k, formData[k]]))
      const { error } = await supabase.from("organizations").update({
        name:         formData.name,
        description:  formData.description,
        author_name:  formData.author_name,
        color_scheme: formData.color_scheme,
        active:       formData.active,
        achievements: JSON.stringify(formData.achievements),
        updated_at:   new Date().toISOString(),
        ...colorPayload,
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
        name:         profile.name         || "",
        description:  profile.description  || "",
        author_name:  profile.author_name  || "",
        color_scheme: profile.color_scheme || "black",
        active:       profile.active !== false,
        achievements: orgAchievements,
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
      await notifyContentDeletedByOrg({
        orgName: profile?.name || "An organization",
        contentType: type,
        contentTitle: item?.title || "Untitled",
      })
    } catch (error) { console.error("Delete error:", error) }
  }

  // ── Pagination ────────────────────────────────────────────────────────────
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
    for (let pg = start; pg <= end; pg++) {
      items.push(
        <PaginationItem key={pg}>
          <PaginationLink
            onClick={() => onPageChange(pg)}
            isActive={pg === currentPage}
            className="cursor-pointer org-page-link"
            data-active={pg === currentPage}
            style={pg === currentPage ? {
              background: `${p}22`,
              color: orgTheme.primaryText,
              borderColor: `${p}45`,
              boxShadow: `0 0 10px ${p}25`,
            } : { color: orgTheme.mutedText }}
          >
            {pg}
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
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: p }} />
      </div>
    )
  }
  if (!isLoggedIn || role !== "org_admin") return null

  // ── Tab definitions ───────────────────────────────────────────────────────
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
    { label: "Announcements", count: stats.totalAnnouncements,  Icon: Megaphone,  desc: "total posted"     },
    { label: "Resources",     count: stats.totalResources,      Icon: BookOpen,   desc: "shared items"     },
    { label: "Blogs",         count: stats.totalBlogs,          Icon: FileText,   desc: "articles written" },
    { label: "Active Events", count: stats.activeAnnouncements, Icon: TrendingUp, desc: "live right now"   },
  ]

  return (
    <div
      className="w-full min-h-screen p-4 sm:p-6 bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px]"
      style={{
        ...orgTheme.cssVars,

        backgroundImage: `
          radial-gradient(#ffffff33 1px, transparent 1px),
          radial-gradient(circle at 20% -10%, ${p}55 0%, transparent 45%),
          radial-gradient(circle at 80% 110%, ${s}40 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, ${p}15 0%, transparent 60%),
          linear-gradient(180deg, ${p}08 0%, ${s}05 100%)
        `,

        backgroundSize: `
          20px 20px,
          auto,
          auto,
          auto,
          auto
        `,

        backgroundColor: "#0b0f1a"
      }}
    >
      <style>{dynamicStyles}</style>

      {/* ── Top bar ── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full flex justify-between items-center max-w-7xl mx-auto mb-8 gap-3">
        <ReturnButton />

        {/* Center badge */}
        <div className="flex-1 max-w-xs mx-auto rounded-full py-2 px-4 flex items-center justify-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${p}15, ${s}10)`,
            border: `1px solid ${p}35`,
            boxShadow: `0 0 20px ${p}15, inset 0 1px 0 ${p}20`,
          }}>
          <ShieldCheck className="w-3.5 h-3.5" style={{ color: p }} />
          <span className="text-xs font-medium" style={{ color: orgTheme.primaryText }}>Organization Panel</span>
        </div>

        {/* Sign out */}
        <button
          onClick={() => setShowSignOutDialog(true)}
          className="shrink-0 flex items-center gap-2 text-sm px-3 py-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#fca5a5",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(239,68,68,0.2)"
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)"
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(239,68,68,0.1)"
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"
          }}>
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </motion.div>

      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          {/* ── Page heading ── */}
          <div className="text-center mb-10">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
              <p className="text-xs uppercase tracking-[0.2em] mb-3 font-medium" style={{ color: `${p}` }}>
                ✦ Dashboard
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-transparent bg-clip-text"
                style={{ backgroundImage: `linear-gradient(135deg, ${p}, ${s})` }}>
                {profile?.name || "Organization"}
              </h1>
              <p className="text-sm" style={{ color: orgTheme.mutedText }}>
                Manage your content, branding, and community presence
              </p>
            </motion.div>
          </div>

          {/* ── Stat Cards ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {statCards.map(({ label, count, Icon, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.07 }}
                className="org-card-hover rounded-2xl p-5 relative overflow-hidden group"
                style={{
                  background: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2))`,
                  border: `2px solid ${p}80`,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05)`,
                }}
              >
                {/* Background glow on hover — done via CSS class org-card-hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                  style={{ background: `radial-gradient(circle at 80% 20%, ${p}15, transparent 60%)` }} />

                {/* Top row: label + icon */}
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs font-medium uppercase tracking-wide" style={{ color: orgTheme.mutedText }}>
                    {label}
                  </p>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center org-icon-ring"
                    style={{
                      background: `linear-gradient(135deg, ${p}25, ${s}15)`,
                      border: `1px solid ${p}40`,
                    }}>
                    <Icon className="w-4.5 h-4.5" style={{ color: p }} />
                  </div>
                </div>

                {/* Count */}
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold leading-none text-transparent bg-clip-text"
                    style={{ backgroundImage: `linear-gradient(135deg, ${p}, ${s})` }}>
                    {count}
                  </span>
                </div>
                <p className="text-[11px] mt-1.5" style={{ color: `${orgTheme.mutedText}99` }}>{desc}</p>

                {/* Bottom gradient line */}
                <div className="absolute bottom-0 left-4 right-4 h-px"
                  style={{ background: `linear-gradient(to right, transparent, ${p}50, transparent)` }} />
              </motion.div>
            ))}
          </motion.div>

          {/* ── Main Tabs Container ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <div className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(0,0,0,0.35)",
                border: `1px solid ${p}20`,
                boxShadow: `0 0 0 1px ${p}08, 0 24px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
                backdropFilter: "blur(20px)",
              }}>

              {/* Thin top accent line */}
              <div className="h-px w-full" style={{ background: `linear-gradient(to right, transparent, ${p}70, ${s}50, transparent)` }} />

              <div className="p-5 sm:p-7">
                <Tabs value={activeTab} onValueChange={setActiveTab}>

                  {/* ── Main tab list ── */}
                  <TabsList className="grid w-full grid-cols-5 mb-7 p-1 rounded-xl gap-0.5"
                    style={{
                      background: "rgba(0,0,0,0.4)",
                      border: `1px solid ${p}18`,
                    }}>
                    {mainTabs.map(({ value, icon, label }) => (
                      <TabsTrigger key={value} value={value}
                        className="org-tab flex items-center gap-1.5 transition-all text-xs sm:text-sm rounded-lg py-2"
                        style={{ color: orgTheme.mutedText }}>
                        {icon}
                        <span className="hidden sm:inline">{label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* ── PROFILE TAB ── */}
                  <TabsContent value="profile" className="mt-0">
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                      <div className="space-y-6">

                        {alert && (
                          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                            <Alert className={alert.type === "error"
                              ? "bg-red-500/10 border-red-500/40 text-red-200 rounded-xl"
                              : "bg-green-500/10 border-green-500/40 text-green-200 rounded-xl"}>
                              {alert.type === "error"
                                ? <AlertCircle className="h-4 w-4" />
                                : <CheckCircle className="h-4 w-4" />}
                              <AlertDescription>{alert.message}</AlertDescription>
                            </Alert>
                          </motion.div>
                        )}

                        <OrgProfileHeader
                          formData={formData} profile={profile}
                          isEditing={isEditing} isLoading={isProfileSaving}
                          onEdit={() => setIsEditing(true)}
                          onSave={handleProfileSubmit}
                          onCancel={handleProfileCancel}
                          orgTheme={orgTheme}
                          primaryC={p}
                          secondaryC={s}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-2 space-y-6">
                            <OrgAboutSection 
                            formData={formData} 
                            isEditing={isEditing} 
                            onChange={handleProfileChange} 
                            orgTheme={orgTheme}
                            primaryC={p}
                            secondaryC={s}
                            />

                            {/* Account Information */}
                            <div className="rounded-2xl p-6 relative overflow-hidden"
                              style={{
                                background: "rgba(0,0,0,0.2)",
                                border: `1px solid ${p}25`,
                                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04)`,
                              }}>
                              {/* Section header */}
                              <div className="flex items-center gap-2.5 mb-1">
                                <span className="flex items-center justify-center w-7 h-7 rounded-lg"
                                  style={{ background: `${p}18`, border: `1px solid ${p}35` }}>
                                  <AtSign className="w-3.5 h-3.5" style={{ color: p }} />
                                </span>
                                <h3 className="text-base font-semibold" style={{ color: orgTheme.primaryText }}>
                                  Account Information
                                </h3>
                              </div>
                              <div className="org-section-divider mb-5 mt-3" />

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label className="mb-2 text-xs flex items-center gap-1.5" style={{ color: orgTheme.mutedText }}>
                                    <AtSign className="w-3.5 h-3.5" />Username (Author Name)
                                  </Label>
                                  {isEditing
                                    ? <Input name="author_name" value={formData.author_name} onChange={handleProfileChange}
                                        className="org-input bg-black/30 text-white rounded-xl h-10"
                                        style={{ border: `1px solid ${p}35` }}
                                        placeholder="johndoe" />
                                    : <p className="text-sm px-3 py-2.5 rounded-xl"
                                        style={{ background: "rgba(0,0,0,0.25)", color: orgTheme.primaryText, border: `1px solid ${p}15` }}>
                                        {formData.author_name || <span style={{ color: orgTheme.mutedText }}>Not set</span>}
                                      </p>
                                  }
                                </div>
                                <div>
                                  <Label className="mb-2 text-xs flex items-center gap-1.5" style={{ color: orgTheme.mutedText }}>
                                    <Mail className="w-3.5 h-3.5" />Email (Login)
                                  </Label>
                                  <p className="text-sm px-3 py-2.5 rounded-xl"
                                    style={{ background: "rgba(0,0,0,0.25)", color: orgTheme.mutedText, border: `1px solid ${p}15` }}>
                                    {session?.user?.email}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Color Customization */}
                            <ColorCustomizationSection
                              formData={formData}
                              isEditing={isEditing}
                              onChange={handleProfileChange}
                              orgTheme={orgTheme}
                              onResetDefaults={handleResetColors}
                              onApplyScheme={handleApplyScheme}
                            />
                          </div>

                          {/* Danger Zone sidebar */}
                          <div className="space-y-6">
                            <div className="rounded-2xl p-6 relative overflow-hidden"
                              style={{
                                background: "rgba(127,17,17,0.12)",
                                border: "1px solid rgba(239,68,68,0.25)",
                                boxShadow: "inset 0 1px 0 rgba(239,68,68,0.08)",
                              }}>
                              <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
                                style={{ background: "radial-gradient(circle at top right, rgba(239,68,68,0.1), transparent 70%)" }} />
                              <h3 className="text-base font-semibold text-red-300 mb-1 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />Danger Zone
                              </h3>
                              <div className="h-px mb-4" style={{ background: "linear-gradient(to right, rgba(239,68,68,0.5), transparent)" }} />
                              <p className="text-xs text-red-400/70 mb-4">
                                Permanently delete this organization and all its data. This cannot be undone.
                              </p>
                              <Button
                                onClick={() => setShowDeleteModal(true)}
                                className="w-full h-9 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-95"
                                style={{
                                  background: "rgba(239,68,68,0.2)",
                                  border: "1px solid rgba(239,68,68,0.4)",
                                  color: "#fca5a5",
                                  boxShadow: "none",
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.background = "rgba(239,68,68,0.3)"
                                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(239,68,68,0.25)"
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.background = "rgba(239,68,68,0.2)"
                                  e.currentTarget.style.boxShadow = "none"
                                }}>
                                <Trash2 className="w-4 h-4 mr-2" />Delete Account
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* ── VIEW ALL TAB ── */}
                <TabsContent value="view">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-300">All Live Content</h2>
                    <p className="text-white/40 text-sm mt-1">View and delete any published content across the platform.</p>
                  </div>
                  <OrgViewableSection
                    currentOrg={profile}
                    authUserId={profile?.user_id}
                    primaryColor={p}
                    secondaryColor={s}
                  />
                </TabsContent>

                  {/* ── CREATE TAB ── */}
                  <TabsContent value="create">
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                      <div className="rounded-2xl p-5"
                        style={{ background: "rgba(0,0,0,0.15)", border: `1px solid ${p}15` }}>
                        <Tabs value={activeCreateTab} onValueChange={setActiveCreateTab}>
                          <TabsList className="grid w-full grid-cols-3 mb-6 p-1 rounded-xl org-sub-tabs">
                            {createSubTabs.map(({ tab, icon, label }) => (
                              <TabsTrigger key={tab} value={tab}
                                className="org-tab flex items-center rounded-lg transition-all"
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
                    </motion.div>
                  </TabsContent>

                  {/* ── POSTER MAKER TAB ── */}
                  <TabsContent value="posters" className="mt-0">
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${p}20` }}>
                        <PosterMaker embedded />
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* ── NOTIFICATIONS TAB ── */}
                  <TabsContent value="notifications" className="mt-0">
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                      <div className="rounded-2xl p-5"
                        style={{ background: "rgba(0,0,0,0.15)", border: `1px solid ${p}15` }}>
                        <div className="mb-5">
                          <h3 className="text-xl font-bold text-transparent bg-clip-text"
                            style={{ backgroundImage: `linear-gradient(135deg, ${p}, ${s})` }}>
                            Notifications
                          </h3>
                          <p className="text-xs mt-1.5" style={{ color: orgTheme.mutedText }}>
                            Approval decisions, content alerts, and account status updates.
                          </p>
                          <div className="org-section-divider mt-4" />
                        </div>
                        <NotificationsTab userId={session?.user?.id} role="org_admin" />
                      </div>
                    </motion.div>
                  </TabsContent>

                </Tabs>
              </div>

              {/* Bottom accent line */}
              <div className="h-px w-full" style={{ background: `linear-gradient(to right, transparent, ${s}40, transparent)` }} />
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

function hexToRgb(hex) {
  if (!hex) return "192, 38, 211"
  const clean = hex.replace("#", "")
  if (clean.length !== 6) return "192, 38, 211"
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `${r}, ${g}, ${b}`
}