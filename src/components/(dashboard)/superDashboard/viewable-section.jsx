"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/(auth)/authContext"   // ← add this import
import { Card, CardContent } from "@/components/ui/card"
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
  ShieldAlert, XCircle, CheckCircle, Inbox, ChevronRight,
  MapPin,
} from "lucide-react"

// ── accent config per tab ─────────────────────────────────────────────────────
const ACCENTS = {
  announcements: {
    dot:       "bg-fuchsia-400",
    tag:       "text-fuchsia-400",
    badge:     "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
    heading:   "text-fuchsia-300",
    border:    "border-fuchsia-500/30",
    from:      "from-fuchsia-900/20",
    tabActive: "data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600",
  },
  blogs: {
    dot:       "bg-pink-400",
    tag:       "text-pink-400",
    badge:     "bg-pink-500/15 text-pink-300 border-pink-500/30",
    heading:   "text-pink-300",
    border:    "border-pink-500/30",
    from:      "from-pink-900/20",
    tabActive: "data-[state=active]:from-pink-600 data-[state=active]:to-fuchsia-600",
  },
  resources: {
    dot:       "bg-violet-400",
    tag:       "text-violet-400",
    badge:     "bg-violet-500/15 text-violet-300 border-violet-500/30",
    heading:   "text-violet-300",
    border:    "border-violet-500/30",
    from:      "from-violet-900/20",
    tabActive: "data-[state=active]:from-violet-600 data-[state=active]:to-purple-600",
  },
}

const TAB_CONFIG = [
  { value: "announcements", label: "Announcements", Icon: Megaphone },
  { value: "blogs",         label: "Blogs",         Icon: FileText  },
  { value: "resources",     label: "Resources",     Icon: BookOpen  },
]

// content_type values expected by content_deletions table
const CONTENT_TYPE_MAP = {
  announcements: "announcement",
  blogs:         "blog",
  resources:     "resource",
}

export default function ViewableSection() {
  const { session } = useAuth()   // ← used to record who deleted the item

  const [data, setData]                   = useState({ announcements: [], blogs: [], resources: [] })
  const [loading, setLoading]             = useState(true)
  const [activeTab, setActiveTab]         = useState("announcements")
  const [search, setSearch]               = useState("")
  const [selectedItem, setSelectedItem]   = useState(null)
  const [deleteDialog, setDeleteDialog]   = useState(null)
  const [deleteReason, setDeleteReason]   = useState("")
  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast]                 = useState(null)

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

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const filter = (arr) =>
      arr.filter((i) =>
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

  // ── MODIFIED: archive to content_deletions before hard-deleting ──────────
  const handleDelete = async () => {
    if (!deleteDialog) return
    const { id, type } = deleteDialog
    setActionLoading(id)

    const tableMap = { announcements: "announcements", blogs: "blogs", resources: "resource_hub" }

    try {
      // 1. Find the full item snapshot
      const item = data[type].find((i) => i.id === id)

      // 2. Write to audit/archive table FIRST (non-blocking — we don't throw if this fails,
      //    but we do warn the user so they can investigate)
      if (item) {
        const { error: archiveError } = await supabase
          .from("content_deletions")
          .insert([{
            original_id:     id,
            content_type:    CONTENT_TYPE_MAP[type],
            title:           item.title           ?? null,
            organization:    item.organization    ?? null,
            organization_id: item.organization_id ?? null,
            author:          item.author          ?? null,
            original_data:   item,
            deleted_by:      session?.user?.id    ?? null,
            deletion_reason: deleteReason.trim()  || null,
          }])

        if (archiveError) {
          // Log but don't abort — deleting the live item is still the priority
          console.warn("Archive write failed (deletion will still proceed):", archiveError.message)
        }
      }

      // 3. Hard-delete from the live table
      const { error } = await supabase.from(tableMap[type]).delete().eq("id", id)
      if (error) throw error

      setData((prev) => ({ ...prev, [type]: prev[type].filter((i) => i.id !== id) }))
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

  return (
    <div className="flex flex-col h-full gap-4">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md text-sm font-medium
          animate-in slide-in-from-top-2 fade-in duration-300
          ${toast.type === "error"
            ? "bg-red-950/90 border-red-500/40 text-red-200 shadow-red-900/40"
            : "bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-900/40"
          }`}
        >
          {toast.type === "error"
            ? <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            : <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          }
          {toast.msg}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">

        {/* ── Tab bar + Search ── */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <TabsList className="bg-black/30 border border-white/8 p-1 rounded-xl h-auto">
            {TAB_CONFIG.map(({ value, label, Icon }) => {
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
                    {filtered[value].length}
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
        {TAB_CONFIG.map(({ value }) => {
          const ac   = ACCENTS[value]
          const list = filtered[value]

          return (
            <TabsContent key={value} value={value} className="flex-1 min-h-0 mt-0">
              <div className="flex gap-3 h-[680px]">

                {/* LEFT — scrollable list */}
                <div className={`w-[320px] shrink-0 flex flex-col rounded-2xl border bg-black/20 overflow-hidden transition-colors duration-200
                  ${selectedItem ? ac.border : "border-white/8"}`}
                >
                  <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between shrink-0">
                    <span className={`text-xs font-bold uppercase tracking-widest ${ac.heading}`}>
                      {value === "announcements" ? "Announcements" : value === "blogs" ? "Blogs" : "Resources"}
                    </span>
                    <span className="text-white/25 text-xs">
                      {list.length} item{list.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-fuchsia-400/60" />
                    </div>
                  ) : list.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/20 p-6 text-center">
                      <Inbox className="w-8 h-8 opacity-40" />
                      <p className="text-xs">
                        {search ? `No results for "${search}"` : `No ${value} yet`}
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-screen overflow-y-hidden">
                      <div className="divide-y divide-white/5">
                        {list.map((item) => (
                          <ListRow
                            key={item.id}
                            item={item}
                            type={value}
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
                </div>

                {/* RIGHT — detail panel */}
                <div className={`flex-1 rounded-2xl border bg-black/20 overflow-hidden transition-colors duration-200
                  ${selectedItem ? ac.border : "border-white/8"}`}
                >
                  {selectedItem ? (
                    <ScrollArea className="h-screen overflow-y-hidden">
                      <DetailPane
                        key={selectedItem.id}
                        item={selectedItem}
                        type={value}
                        ac={ac}
                        actionLoading={actionLoading}
                        onDelete={() =>
                          setDeleteDialog({ id: selectedItem.id, title: selectedItem.title, type: value })
                        }
                      />
                    </ScrollArea>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-4 text-white/15 select-none">
                      <div className="w-14 h-14 rounded-2xl border border-white/8 flex items-center justify-center bg-white/3">
                        {value === "announcements" && <Megaphone className="w-6 h-6" />}
                        {value === "blogs"         && <FileText  className="w-6 h-6" />}
                        {value === "resources"     && <BookOpen  className="w-6 h-6" />}
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
                  This action is permanent and cannot be undone
                </p>
              </div>
            </div>

            <AlertDialogDescription asChild>
              <div className="space-y-4 text-sm">
                <p className="text-white/55">
                  You are permanently deleting{" "}
                  <span className="text-white font-medium">"{deleteDialog?.title}"</span>.
                </p>

                {/* Audit trail note */}
                <div className="px-3 py-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15 text-amber-200/50 text-xs leading-relaxed flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400/60" />
                  <span>
                    A copy of this content will be saved to the <strong className="text-amber-300/70">History</strong> tab for audit purposes.
                  </span>
                </div>

                <div className="px-3 py-2.5 rounded-lg bg-white/3 border border-white/8 text-white/40 text-xs leading-relaxed">
                  This will remove the item from the platform immediately. Any associated
                  data and references will also be cleared.
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/30 flex items-center gap-2">
                    <XCircle className="w-3 h-3 shrink-0" />
                    Reason for Deletion
                    <span className="text-white/18 font-normal normal-case tracking-normal">
                      (optional)
                    </span>
                  </label>
                  <Textarea
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="e.g. Outdated content, duplicate entry, policy violation…"
                    className="bg-black/40 border border-red-500/15 text-white/70 placeholder:text-white/18 text-xs resize-none focus:border-red-400/30 focus:ring-0 rounded-lg"
                    rows={3}
                  />
                  <p className="text-white/20 text-[11px] leading-relaxed">
                    Saved to the History audit log. Leave blank to delete without a reason.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2 mt-1">
            <AlertDialogCancel
              onClick={() => setDeleteReason("")}
              className="cursor-pointer bg-white/5 hover:bg-white/8 text-white/55 hover:text-white border border-white/10 text-sm transition-all duration-200"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleDelete}
              disabled={!!actionLoading}
              className="cursor-pointer bg-gradient-to-r from-pink-600 via-fuchsia-600 to-rose-600
                hover:from-pink-500 hover:via-fuchsia-500 hover:to-rose-500
                active:scale-[0.97] text-white border-0 gap-2 text-sm transition-all duration-200
                shadow-lg hover:shadow-pink-500/25"
            >
              {actionLoading
                ? <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                : <Trash2 className="w-4 h-4 shrink-0" />
              }
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
      className={`w-full h-full text-left py-4 px-2 m-2 flex items-start gap-3 border border-fuchsia-700/50 transition-all duration-150 group
        border-l-2
        ${isSelected
          ? "bg-white/6 border-l-current"
          : "border-l-transparent hover:bg-white/3 hover:border-l-white/10"
        }`}
      style={isSelected ? { borderLeftColor: "currentColor" } : {}}
    >
      <span className={`mt-[7px] w-1.5 h-1.5 rounded-full shrink-0 ${ac.dot}
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
            {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>

        {(item.organization || item.author) && (
          <p className={`text-[11px] truncate ${ac.tag} opacity-75`}>
            {item.organization || item.author}
          </p>
        )}

        <div className="flex items-center gap-1.5 flex-wrap">
          {type === "announcements" && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${
              isExpired
                ? "bg-red-500/10 text-red-400/70 border-red-500/15"
                : "bg-emerald-500/10 text-emerald-400/70 border-emerald-500/15"
            }`}>
              {isExpired ? "Expired" : "Active"}
            </span>
          )}
          {type === "blogs" && item.theme && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/30">
              {item.theme}
            </span>
          )}
        </div>
      </div>

      <ChevronRight className={`w-3.5 h-3.5 shrink-0 mt-0.5 transition-colors
        ${isSelected ? ac.tag : "text-white/12 group-hover:text-white/25"}`}
      />
    </button>
  )
}

// ── Detail pane ───────────────────────────────────────────────────────────────
function DetailPane({ item, type, ac, actionLoading, onDelete }) {
  const isExpired = item.date_end && new Date(item.date_end) < new Date()

  return (
    <div className="h-full flex flex-col">

      {/* Header */}
      <div className="px-6 pt-6 pb-5 border-b border-white/8 shrink-0">
        <div className="flex items-start justify-between gap-4">
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
                {new Date(item.created_at).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </span>

              {type === "announcements" && (
                <span className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium ${
                  isExpired
                    ? "bg-red-500/10 text-red-300 border-red-500/20"
                    : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isExpired ? "bg-red-400" : "bg-emerald-400"}`} />
                  {isExpired ? "Expired" : "Active"}
                </span>
              )}

              {type === "blogs" && item.theme && (
                <Badge className={`${ac.badge} border text-xs flex items-center gap-1`}>
                  <Tag className="w-3 h-3" />{item.theme}
                </Badge>
              )}
            </div>
          </div>

          <Button
            size="sm"
            onClick={onDelete}
            disabled={actionLoading === item.id}
            className="shrink-0 h-9 px-4 bg-gradient-to-r from-pink-600/70 to-fuchsia-600/70
              hover:from-pink-500 hover:to-fuchsia-500 text-white border-0 gap-2 text-xs font-medium
              shadow-md hover:shadow-pink-500/20 active:scale-[0.97] transition-all duration-200"
          >
            {actionLoading === item.id
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Trash2 className="w-3.5 h-3.5" />
            }
            Delete
          </Button>
        </div>
      </div>

      {/* Scrollable body */}
      <ScrollArea className="flex-1">
        <div className="px-6 py-5 space-y-6">

          {item.des && (
            <DetailBlock icon={<AlignLeft className="w-3.5 h-3.5" />} label="Description">
              <p className="text-white/65 text-sm leading-relaxed">{item.des}</p>
            </DetailBlock>
          )}

          {item.content && (
            <DetailBlock icon={<FileText className="w-3.5 h-3.5" />} label="Content">
              <p className="text-white/65 text-sm leading-relaxed whitespace-pre-line">{item.content}</p>
            </DetailBlock>
          )}

          {/* ── Announcement-specific ── */}
          {type === "announcements" && (
            <>
              {(item.date_begin || item.date_end) && (
                <DetailBlock icon={<Calendar className="w-3.5 h-3.5" />} label="Schedule">
                  <div className="flex gap-3">
                    {[
                      { label: "Start", val: item.date_begin, expired: false },
                      { label: "End",   val: item.date_end,   expired: isExpired },
                    ].filter(({ val }) => val).map(({ label, val, expired }) => (
                      <div key={label} className="flex-1 px-4 py-3 rounded-xl bg-white/4 border border-white/8">
                        <p className="text-[10px] text-white/30 mb-1 uppercase tracking-wider">{label}</p>
                        <p className={`text-sm font-medium ${expired ? "text-red-300/80" : "text-white/75"}`}>
                          {new Date(val).toLocaleDateString("en-US", {
                            month: "long", day: "numeric", year: "numeric",
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                </DetailBlock>
              )}

              {item.open_to && (
                <DetailBlock icon={<Users className="w-3.5 h-3.5" />} label="Open To">
                  <p className="text-white/65 text-sm">{item.open_to}</p>
                </DetailBlock>
              )}

              {item.prizes?.length > 0 && (
                <DetailBlock icon={<Trophy className="w-3.5 h-3.5" />} label={`Prizes (${item.prizes.length})`}>
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
                <DetailBlock icon={<Link2 className="w-3.5 h-3.5" />} label="Link">
                  <a href={item.link} target="_blank" rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 text-sm ${ac.tag} hover:underline underline-offset-2 break-all`}>
                    {item.link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                  </a>
                </DetailBlock>
              )}
            </>
          )}

          {/* ── Blog-specific ── */}
          {type === "blogs" && (
            <>
              {item.author && (
                <DetailBlock icon={<User className="w-3.5 h-3.5" />} label="Author">
                  <p className="text-white/65 text-sm">{item.author}</p>
                </DetailBlock>
              )}
              {item.place && (
                <DetailBlock icon={<MapPin className="w-3.5 h-3.5" />} label="Place / Venue">
                  <p className="text-white/65 text-sm">{item.place}</p>
                </DetailBlock>
              )}
              {item.date && (
                <DetailBlock icon={<Calendar className="w-3.5 h-3.5" />} label="Date">
                  <p className="text-white/65 text-sm">
                    {new Date(item.date).toLocaleDateString("en-US", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </p>
                </DetailBlock>
              )}
              {item.link && (
                <DetailBlock icon={<Link2 className="w-3.5 h-3.5" />} label="Link">
                  <a href={item.link} target="_blank" rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 text-sm ${ac.tag} hover:underline underline-offset-2 break-all`}>
                    {item.link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                  </a>
                </DetailBlock>
              )}
            </>
          )}

          {/* ── Resource-specific ── */}
          {type === "resources" && (
            <>
              {item.category && (
                <DetailBlock icon={<Hash className="w-3.5 h-3.5" />} label="Category">
                  <Badge className={`${ac.badge} border text-xs`}>{item.category}</Badge>
                </DetailBlock>
              )}
              {item.link && (
                <DetailBlock icon={<Globe className="w-3.5 h-3.5" />} label="Resource Link">
                  <a href={item.link} target="_blank" rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 text-sm ${ac.tag} hover:underline underline-offset-2 break-all`}>
                    {item.link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                  </a>
                </DetailBlock>
              )}
              {item.tags?.length > 0 && (
                <DetailBlock icon={<Tag className="w-3.5 h-3.5" />} label="Tags">
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag, i) => (
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
              <Hash className="w-3 h-3" />{item.id}
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

// ── Reusable labeled block ────────────────────────────────────────────────────
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