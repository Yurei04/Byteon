"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  AlertCircle, Search, Calendar, Building2, Tag,
  Link2, Trophy, Clock, Hash, ExternalLink,
  AlignLeft, Award, Users, Globe, User,
  ShieldAlert, XCircle, CheckCircle, Inbox,
  ChevronRight, ChevronLeft,
} from "lucide-react"

import { notifyContentDeletedByOrg } from "@/lib/notification"

const ITEMS_PER_PAGE = 10

const TAB_CONFIG = [
  { value: "announcements", label: "Announcements", Icon: Megaphone },
  { value: "blogs",         label: "Blogs",         Icon: FileText  },
  { value: "resources",     label: "Resources",     Icon: BookOpen  },
]

// ── Build dynamic accent set from a single hex color ─────────────────────────
// Each tab gets a tinted variant derived from the org's primary color by mixing
// in a hue offset so tabs feel distinct while still matching the org palette.
function buildAccents(primary, secondary) {
  // We express everything as CSS values so the component stays pure JS.
  // "tab 0" → primary, "tab 1" → secondary, "tab 2" → mix/accent
  const colors = [primary, secondary, secondary]

  return TAB_CONFIG.map((_, i) => {
    const c = colors[i] || primary
    return {
      color: c,
      // inline-style-compatible values (no Tailwind class names)
      dotBg:          c,
      tagColor:       c,
      badgeBg:        `${c}22`,
      badgeBorder:    `${c}50`,
      badgeText:      c,
      borderColor:    `${c}45`,
      headingColor:   c,
      pageActiveBg:   `${c}28`,
      pageActiveBorder:`${c}60`,
      pageActiveText: c,
    }
  })
}

// ── Pagination sub-component ──────────────────────────────────────────────────
function OrgPagination({ currentPage, totalPages, onPageChange, ac }) {
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
    <div className="flex items-center justify-between px-3 py-2 border-t border-white/[0.06] shrink-0 bg-black/10">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" }}
        onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)" }}
        onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)" }}
      >
        <ChevronLeft className="w-3 h-3" /> Prev
      </button>

      <div className="flex items-center gap-1">
        {withEllipsis.map((item, idx) =>
          item === "…" ? (
            <span key={`e-${idx}`} className="text-white/20 text-[11px] px-1">…</span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className="w-6 h-6 rounded-md text-[11px] font-medium transition-all"
              style={currentPage === item ? {
                background: ac.pageActiveBg,
                border: `1px solid ${ac.pageActiveBorder}`,
                color: ac.pageActiveText,
                boxShadow: `0 0 8px ${ac.color}30`,
              } : {
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.3)",
              }}
              onMouseEnter={e => {
                if (currentPage !== item) {
                  e.currentTarget.style.background = `${ac.color}12`
                  e.currentTarget.style.borderColor = `${ac.color}40`
                  e.currentTarget.style.color = ac.color
                }
              }}
              onMouseLeave={e => {
                if (currentPage !== item) {
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
                  e.currentTarget.style.color = "rgba(255,255,255,0.3)"
                }
              }}
            >
              {item}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" }}
        onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)" }}
        onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)" }}
      >
        Next <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function OrgViewableSection({ currentOrg, authUserId, primaryColor, secondaryColor }) {
  // Derive accent set from live org colors — updates whenever the org changes scheme
  const accents = useMemo(
    () => buildAccents(
      primaryColor  || "#c026d3",
      secondaryColor || "#db2777",
    ),
    [primaryColor, secondaryColor],
  )

  const p = primaryColor  || "#c026d3"
  const s = secondaryColor || "#db2777"

  // Scoped CSS for things we can't do inline (tab active gradient, transitions)
  const scopedStyles = useMemo(() => `
    .ovs-tab-list {
      background: rgba(0,0,0,0.3);
      border: 1px solid ${p}20;
    }
    .ovs-tab[data-state=active] {
      background: linear-gradient(135deg, ${p}, ${s}) !important;
      color: #ffffff !important;
      box-shadow: 0 2px 14px ${p}45, 0 0 0 1px ${p}30 !important;
    }
    .ovs-tab:hover:not([data-state=active]) {
      background: ${p}15 !important;
      color: ${p} !important;
    }
    .ovs-tab {
      transition: all 0.2s ease !important;
      color: rgba(255,255,255,0.35);
    }
    .ovs-list-row:hover {
      background: ${p}0d !important;
    }
    .ovs-list-row-selected {
      background: ${p}10 !important;
      border-left-color: ${p} !important;
    }
    .ovs-search:focus {
      border-color: ${p}50 !important;
      box-shadow: 0 0 0 2px ${p}20 !important;
      outline: none !important;
    }
  `, [p, s])

  const [data, setData]                   = useState({ announcements: [], blogs: [], resources: [] })
  const [loading, setLoading]             = useState(true)
  const [activeTab, setActiveTab]         = useState("announcements")
  const [search, setSearch]               = useState("")
  const [selectedItem, setSelectedItem]   = useState(null)
  const [deleteDialog, setDeleteDialog]   = useState(null)
  const [deleteReason, setDeleteReason]   = useState("")
  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast]                 = useState(null)
  const [pages, setPages]                 = useState({ announcements: 1, blogs: 1, resources: 1 })

  const setPage = (tab, pg) => setPages((prev) => ({ ...prev, [tab]: pg }))

  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchAll = async () => {
    if (!currentOrg?.id) return
    setLoading(true)
    try {
      const orgId = currentOrg.id
      const [{ data: ann, error: annErr }, { data: blogs, error: blogErr }, { data: res, error: resErr }] =
        await Promise.all([
          supabase.from("announcements").select("*").eq("organization_id", orgId).order("created_at", { ascending: false }),
          supabase.from("blogs").select("*").eq("organization_id", orgId).order("created_at", { ascending: false }),
          supabase.from("resource_hub").select("*").eq("organization_id", orgId).order("created_at", { ascending: false }),
        ])
      if (annErr)  throw annErr
      if (blogErr) throw blogErr
      if (resErr)  throw resErr
      setData({ announcements: ann || [], blogs: blogs || [], resources: res || [] })
    } catch (err) {
      showToast("Failed to load content: " + err.message, "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [currentOrg?.id])
  useEffect(() => { setSelectedItem(null) }, [activeTab])
  useEffect(() => { setPages({ announcements: 1, blogs: 1, resources: 1 }) }, [search])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const filter = (arr) => arr.filter((i) =>
      (i.title        || "").toLowerCase().includes(q) ||
      (i.organization || "").toLowerCase().includes(q) ||
      (i.author       || "").toLowerCase().includes(q)
    )
    return {
      announcements: filter(data.announcements),
      blogs:         filter(data.blogs),
      resources:     filter(data.resources),
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

  const handleDelete = async () => {
    if (!deleteDialog) return
    const { id, type, item } = deleteDialog
    setActionLoading(id)
    const tableMap = { announcements: "announcements", blogs: "blogs", resources: "resource_hub" }
    try {
      const { error } = await supabase.from(tableMap[type]).delete().eq("id", id)
      if (error) throw error
      setData((prev) => ({ ...prev, [type]: prev[type].filter((i) => i.id !== id) }))
      if (selectedItem?.id === id) setSelectedItem(null)
      await notifyContentDeletedByOrg({
        orgName:      currentOrg?.name || "An organization",
        contentType:  type.replace(/s$/, ""),
        contentTitle: item?.title || "Untitled",
      })
      showToast(`"${deleteDialog.title}" deleted successfully.`)
    } catch (err) {
      showToast("Delete failed: " + err.message, "error")
    } finally {
      setActionLoading(null)
      setDeleteDialog(null)
      setDeleteReason("")
    }
  }

  if (!currentOrg?.id) {
    return (
      <div className="flex items-center justify-center py-20 text-white/20 gap-3">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: p }} />
        <span className="text-sm">Loading organization data…</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <style>{scopedStyles}</style>

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

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSearch("") }} className="flex flex-col flex-1 min-h-0">

        {/* Tab bar + search */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <TabsList className="ovs-tab-list p-1 rounded-xl h-auto flex gap-0.5">
            {TAB_CONFIG.map(({ value, label, Icon }, i) => {
              const ac = accents[i]
              return (
                <TabsTrigger key={value} value={value}
                  className="ovs-tab flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium">
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {/* Count badge — tinted to tab's accent color */}
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium"
                    style={{
                      background: ac.badgeBg,
                      borderColor: ac.badgeBorder,
                      color: ac.badgeText,
                    }}>
                    {filtered[value].length}
                  </span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Search */}
          <div className="relative flex-1 max-w-xs group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none transition-colors"
              style={{ color: "rgba(255,255,255,0.25)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or author…"
              className="ovs-search w-full pl-9 pr-3 h-9 rounded-lg bg-black/25 text-white text-sm placeholder:text-white/25 transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            />
          </div>
        </div>

        {TAB_CONFIG.map(({ value }, tabIndex) => {
          const ac       = accents[tabIndex]
          const list     = filtered[value]
          const pageList = paginated[value]
          const cp       = pages[value]
          const tp       = totalPages[value]

          return (
            <TabsContent key={value} value={value} className="flex-1 min-h-0 mt-0">
              <div className="flex gap-3 h-[620px]">

                {/* LEFT — list panel */}
                <div
                  className="w-[320px] max-w-[320px] min-w-0 shrink-0 flex flex-col rounded-2xl overflow-hidden transition-all duration-300"
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    border: selectedItem
                      ? `1px solid ${ac.color}50`
                      : "1px solid rgba(255,255,255,0.07)",
                    boxShadow: selectedItem
                      ? `0 0 20px ${ac.color}15`
                      : "none",
                  }}
                >
                  {/* Panel header */}
                  <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between shrink-0">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: ac.headingColor }}>
                      {value === "announcements" ? "Announcements" : value === "blogs" ? "Blogs" : "Resources"}
                    </span>
                    <div className="flex items-center gap-2">
                      {tp > 1 && (
                        <span className="text-white/20 text-[10px]">p.{cp}/{tp}</span>
                      )}
                      <span className="text-white/25 text-xs">
                        {list.length} item{list.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: `${ac.color}90` }} />
                    </div>
                  ) : list.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/20 p-6 text-center">
                      <Inbox className="w-8 h-8 opacity-40" />
                      <p className="text-xs">
                        {search ? `No results for "${search}"` : `You haven't posted any ${value} yet`}
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="flex-1 min-h-0 overflow-hidden">
                      <div className="divide-y divide-white/[0.04]">
                        {pageList.map((item) => (
                          <ListRow
                            key={item.id}
                            item={item}
                            type={value}
                            ac={ac}
                            isSelected={selectedItem?.id === item.id}
                            onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  )}

                  <OrgPagination
                    currentPage={cp}
                    totalPages={tp}
                    onPageChange={(pg) => { setPage(value, pg); setSelectedItem(null) }}
                    ac={ac}
                  />
                </div>

                {/* RIGHT — detail panel */}
                <div
                  className="flex-1 rounded-2xl overflow-hidden transition-all duration-300"
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    border: selectedItem
                      ? `1px solid ${ac.color}50`
                      : "1px solid rgba(255,255,255,0.07)",
                    boxShadow: selectedItem
                      ? `0 0 24px ${ac.color}12`
                      : "none",
                  }}
                >
                  {selectedItem ? (
                    <DetailPane
                      key={selectedItem.id}
                      item={selectedItem}
                      type={value}
                      ac={ac}
                      primaryColor={p}
                      secondaryColor={s}
                      actionLoading={actionLoading}
                      onDelete={() => setDeleteDialog({
                        id:    selectedItem.id,
                        title: selectedItem.title,
                        type:  value,
                        item:  selectedItem,
                      })}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-4 select-none">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{
                          background: `${ac.color}10`,
                          border: `1px solid ${ac.color}25`,
                        }}>
                        {value === "announcements" && <Megaphone className="w-6 h-6" style={{ color: `${ac.color}60` }} />}
                        {value === "blogs"         && <FileText  className="w-6 h-6" style={{ color: `${ac.color}60` }} />}
                        {value === "resources"     && <BookOpen  className="w-6 h-6" style={{ color: `${ac.color}60` }} />}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-white/20">Nothing selected</p>
                        <p className="text-xs text-white/10 mt-1">
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
        onOpenChange={(open) => { if (!open) { setDeleteDialog(null); setDeleteReason("") } }}
      >
        <AlertDialogContent className="bg-gradient-to-br from-slate-950 via-rose-950/25 to-slate-950 backdrop-blur-xl border border-red-500/20 shadow-2xl shadow-red-900/25 max-w-md">
          <AlertDialogHeader className="gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <AlertDialogTitle className="text-red-200 text-base font-semibold">
                  Delete Content
                </AlertDialogTitle>
                <p className="text-white/30 text-xs mt-0.5">
                  Platform admins will be notified
                </p>
              </div>
            </div>

            <AlertDialogDescription asChild>
              <div className="space-y-4 text-sm">
                <div className="px-3 py-2.5 rounded-lg bg-white/3 border border-white/8 text-white/40 text-xs leading-relaxed">
                  Permanently deleting{" "}
                  <span className="text-white font-medium">"{deleteDialog?.title}"</span>.
                  This cannot be undone.
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/30 flex items-center gap-2">
                    <XCircle className="w-3 h-3 shrink-0" />Reason
                    <span className="text-white/18 font-normal normal-case tracking-normal">(optional)</span>
                  </label>
                  <Textarea
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="e.g. Outdated content, policy violation…"
                    className="bg-black/40 border border-red-500/15 text-white/70 placeholder:text-white/18 text-xs resize-none focus:border-red-400/30 focus:ring-0 rounded-lg"
                    rows={3}
                  />
                  <p className="text-white/18 text-[11px] leading-relaxed">
                    For audit trail purposes. Super admins will see this deletion in their activity feed.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2 mt-1">
            <AlertDialogCancel onClick={() => setDeleteReason("")}
              className="cursor-pointer bg-white/5 hover:bg-white/8 text-white/55 hover:text-white border border-white/10 text-sm transition-all">
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleDelete}
              disabled={!!actionLoading}
              className="cursor-pointer text-white border-0 gap-2 text-sm transition-all shadow-lg active:scale-[0.97]"
              style={{
                background: `linear-gradient(135deg, ${p}, ${s})`,
                boxShadow: `0 4px 16px ${p}40`,
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

// ── List row ──────────────────────────────────────────────────────────────────
function ListRow({ item, type, ac, isSelected, onClick }) {
  const isExpired = item.date_end && new Date(item.date_end) < new Date()

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-all duration-150 group border-l-2
        ${isSelected ? "ovs-list-row-selected" : "ovs-list-row border-l-transparent"}`}
      style={isSelected ? { borderLeftColor: ac.color } : {}}
    >
      {/* Colored dot */}
      <span
        className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0 transition-opacity"
        style={{
          background: ac.dotBg,
          opacity: isSelected ? 1 : 0.4,
        }}
      />

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <p className={`text-xs font-semibold truncate whitespace-nowrap flex-1 min-w-0 transition-colors
            ${isSelected ? "text-white" : "text-white/60"}`}>
            {item.title}
          </p>
          <span className="text-white/20 text-[10px] shrink-0">
            {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>

        {item.author && (
          <p className="text-[11px] truncate opacity-75" style={{ color: ac.tagColor }}>{item.author}</p>
        )}

        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
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
          {item.des && (
            <span className="text-[10px] text-white/20 truncate whitespace-nowrap flex-1 min-w-0">
              {item.des}
            </span>
          )}
        </div>
      </div>

      <ChevronRight
        className="w-3.5 h-3.5 shrink-0 mt-0.5 transition-colors"
        style={{ color: isSelected ? ac.tagColor : "rgba(255,255,255,0.12)" }}
      />
    </button>
  )
}

// ── Detail pane ───────────────────────────────────────────────────────────────
function DetailPane({ item, type, ac, primaryColor, secondaryColor, actionLoading, onDelete }) {
  const isExpired = item.date_end && new Date(item.date_end) < new Date()
  const p = primaryColor
  const s = secondaryColor

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-5 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        {/* Top accent line matching org color */}
        <div className="h-px mb-4 -mx-6 -mt-6 rounded-t-2xl"
          style={{ background: `linear-gradient(to right, transparent, ${ac.color}60, transparent)` }} />

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2.5">
            <h2 className="text-xl font-bold text-white leading-snug">{item.title}</h2>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex items-center gap-1.5 text-white/30 text-xs">
                <Clock className="w-3 h-3" />
                {new Date(item.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
              {type === "announcements" && (
                <span className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium
                  ${isExpired
                    ? "bg-red-500/10 text-red-300 border-red-500/20"
                    : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full
                    ${isExpired ? "bg-red-400" : "bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.8)]"}`} />
                  {isExpired ? "Expired" : "Active"}
                </span>
              )}
              {type === "blogs" && item.theme && (
                <span className="text-[11px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-medium"
                  style={{ background: ac.badgeBg, borderColor: ac.badgeBorder, color: ac.badgeText }}>
                  <Tag className="w-3 h-3" />{item.theme}
                </span>
              )}
            </div>
          </div>

          {/* Delete button — uses org gradient */}
          <button
            onClick={onDelete}
            disabled={actionLoading === item.id}
            className="shrink-0 h-9 px-4 rounded-xl text-white text-xs font-medium flex items-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50"
            style={{
              background: `linear-gradient(135deg, ${p}90, ${s}90)`,
              boxShadow: `0 4px 14px ${p}35`,
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 6px 20px ${p}55`}
            onMouseLeave={e => e.currentTarget.style.boxShadow = `0 4px 14px ${p}35`}
          >
            {actionLoading === item.id
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Trash2  className="w-3.5 h-3.5" />}
            Delete
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="px-6 py-5 space-y-6">

          {item.des && (
            <DetailBlock icon={<AlignLeft className="w-3.5 h-3.5" />} label="Description" ac={ac}>
              <p className="text-white/65 text-sm leading-relaxed">{item.des}</p>
            </DetailBlock>
          )}

          {item.content && (
            <DetailBlock icon={<FileText className="w-3.5 h-3.5" />} label="Content" ac={ac}>
              <p className="text-white/65 text-sm leading-relaxed whitespace-pre-line">{item.content}</p>
            </DetailBlock>
          )}

          {/* Announcement-specific */}
          {type === "announcements" && (
            <>
              {(item.date_begin || item.date_end) && (
                <DetailBlock icon={<Calendar className="w-3.5 h-3.5" />} label="Schedule" ac={ac}>
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

              {item.open_to && (
                <DetailBlock icon={<Users className="w-3.5 h-3.5" />} label="Open To" ac={ac}>
                  <p className="text-white/65 text-sm">{item.open_to}</p>
                </DetailBlock>
              )}

              {item.prizes?.length > 0 && (
                <DetailBlock icon={<Trophy className="w-3.5 h-3.5" />} label={`Prizes (${item.prizes.length})`} ac={ac}>
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

              {item.link && (
                <DetailBlock icon={<Link2 className="w-3.5 h-3.5" />} label="Link" ac={ac}>
                  <a href={item.link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm hover:underline underline-offset-2 break-all"
                    style={{ color: ac.tagColor }}>
                    {item.link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                  </a>
                </DetailBlock>
              )}
            </>
          )}

          {/* Blog-specific */}
          {type === "blogs" && (
            <>
              {item.author && (
                <DetailBlock icon={<User className="w-3.5 h-3.5" />} label="Author" ac={ac}>
                  <p className="text-white/65 text-sm">{item.author}</p>
                </DetailBlock>
              )}
              {item.link && (
                <DetailBlock icon={<Link2 className="w-3.5 h-3.5" />} label="Link" ac={ac}>
                  <a href={item.link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm hover:underline underline-offset-2 break-all"
                    style={{ color: ac.tagColor }}>
                    {item.link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                  </a>
                </DetailBlock>
              )}
            </>
          )}

          {/* Resource-specific */}
          {type === "resources" && item.link && (
            <DetailBlock icon={<Globe className="w-3.5 h-3.5" />} label="Resource Link" ac={ac}>
              <a href={item.link} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm hover:underline underline-offset-2 break-all"
                style={{ color: ac.tagColor }}>
                {item.link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
              </a>
            </DetailBlock>
          )}

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

// ── Detail block ──────────────────────────────────────────────────────────────
function DetailBlock({ icon, label, ac, children }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-2"
        style={{ color: "rgba(255,255,255,0.28)" }}>
        <span style={{ color: ac.color, opacity: 0.7 }}>{icon}</span>
        {label}
      </p>
      {children}
    </div>
  )
}