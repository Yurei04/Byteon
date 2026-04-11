"use client"

import { useState, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Search, FileText, Tag, MapPin, Calendar,
  Hash, ExternalLink, Link2, Eye, Clock,
  Trash2, Loader2, Inbox, ChevronRight,
  ChevronLeft, ShieldAlert, XCircle, CheckCircle,
  AlertCircle, Edit,
} from "lucide-react"

import { notifyBlogDeletedByUser } from "@/lib/notification" 
import BlogEditOrg from "@/components/blog/blog-edit-org"

const ITEMS_PER_PAGE = 10

// ── accent for the single "blogs" theme ──────────────────────────────────────
const AC = {
  dot:        "bg-fuchsia-400",
  dotGlow:    "shadow-[0_0_6px_2px_rgba(232,121,249,0.5)]",
  tag:        "text-fuchsia-300",
  badge:      "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  heading:    "text-fuchsia-300",
  border:     "border-fuchsia-500/30",
  pageActive: "bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-300",
  pageHover:  "hover:bg-fuchsia-500/10 hover:border-fuchsia-500/30 hover:text-fuchsia-300",
}

// ── Inline pagination ─────────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
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
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className="flex items-center gap-1 px-2 py-1 rounded-lg border border-white/8 text-white/30 text-[11px] transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:text-white/60 hover:bg-white/5 hover:border-white/15">
        <ChevronLeft className="w-3 h-3" /> Prev
      </button>

      <div className="flex items-center gap-1">
        {withEllipsis.map((item, idx) =>
          item === "…" ? (
            <span key={`e-${idx}`} className="text-white/20 text-[11px] px-1">…</span>
          ) : (
            <button key={item} onClick={() => onPageChange(item)}
              className={`w-6 h-6 rounded-md border text-[11px] font-medium transition-all
                ${currentPage === item
                  ? AC.pageActive
                  : `border-white/8 text-white/30 ${AC.pageHover}`}`}>
              {item}
            </button>
          )
        )}
      </div>

      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-2 py-1 rounded-lg border border-white/8 text-white/30 text-[11px] transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:text-white/60 hover:bg-white/5 hover:border-white/15">
        Next <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Props:
//   blogs        — array of blog objects (already fetched by parent)
//   blogsLoading — boolean
//   profile      — auth profile object (for name + notify)
//   onBlogUpdate — callback to refetch after edit/delete
//   addToast     — optional toast callback from parent
// ─────────────────────────────────────────────────────────────────────────────
export default function UserViewableSection({ blogs = [], blogsLoading = false, profile, onBlogUpdate, addToast }) {
  const [search, setSearch]               = useState("")
  const [selectedItem, setSelectedItem]   = useState(null)
  const [currentPage, setCurrentPage]     = useState(1)
  const [deleteDialog, setDeleteDialog]   = useState(null)   // full blog object
  const [deleteReason, setDeleteReason]   = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast]                 = useState(null)

  const showToast = (msg, type = "success") => {
    // use parent's toast if provided, otherwise local
    if (addToast) { addToast(type, msg); return }
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return blogs
    return blogs.filter((b) =>
      (b.title  || "").toLowerCase().includes(q) ||
      (b.theme  || "").toLowerCase().includes(q) ||
      (b.author || "").toLowerCase().includes(q) ||
      (b.des    || "").toLowerCase().includes(q)
    )
  }, [blogs, search])

  const totalPages  = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const pageList    = useMemo(() =>
    filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filtered, currentPage]
  )

  // Reset page + selection on search
  const handleSearch = (val) => {
    setSearch(val)
    setCurrentPage(1)
    setSelectedItem(null)
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const openDelete = (blog) => {
    setDeleteReason("")
    setDeleteDialog(blog)
  }

  const confirmDelete = async () => {
    if (!deleteDialog?.id) return
    setActionLoading(true)
    try {
      const { error } = await supabase.from("blogs").delete().eq("id", deleteDialog.id)
      if (error) throw error

      if (selectedItem?.id === deleteDialog.id) setSelectedItem(null)

      await notifyBlogDeletedByUser({
        userName:  profile?.name  || "A user",
        blogTitle: deleteDialog.title || "Untitled",
      })

      onBlogUpdate?.()
      showToast("Blog deleted successfully.")
      setDeleteDialog(null)
      setDeleteReason("")
    } catch (err) {
      console.error("Delete error:", err)
      showToast("Failed to delete. Please try again.", "error")
    } finally {
      setActionLoading(false)
    }
  }

  const closeDelete = () => {
    if (actionLoading) return
    setDeleteDialog(null)
    setDeleteReason("")
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Local toast (only used if parent didn't provide addToast) */}
      {toast && !addToast && (
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

      {/* ── Search bar ── */}
      <div className="relative max-w-xs group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 group-focus-within:text-white/50 transition-colors" />
        <Input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search blogs…"
          className="pl-9 h-9 bg-black/25 border-white/8 hover:border-white/15 focus:border-white/25 text-white text-sm placeholder:text-white/25 rounded-lg focus:ring-0 transition-colors"
        />
      </div>

      {/* ── Split screen ── */}
      <div className="flex gap-3 h-[580px]">

        {/* LEFT — list */}
        <div className={`w-[300px] shrink-0 flex flex-col rounded-2xl border bg-black/20 overflow-hidden transition-colors duration-200
          ${selectedItem ? AC.border : "border-white/8"}`}>

          {/* header */}
          <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between shrink-0">
            <span className={`text-xs font-bold uppercase tracking-widest ${AC.heading}`}>My Blogs</span>
            <div className="flex items-center gap-2">
              {totalPages > 1 && (
                <span className="text-white/18 text-[10px]">p.{currentPage}/{totalPages}</span>
              )}
              <span className="text-white/25 text-xs">
                {filtered.length} post{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* body */}
          {blogsLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-fuchsia-400/60" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/20 p-6 text-center">
              <Inbox className="w-8 h-8 opacity-40" />
              <p className="text-xs">
                {search ? `No blogs matching "${search}"` : "You haven't written any blogs yet"}
              </p>
            </div>
          ) : (
            <ScrollArea className="flex-1 min-h-0">
              <div className="divide-y divide-white/5">
                {pageList.map((blog) => (
                  <BlogListRow
                    key={blog.id}
                    blog={blog}
                    isSelected={selectedItem?.id === blog.id}
                    onClick={() => setSelectedItem(selectedItem?.id === blog.id ? null : blog)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}

          {/* pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => { setCurrentPage(p); setSelectedItem(null) }}
          />
        </div>

        {/* RIGHT — detail */}
        <div className={`flex-1 rounded-2xl border bg-black/20 overflow-hidden transition-colors duration-200
          ${selectedItem ? AC.border : "border-white/8"}`}>
          {selectedItem ? (
            <BlogDetailPane
              key={selectedItem.id}
              blog={selectedItem}
              onDelete={() => openDelete(selectedItem)}
              onUpdate={() => {
                onBlogUpdate?.()
                // Refresh selected item from updated list is handled by parent re-render
              }}
              actionLoading={actionLoading}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-white/15 select-none">
              <div className="w-14 h-14 rounded-2xl border border-white/8 flex items-center justify-center bg-white/3">
                <FileText className="w-6 h-6 opacity-40" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white/20">No blog selected</p>
                <p className="text-xs text-white/10 mt-1">Pick a post from the left to read or manage it</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Delete dialog — at root, outside all panels ── */}
      <AlertDialog open={!!deleteDialog} onOpenChange={(open) => { if (!open) closeDelete() }}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-950 via-rose-950/25 to-slate-950 backdrop-blur-xl border border-red-500/20 shadow-2xl shadow-red-900/25 max-w-md">
          <AlertDialogHeader className="gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <AlertDialogTitle className="text-red-200 text-base font-semibold">
                  Delete Blog Post
                </AlertDialogTitle>
                <p className="text-white/30 text-xs mt-0.5">Platform admins will be notified</p>
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
                    placeholder="e.g. Outdated content, no longer relevant…"
                    className="bg-black/40 border border-red-500/15 text-white/70 placeholder:text-white/18 text-xs resize-none focus:border-red-400/30 focus:ring-0 rounded-lg"
                    rows={3}
                  />
                  <p className="text-white/18 text-[11px] leading-relaxed">
                    Optional note for the audit trail.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2 mt-1">
            <AlertDialogCancel disabled={actionLoading} onClick={closeDelete}
              className="cursor-pointer bg-white/5 hover:bg-white/8 text-white/55 hover:text-white border border-white/10 text-sm transition-all">
              Cancel
            </AlertDialogCancel>
            <Button onClick={confirmDelete} disabled={actionLoading}
              className="cursor-pointer bg-gradient-to-r from-pink-600 via-fuchsia-600 to-rose-600
                hover:from-pink-500 hover:via-fuchsia-500 hover:to-rose-500
                active:scale-[0.97] text-white border-0 gap-2 text-sm transition-all shadow-lg hover:shadow-pink-500/25">
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
function BlogListRow({ blog, isSelected, onClick }) {
  return (
    <button onClick={onClick}
      className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-all duration-150 group border-l-2
        ${isSelected
          ? `bg-fuchsia-500/8 border-l-fuchsia-400`
          : `border-l-transparent hover:bg-fuchsia-500/5 hover:border-l-fuchsia-500/40`}`}
    >
      {/* dot */}
      <span className={`mt-[7px] w-1.5 h-1.5 rounded-full shrink-0 ${AC.dot} transition-all duration-200
        ${isSelected ? `opacity-100 ${AC.dotGlow}` : "opacity-35 group-hover:opacity-75"}`} />

      <div className="flex-1 min-w-0 space-y-1">
        {/* title + date */}
        <div className="flex items-start justify-between gap-2">
          <p className={`text-xs font-semibold leading-snug line-clamp-2 transition-colors
            ${isSelected ? "text-white" : "text-white/55 group-hover:text-white/85"}`}>
            {blog.title}
          </p>
          <span className="text-white/20 text-[10px] shrink-0 mt-0.5">
            {new Date(blog.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>

        {/* theme + preview */}
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          {blog.theme && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border shrink-0 ${AC.badge}`}>
              {blog.theme}
            </span>
          )}
          {blog.des && (
            <span className="text-[10px] text-white/20 truncate flex-1 min-w-0">{blog.des}</span>
          )}
        </div>

        {/* views */}
        {blog.views > 0 && (
          <p className="flex items-center gap-1 text-[10px] text-white/20 group-hover:text-white/30 transition-colors">
            <Eye className="w-3 h-3" />{blog.views} view{blog.views !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <ChevronRight className={`w-3.5 h-3.5 shrink-0 mt-0.5 transition-all
        ${isSelected ? "text-fuchsia-400" : "text-white/10 group-hover:text-white/28 group-hover:translate-x-0.5"}`} />
    </button>
  )
}

// ── Detail pane ───────────────────────────────────────────────────────────────
function BlogDetailPane({ blog, onDelete, onUpdate, actionLoading }) {
  return (
    <div className="h-full flex flex-col">

      {/* header */}
      <div className="px-6 pt-6 pb-5 border-b border-white/8 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2.5">
            {blog.theme && (
              <Badge className={`${AC.badge} border text-xs flex items-center gap-1.5 w-fit`}>
                <Tag className="w-3 h-3" />{blog.theme}
              </Badge>
            )}
            <h2 className="text-xl font-bold text-white leading-snug">{blog.title}</h2>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 text-white/30 text-xs">
                <Clock className="w-3 h-3" />
                {new Date(blog.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
              {blog.views > 0 && (
                <span className="flex items-center gap-1.5 text-white/30 text-xs">
                  <Eye className="w-3 h-3" />{blog.views} view{blog.views !== 1 ? "s" : ""}
                </span>
              )}
              {blog.place && (
                <span className="flex items-center gap-1.5 text-white/30 text-xs">
                  <MapPin className="w-3 h-3" />{blog.place}
                </span>
              )}
            </div>
          </div>

          {/* actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Edit — reuses BlogEditOrg dialog trigger */}
            <BlogEditOrg blog={blog} onUpdate={onUpdate}>
              <Button size="sm" variant="ghost"
                className="h-9 px-3 border border-white/10 hover:border-fuchsia-500/35 text-white/40 hover:text-fuchsia-300 hover:bg-fuchsia-500/8 gap-1.5 text-xs transition-all active:scale-[0.97]">
                <Edit className="w-3.5 h-3.5" />Edit
              </Button>
            </BlogEditOrg>

            {/* Delete */}
            <Button size="sm" onClick={onDelete} disabled={actionLoading}
              className="h-9 px-4 bg-gradient-to-r from-pink-600/70 to-fuchsia-600/70
                hover:from-pink-500 hover:to-fuchsia-500 text-white border-0 gap-2 text-xs font-medium
                shadow-md hover:shadow-pink-500/20 active:scale-[0.97] transition-all duration-200">
              <Trash2 className="w-3.5 h-3.5" />Delete
            </Button>
          </div>
        </div>
      </div>

      {/* scrollable body */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-6 py-5 space-y-6">

          {/* Description */}
          {blog.des && (
            <DetailBlock icon={<FileText className="w-3.5 h-3.5" />} label="Description">
              <p className="text-white/65 text-sm leading-relaxed">{blog.des}</p>
            </DetailBlock>
          )}

          {/* Author */}
          {blog.author && (
            <DetailBlock icon={<Hash className="w-3.5 h-3.5" />} label="Author">
              <p className="text-white/65 text-sm">{blog.author}</p>
            </DetailBlock>
          )}

          {/* Date (event date, not created_at) */}
          {blog.date && (
            <DetailBlock icon={<Calendar className="w-3.5 h-3.5" />} label="Date">
              <p className="text-white/65 text-sm">
                {new Date(blog.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </DetailBlock>
          )}

          {/* Related hackathons */}
          {blog.hackathon?.length > 0 && (
            <DetailBlock icon={<Link2 className="w-3.5 h-3.5" />} label="Related Hackathon(s)">
              <div className="flex flex-wrap gap-1.5">
                {blog.hackathon.map((h, i) => (
                  <Badge key={i} className={`${AC.badge} border text-xs`}>{h}</Badge>
                ))}
              </div>
            </DetailBlock>
          )}

          {/* External link */}
          {blog.link && (
            <DetailBlock icon={<ExternalLink className="w-3.5 h-3.5" />} label="Link">
              <a href={blog.link} target="_blank" rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 text-sm ${AC.tag} hover:underline underline-offset-2 break-all`}>
                {blog.link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
              </a>
            </DetailBlock>
          )}

          {/* Full content */}
          {blog.content && (
            <DetailBlock icon={<FileText className="w-3.5 h-3.5" />} label="Content">
              <p className="text-white/65 text-sm leading-relaxed whitespace-pre-line">{blog.content}</p>
            </DetailBlock>
          )}

          {/* ID */}
          <div className="pt-1 pb-2">
            <p className="flex items-center gap-1.5 text-[11px] text-white/15 font-mono hover:text-white/28 transition-colors cursor-text select-all">
              <Hash className="w-3 h-3" />{blog.id}
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
      <p className={`text-[11px] font-semibold uppercase tracking-wider text-white/28 flex items-center gap-1.5 mb-2`}>
        <span className="text-white/35">{icon}</span>{label}
      </p>
      {children}
    </div>
  )
}