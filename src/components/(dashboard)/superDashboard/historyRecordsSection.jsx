"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { Button }      from "@/components/ui/button"
import { Badge }       from "@/components/ui/badge"
import { Input }       from "@/components/ui/input"
import { ScrollArea }  from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Megaphone, FileText, BookOpen, Trash2, XCircle,
  Loader2, AlertCircle, Search, Calendar, Building2,
  Tag, Link2, Trophy, Clock, Hash, ExternalLink,
  AlignLeft, Award, Users, Globe, User, ChevronRight,
  CheckCircle, Inbox, MapPin, History, ShieldAlert,
  ChevronLeft,
} from "lucide-react"

const ITEMS_PER_PAGE = 10

// ─── accent config ────────────────────────────────────────────────────────────
const ACCENTS = {
  announcements: {
    dot:       "bg-fuchsia-400",
    tag:       "text-fuchsia-400",
    badge:     "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
    heading:   "text-fuchsia-300",
    border:    "border-fuchsia-500/30",
    tabActive: "data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600",
    pageActive: "bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-300",
    pageHover:  "hover:bg-fuchsia-500/10 hover:border-fuchsia-500/30 hover:text-fuchsia-300",
  },
  blogs: {
    dot:       "bg-pink-400",
    tag:       "text-pink-400",
    badge:     "bg-pink-500/15 text-pink-300 border-pink-500/30",
    heading:   "text-pink-300",
    border:    "border-pink-500/30",
    tabActive: "data-[state=active]:from-pink-600 data-[state=active]:to-fuchsia-600",
    pageActive: "bg-pink-500/20 border-pink-500/40 text-pink-300",
    pageHover:  "hover:bg-pink-500/10 hover:border-pink-500/30 hover:text-pink-300",
  },
  resources: {
    dot:       "bg-violet-400",
    tag:       "text-violet-400",
    badge:     "bg-violet-500/15 text-violet-300 border-violet-500/30",
    heading:   "text-violet-300",
    border:    "border-violet-500/30",
    tabActive: "data-[state=active]:from-violet-600 data-[state=active]:to-purple-600",
    pageActive: "bg-violet-500/20 border-violet-500/40 text-violet-300",
    pageHover:  "hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-300",
  },
}

const CONTENT_TABS = [
  { value: "announcements", label: "Announcements", Icon: Megaphone },
  { value: "blogs",         label: "Blogs",         Icon: FileText  },
  { value: "resources",     label: "Resources",     Icon: BookOpen  },
]

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"

const fmtTime = (d) =>
  d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—"

// ── Pagination component ───────────────────────────────────────────────────────
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

// ─── main component ───────────────────────────────────────────────────────────
export default function HistorySection() {
  const [mode, setMode]                   = useState("rejected")
  const [activeTab, setActiveTab]         = useState("announcements")
  const [search, setSearch]               = useState("")
  const [selectedItem, setSelectedItem]   = useState(null)
  const [loading, setLoading]             = useState(true)
  const [toast, setToast]                 = useState(null)

  const [rejected, setRejected] = useState({ announcements: [], blogs: [], resources: [] })
  const [deleted,  setDeleted]  = useState({ announcements: [], blogs: [], resources: [] })

  // Pagination: keyed by `${mode}-${tab}`
  const [pages, setPages] = useState({})
  const pageKey = (m, t) => `${m}-${t}`
  const getPage = (m, t) => pages[pageKey(m, t)] || 1
  const setPage = (m, t, p) => setPages((prev) => ({ ...prev, [pageKey(m, t)]: p }))

  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true)
    try {
      // Cutoff: anything older than 3 months is expired
      const cutoff = new Date()
      cutoff.setMonth(cutoff.getMonth() - 3)
      const cutoffISO = cutoff.toISOString()

      // Purge expired rejected submissions (keyed on reviewed_at)
      await Promise.all([
        supabase.from("pending_announcements").delete().eq("status", "rejected").lt("reviewed_at", cutoffISO),
        supabase.from("pending_blogs"        ).delete().eq("status", "rejected").lt("reviewed_at", cutoffISO),
        supabase.from("pending_resources"    ).delete().eq("status", "rejected").lt("reviewed_at", cutoffISO),
        // Purge expired deletion records (keyed on deleted_at)
        supabase.from("content_deletions"    ).delete().lt("deleted_at", cutoffISO),
      ])

      // Now fetch what remains
      const [
        { data: rAnn  }, { data: rBlog }, { data: rRes  },
        { data: dAll  },
      ] = await Promise.all([
        supabase.from("pending_announcements").select("*").eq("status", "rejected").order("reviewed_at", { ascending: false }),
        supabase.from("pending_blogs"        ).select("*").eq("status", "rejected").order("reviewed_at", { ascending: false }),
        supabase.from("pending_resources"    ).select("*").eq("status", "rejected").order("reviewed_at", { ascending: false }),
        supabase.from("content_deletions"    ).select("*").order("deleted_at",  { ascending: false }),
      ])

      setRejected({
        announcements: rAnn  || [],
        blogs:         rBlog || [],
        resources:     rRes  || [],
      })

      const typeMap = { announcement: "announcements", blog: "blogs", resource: "resources" }
      const dBuckets = { announcements: [], blogs: [], resources: [] }
      ;(dAll || []).forEach((row) => {
        const key = typeMap[row.content_type]
        if (key) dBuckets[key].push(row)
      })
      setDeleted(dBuckets)
    } catch (err) {
      showToast("Failed to load history: " + err.message, "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])
  useEffect(() => { setSelectedItem(null) }, [mode, activeTab])

  // Reset page on search change
  useEffect(() => {
    setPages({})
  }, [search])

  const activeData = mode === "rejected" ? rejected : deleted

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const filter = (arr) =>
      arr.filter((i) =>
        (i.title        || "").toLowerCase().includes(q) ||
        (i.organization || "").toLowerCase().includes(q) ||
        (i.author       || "").toLowerCase().includes(q)
      )
    return {
      announcements: filter(activeData.announcements),
      blogs:         filter(activeData.blogs),
      resources:     filter(activeData.resources),
    }
  }, [activeData, search])

  const totalRejected = rejected.announcements.length + rejected.blogs.length + rejected.resources.length
  const totalDeleted  = deleted.announcements.length  + deleted.blogs.length  + deleted.resources.length

  const getExpiry = (dateStr) => {
    if (!dateStr) return null
    const expiry = new Date(dateStr)
    expiry.setMonth(expiry.getMonth() + 3)
    const diffMs = expiry - Date.now()
    if (diffMs <= 0) return { expired: true, label: "Expired", pct: 0, tier: "red" }

    const days  = Math.floor(diffMs / 864e5)
    const hours = Math.floor((diffMs % 864e5) / 36e5)
    const pct   = Math.min(100, Math.round((diffMs / (90 * 864e5)) * 100))

    let label, tier
    if (days > 60) { label = `${Math.floor(days / 30)}mo ${days % 30}d left`;  tier = "green"  }
    else if (days > 30) { label = `${days}d left`;                               tier = "amber"  }
    else if (days > 7)  { label = `${days}d left`;                               tier = "orange" }
    else if (days > 0)  { label = `${days}d ${hours}h left`;                     tier = "red"    }
    else                { label = `${hours}h left`;                               tier = "red"    }

    return { expired: false, label, pct, tier, days }
  }

  const EXPIRY_STYLES = {
    green:  { text: "text-emerald-400", bar: "bg-emerald-400", badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
    amber:  { text: "text-amber-400",   bar: "bg-amber-400",   badge: "bg-amber-500/10   text-amber-300   border-amber-500/20"   },
    orange: { text: "text-orange-400",  bar: "bg-orange-400",  badge: "bg-orange-500/10  text-orange-300  border-orange-500/20"  },
    red:    { text: "text-red-400",     bar: "bg-red-400",     badge: "bg-red-500/10     text-red-300     border-red-500/20"     },
  }

  function HistoryListRow({ item, mode, ac, isSelected, onClick }) {
    const eventAt = mode === "rejected" ? item.reviewed_at : item.deleted_at
    const expiry  = getExpiry(eventAt)
    const es      = expiry ? EXPIRY_STYLES[expiry.tier] : null

    return (
      <button
        onClick={onClick}
        className={`w-full text-left py-4 px-4 flex items-start gap-3 transition-all duration-150 group border-l-2
          ${isSelected
            ? `bg-white/6 ${ac.border}`
            : `border-l-transparent hover:bg-white/3 hover:${ac.border}`}`}
      >
        <span className={`mt-[7px] w-1.5 h-1.5 rounded-full shrink-0
          ${mode === "rejected" ? "bg-red-400" : "bg-slate-400"}
          ${isSelected ? "opacity-100" : "opacity-40 group-hover:opacity-70"}`}
        />

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-xs font-semibold leading-snug line-clamp-2
              ${isSelected ? "text-white" : "text-white/60 group-hover:text-white/85"}`}
            >
              {item.title}
            </p>
            <span className="text-white/20 text-[10px] shrink-0 mt-0.5">
              {eventAt
                ? new Date(eventAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "—"}
            </span>
          </div>

          {(item.organization || item.author) && (
            <p className={`text-[11px] truncate ${ac.tag} opacity-75`}>
              {item.organization || item.author}
            </p>
          )}

          {mode === "rejected" && item.rejection_reason && (
            <p className="text-[10px] text-red-400/60 truncate italic">
              &quot;{item.rejection_reason}&quot;
            </p>
          )}
          {mode === "deleted" && item.deletion_reason && (
            <p className="text-[10px] text-slate-400/60 truncate italic">
              &quot;{item.deletion_reason}&quot;
            </p>
          )}

          {/* ── Expiry bar ── */}
          {expiry && (
            <div className="pt-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-medium flex items-center gap-1 ${expiry.expired ? "text-red-400/70" : es.text}`}>
                  <Clock className="w-2.5 h-2.5" />
                  {expiry.label}
                </span>
                {!expiry.expired && (
                  <span className="text-[9px] text-white/18">{expiry.pct}%</span>
                )}
              </div>
              <div className="h-[3px] rounded-full bg-white/6 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${expiry.expired ? "bg-red-500/40" : es.bar}`}
                  style={{ width: `${expiry.pct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <ChevronRight className={`w-3.5 h-3.5 shrink-0 mt-0.5 transition-colors
          ${isSelected ? ac.tag : "text-white/12 group-hover:text-white/25"}`}
        />
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md text-sm font-medium
          animate-in slide-in-from-top-2 fade-in duration-300
          ${toast.type === "error"
            ? "bg-red-950/90 border-red-500/40 text-red-200"
            : "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"}`}
        >
          {toast.type === "error"
            ? <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            : <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          }
          {toast.msg}
        </div>
      )}

      {/* ── Mode Toggle ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2 p-1 rounded-xl bg-black/30 border border-white/8">
          <button
            onClick={() => setMode("rejected")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${mode === "rejected"
                ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-900/30"
                : "text-white/40 hover:text-white/70"}`}
          >
            <XCircle className="w-4 h-4" />
            Rejected
            {totalRejected > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium
                ${mode === "rejected"
                  ? "bg-white/20 text-white border-white/30"
                  : "bg-red-500/15 text-red-300 border-red-500/30"}`}>
                {totalRejected}
              </span>
            )}
          </button>

          <button
            onClick={() => setMode("deleted")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${mode === "deleted"
                ? "bg-gradient-to-r from-slate-600 to-zinc-700 text-white shadow-lg"
                : "text-white/40 hover:text-white/70"}`}
          >
            <Trash2 className="w-4 h-4" />
            Deleted
            {totalDeleted > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium
                ${mode === "deleted"
                  ? "bg-white/20 text-white border-white/30"
                  : "bg-slate-500/15 text-slate-300 border-slate-500/30"}`}>
                {totalDeleted}
              </span>
            )}
          </button>
        </div>

        <p className="text-white/25 text-xs">
          {mode === "rejected"
            ? "Submissions that were rejected by a reviewer — content never went live."
            : "Live content that was permanently deleted by an admin."}
        </p>
      </div>

      {/* ── Content type tabs + Search ── */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSearch("") }} className="flex flex-col flex-1 min-h-0">

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <TabsList className="bg-black/30 border border-white/8 p-1 rounded-xl h-auto">
            {CONTENT_TABS.map(({ value, label, Icon }) => {
              const ac = ACCENTS[value]
              return (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    text-white/40 hover:text-white/70
                    data-[state=active]:bg-gradient-to-r data-[state=active]:text-white data-[state=active]:shadow-lg
                    ${ac.tabActive}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${ac.badge}`}>
                    {filtered[value]?.length ?? 0}
                  </span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, org, author…"
              className="pl-9 h-9 bg-black/25 border-white/8 text-white text-sm placeholder:text-white/25 rounded-lg focus:border-white/20 focus:ring-0"
            />
          </div>
        </div>

        {/* ── Tab panels ── */}
        {CONTENT_TABS.map(({ value }) => {
          const ac   = ACCENTS[value]
          const list = filtered[value] ?? []
          const cp   = getPage(mode, value)
          const tp   = Math.ceil(list.length / ITEMS_PER_PAGE)
          const pageList = list.slice((cp - 1) * ITEMS_PER_PAGE, cp * ITEMS_PER_PAGE)

          return (
            <TabsContent key={value} value={value} className="flex-1 min-h-0 mt-0">
              <div className="flex gap-3 h-[680px]">

                {/* LEFT — list */}
                <div className={`w-[320px] shrink-0 flex flex-col rounded-2xl border bg-black/20 overflow-hidden transition-colors duration-200
                  ${selectedItem ? ac.border : "border-white/8"}`}
                >
                  <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between shrink-0">
                    <span className={`text-xs font-bold uppercase tracking-widest ${ac.heading}`}>
                      {value}
                    </span>
                    <div className="flex items-center gap-2">
                      {tp > 1 && <span className="text-white/18 text-[10px]">p.{cp}/{tp}</span>}
                      <span className="text-white/25 text-xs">{list.length} item{list.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-fuchsia-400/60" />
                    </div>
                  ) : list.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/20 p-6 text-center">
                      <Inbox className="w-8 h-8 opacity-40" />
                      <p className="text-xs">
                        {search
                          ? `No results for "${search}"`
                          : mode === "rejected"
                            ? `No rejected ${value}`
                            : `No deleted ${value}`}
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="flex-1 min-h-0">
                      <div className="divide-y divide-white/5">
                        {pageList.map((item) => (
                          <HistoryListRow
                            key={item.id}
                            item={item}
                            mode={mode}
                            ac={ac}
                            isSelected={selectedItem?.id === item.id}
                            onClick={() =>
                              setSelectedItem(selectedItem?.id === item.id ? null : item)
                            }
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  )}

                  <Pagination
                    currentPage={cp}
                    totalPages={tp}
                    onPageChange={(p) => { setPage(mode, value, p); setSelectedItem(null) }}
                    ac={ac}
                  />
                </div>

                {/* RIGHT — detail */}
                <div className={`flex-1 rounded-2xl border bg-black/20 overflow-hidden transition-colors duration-200
                  ${selectedItem ? ac.border : "border-white/8"}`}
                >
                  {selectedItem ? (
                    <ScrollArea className="h-full">
                      <HistoryDetailPane
                        key={selectedItem.id}
                        item={selectedItem}
                        mode={mode}
                        type={value}
                        ac={ac}
                      />
                    </ScrollArea>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-4 text-white/15 select-none">
                      <div className="w-14 h-14 rounded-2xl border border-white/8 flex items-center justify-center bg-white/3">
                        <History className="w-6 h-6" />
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
    </div>
  )
}

// ─── List Row ─────────────────────────────────────────────────────────────────
function HistoryListRow({ item, mode, ac, isSelected, onClick }) {
  const eventAt = mode === "rejected" ? item.reviewed_at : item.deleted_at

  return (
    <button
      onClick={onClick}
      className={`w-full text-left py-4 px-4 flex items-start gap-3 transition-all duration-150 group border-l-2
        ${isSelected
          ? `bg-white/6 ${ac.border}`
          : `border-l-transparent hover:bg-white/3 hover:${ac.border}`}`}
    >
      <span className={`mt-[7px] w-1.5 h-1.5 rounded-full shrink-0
        ${mode === "rejected" ? "bg-red-400" : "bg-slate-400"}
        ${isSelected ? "opacity-100" : "opacity-40 group-hover:opacity-70"}`}
      />

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-xs font-semibold leading-snug line-clamp-2
            ${isSelected ? "text-white" : "text-white/60 group-hover:text-white/85"}`}
          >
            {item.title}
          </p>
          <span className="text-white/20 text-[10px] shrink-0 mt-0.5">
            {eventAt
              ? new Date(eventAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : "—"}
          </span>
        </div>

        {(item.organization || item.author) && (
          <p className={`text-[11px] truncate ${ac.tag} opacity-75`}>
            {item.organization || item.author}
          </p>
        )}

        {mode === "rejected" && item.rejection_reason && (
          <p className="text-[10px] text-red-400/60 truncate italic">
            &quot;{item.rejection_reason}&quot;
          </p>
        )}
        {mode === "deleted" && item.deletion_reason && (
          <p className="text-[10px] text-slate-400/60 truncate italic">
            &quot;{item.deletion_reason}&quot;
          </p>
        )}
      </div>

      <ChevronRight className={`w-3.5 h-3.5 shrink-0 mt-0.5 transition-colors
        ${isSelected ? ac.tag : "text-white/12 group-hover:text-white/25"}`}
      />
    </button>
  )
}

// ─── Detail Pane ──────────────────────────────────────────────────────────────
function HistoryDetailPane({ item, mode, type, ac }) {
  const data = mode === "deleted" ? (item.original_data ?? item) : item

  const eventAt = mode === "rejected" ? item.reviewed_at : item.deleted_at
  const reason  = mode === "rejected" ? item.rejection_reason : item.deletion_reason

  return (
    <div className="flex flex-col">

      {/* Header */}
      <div className="px-6 pt-6 pb-5 border-b border-white/8">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-0 space-y-2.5">

            {item.organization && (
              <Badge className={`${ac.badge} border text-xs flex items-center gap-1.5 w-fit`}>
                <Building2 className="w-3 h-3" />{item.organization}
              </Badge>
            )}

            <h2 className="text-xl font-bold text-white leading-snug">{item.title}</h2>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex items-center gap-1.5 text-white/30 text-xs">
                <Clock className="w-3 h-3" />
                Submitted {fmtDate(item.created_at)}
              </span>

              {mode === "rejected" ? (
                <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium bg-red-500/10 text-red-300 border-red-500/20">
                  <XCircle className="w-3 h-3" /> Rejected {eventAt ? fmtTime(eventAt) : ""}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium bg-slate-500/10 text-slate-300 border-slate-500/20">
                  <Trash2 className="w-3 h-3" /> Deleted {eventAt ? fmtTime(eventAt) : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-5">

        {reason && (
          <div className={`rounded-xl border p-4 space-y-1
            ${mode === "rejected"
              ? "bg-red-950/30 border-red-500/20"
              : "bg-slate-800/30 border-slate-500/20"}`}
          >
            <p className={`text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5
              ${mode === "rejected" ? "text-red-400" : "text-slate-400"}`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              {mode === "rejected" ? "Rejection Reason" : "Deletion Reason"}
            </p>
            <p className="text-white/65 text-sm leading-relaxed">{reason}</p>
          </div>
        )}

        {data.des && (
          <DetailBlock icon={<AlignLeft className="w-3.5 h-3.5" />} label="Description">
            <p className="text-white/65 text-sm leading-relaxed">{data.des}</p>
          </DetailBlock>
        )}

        {data.content && (
          <DetailBlock icon={<FileText className="w-3.5 h-3.5" />} label="Content">
            <p className="text-white/65 text-sm leading-relaxed whitespace-pre-line">{data.content}</p>
          </DetailBlock>
        )}

        {type === "announcements" && (
          <>
            {(data.date_begin || data.date_end) && (
              <DetailBlock icon={<Calendar className="w-3.5 h-3.5" />} label="Schedule">
                <div className="flex gap-3">
                  {[
                    { label: "Start", val: data.date_begin },
                    { label: "End",   val: data.date_end   },
                  ].filter(({ val }) => val).map(({ label, val }) => (
                    <div key={label} className="flex-1 px-4 py-3 rounded-xl bg-white/4 border border-white/8">
                      <p className="text-[10px] text-white/30 mb-1 uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-medium text-white/75">{fmtDate(val)}</p>
                    </div>
                  ))}
                </div>
              </DetailBlock>
            )}

            {data.open_to && (
              <DetailBlock icon={<Users className="w-3.5 h-3.5" />} label="Open To">
                <p className="text-white/65 text-sm">{data.open_to}</p>
              </DetailBlock>
            )}

            {data.prizes?.length > 0 && (
              <DetailBlock icon={<Trophy className="w-3.5 h-3.5" />} label={`Prizes (${data.prizes.length})`}>
                <div className="space-y-2">
                  {data.prizes.map((prize, i) => (
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

            {data.link && (
              <DetailBlock icon={<Link2 className="w-3.5 h-3.5" />} label="Link">
                <a href={data.link} target="_blank" rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 text-sm ${ac.tag} hover:underline underline-offset-2 break-all`}>
                  {data.link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                </a>
              </DetailBlock>
            )}
          </>
        )}

        {type === "blogs" && (
          <>
            {data.author && (
              <DetailBlock icon={<User className="w-3.5 h-3.5" />} label="Author">
                <p className="text-white/65 text-sm">{data.author}</p>
              </DetailBlock>
            )}
            {data.theme && (
              <DetailBlock icon={<Tag className="w-3.5 h-3.5" />} label="Theme">
                <Badge className={`${ac.badge} border text-xs`}>{data.theme}</Badge>
              </DetailBlock>
            )}
            {data.place && (
              <DetailBlock icon={<MapPin className="w-3.5 h-3.5" />} label="Place / Venue">
                <p className="text-white/65 text-sm">{data.place}</p>
              </DetailBlock>
            )}
            {data.date && (
              <DetailBlock icon={<Calendar className="w-3.5 h-3.5" />} label="Date">
                <p className="text-white/65 text-sm">{fmtDate(data.date)}</p>
              </DetailBlock>
            )}
            {data.link && (
              <DetailBlock icon={<Link2 className="w-3.5 h-3.5" />} label="Link">
                <a href={data.link} target="_blank" rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 text-sm ${ac.tag} hover:underline underline-offset-2 break-all`}>
                  {data.link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                </a>
              </DetailBlock>
            )}
          </>
        )}

        {type === "resources" && (
          <>
            {data.category && (
              <DetailBlock icon={<Hash className="w-3.5 h-3.5" />} label="Category">
                <Badge className={`${ac.badge} border text-xs`}>{data.category}</Badge>
              </DetailBlock>
            )}
            {data.link && (
              <DetailBlock icon={<Globe className="w-3.5 h-3.5" />} label="Resource Link">
                <a href={data.link} target="_blank" rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 text-sm ${ac.tag} hover:underline underline-offset-2 break-all`}>
                  {data.link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                </a>
              </DetailBlock>
            )}
            {data.tags?.length > 0 && (
              <DetailBlock icon={<Tag className="w-3.5 h-3.5" />} label="Tags">
                <div className="flex flex-wrap gap-1.5">
                  {data.tags.map((tag, i) => (
                    <Badge key={i} className={`${ac.badge} border text-xs`}>
                      #{typeof tag === "string" ? tag : tag.name}
                    </Badge>
                  ))}
                </div>
              </DetailBlock>
            )}
          </>
        )}

        <div className="pt-1 pb-2">
          <p className="flex items-center gap-1.5 text-[11px] text-white/15 font-mono">
            <Hash className="w-3 h-3" />
            {mode === "deleted" ? `Original ID: ${item.original_id}` : item.id}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Reusable label block ─────────────────────────────────────────────────────
function DetailBlock({ icon, label, children }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/28 flex items-center gap-1.5 mb-2">
        <span className="text-white/35">{icon}</span>
        {label}
      </p>
      {children}
    </div>
  )
}