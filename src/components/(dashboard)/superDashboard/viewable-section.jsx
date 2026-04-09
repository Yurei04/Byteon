"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  AlertCircle, Search, Calendar, Tag,
  Link2, Trophy, Clock, Hash, ExternalLink,
  AlignLeft, Award, Users, Globe, User,
  ShieldAlert, XCircle, CheckCircle, Inbox,
  ChevronRight, ChevronLeft,
  PauseCircle, PlayCircle, Filter,
  DollarSign, MapPin, BarChart2, Sheet,
  Palette, UserCheck, UserX, Info,
} from "lucide-react"

const ITEMS_PER_PAGE = 10

// ACCENTS includes both Tailwind classes AND raw hex values for inline styles
const ACCENTS = {
  announcements: {
    color:        "#e879f9",  // fuchsia-400
    colorShadow:  "#a21caf",
    tagColor:     "#e879f9",
    dotBg:        "#e879f9",
    badgeBg:      "rgba(232,121,249,0.12)",
    badgeBorder:  "rgba(232,121,249,0.35)",
    badgeText:    "#f0abfc",
    dot:          "bg-fuchsia-400",
    tag:          "text-fuchsia-400",
    badge:        "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
    heading:      "text-fuchsia-300",
    border:       "border-fuchsia-500/30",
    tabActive:    "data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600",
    pageActive:   "bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-300",
    pageHover:    "hover:bg-fuchsia-500/10 hover:border-fuchsia-500/30 hover:text-fuchsia-300",
  },
  blogs: {
    color:        "#f472b6",  // pink-400
    colorShadow:  "#be185d",
    tagColor:     "#f472b6",
    dotBg:        "#f472b6",
    badgeBg:      "rgba(244,114,182,0.12)",
    badgeBorder:  "rgba(244,114,182,0.35)",
    badgeText:    "#f9a8d4",
    dot:          "bg-pink-400",
    tag:          "text-pink-400",
    badge:        "bg-pink-500/15 text-pink-300 border-pink-500/30",
    heading:      "text-pink-300",
    border:       "border-pink-500/30",
    tabActive:    "data-[state=active]:from-pink-600 data-[state=active]:to-fuchsia-600",
    pageActive:   "bg-pink-500/20 border-pink-500/40 text-pink-300",
    pageHover:    "hover:bg-pink-500/10 hover:border-pink-500/30 hover:text-pink-300",
  },
  resources: {
    color:        "#a78bfa",  // violet-400
    colorShadow:  "#6d28d9",
    tagColor:     "#a78bfa",
    dotBg:        "#a78bfa",
    badgeBg:      "rgba(167,139,250,0.12)",
    badgeBorder:  "rgba(167,139,250,0.35)",
    badgeText:    "#c4b5fd",
    dot:          "bg-violet-400",
    tag:          "text-violet-400",
    badge:        "bg-violet-500/15 text-violet-300 border-violet-500/30",
    heading:      "text-violet-300",
    border:       "border-violet-500/30",
    tabActive:    "data-[state=active]:from-violet-600 data-[state=active]:to-purple-600",
    pageActive:   "bg-violet-500/20 border-violet-500/40 text-violet-300",
    pageHover:    "hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-300",
  },
}

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


// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange, ac }) {
  if (totalPages <= 1) return null

  const pages = []
  const delta = 1
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      pages.push(i)
    }
  }
  const withEllipsis = []
  pages.forEach((page, idx) => {
    if (idx > 0 && page - pages[idx - 1] > 1) withEllipsis.push("…")
    withEllipsis.push(page)
  })

  return (
    <div className="flex items-center justify-between px-3 py-2 border-t border-white/6 shrink-0 bg-black/10">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-2 py-1 rounded-lg border border-white/8 text-white/30 text-[11px] transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:text-white/60 hover:bg-white/5 hover:border-white/15"
      >
        <ChevronLeft className="w-3 h-3" /> Prev
      </button>

      <div className="flex items-center gap-1">
        {withEllipsis.map((item, idx) =>
          item === "…" ? (
            <span key={`ellipsis-${idx}`} className="text-white/20 text-[11px] px-1">…</span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={`w-6 h-6 rounded-md border text-[11px] font-medium transition-all
                ${currentPage === item ? ac.pageActive : `border-white/8 text-white/30 ${ac.pageHover}`}`}
            >
              {item}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-2 py-1 rounded-lg border border-white/8 text-white/30 text-[11px] transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:text-white/60 hover:bg-white/5 hover:border-white/15"
      >
        Next <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  )
}


// ── Status filter chip bar ────────────────────────────────────────────────────
function StatusFilterBar({ tab, value, onChange, counts, ac }) {
  const options = STATUS_FILTERS[tab] || STATUS_FILTERS.blogs

  return (
    <div
      className="px-3 py-2 border-b border-white/[0.05] flex items-center gap-1.5 flex-wrap shrink-0"
      style={{ background: "rgba(0,0,0,0.1)" }}
    >
      <Filter className="w-3 h-3 shrink-0" style={{ color: "rgba(255,255,255,0.18)" }} />
      {options.map(opt => {
        const isActive = value === opt.value
        const count    = counts[opt.value] ?? 0

        const chipStyle = (() => {
          if (!isActive) return { bg: "transparent", border: "rgba(255,255,255,0.08)", text: "rgba(255,255,255,0.28)", shadow: "none" }
          if (opt.value === "suspended") return { bg: "#d9770618", border: "#d9770655", text: "#fbbf24", shadow: "0 0 10px #d9770630" }
          if (opt.value === "expired")   return { bg: "#ef444418", border: "#ef444450", text: "#fca5a5", shadow: "0 0 10px #ef444425" }
          if (opt.value === "active")    return { bg: "#05966918", border: "#05966950", text: "#6ee7b7", shadow: "0 0 10px #05966925" }
          return { bg: `${ac.color}18`, border: `${ac.color}55`, text: ac.color, shadow: `0 0 10px ${ac.color}30` }
        })()

        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="flex items-center gap-1 px-2.5 py-[3px] rounded-full text-[11px] font-medium transition-all"
            style={{ background: chipStyle.bg, border: `1px solid ${chipStyle.border}`, color: chipStyle.text, boxShadow: chipStyle.shadow }}
          >
            {opt.value === "suspended" && <PauseCircle className="w-2.5 h-2.5" />}
            {opt.value === "active"    && <PlayCircle  className="w-2.5 h-2.5" />}
            {opt.label}
            <span className="ml-0.5 opacity-55 tabular-nums">{count}</span>
          </button>
        )
      })}
    </div>
  )
}


// ── Main component ────────────────────────────────────────────────────────────
export default function ViewableSection() {
  const [data, setData]                   = useState({ announcements: [], blogs: [], resources: [] })
  const [loading, setLoading]             = useState(true)
  const [activeTab, setActiveTab]         = useState("announcements")
  const [search, setSearch]               = useState("")
  const [selectedItem, setSelectedItem]   = useState(null)
  const [deleteDialog, setDeleteDialog]   = useState(null)
  const [deleteReason, setDeleteReason]   = useState("")
  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast]                 = useState(null)
  const [statusFilter, setStatusFilter]   = useState({ announcements: "all", blogs: "all", resources: "all" })
  const [suspendDialog, setSuspendDialog] = useState(null)
  const [actionReason, setActionReason]   = useState("")
  const [pages, setPages]                 = useState({ announcements: 1, blogs: 1, resources: 1 })

  const setPage = (tab, p) => setPages(prev => ({ ...prev, [tab]: p }))

  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [{ data: ann }, { data: blogs }, { data: res }] = await Promise.all([
        supabase.from("announcements").select("*").order("created_at", { ascending: false }),
        supabase.from("blogs").select("*").order("created_at", { ascending: false }),
        supabase.from("resource_hub").select("*").order("created_at", { ascending: false }),
      ])
      setData({ announcements: ann || [], blogs: blogs || [], resources: res || [] })
    } catch (err) {
      showToast("Failed to load content: " + err.message, "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])
  useEffect(() => { setSelectedItem(null) }, [activeTab])
  useEffect(() => { setPages({ announcements: 1, blogs: 1, resources: 1 }) }, [search])

  const patchItem = (type, id, patch) => {
    setData(prev => ({ ...prev, [type]: prev[type].map(i => i.id === id ? { ...i, ...patch } : i) }))
    setSelectedItem(prev => prev?.id === id ? { ...prev, ...patch } : prev)
  }

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
    blogs:         filtered.blogs.slice((pages.blogs - 1) * ITEMS_PER_PAGE, pages.blogs * ITEMS_PER_PAGE),
    resources:     filtered.resources.slice((pages.resources - 1) * ITEMS_PER_PAGE, pages.resources * ITEMS_PER_PAGE),
  }), [filtered, pages])

  const totalPages = {
    announcements: Math.ceil(filtered.announcements.length / ITEMS_PER_PAGE),
    blogs:         Math.ceil(filtered.blogs.length / ITEMS_PER_PAGE),
    resources:     Math.ceil(filtered.resources.length / ITEMS_PER_PAGE),
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteDialog) return
    const { id, type } = deleteDialog
    setActionLoading(id)
    try {
      const { error } = await supabase.from(TABLE_MAP[type]).delete().eq("id", id)
      if (error) throw error
      setData(prev => ({ ...prev, [type]: prev[type].filter(i => i.id !== id) }))
      if (selectedItem?.id === id) setSelectedItem(null)
      showToast(`"${deleteDialog.title}" deleted successfully.`)
    } catch (err) {
      showToast("Delete failed: " + err.message, "error")
    } finally {
      setActionLoading(null)
      setDeleteDialog(null)
      setDeleteReason("")
    }
  }

  // ── Suspend / Reactivate ──────────────────────────────────────────────────
  const handleToggleSuspend = async () => {
    if (!suspendDialog) return
    const { id, type, item } = suspendDialog
    const wasSuspended = isItemSuspended(item)
    const newStatus    = wasSuspended ? "active" : "suspended"
    setActionLoading(id)
    try {
      const { error } = await supabase.from(TABLE_MAP[type]).update({ status: newStatus }).eq("id", id)
      if (error) throw error
      patchItem(type, id, { status: newStatus })
      showToast(
        wasSuspended
          ? `"${item?.title}" has been reactivated.`
          : `"${item?.title}" has been suspended.`,
        "success"
      )
    } catch (err) {
      showToast(`Action failed: ${err.message}`, "error")
    } finally {
      setActionLoading(null)
      setSuspendDialog(null)
      setActionReason("")
    }
  }

  return (
    <div className="flex flex-col h-full gap-4">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md text-sm font-medium
          animate-in slide-in-from-top-2 fade-in duration-300
          ${toast.type === "error"
            ? "bg-red-950/90 border-red-500/40 text-red-200 shadow-red-900/40"
            : "bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-900/40"}`}
        >
          {toast.type === "error"
            ? <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            : <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.msg}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={v => { setActiveTab(v); setSearch("") }} className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <TabsList className="bg-black/30 border border-white/8 p-1 rounded-xl h-auto">
            {TAB_CONFIG.map(({ value, label, Icon }) => {
              const ac = ACCENTS[value]
              return (
                <TabsTrigger key={value} value={value}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    text-white/40 hover:text-white/70
                    data-[state=active]:bg-gradient-to-r data-[state=active]:text-white data-[state=active]:shadow-lg
                    ${ac.tabActive}`}
                >
                  <Icon className="w-3.5 h-3.5" />{label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${ac.badge}`}>
                    {filtered[value].length}
                  </span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          <div className="relative flex-1 max-w-xs group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 group-focus-within:text-white/50 transition-colors" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or author…"
              className="pl-9 h-9 bg-black/25 border-white/8 hover:border-white/15 focus:border-white/25 text-white text-sm placeholder:text-white/25 rounded-lg focus:ring-0 transition-colors"
            />
          </div>
        </div>

        {TAB_CONFIG.map(({ value }) => {
          const ac       = ACCENTS[value]
          const list     = filtered[value]
          const pageList = paginated[value]
          const cp       = pages[value]
          const tp       = totalPages[value]
          const sf       = statusFilter[value]

          return (
            <TabsContent key={value} value={value} className="flex-1 min-h-0 mt-0">
              <div className="flex gap-3 h-[680px]">

                {/* LEFT — list */}
                <div className={`w-[320px] max-w-[320px] min-w-0 shrink-0 flex flex-col rounded-2xl border bg-black/20 overflow-hidden transition-colors duration-200
                  ${selectedItem ? ac.border : "border-white/8"}`}>

                  <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between shrink-0">
                    <span className={`text-xs font-bold uppercase tracking-widest ${ac.heading}`}>
                      {value === "announcements" ? "Announcements" : value === "blogs" ? "Blogs" : "Resources"}
                    </span>
                    <div className="flex items-center gap-2">
                      {tp > 1 && <span className="text-white/18 text-[10px]">p.{cp}/{tp}</span>}
                      <span className="text-white/25 text-xs">{list.length} item{list.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  <StatusFilterBar
                    tab={value} value={sf}
                    onChange={v => setStatusFilter(prev => ({ ...prev, [value]: v }))}
                    counts={chipCounts[value]} ac={ac}
                  />

                  {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-fuchsia-400/60" />
                    </div>
                  ) : list.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/20 p-6 text-center">
                      <Inbox className="w-8 h-8 opacity-40" />
                      <p className="text-xs">{search ? `No results for "${search}"` : `No ${value} yet`}</p>
                    </div>
                  ) : (
                    <ScrollArea className="flex-1 min-h-0 overflow-hidden">
                      <div className="divide-y divide-white/5">
                        {pageList.map(item => (
                          <ListRow
                            key={item.id} item={item} type={value} ac={ac}
                            isSelected={selectedItem?.id === item.id}
                            onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  )}

                  <Pagination
                    currentPage={cp} totalPages={tp}
                    onPageChange={p => { setPage(value, p); setSelectedItem(null) }}
                    ac={ac}
                  />
                </div>

                {/* RIGHT — detail */}
                <div className={`flex-1 rounded-2xl border bg-black/20 overflow-hidden transition-colors duration-200
                  ${selectedItem ? ac.border : "border-white/8"}`}>
                  {selectedItem ? (
                    <DetailPane
                      key={selectedItem.id} item={selectedItem} type={value} ac={ac}
                      actionLoading={actionLoading}
                      onDelete={() => setDeleteDialog({ id: selectedItem.id, title: selectedItem.title, type: value, item: selectedItem })}
                      onToggleSuspend={() => setSuspendDialog({ id: selectedItem.id, title: selectedItem.title, type: value, item: selectedItem })}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-4 text-white/15 select-none">
                      <div className="w-14 h-14 rounded-2xl border border-white/8 flex items-center justify-center bg-white/3">
                        {value === "announcements" && <Megaphone className="w-6 h-6" />}
                        {value === "blogs"         && <FileText  className="w-6 h-6" />}
                        {value === "resources"     && <BookOpen  className="w-6 h-6" />}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-white/20">Nothing selected</p>
                        <p className="text-xs text-white/10 mt-1">Pick an item from the left to view details</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          )
        })}
      </Tabs>

      {/* Delete dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={open => { if (!open) { setDeleteDialog(null); setDeleteReason("") } }}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-950 via-rose-950/25 to-slate-950 backdrop-blur-xl border border-red-500/20 shadow-2xl shadow-red-900/25 max-w-md">
          <AlertDialogHeader className="gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <AlertDialogTitle className="text-red-200 text-base font-semibold">Delete Content</AlertDialogTitle>
                <p className="text-white/30 text-xs mt-0.5">This action is permanent and cannot be undone</p>
              </div>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-sm">
                <div className="px-3 py-2.5 rounded-lg bg-white/3 border border-white/8 text-white/40 text-xs leading-relaxed">
                  Permanently deleting <span className="text-white font-medium">"{deleteDialog?.title}"</span>.
                  This cannot be undone.
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/30 flex items-center gap-2">
                    <XCircle className="w-3 h-3 shrink-0" />Reason
                    <span className="text-white/18 font-normal normal-case tracking-normal">(optional)</span>
                  </label>
                  <Textarea
                    value={deleteReason}
                    onChange={e => setDeleteReason(e.target.value)}
                    placeholder="e.g. Outdated content, policy violation…"
                    className="bg-black/40 border border-red-500/15 text-white/70 placeholder:text-white/18 text-xs resize-none focus:border-red-400/30 focus:ring-0 rounded-lg"
                    rows={3}
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-1">
            <AlertDialogCancel
              onClick={() => setDeleteReason("")}
              className="cursor-pointer bg-white/5 hover:bg-white/8 text-white/55 hover:text-white border border-white/10 text-sm transition-all"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleDelete}
              disabled={!!actionLoading}
              className="cursor-pointer bg-gradient-to-r from-pink-600 via-fuchsia-600 to-rose-600 hover:from-pink-500 hover:via-fuchsia-500 hover:to-rose-500 active:scale-[0.97] text-white border-0 gap-2 text-sm transition-all shadow-lg hover:shadow-pink-500/25"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Trash2 className="w-4 h-4 shrink-0" />}
              Delete Permanently
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend / Reactivate dialog */}
      <AlertDialog open={!!suspendDialog} onOpenChange={open => { if (!open) { setSuspendDialog(null); setActionReason("") } }}>
        {(() => {
          const isSuspended = suspendDialog?.item?.status === "suspended"
          return (
            <AlertDialogContent className={`backdrop-blur-xl border shadow-2xl max-w-md
              ${isSuspended
                ? "bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950 border-emerald-500/20 shadow-emerald-900/20"
                : "bg-gradient-to-br from-slate-950 via-amber-950/20 to-slate-950 border-amber-500/20 shadow-amber-900/20"}`}
            >
              <AlertDialogHeader className="gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border
                    ${isSuspended ? "bg-emerald-500/10 border-emerald-500/25" : "bg-amber-500/10 border-amber-500/25"}`}>
                    {isSuspended
                      ? <PlayCircle  className="w-5 h-5 text-emerald-400" />
                      : <PauseCircle className="w-5 h-5 text-amber-400"   />}
                  </div>
                  <div>
                    <AlertDialogTitle className={`text-base font-semibold ${isSuspended ? "text-emerald-200" : "text-amber-200"}`}>
                      {isSuspended ? "Reactivate Post" : "Suspend Post"}
                    </AlertDialogTitle>
                    <p className="text-white/30 text-xs mt-0.5">
                      {isSuspended ? "The post will become visible on the platform again" : "The post will be hidden from the platform until reactivated"}
                    </p>
                  </div>
                </div>
                <AlertDialogDescription asChild>
                  <div className="space-y-4 text-sm">
                    <div className="px-3 py-2.5 rounded-lg bg-white/3 border border-white/8 text-white/40 text-xs leading-relaxed">
                      {isSuspended ? "Reactivating" : "Suspending"}{" "}
                      <span className="text-white font-medium">"{suspendDialog?.title}"</span>.
                      {!isSuspended && " The post will be hidden from the platform until reactivated."}
                    </div>
                    {!isSuspended && (
                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-white/30 flex items-center gap-2">
                          <PauseCircle className="w-3 h-3 shrink-0" />Reason
                          <span className="text-white/18 font-normal normal-case tracking-normal">(optional)</span>
                        </label>
                        <Textarea
                          value={actionReason}
                          onChange={e => setActionReason(e.target.value)}
                          placeholder="e.g. Under review, policy concern, temporary hold…"
                          className="bg-black/40 border border-amber-500/15 text-white/70 placeholder:text-white/18 text-xs resize-none focus:border-amber-400/30 focus:ring-0 rounded-lg"
                          rows={3}
                        />
                      </div>
                    )}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2 mt-1">
                <AlertDialogCancel
                  onClick={() => setActionReason("")}
                  className="cursor-pointer bg-white/5 hover:bg-white/8 text-white/55 hover:text-white border border-white/10 text-sm transition-all"
                >
                  Cancel
                </AlertDialogCancel>
                <Button
                  onClick={handleToggleSuspend}
                  disabled={!!actionLoading}
                  className="cursor-pointer text-white border-0 gap-2 text-sm transition-all shadow-lg active:scale-[0.97]"
                  style={isSuspended
                    ? { background: "linear-gradient(135deg, #059669, #047857)", boxShadow: "0 4px 16px rgba(5,150,105,0.35)" }
                    : { background: "linear-gradient(135deg, #d97706, #b45309)", boxShadow: "0 4px 16px rgba(217,119,6,0.35)" }}
                >
                  {actionLoading
                    ? <Loader2    className="w-4 h-4 animate-spin shrink-0" />
                    : isSuspended
                      ? <PlayCircle  className="w-4 h-4 shrink-0" />
                      : <PauseCircle className="w-4 h-4 shrink-0" />}
                  {isSuspended ? "Reactivate Post" : "Suspend Post"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          )
        })()}
      </AlertDialog>
    </div>
  )
}


// ── List row ──────────────────────────────────────────────────────────────────
function ListRow({ item, type, ac, isSelected, onClick }) {
  const isExpired   = item.date_end && new Date(item.date_end) < new Date()
  const isSuspended = item.status === "suspended"

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-all duration-150 group border-l-2
        ${isSelected ? "bg-white/4 border-l-current" : "border-l-transparent hover:bg-white/2"}`}
      style={isSelected ? { borderLeftColor: isSuspended ? "#d97706" : ac.color } : {}}
    >
      <span
        className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: isSuspended ? "#d97706" : ac.dotBg, opacity: isSelected ? 1 : 0.4 }}
      />

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <p className={`text-xs font-semibold truncate flex-1 min-w-0 transition-colors
            ${isSelected ? (isSuspended ? "text-amber-200/80" : "text-white") : "text-white/60"}`}>
            {item.title}
          </p>
          <span className="text-white/20 text-[10px] shrink-0">
            {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>

        {item.author && (
          <p className="text-[11px] truncate opacity-75" style={{ color: isSuspended ? "#d97706" : ac.tagColor }}>
            {item.author}
          </p>
        )}

        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          {isSuspended ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium shrink-0 flex items-center gap-1 bg-amber-500/10 text-amber-400/80 border-amber-500/20">
              <PauseCircle className="w-2.5 h-2.5" />Suspended
            </span>
          ) : (
            <>
              {type === "announcements" && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium shrink-0
                  ${isExpired
                    ? "bg-red-500/10 text-red-400/70 border-red-500/15"
                    : "bg-emerald-500/10 text-emerald-400/70 border-emerald-500/15"}`}>
                  {isExpired ? "Expired" : "Active"}
                </span>
              )}
              {type === "blogs" && item.theme && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/30 shrink-0">
                  {item.theme}
                </span>
              )}
            </>
          )}
          {item.des && (
            <span className="text-[10px] text-white/20 truncate flex-1 min-w-0">{item.des}</span>
          )}
        </div>
      </div>

      <ChevronRight
        className="w-3.5 h-3.5 shrink-0 mt-0.5"
        style={{ color: isSelected ? (isSuspended ? "#d97706" : ac.tagColor) : "rgba(255,255,255,0.12)" }}
      />
    </button>
  )
}


// ── Detail pane ───────────────────────────────────────────────────────────────
function DetailPane({ item, type, ac, actionLoading, onDelete, onToggleSuspend }) {
  const isExpired   = item.date_end && new Date(item.date_end) < new Date()
  const isSuspended = item.status === "suspended"

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-5 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div
          className="h-px mb-4 -mx-6 -mt-6 rounded-t-2xl"
          style={{
            background: isSuspended
              ? "linear-gradient(to right, transparent, #d9770680, transparent)"
              : `linear-gradient(to right, transparent, ${ac.color}60, transparent)`,
          }}
        />

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2.5">
            <h2 className={`text-xl font-bold leading-snug ${isSuspended ? "text-amber-100/80" : "text-white"}`}>
              {item.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex items-center gap-1.5 text-white/30 text-xs">
                <Clock className="w-3 h-3" />
                {new Date(item.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
              {isSuspended ? (
                <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium bg-amber-500/10 text-amber-300 border-amber-500/20">
                  <PauseCircle className="w-3 h-3" />Suspended
                </span>
              ) : type === "announcements" ? (
                <span className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium
                  ${isExpired ? "bg-red-500/10 text-red-300 border-red-500/20" : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isExpired ? "bg-red-400" : "bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.8)]"}`} />
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

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onToggleSuspend}
              disabled={!!actionLoading}
              className="h-9 px-3.5 rounded-xl text-white text-xs font-medium flex items-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50"
              style={isSuspended
                ? { background: "linear-gradient(135deg, #05966990, #04785790)", boxShadow: "0 4px 14px rgba(5,150,105,0.3)" }
                : { background: "linear-gradient(135deg, #d9770690, #b4530990)", boxShadow: "0 4px 14px rgba(217,119,6,0.3)" }}
            >
              {actionLoading === item.id
                ? <Loader2    className="w-3.5 h-3.5 animate-spin" />
                : isSuspended ? <PlayCircle className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
              {isSuspended ? "Reactivate" : "Suspend"}
            </button>

            <button
              onClick={onDelete}
              disabled={!!actionLoading}
              className="h-9 px-3.5 rounded-xl text-white text-xs font-medium flex items-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50"
              style={{
                background:  `linear-gradient(135deg, ${ac.color}90, ${ac.colorShadow}90)`,
                boxShadow:   `0 4px 14px ${ac.color}35`,
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 6px 20px ${ac.color}55`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = `0 4px 14px ${ac.color}35`}
            >
              {actionLoading === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete
            </button>
          </div>
        </div>

        {isSuspended && (
          <div className="mt-4 px-4 py-3 rounded-xl flex items-center gap-3 bg-amber-500/8 border border-amber-500/20">
            <PauseCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-amber-300/80 text-xs leading-relaxed">
              This post is <span className="font-semibold text-amber-300">suspended</span> and hidden from the platform.
              Click <span className="font-semibold">"Reactivate"</span> to restore visibility.
            </p>
          </div>
        )}
      </div>

      {/* Body */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-6 py-5 space-y-6">

          {/* Description */}
          {item.des && (
            <DetailBlock icon={<AlignLeft className="w-3.5 h-3.5" />} label="Description">
              <p className="text-white/65 text-sm leading-relaxed">{item.des}</p>
            </DetailBlock>
          )}

          {/* Content (blogs) */}
          {item.content && (
            <DetailBlock icon={<FileText className="w-3.5 h-3.5" />} label="Content">
              <p className="text-white/65 text-sm leading-relaxed whitespace-pre-line">{item.content}</p>
            </DetailBlock>
          )}

          {/* ── Announcements ──────────────────────────────────────────────── */}
          {type === "announcements" && (
            <>
              {/* Schedule */}
              {(item.date_begin || item.date_end) && (
                <DetailBlock icon={<Calendar className="w-3.5 h-3.5" />} label="Schedule">
                  <div className="flex gap-3">
                    {[
                      { label: "Start", val: item.date_begin, expired: false },
                      { label: "End",   val: item.date_end,   expired: isExpired },
                    ].filter(({ val }) => val).map(({ label, val, expired }) => (
                      <div key={label} className="flex-1 px-4 py-3 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <p className="text-[10px] text-white/30 mb-1 uppercase tracking-wider">{label}</p>
                        <p className={`text-sm font-medium ${expired ? "text-red-300/80" : "text-white/75"}`}>
                          {new Date(val).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    ))}
                  </div>
                </DetailBlock>
              )}

              {/* Open To */}
              {item.open_to && (
                <DetailBlock icon={<Users className="w-3.5 h-3.5" />} label="Open To">
                  <p className="text-white/65 text-sm">{item.open_to}</p>
                </DetailBlock>
              )}

              {/* Countries */}
              {item.countries && (
                <DetailBlock icon={<MapPin className="w-3.5 h-3.5" />} label="Countries">
                  <p className="text-white/65 text-sm">{item.countries}</p>
                </DetailBlock>
              )}

              {/* Prizes */}
              {item.prizes?.length > 0 && (
                <DetailBlock icon={<Trophy className="w-3.5 h-3.5" />} label={`Prizes (${item.prizes.length})${item.prize_currency ? ` · ${item.prize_currency}` : ""}`}>
                  <div className="space-y-2">
                    {item.prizes.map((prize, i) => (
                      <div key={i} className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15">
                        <Award className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                        <div>
                          {prize.place  && <p className="text-amber-300 text-xs font-semibold">{prize.place}</p>}
                          {prize.reward && <p className="text-white/55 text-xs">{prize.reward}</p>}
                          {typeof prize === "string" && <p className="text-white/55 text-xs">{prize}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </DetailBlock>
              )}

              {/* Website link */}
              {item.website_link && (
                <DetailBlock icon={<Globe className="w-3.5 h-3.5" />} label="Website">
                  <a href={item.website_link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm hover:underline underline-offset-2 break-all"
                    style={{ color: ac.tagColor }}>
                    {item.website_link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                  </a>
                </DetailBlock>
              )}

              {/* Dev / submission link */}
              {item.dev_link && (
                <DetailBlock icon={<Link2 className="w-3.5 h-3.5" />} label="Dev / Submission Link">
                  <a href={item.dev_link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm hover:underline underline-offset-2 break-all"
                    style={{ color: ac.tagColor }}>
                    {item.dev_link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                  </a>
                </DetailBlock>
              )}

              {/* Tracking */}
              {item.tracking_method && (
                <DetailBlock icon={<BarChart2 className="w-3.5 h-3.5" />} label="Tracking Method">
                  <p className="text-white/65 text-sm capitalize">{item.tracking_method}</p>
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

              {/* Color scheme */}
              {item.color_scheme && (
                <DetailBlock icon={<Palette className="w-3.5 h-3.5" />} label="Color Scheme">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-md border border-white/10 shrink-0"
                      style={{ background: item.color_scheme }}
                    />
                    <p className="text-white/65 text-sm font-mono">{item.color_scheme}</p>
                  </div>
                </DetailBlock>
              )}

              {/* Review info */}
              {(item.submitted_by || item.reviewed_by || item.reviewed_at || item.rejection_reason) && (
                <DetailBlock icon={<Info className="w-3.5 h-3.5" />} label="Review Info">
                  <div className="space-y-2 text-xs text-white/50">
                    {item.submitted_by && (
                      <p className="flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-white/25 shrink-0" />
                        <span className="text-white/30">Submitted by</span>
                        <span className="font-mono text-white/60">{item.submitted_by}</span>
                      </p>
                    )}
                    {item.reviewed_by && (
                      <p className="flex items-center gap-2">
                        <UserX className="w-3.5 h-3.5 text-white/25 shrink-0" />
                        <span className="text-white/30">Reviewed by</span>
                        <span className="font-mono text-white/60">{item.reviewed_by}</span>
                      </p>
                    )}
                    {item.reviewed_at && (
                      <p className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-white/25 shrink-0" />
                        <span className="text-white/30">Reviewed at</span>
                        <span className="text-white/60">
                          {new Date(item.reviewed_at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </p>
                    )}
                    {item.rejection_reason && (
                      <div className="mt-2 px-3 py-2 rounded-lg bg-red-500/8 border border-red-500/15">
                        <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Rejection Reason</p>
                        <p className="text-red-300/70 text-xs leading-relaxed">{item.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </DetailBlock>
              )}
            </>
          )}

          {/* ── Blogs ──────────────────────────────────────────────────────── */}
          {type === "blogs" && (
            <>
              {item.author && (
                <DetailBlock icon={<User className="w-3.5 h-3.5" />} label="Author">
                  <p className="text-white/65 text-sm">{item.author}</p>
                </DetailBlock>
              )}
              {item.link && (
                <DetailBlock icon={<Link2 className="w-3.5 h-3.5" />} label="Link">
                  <a href={item.link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm hover:underline underline-offset-2 break-all"
                    style={{ color: ac.tagColor }}>
                    {item.link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                  </a>
                </DetailBlock>
              )}
            </>
          )}

          {/* ── Resources ──────────────────────────────────────────────────── */}
          {type === "resources" && item.link && (
            <DetailBlock icon={<Globe className="w-3.5 h-3.5" />} label="Resource Link">
              <a href={item.link} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm hover:underline underline-offset-2 break-all"
                style={{ color: ac.tagColor }}>
                {item.link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
              </a>
            </DetailBlock>
          )}

          {/* Row ID */}
          <div className="pt-1 pb-2">
            <p className="flex items-center gap-1.5 text-[11px] text-white/15 font-mono">
              <Hash className="w-3 h-3" />{item.id}
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

function DetailBlock({ icon, label, children }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/28 flex items-center gap-1.5 mb-2">
        <span className="text-white/35">{icon}</span>{label}
      </p>
      {children}
    </div>
  )
}