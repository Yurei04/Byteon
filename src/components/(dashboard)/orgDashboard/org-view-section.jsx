"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Megaphone, FileText, BookOpen, Trash2, Loader2,
  AlertCircle, Search, Calendar, Tag, Link2, Trophy,
  Clock, Hash, ExternalLink, AlignLeft, Award, Users,
  Globe, User, ShieldAlert, XCircle, CheckCircle, Inbox,
  ChevronRight, ChevronLeft, PauseCircle, PlayCircle, Filter,
  MapPin, BarChart2, Sheet, Info,
} from "lucide-react"

import { notifyContentDeletedByOrg } from "@/lib/notification"
import { Input } from "@/components/ui/input"

// ─── Constants ────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 10

const TAB_CONFIG = [
  { value: "announcements", label: "Announcements", Icon: Megaphone },
  { value: "blogs",         label: "Blogs",         Icon: FileText  },
  { value: "resources",     label: "Resources",     Icon: BookOpen  },
]

const TABLE_MAP = {
  announcements: "announcements",
  blogs:         "blogs",
  resources:     "resource_hub",
}

const TYPE_LABEL = {
  announcements: "announcement",
  blogs:         "blog",
  resources:     "resource",
}

const STATUS_FILTERS = {
  announcements: [
    { value: "all",       label: "All"       },
    { value: "active",    label: "Active"    },
    { value: "suspended", label: "Suspended" },
    { value: "expired",   label: "Expired"   },
  ],
  blogs: [
    { value: "all",       label: "All"       },
    { value: "active",    label: "Active"    },
    { value: "suspended", label: "Suspended" },
  ],
  resources: [
    { value: "all",       label: "All"       },
    { value: "active",    label: "Active"    },
    { value: "suspended", label: "Suspended" },
  ],
}

// ─── Semantic status palettes — intentionally NOT theme-aware ─────────────────
// These colours carry meaning (suspended=amber, expired=red, active=green)
// and must stay readable on both light and dark backgrounds.
const STATUS_PALETTE = {
  suspended: { bg: "rgba(217,119,6,0.12)",  border: "rgba(217,119,6,0.40)",  text: "#92400e",  icon: "#d97706"  },
  expired:   { bg: "rgba(239,68,68,0.10)",  border: "rgba(239,68,68,0.35)",  text: "#991b1b",  icon: "#ef4444"  },
  active:    { bg: "rgba(5,150,105,0.10)",  border: "rgba(5,150,105,0.35)",  text: "#065f46",  icon: "#10b981"  },
}

// ─── Accent builder ───────────────────────────────────────────────────────────
function buildAccents(primary, secondary) {
  const colors = [primary, secondary, secondary]
  return TAB_CONFIG.map((_, i) => {
    const c = colors[i] || primary
    return {
      color:            c,
      dotBg:            c,
      tagColor:         c,
      badgeBg:          `${c}22`,
      badgeBorder:      `${c}50`,
      badgeText:        c,
      headingColor:     c,
      pageActiveBg:     `${c}28`,
      pageActiveBorder: `${c}60`,
      pageActiveText:   c,
    }
  })
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function OrgPagination({ currentPage, totalPages, onPageChange, ac, uiT }) {
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) pages.push(i)
  }
  const withEllipsis = []
  pages.forEach((page, idx) => {
    if (idx > 0 && page - pages[idx - 1] > 1) withEllipsis.push("…")
    withEllipsis.push(page)
  })

  const btnBase = {
    border:     `1px solid ${uiT?.borderBase   ?? "rgba(220,150,240,0.35)"}`,
    color:       uiT?.mutedText  ?? "#a11bb0",
    background: "transparent",
  }

  return (
    <div
      className="flex items-center justify-between px-3 py-2 shrink-0"
      style={{
        borderTop:  `1px solid ${uiT?.borderBase ?? "rgba(220,150,240,0.30)"}`,
        background:  uiT?.inlineBg ?? "rgba(220,150,240,0.10)",
      }}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        style={btnBase}
        onMouseEnter={e => { e.currentTarget.style.color = uiT?.bodyText ?? "#701976"; e.currentTarget.style.borderColor = uiT?.borderMid ?? "#a11bb0" }}
        onMouseLeave={e => { e.currentTarget.style.color = uiT?.mutedText ?? "#a11bb0"; e.currentTarget.style.borderColor = uiT?.borderBase ?? "rgba(220,150,240,0.35)" }}
      >
        <ChevronLeft className="w-3 h-3" /> Prev
      </button>

      <div className="flex items-center gap-1">
        {withEllipsis.map((item, idx) =>
          item === "…"
            ? <span key={`e-${idx}`} className="text-[11px] px-1" style={{ color: uiT?.mutedText ?? "#a11bb0" }}>…</span>
            : (
              <button key={item} onClick={() => onPageChange(item)}
                className="w-6 h-6 rounded-md text-[11px] font-medium transition-all"
                style={currentPage === item
                  ? { background: ac.pageActiveBg, border: `1px solid ${ac.pageActiveBorder}`, color: ac.pageActiveText, boxShadow: `0 0 8px ${ac.color}30` }
                  : { background: "transparent", border: `1px solid ${uiT?.borderBase ?? "rgba(220,150,240,0.35)"}`, color: uiT?.mutedText ?? "#a11bb0" }
                }
                onMouseEnter={e => { if (currentPage !== item) { e.currentTarget.style.background = `${ac.color}12`; e.currentTarget.style.borderColor = `${ac.color}40`; e.currentTarget.style.color = ac.color } }}
                onMouseLeave={e => { if (currentPage !== item) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = uiT?.borderBase ?? "rgba(220,150,240,0.35)"; e.currentTarget.style.color = uiT?.mutedText ?? "#a11bb0" } }}
              >
                {item}
              </button>
            )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        style={btnBase}
        onMouseEnter={e => { e.currentTarget.style.color = uiT?.bodyText ?? "#701976"; e.currentTarget.style.borderColor = uiT?.borderMid ?? "#a11bb0" }}
        onMouseLeave={e => { e.currentTarget.style.color = uiT?.mutedText ?? "#a11bb0"; e.currentTarget.style.borderColor = uiT?.borderBase ?? "rgba(220,150,240,0.35)" }}
      >
        Next <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  )
}

// ─── Status filter chip bar ───────────────────────────────────────────────────
function StatusFilterBar({ tab, value, onChange, counts, ac, uiT }) {
  const options = STATUS_FILTERS[tab] || STATUS_FILTERS.blogs

  return (
    <div
      className="px-3 py-2 flex items-center gap-1.5 flex-wrap shrink-0"
      style={{
        borderBottom: `1px solid ${uiT?.borderBase ?? "rgba(220,150,240,0.25)"}`,
        background:    uiT?.inlineBg ?? "rgba(220,150,240,0.10)",
      }}
    >
      <Filter className="w-3 h-3 shrink-0" style={{ color: uiT?.mutedText ?? "#a11bb0" }} />
      {options.map(opt => {
        const isActive = value === opt.value
        const count    = counts[opt.value] ?? 0

        // Active chip: use semantic palette for status chips, brand colour for "all"
        const chipStyle = (() => {
          if (!isActive) return {
            bg: "transparent",
            border: uiT?.borderBase ?? "rgba(220,150,240,0.35)",
            text:   uiT?.mutedText  ?? "#a11bb0",
            shadow: "none",
          }
          const sp = STATUS_PALETTE[opt.value]
          if (sp) return { bg: sp.bg, border: sp.border, text: sp.text, shadow: "none" }
          return { bg: `${ac.color}18`, border: `${ac.color}55`, text: ac.color, shadow: `0 0 10px ${ac.color}30` }
        })()

        return (
          <button key={opt.value} onClick={() => onChange(opt.value)}
            className="flex items-center gap-1 px-2.5 py-[3px] rounded-full text-[11px] font-medium transition-all"
            style={{ background: chipStyle.bg, border: `1px solid ${chipStyle.border}`, color: chipStyle.text, boxShadow: chipStyle.shadow }}
          >
            {opt.value === "suspended" && <PauseCircle className="w-2.5 h-2.5" />}
            {opt.value === "active"    && <PlayCircle  className="w-2.5 h-2.5" />}
            {opt.label}
            <span className="ml-0.5 opacity-60 tabular-nums">{count}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Inline toast ─────────────────────────────────────────────────────────────
function InlineToast({ toast }) {
  if (!toast) return null
  const isError = toast.type === "error"
  return (
    <div
      className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium"
      style={{
        background:  isError ? "rgba(127,29,29,0.95)" : "rgba(6,78,59,0.95)",
        borderColor: isError ? "rgba(239,68,68,0.5)"  : "rgba(16,185,129,0.5)",
        color:       isError ? "#fecaca"               : "#d1fae5",
        backdropFilter: "blur(12px)",
      }}
    >
      {isError
        ? <AlertCircle className="w-4 h-4 shrink-0" style={{ color: "#f87171" }} />
        : <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "#34d399" }} />}
      {toast.msg}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function OrgViewableSection({ currentOrg, authUserId, primaryColor, secondaryColor, addToast, uiT }) {
  const accents = useMemo(
    () => buildAccents(primaryColor || "#c026d3", secondaryColor || "#db2777"),
    [primaryColor, secondaryColor],
  )
  const p = primaryColor   || "#c026d3"
  const s = secondaryColor || "#db2777"

  // Scoped CSS — tab active/hover states use brand colours; text falls back to uiT
  const scopedStyles = useMemo(() => `
    .ovs-tab-list {
      background: ${uiT?.inlineBg   ?? "rgba(220,150,240,0.10)"} !important;
      border: 1px solid ${p}20 !important;
    }
    .ovs-tab[data-state=active] {
      background: linear-gradient(135deg, ${p}, ${s}) !important;
      color: #ffffff !important;
      box-shadow: 0 2px 14px ${p}45, 0 0 0 1px ${p}30 !important;
    }
    .ovs-tab:hover:not([data-state=active]) {
      background: ${p}18 !important;
      color: ${p} !important;
    }
    .ovs-tab {
      transition: all 0.2s ease !important;
      color: ${uiT?.mutedText ?? "#a11bb0"} !important;
    }
    .ovs-list-row:hover  { background: ${p}0d !important; }
    .ovs-list-row-sel    { background: ${p}12 !important; }
    .ovs-search:focus {
      border-color: ${p}60 !important;
      box-shadow: 0 0 0 2px ${p}22 !important;
      outline: none !important;
    }
    .ovs-search::placeholder { color: ${uiT?.mutedText ?? "#a11bb0"} !important; }
  `, [p, s, uiT])

  const [data, setData]                   = useState({ announcements: [], blogs: [], resources: [] })
  const [loading, setLoading]             = useState(true)
  const [activeTab, setActiveTab]         = useState("announcements")
  const [search, setSearch]               = useState("")
  const [statusFilter, setStatusFilter]   = useState({ announcements: "all", blogs: "all", resources: "all" })
  const [selectedItem, setSelectedItem]   = useState(null)
  const [deleteDialog, setDeleteDialog]   = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [deleteReason, setDeleteReason]   = useState("")
  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast]                 = useState(null)
  const [pages, setPages]                 = useState({ announcements: 1, blogs: 1, resources: 1 })

  const setPage   = (tab, pg) => setPages(prev => ({ ...prev, [tab]: pg }))
  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500) }

  const fetchAll = async () => {
    if (!currentOrg?.id) return
    setLoading(true)
    try {
      const orgId = currentOrg.id
      const [{ data: ann, error: ae }, { data: blogs, error: be }, { data: res, error: re }] = await Promise.all([
        supabase.from("announcements").select("*").eq("organization_id", orgId).order("created_at", { ascending: false }),
        supabase.from("blogs").select("*").eq("organization_id", orgId).order("created_at", { ascending: false }),
        supabase.from("resource_hub").select("*").eq("organization_id", orgId).order("created_at", { ascending: false }),
      ])
      if (ae) throw ae; if (be) throw be; if (re) throw re
      setData({ announcements: ann || [], blogs: blogs || [], resources: res || [] })
    } catch (err) {
      showToast("Failed to load content: " + err.message, "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [currentOrg?.id])
  useEffect(() => { setSelectedItem(null) }, [activeTab])
  useEffect(() => {
    setPages({ announcements: 1, blogs: 1, resources: 1 })
    setSelectedItem(null)
  }, [search, statusFilter])

  const isItemExpired   = (item) => item.date_end && new Date(item.date_end) < new Date()
  const isItemSuspended = (item) => item.status === "suspended"

  const applyFilters = (arr, tab, sf) => {
    const q = search.toLowerCase()
    return arr.filter(item => {
      const matchesSearch =
        (item.title  || "").toLowerCase().includes(q) ||
        (item.author || "").toLowerCase().includes(q)
      if (!matchesSearch) return false
      if (sf === "all")       return true
      if (sf === "suspended") return isItemSuspended(item)
      if (sf === "expired")   return tab === "announcements" && !isItemSuspended(item) && isItemExpired(item)
      if (sf === "active")    return !isItemSuspended(item) && !(tab === "announcements" && isItemExpired(item))
      return true
    })
  }

  const filtered = useMemo(() => ({
    announcements: applyFilters(data.announcements, "announcements", statusFilter.announcements),
    blogs:         applyFilters(data.blogs,         "blogs",         statusFilter.blogs),
    resources:     applyFilters(data.resources,     "resources",     statusFilter.resources),
  }), [data, search, statusFilter])

  const chipCounts = useMemo(() => {
    const counts = (tab, arr) => {
      const q    = search.toLowerCase()
      const base = arr.filter(i =>
        (i.title  || "").toLowerCase().includes(q) ||
        (i.author || "").toLowerCase().includes(q)
      )
      return {
        all:       base.length,
        suspended: base.filter(i => isItemSuspended(i)).length,
        expired:   tab === "announcements" ? base.filter(i => !isItemSuspended(i) && isItemExpired(i)).length : 0,
        active:    base.filter(i => !isItemSuspended(i) && !(tab === "announcements" && isItemExpired(i))).length,
      }
    }
    return {
      announcements: counts("announcements", data.announcements),
      blogs:         counts("blogs",         data.blogs),
      resources:     counts("resources",     data.resources),
    }
  }, [data, search])

  const paginated = useMemo(() => ({
    announcements: filtered.announcements.slice((pages.announcements - 1) * ITEMS_PER_PAGE, pages.announcements * ITEMS_PER_PAGE),
    blogs:         filtered.blogs        .slice((pages.blogs         - 1) * ITEMS_PER_PAGE, pages.blogs         * ITEMS_PER_PAGE),
    resources:     filtered.resources    .slice((pages.resources     - 1) * ITEMS_PER_PAGE, pages.resources     * ITEMS_PER_PAGE),
  }), [filtered, pages])

  const totalPages = {
    announcements: Math.max(1, Math.ceil(filtered.announcements.length / ITEMS_PER_PAGE)),
    blogs:         Math.max(1, Math.ceil(filtered.blogs.length         / ITEMS_PER_PAGE)),
    resources:     Math.max(1, Math.ceil(filtered.resources.length     / ITEMS_PER_PAGE)),
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteDialog) return
    const { id, type, item } = deleteDialog
    setActionLoading(id)
    try {
      const { error } = await supabase.from(TABLE_MAP[type]).delete().eq("id", id)
      if (error) throw error
      setData(prev => ({ ...prev, [type]: prev[type].filter(i => i.id !== id) }))
      if (selectedItem?.id === id) setSelectedItem(null)
      await notifyContentDeletedByOrg({
        orgName:      currentOrg?.name || "An organization",
        contentType:  TYPE_LABEL[type],
        contentTitle: item?.title || "Untitled",
      })
      addToast("success", "Deleted successfully")
    } catch (err) {
      showToast("Delete failed: " + err.message, "error")
    } finally {
      setActionLoading(null); setDeleteDialog(null); setDeleteReason(""); setDeleteConfirm("")
    }
  }

  if (!currentOrg?.id) {
    return (
      <div className="flex items-center justify-center py-20 gap-3" style={{ color: uiT?.mutedText ?? "#a11bb0" }}>
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: p }} />
        <span className="text-sm">Loading organization data…</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <style>{scopedStyles}</style>
      <InlineToast toast={toast} />

      <Tabs value={activeTab} onValueChange={v => { setActiveTab(v); setSearch("") }} className="flex flex-col flex-1 min-h-0">

        {/* ── Tab bar + search ── */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <TabsList className="ovs-tab-list p-1 rounded-xl h-auto flex gap-0.5">
            {TAB_CONFIG.map(({ value, label, Icon }, i) => {
              const ac = accents[i]
              return (
                <TabsTrigger key={value} value={value}
                  className="ovs-tab flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium">
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium"
                    style={{ background: ac.badgeBg, borderColor: ac.badgeBorder, color: ac.badgeText }}
                  >
                    {chipCounts[value].all}
                  </span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
              style={{ color: uiT?.mutedText ?? "#a11bb0" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or author…"
              className="ovs-search w-full pl-9 pr-3 h-9 rounded-lg text-sm transition-all"
              style={{
                background: uiT?.inputBg     ?? "#ffffff",
                border:     `1px solid ${uiT?.borderBase ?? "rgba(220,150,240,0.35)"}`,
                color:      uiT?.headingText ?? "#320a37",
              }}
            />
          </div>
        </div>

        {TAB_CONFIG.map(({ value }, tabIndex) => {
          const ac       = accents[tabIndex]
          const list     = filtered[value]
          const pageList = paginated[value]
          const cp       = pages[value]
          const tp       = totalPages[value]
          const sf       = statusFilter[value]

          return (
            <TabsContent key={value} value={value} className="flex-1 min-h-0 mt-0">
              <div className="flex gap-3 h-[620px]">

                {/* ── LEFT: list panel ── */}
                <div
                  className="w-[320px] max-w-[320px] min-w-0 shrink-0 flex flex-col rounded-2xl overflow-hidden transition-all duration-300"
                  style={{
                    background: uiT?.cardBg  ?? "#ffffff",
                    border:     selectedItem
                      ? `1px solid ${ac.color}50`
                      : `1px solid ${uiT?.borderBase ?? "rgba(220,150,240,0.35)"}`,
                    boxShadow: selectedItem ? `0 0 20px ${ac.color}15` : "none",
                  }}
                >
                  {/* List header */}
                  <div
                    className="px-4 py-3 flex items-center justify-between shrink-0"
                    style={{ borderBottom: `1px solid ${uiT?.borderBase ?? "rgba(220,150,240,0.30)"}` }}
                  >
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: ac.headingColor }}>
                      {value === "announcements" ? "Announcements" : value === "blogs" ? "Blogs" : "Resources"}
                    </span>
                    <div className="flex items-center gap-2">
                      {tp > 1 && (
                        <span className="text-[10px]" style={{ color: uiT?.mutedText ?? "#a11bb0" }}>
                          p.{cp}/{tp}
                        </span>
                      )}
                      <span className="text-xs" style={{ color: uiT?.mutedText ?? "#a11bb0" }}>
                        {list.length} item{list.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <StatusFilterBar
                    tab={value} value={sf}
                    onChange={v => setStatusFilter(prev => ({ ...prev, [value]: v }))}
                    counts={chipCounts[value]} ac={ac} uiT={uiT}
                  />

                  {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: `${ac.color}90` }} />
                    </div>
                  ) : list.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
                      <Inbox className="w-8 h-8" style={{ color: uiT?.mutedText ?? "#a11bb0", opacity: 0.5 }} />
                      <p className="text-xs" style={{ color: uiT?.mutedText ?? "#a11bb0" }}>
                        {search || sf !== "all"
                          ? `No ${sf !== "all" ? sf : ""} items${search ? ` matching "${search}"` : ""}`
                          : `You haven't posted any ${value} yet`}
                      </p>
                      {sf !== "all" && (
                        <button
                          onClick={() => setStatusFilter(prev => ({ ...prev, [value]: "all" }))}
                          className="text-[11px] underline underline-offset-2 opacity-50 hover:opacity-80 transition-opacity"
                          style={{ color: ac.color }}
                        >
                          Show all
                        </button>
                      )}
                    </div>
                  ) : (
                    <ScrollArea className="flex-1 min-h-0 overflow-hidden">
                      <div style={{ borderTop: `1px solid ${uiT?.borderBase ?? "rgba(220,150,240,0.25)"}` }}>
                        {pageList.map((item, idx) => (
                          <div key={item.id} style={idx > 0 ? { borderTop: `1px solid ${uiT?.borderBase ?? "rgba(220,150,240,0.25)"}` } : {}}>
                            <ListRow
                              item={item} type={value} ac={ac} uiT={uiT}
                              isSelected={selectedItem?.id === item.id}
                              onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                            />
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}

                  <OrgPagination
                    currentPage={cp} totalPages={tp}
                    onPageChange={pg => { setPage(value, pg); setSelectedItem(null) }}
                    ac={ac} uiT={uiT}
                  />
                </div>

                {/* ── RIGHT: detail panel ── */}
                <div
                  className="flex-1 rounded-2xl overflow-hidden transition-all duration-300"
                  style={{
                    background: uiT?.cardBg ?? "#ffffff",
                    border:     selectedItem
                      ? `1px solid ${ac.color}50`
                      : `1px solid ${uiT?.borderBase ?? "rgba(220,150,240,0.35)"}`,
                    boxShadow: selectedItem ? `0 0 24px ${ac.color}12` : "none",
                  }}
                >
                  {selectedItem ? (
                    <DetailPane
                      key={selectedItem.id} item={selectedItem} type={value} ac={ac}
                      primaryColor={p} secondaryColor={s} actionLoading={actionLoading}
                      uiT={uiT}
                      onDelete={() => setDeleteDialog({ id: selectedItem.id, title: selectedItem.title, type: value, item: selectedItem })}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-4 select-none">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: `${ac.color}10`, border: `1px solid ${ac.color}25` }}>
                        {value === "announcements" && <Megaphone className="w-6 h-6" style={{ color: `${ac.color}60` }} />}
                        {value === "blogs"         && <FileText  className="w-6 h-6" style={{ color: `${ac.color}60` }} />}
                        {value === "resources"     && <BookOpen  className="w-6 h-6" style={{ color: `${ac.color}60` }} />}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium" style={{ color: uiT?.bodyText ?? "#a11bb0" }}>
                          Nothing selected
                        </p>
                        <p className="text-xs mt-1" style={{ color: uiT?.mutedText ?? "#a11bb0" }}>
                          Pick an item from the left to view details
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          )
        })}
      </Tabs>

      {/* ── Delete dialog ── */}
      <AlertDialog
        open={!!deleteDialog}
        onOpenChange={open => { if (!open) { setDeleteDialog(null); setDeleteReason(""); setDeleteConfirm("") } }}
      >
        <AlertDialogContent
          className="backdrop-blur-xl max-w-md"
          style={{
            background: uiT?.cardBg ?? "linear-gradient(135deg, rgb(2,4,18), rgba(120,10,10,0.15), rgb(2,4,18))",
            border:     "1px solid rgba(239,68,68,0.25)",
            boxShadow:  "0 24px 64px rgba(239,68,68,0.12)",
          }}
        >
          <AlertDialogHeader className="gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.30)" }}>
                <ShieldAlert className="w-5 h-5" style={{ color: "#ef4444" }} />
              </div>
              <div>
                <AlertDialogTitle style={{ color: STATUS_PALETTE.expired.text }} className="text-base font-semibold">
                  Delete Content
                </AlertDialogTitle>
                <p className="text-xs mt-0.5" style={{ color: uiT?.mutedText ?? "#a11bb0" }}>
                  Platform admins will be notified
                </p>
              </div>
            </div>

            <AlertDialogDescription asChild>
              <div className="space-y-4 text-sm">

                {/* Warning banner */}
                <div
                  className="px-3 py-2.5 rounded-lg text-xs leading-relaxed"
                  style={{
                    background: uiT?.surfaceBg2 ?? "rgba(253,244,255,0.70)",
                    border:     `1px solid ${uiT?.borderBase ?? "rgba(220,150,240,0.35)"}`,
                    color:      uiT?.bodyText   ?? "#701976",
                  }}
                >
                  Permanently deleting{" "}
                  <span className="font-semibold" style={{ color: uiT?.headingText ?? "#320a37" }}>
                    "{deleteDialog?.title}"
                  </span>.{" "}
                  This cannot be undone.
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-2"
                    style={{ color: uiT?.bodyText ?? "#701976" }}>
                    <XCircle className="w-3 h-3 shrink-0" style={{ color: "#ef4444" }} />
                    Reason <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <Textarea
                    value={deleteReason}
                    onChange={e => setDeleteReason(e.target.value)}
                    placeholder="Provide a reason for deletion..."
                    className="text-xs resize-none focus:ring-0 rounded-lg"
                    style={{
                      background:  uiT?.inputBg    ?? "#ffffff",
                      borderColor: "rgba(239,68,68,0.20)",
                      color:       uiT?.headingText ?? "#320a37",
                    }}
                    rows={3}
                  />
                  <p className="text-[11px] leading-relaxed" style={{ color: uiT?.mutedText ?? "#a11bb0" }}>
                    Required for audit trail. Super admins will see this.
                  </p>
                </div>

                {/* Confirmation */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: uiT?.bodyText ?? "#701976" }}>
                    Type <span style={{ color: "#ef4444", fontWeight: 700 }}>"DELETE"</span> to confirm
                  </label>
                  <Input
                    value={deleteConfirm}
                    onChange={e => setDeleteConfirm(e.target.value)}
                    placeholder="DELETE"
                    className="text-xs focus:ring-0 rounded-lg"
                    style={{
                      background:  uiT?.inputBg    ?? "#ffffff",
                      borderColor: "rgba(239,68,68,0.20)",
                      color:       uiT?.headingText ?? "#320a37",
                    }}
                  />
                </div>

              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2 mt-1">
            <AlertDialogCancel
              onClick={() => { setDeleteReason(""); setDeleteConfirm("") }}
              className="cursor-pointer text-sm transition-all"
              style={{
                background:  uiT?.inlineBg  ?? "rgba(220,150,240,0.25)",
                border:      `1px solid ${uiT?.borderMid ?? "#a11bb0"}`,
                color:       uiT?.bodyText  ?? "#701976",
              }}
            >
              Cancel
            </AlertDialogCancel>

            <Button
              onClick={handleDelete}
              disabled={!!actionLoading || !deleteReason.trim() || deleteConfirm !== "DELETE"}
              className="cursor-pointer border-0 gap-2 text-sm transition-all shadow-lg active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${p}, ${s})`,
                boxShadow:  `0 4px 16px ${p}40`,
                color:      "#320a37",
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 6px 24px ${p}60`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = `0 4px 16px ${p}40`}
            >
              {actionLoading
                ? <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                : <Trash2  className="w-4 h-4 shrink-0" />}
              Delete Permanently
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── List row ─────────────────────────────────────────────────────────────────
function ListRow({ item, type, ac, isSelected, onClick, uiT }) {
  const isExpired   = item.date_end && new Date(item.date_end) < new Date()
  const isSuspended = item.status === "suspended"
  const sp = STATUS_PALETTE

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-all duration-150 group border-l-2 ${isSelected ? "ovs-list-row-sel" : "ovs-list-row border-l-transparent"}`}
      style={isSelected ? { borderLeftColor: isSuspended ? sp.suspended.icon : ac.color } : {}}
    >
      {/* Dot indicator */}
      <span
        className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          background: isSuspended ? sp.suspended.icon : ac.dotBg,
          opacity:    isSelected ? 1 : 0.45,
        }}
      />

      <div className="flex-1 min-w-0 space-y-1">
        {/* Title + date */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <p
            className="text-xs font-semibold truncate flex-1 min-w-0 transition-colors"
            style={{
              color: isSelected
                ? (isSuspended ? sp.suspended.text : uiT?.headingText ?? "#320a37")
                : (uiT?.bodyText ?? "#701976"),
            }}
          >
            {item.title}
          </p>
          <span className="text-[10px] shrink-0" style={{ color: uiT?.mutedText ?? "#a11bb0" }}>
            {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>

        {/* Author */}
        {item.author && (
          <p className="text-[11px] truncate" style={{ color: isSuspended ? sp.suspended.icon : ac.tagColor, opacity: 0.85 }}>
            {item.author}
          </p>
        )}

        {/* Status chips + snippet */}
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          {isSuspended ? (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium shrink-0 flex items-center gap-1"
              style={{ background: sp.suspended.bg, borderColor: sp.suspended.border, color: sp.suspended.text }}
            >
              <PauseCircle className="w-2.5 h-2.5" />Suspended
            </span>
          ) : (
            <>
              {type === "announcements" && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium shrink-0"
                  style={isExpired
                    ? { background: sp.expired.bg,  borderColor: sp.expired.border,  color: sp.expired.text  }
                    : { background: sp.active.bg,   borderColor: sp.active.border,   color: sp.active.text   }
                  }
                >
                  {isExpired ? "Expired" : "Active"}
                </span>
              )}
              {type === "blogs" && item.theme && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium shrink-0"
                  style={{
                    background:  uiT?.surfaceBg2 ?? "rgba(220,150,240,0.25)",
                    borderColor: uiT?.borderBase  ?? "rgba(220,150,240,0.35)",
                    color:       uiT?.mutedText   ?? "#a11bb0",
                  }}
                >
                  {item.theme}
                </span>
              )}
            </>
          )}
          {item.des && (
            <span className="text-[10px] truncate flex-1 min-w-0" style={{ color: uiT?.mutedText ?? "#a11bb0" }}>
              {item.des}
            </span>
          )}
        </div>
      </div>

      <ChevronRight
        className="w-3.5 h-3.5 shrink-0 mt-0.5"
        style={{ color: isSelected ? (isSuspended ? sp.suspended.icon : ac.tagColor) : (uiT?.mutedText ?? "#a11bb0") }}
      />
    </button>
  )
}

// ─── Detail pane ──────────────────────────────────────────────────────────────
function DetailPane({ item, type, ac, primaryColor, secondaryColor, actionLoading, onDelete, uiT }) {
  const isExpired   = item.date_end && new Date(item.date_end) < new Date()
  const isSuspended = item.status === "suspended"
  const p = primaryColor, s = secondaryColor
  const sp = STATUS_PALETTE

  const prizes = useMemo(() => {
    if (!item.prizes) return []
    if (Array.isArray(item.prizes)) return item.prizes
    try { return JSON.parse(item.prizes) } catch { return [] }
  }, [item.prizes])

  return (
    <div className="h-full flex flex-col">

      {/* Header */}
      <div
        className="px-6 pt-6 pb-5 shrink-0"
        style={{ borderBottom: `1px solid ${uiT?.borderBase ?? "rgba(220,150,240,0.35)"}` }}
      >
        {/* Accent top bar */}
        <div
          className="h-px mb-4 -mx-6 -mt-6 rounded-t-2xl"
          style={{
            background: isSuspended
              ? `linear-gradient(to right, transparent, ${sp.suspended.icon}80, transparent)`
              : `linear-gradient(to right, transparent, ${ac.color}60, transparent)`,
          }}
        />

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2.5">
            <h2
              className="text-xl font-bold leading-snug"
              style={{ color: isSuspended ? sp.suspended.text : uiT?.headingText ?? "#320a37" }}
            >
              {item.title}
            </h2>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex items-center gap-1.5 text-xs" style={{ color: uiT?.mutedText ?? "#a11bb0" }}>
                <Clock className="w-3 h-3" />
                {new Date(item.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>

              {/* Status badge */}
              {isSuspended ? (
                <span
                  className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium"
                  style={{ background: sp.suspended.bg, borderColor: sp.suspended.border, color: sp.suspended.text }}
                >
                  <PauseCircle className="w-3 h-3" />Suspended by admin
                </span>
              ) : type === "announcements" ? (
                <span
                  className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium"
                  style={isExpired
                    ? { background: sp.expired.bg, borderColor: sp.expired.border, color: sp.expired.text }
                    : { background: sp.active.bg,  borderColor: sp.active.border,  color: sp.active.text  }
                  }
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: isExpired ? sp.expired.icon : sp.active.icon,
                      boxShadow: isExpired ? "none" : `0 0 4px ${sp.active.icon}` }}
                  />
                  {isExpired ? "Expired" : "Active"}
                </span>
              ) : null}

              {type === "blogs" && item.theme && (
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-medium"
                  style={{ background: ac.badgeBg, borderColor: ac.badgeBorder, color: ac.badgeText }}
                >
                  <Tag className="w-3 h-3" />{item.theme}
                </span>
              )}
            </div>
          </div>

          {/* Delete button — only when not suspended */}
          {!isSuspended && (
            <button
              onClick={onDelete} disabled={!!actionLoading}
              className="h-9 px-3.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50 shrink-0"
              style={{
                background: `linear-gradient(135deg, ${p}, ${s})`,
                boxShadow:  `0 4px 14px ${p}35`,
                color:      "#320a37",
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 6px 20px ${p}55`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = `0 4px 14px ${p}35`}
            >
              {actionLoading === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete
            </button>
          )}
        </div>

        {/* Suspension notice */}
        {isSuspended && (
          <div
            className="mt-4 px-4 py-3 rounded-xl flex items-start gap-3"
            style={{ background: sp.suspended.bg, border: `1px solid ${sp.suspended.border}` }}
          >
            <PauseCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: sp.suspended.icon }} />
            <p className="text-xs leading-relaxed" style={{ color: sp.suspended.text }}>
              This post has been <span className="font-semibold">suspended by a platform admin</span> and is hidden from the platform.
              Please contact support if you believe this was done in error. You cannot delete suspended posts — reach out to an admin to resolve.
            </p>
          </div>
        )}
      </div>

      {/* Body */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-6 py-5 space-y-6">

          {item.des && (
            <DetailBlock icon={<AlignLeft className="w-3.5 h-3.5" />} label="Description" ac={ac} uiT={uiT}>
              <p className="text-sm leading-relaxed" style={{ color: uiT?.bodyText ?? "#701976" }}>{item.des}</p>
            </DetailBlock>
          )}

          {item.content && (
            <DetailBlock icon={<FileText className="w-3.5 h-3.5" />} label="Content" ac={ac} uiT={uiT}>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: uiT?.bodyText ?? "#701976" }}>{item.content}</p>
            </DetailBlock>
          )}

          {/* ── Announcements ── */}
          {type === "announcements" && (
            <>
              {(item.date_begin || item.date_end) && (
                <DetailBlock icon={<Calendar className="w-3.5 h-3.5" />} label="Schedule" ac={ac} uiT={uiT}>
                  <div className="flex gap-3">
                    {[
                      { label: "Start", val: item.date_begin, expired: false },
                      { label: "End",   val: item.date_end,   expired: isExpired },
                    ].filter(({ val }) => val).map(({ label, val, expired }) => (
                      <div key={label} className="flex-1 px-4 py-3 rounded-xl"
                        style={{
                          background: uiT?.surfaceBg2 ?? "rgba(220,150,240,0.25)",
                          border:     `1px solid ${uiT?.borderBase ?? "rgba(220,150,240,0.35)"}`,
                        }}>
                        <p className="text-[10px] mb-1 uppercase tracking-wider" style={{ color: uiT?.mutedText ?? "#a11bb0" }}>{label}</p>
                        <p className="text-sm font-medium"
                          style={{ color: expired ? sp.expired.text : uiT?.bodyText ?? "#320a37" }}>
                          {new Date(val).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    ))}
                  </div>
                </DetailBlock>
              )}

              {item.open_to && (
                <DetailBlock icon={<Users className="w-3.5 h-3.5" />} label="Open To" ac={ac} uiT={uiT}>
                  <p className="text-sm" style={{ color: uiT?.bodyText ?? "#701976" }}>{item.open_to}</p>
                </DetailBlock>
              )}

              {item.countries && (
                <DetailBlock icon={<MapPin className="w-3.5 h-3.5" />} label="Countries" ac={ac} uiT={uiT}>
                  <p className="text-sm" style={{ color: uiT?.bodyText ?? "#320a37" }}>{item.countries}</p>
                </DetailBlock>
              )}

              {Array.isArray(prizes) && prizes.length > 0 && (
                <DetailBlock
                  icon={<Trophy className="w-3.5 h-3.5" />}
                  label={`Prizes (${prizes.length})${item?.prize_currency ? ` · ${item.prize_currency}` : ""}`}
                  ac={ac} uiT={uiT}
                >
                  <div className="space-y-2">
                    {prizes.map((prize, i) => {
                      let name = "", value = "", description = ""
                      if (typeof prize === "string") {
                        value = prize
                      } else if (typeof prize === "object" && prize !== null) {
                        name        = prize.name || prize.title || prize.place || `Prize ${i + 1}`
                        value       = prize.value || prize.reward || prize.amount || ""
                        description = prize.description || prize.details || ""
                      }
                      return (
                        <div key={i} className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl"
                          style={{
                            background: "rgba(245,158,11,0.07)",
                            border:     "1px solid rgba(245,158,11,0.20)",
                          }}>
                          <Award className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#f59e0b" }} />
                          <div className="min-w-0">
                            <div className="flex items-start gap-3">
                              <span className="text-xs leading-none mt-0.5 font-medium" style={{ color: uiT?.mutedText ?? "#701976" }}>
                                #{i + 1}
                              </span>
                              <div className="min-w-0">
                                {name && (
                                  <p className="text-[10px] uppercase tracking-widest font-bold mb-1"
                                    style={{ color: uiT?.mutedText ?? "#701976" }}>{name}</p>
                                )}
                                {value && (
                                  <p className="text-sm font-bold leading-tight"
                                    style={{ color: uiT?.headingText ?? "#320a37" }}>{value}</p>
                                )}
                                {description && (
                                  <p className="text-xs mt-1.5 leading-relaxed"
                                    style={{ color: uiT?.mutedText ?? "#701976" }}>{description}</p>
                                )}
                              </div>
                            </div>
                            {typeof prize === "object" && prize !== null && !prize.name && !prize.value && !prize.reward && (
                              <p className="text-xs font-mono break-all mt-1" style={{ color: uiT?.mutedText ?? "#a11bb0" }}>
                                {JSON.stringify(prize)}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </DetailBlock>
              )}

              {item.website_link && (
                <DetailBlock icon={<Globe className="w-3.5 h-3.5" />} label="Website" ac={ac} uiT={uiT}>
                  <a href={item.website_link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm hover:underline underline-offset-2 break-all"
                    style={{ color: ac.tagColor }}>
                    {item.website_link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                  </a>
                </DetailBlock>
              )}

              {item.dev_link && (
                <DetailBlock icon={<Link2 className="w-3.5 h-3.5" />} label="Dev / Submission Link" ac={ac} uiT={uiT}>
                  <a href={item.dev_link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm hover:underline underline-offset-2 break-all"
                    style={{ color: ac.tagColor }}>
                    {item.dev_link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                  </a>
                </DetailBlock>
              )}

              {item.tracking_method && (
                <DetailBlock icon={<BarChart2 className="w-3.5 h-3.5" />} label="Tracking Method" ac={ac} uiT={uiT}>
                  <p className="text-sm capitalize" style={{ color: uiT?.bodyText ?? "#701976" }}>{item.tracking_method}</p>
                  {item.google_sheet_csv_url && (
                    <a href={item.google_sheet_csv_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs mt-1.5 hover:underline underline-offset-2 break-all"
                      style={{ color: ac.tagColor }}>
                      <Sheet className="w-3 h-3 shrink-0" />
                      Google Sheet CSV
                      <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                    </a>
                  )}
                </DetailBlock>
              )}

              {item.rejection_reason && (
                <DetailBlock icon={<Info className="w-3.5 h-3.5" />} label="Review Note" ac={ac} uiT={uiT}>
                  <div className="px-3 py-2.5 rounded-lg"
                    style={{ background: sp.expired.bg, border: `1px solid ${sp.expired.border}` }}>
                    <p className="text-xs leading-relaxed" style={{ color: sp.expired.text }}>{item.rejection_reason}</p>
                  </div>
                </DetailBlock>
              )}
            </>
          )}

          {/* ── Blogs ── */}
          {type === "blogs" && (
            <>
              {item.author && (
                <DetailBlock icon={<User className="w-3.5 h-3.5" />} label="Author" ac={ac} uiT={uiT}>
                  <p className="text-sm" style={{ color: uiT?.bodyText ?? "#701976" }}>{item.author}</p>
                </DetailBlock>
              )}
              {item.link && (
                <DetailBlock icon={<Link2 className="w-3.5 h-3.5" />} label="Link" ac={ac} uiT={uiT}>
                  <a href={item.link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm hover:underline underline-offset-2 break-all"
                    style={{ color: ac.tagColor }}>
                    {item.link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                  </a>
                </DetailBlock>
              )}
            </>
          )}

          {/* ── Resources ── */}
          {type === "resources" && item.link && (
            <DetailBlock icon={<Globe className="w-3.5 h-3.5" />} label="Resource Link" ac={ac} uiT={uiT}>
              <a href={item.link} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm hover:underline underline-offset-2 break-all"
                style={{ color: ac.tagColor }}>
                {item.link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
              </a>
            </DetailBlock>
          )}

          {/* Row ID */}
          <div className="pt-1 pb-2">
            <p className="flex items-center gap-1.5 text-[11px] font-mono"
              style={{ color: uiT?.mutedText ?? "#a11bb0" }}>
              <Hash className="w-3 h-3" />{item.id}
            </p>
          </div>

        </div>
      </ScrollArea>
    </div>
  )
}

// ─── Detail block ─────────────────────────────────────────────────────────────
function DetailBlock({ icon, label, ac, uiT, children }) {
  return (
    <div>
      <p
        className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-2.5"
        style={{ color: uiT?.mutedText ?? "#a11bb0" }}
      >
        <span style={{ color: ac.color, opacity: 0.75 }}>{icon}</span>
        {label}
      </p>
      {children}
    </div>
  )
}