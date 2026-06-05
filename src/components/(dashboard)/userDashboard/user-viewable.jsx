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

/* ─────────────────────────────────────────────────────────────────────────────
   CSS TOKENS  (injected once via <style>)
   We use data-attributes so these live entirely in CSS, not JS conditionals.
───────────────────────────────────────────────────────────────────────────── */
const THEME_STYLES = `
  /* ── Light ── */
  :root {
    --uv-bg:              rgba(255,255,255,0.60);
    --uv-bg-raised:       rgba(253,244,255,0.80);
    --uv-border:          rgba(192,38,211,0.14);
    --uv-border-active:   rgba(192,38,211,0.38);
    --uv-border-subtle:   rgba(192,38,211,0.10);
    --uv-divide:          rgba(192,38,211,0.07);

    --uv-text-primary:    #1e0320;
    --uv-text-secondary:  #701976;
    --uv-text-muted:      #a11bb0;
    --uv-text-faint:      rgba(112,25,118,0.45);
    --uv-text-mono:       rgba(112,25,118,0.35);

    --uv-heading:         #c026d3;
    --uv-brand:           #c026d3;
    --uv-brand-soft:      rgba(192,38,211,0.10);
    --uv-brand-border:    rgba(192,38,211,0.25);

    --uv-row-hover:       rgba(192,38,211,0.04);
    --uv-row-selected:    rgba(192,38,211,0.07);
    --uv-row-indicator:   #c026d3;

    --uv-badge-bg:        rgba(192,38,211,0.10);
    --uv-badge-text:      #a11bb0;
    --uv-badge-border:    rgba(192,38,211,0.28);

    --uv-empty-text:      rgba(112,25,118,0.35);

    --uv-page-active-bg:  rgba(192,38,211,0.12);
    --uv-page-active-border: rgba(192,38,211,0.38);
    --uv-page-active-text: #c026d3;
    --uv-page-text:       rgba(112,25,118,0.40);
    --uv-page-border:     rgba(192,38,211,0.15);

    --uv-input-bg:        rgba(255,255,255,0.70);
    --uv-input-border:    rgba(192,38,211,0.18);
    --uv-input-text:      #1e0320;
    --uv-input-placeholder: rgba(161,27,176,0.40);

    --uv-header-border:   rgba(192,38,211,0.10);
    --uv-section-label:   rgba(192,38,211,0.50);

    --uv-detail-icon:     rgba(161,27,176,0.45);
    --uv-detail-label:    rgba(112,25,118,0.45);
    --uv-detail-text:     #3a0a40;
    --uv-detail-link:     #c026d3;
    --uv-detail-id:       rgba(112,25,118,0.25);

    --uv-empty-placeholder-bg:     rgba(253,244,255,0.60);
    --uv-empty-placeholder-border: rgba(192,38,211,0.15);
    --uv-empty-placeholder-icon:   rgba(192,38,211,0.30);
    --uv-empty-placeholder-text:   rgba(112,25,118,0.40);
    --uv-empty-placeholder-sub:    rgba(112,25,118,0.28);

    --uv-pager-bg:        rgba(253,244,255,0.50);
    --uv-pager-hover-bg:  rgba(192,38,211,0.06);
    --uv-pager-hover-border: rgba(192,38,211,0.30);
    --uv-pager-hover-text: #c026d3;
    --uv-pager-disabled:  rgba(161,27,176,0.25);
  }

  /* ── Dark ── */
  .dark {
    --uv-bg:              rgba(0,0,0,0.20);
    --uv-bg-raised:       rgba(255,255,255,0.025);
    --uv-border:          rgba(255,255,255,0.08);
    --uv-border-active:   rgba(232,121,249,0.40);
    --uv-border-subtle:   rgba(255,255,255,0.05);
    --uv-divide:          rgba(255,255,255,0.05);

    --uv-text-primary:    #ffffff;
    --uv-text-secondary:  rgba(255,255,255,0.75);
    --uv-text-muted:      rgba(255,255,255,0.45);
    --uv-text-faint:      rgba(255,255,255,0.25);
    --uv-text-mono:       rgba(255,255,255,0.18);

    --uv-heading:         #e879f9;
    --uv-brand:           #e879f9;
    --uv-brand-soft:      rgba(232,121,249,0.10);
    --uv-brand-border:    rgba(232,121,249,0.30);

    --uv-row-hover:       rgba(232,121,249,0.05);
    --uv-row-selected:    rgba(232,121,249,0.08);
    --uv-row-indicator:   #e879f9;

    --uv-badge-bg:        rgba(168,85,247,0.15);
    --uv-badge-text:      #e879f9;
    --uv-badge-border:    rgba(168,85,247,0.30);

    --uv-empty-text:      rgba(255,255,255,0.20);

    --uv-page-active-bg:  rgba(168,85,247,0.20);
    --uv-page-active-border: rgba(168,85,247,0.40);
    --uv-page-active-text: #e879f9;
    --uv-page-text:       rgba(255,255,255,0.30);
    --uv-page-border:     rgba(255,255,255,0.08);

    --uv-input-bg:        rgba(0,0,0,0.25);
    --uv-input-border:    rgba(255,255,255,0.08);
    --uv-input-text:      #ffffff;
    --uv-input-placeholder: rgba(255,255,255,0.25);

    --uv-header-border:   rgba(255,255,255,0.06);
    --uv-section-label:   rgba(232,121,249,0.60);

    --uv-detail-icon:     rgba(255,255,255,0.35);
    --uv-detail-label:    rgba(255,255,255,0.28);
    --uv-detail-text:     rgba(255,255,255,0.65);
    --uv-detail-link:     #e879f9;
    --uv-detail-id:       rgba(255,255,255,0.15);

    --uv-empty-placeholder-bg:     rgba(255,255,255,0.02);
    --uv-empty-placeholder-border: rgba(255,255,255,0.08);
    --uv-empty-placeholder-icon:   rgba(255,255,255,0.25);
    --uv-empty-placeholder-text:   rgba(255,255,255,0.20);
    --uv-empty-placeholder-sub:    rgba(255,255,255,0.10);

    --uv-pager-bg:        rgba(0,0,0,0.10);
    --uv-pager-hover-bg:  rgba(255,255,255,0.05);
    --uv-pager-hover-border: rgba(255,255,255,0.15);
    --uv-pager-hover-text: rgba(255,255,255,0.60);
    --uv-pager-disabled:  rgba(255,255,255,0.20);
  }
`

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = []
  const delta = 1
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta))
      pages.push(i)
  }
  const withEllipsis = []
  pages.forEach((page, idx) => {
    if (idx > 0 && page - pages[idx - 1] > 1) withEllipsis.push("…")
    withEllipsis.push(page)
  })

  const btnBase = {
    border: "1px solid var(--uv-page-border)",
    color:  "var(--uv-page-text)",
    background: "transparent",
    transition: "all 0.15s",
  }

  return (
    <div className="flex items-center justify-between px-3 py-2 shrink-0"
      style={{ borderTop: "1px solid var(--uv-border-subtle)", background: "var(--uv-pager-bg)" }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] disabled:opacity-30 disabled:cursor-not-allowed"
        style={btnBase}
        onMouseEnter={e => { e.currentTarget.style.background = "var(--uv-pager-hover-bg)"; e.currentTarget.style.borderColor = "var(--uv-pager-hover-border)"; e.currentTarget.style.color = "var(--uv-pager-hover-text)" }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--uv-page-border)"; e.currentTarget.style.color = "var(--uv-page-text)" }}
      >
        <ChevronLeft className="w-3 h-3" /> Prev
      </button>

      <div className="flex items-center gap-1">
        {withEllipsis.map((item, idx) =>
          item === "…" ? (
            <span key={`e-${idx}`} className="text-[11px] px-1" style={{ color: "var(--uv-text-faint)" }}>…</span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className="w-6 h-6 rounded-md text-[11px] font-medium transition-all"
              style={currentPage === item ? {
                background:   "var(--uv-page-active-bg)",
                border:       "1px solid var(--uv-page-active-border)",
                color:        "var(--uv-page-active-text)",
              } : btnBase}
            >
              {item}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] disabled:opacity-30 disabled:cursor-not-allowed"
        style={btnBase}
        onMouseEnter={e => { e.currentTarget.style.background = "var(--uv-pager-hover-bg)"; e.currentTarget.style.borderColor = "var(--uv-pager-hover-border)"; e.currentTarget.style.color = "var(--uv-pager-hover-text)" }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--uv-page-border)"; e.currentTarget.style.color = "var(--uv-page-text)" }}
      >
        Next <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function UserViewableSection({ blogs = [], blogsLoading = false, profile, onBlogUpdate, addToast }) {
  const [search, setSearch]               = useState("")
  const [selectedItem, setSelectedItem]   = useState(null)
  const [currentPage, setCurrentPage]     = useState(1)
  const [deleteDialog, setDeleteDialog]   = useState(null)
  const [deleteReason, setDeleteReason]   = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [localToast, setLocalToast]       = useState(null)

  const showToast = (msg, type = "success") => {
    if (addToast) { addToast(type, msg); return }
    setLocalToast({ msg, type })
    setTimeout(() => setLocalToast(null), 3500)
  }

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const pageList   = useMemo(() =>
    filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filtered, currentPage]
  )

  const handleSearch = (val) => { setSearch(val); setCurrentPage(1); setSelectedItem(null) }

  const openDelete = (blog) => { setDeleteReason(""); setDeleteDialog(blog) }

  const confirmDelete = async () => {
    if (!deleteDialog?.id) return
    setActionLoading(true)
    try {
      const { error } = await supabase.from("blogs").delete().eq("id", deleteDialog.id)
      if (error) throw error
      if (selectedItem?.id === deleteDialog.id) setSelectedItem(null)
      await notifyBlogDeletedByUser({ userName: profile?.name || "A user", blogTitle: deleteDialog.title || "Untitled" })
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

  const closeDelete = () => { if (actionLoading) return; setDeleteDialog(null); setDeleteReason("") }

  return (
    <div className="flex flex-col gap-4">
      <style>{THEME_STYLES}</style>

      {/* Local toast */}
      {localToast && !addToast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md text-sm font-medium
          animate-in slide-in-from-top-2 fade-in duration-300
          ${localToast.type === "error"
            ? "bg-red-950/90 border-red-500/40 text-red-200 shadow-red-900/40"
            : "bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-900/40"}`}>
          {localToast.type === "error"
            ? <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            : <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
          {localToast.msg}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-xs group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors"
          style={{ color: "var(--uv-input-placeholder)" }} />
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search blogs…"
          className="w-full pl-9 pr-3 h-9 rounded-lg text-sm outline-none transition-all"
          style={{
            background:  "var(--uv-input-bg)",
            border:      "1px solid var(--uv-input-border)",
            color:       "var(--uv-input-text)",
          }}
        />
      </div>

      {/* Split screen */}
      <div className="flex gap-3 h-[580px]">

        {/* LEFT — list */}
        <div className="w-[300px] shrink-0 flex flex-col rounded-2xl overflow-hidden transition-colors duration-200"
          style={{
            background: "var(--uv-bg)",
            border:     `1px solid ${selectedItem ? "var(--uv-border-active)" : "var(--uv-border)"}`,
          }}>

          {/* list header */}
          <div className="px-4 py-3 flex items-center justify-between shrink-0"
            style={{ borderBottom: "1px solid var(--uv-header-border)" }}>
            <span className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--uv-heading)" }}>My Blogs</span>
            <div className="flex items-center gap-2">
              {totalPages > 1 && (
                <span className="text-[10px]" style={{ color: "var(--uv-text-faint)" }}>
                  p.{currentPage}/{totalPages}
                </span>
              )}
              <span className="text-xs" style={{ color: "var(--uv-text-faint)" }}>
                {filtered.length} post{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* list body */}
          {blogsLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--uv-brand)" }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <Inbox className="w-8 h-8 opacity-40" style={{ color: "var(--uv-empty-text)" }} />
              <p className="text-xs" style={{ color: "var(--uv-empty-text)" }}>
                {search ? `No blogs matching "${search}"` : "You haven't written any blogs yet"}
              </p>
            </div>
          ) : (
            <ScrollArea className="flex-1 min-h-0">
              <div style={{ borderColor: "var(--uv-divide)" }}>
                {pageList.map((blog, i) => (
                  <div key={blog.id} style={{ borderBottom: i < pageList.length - 1 ? "1px solid var(--uv-divide)" : "none" }}>
                    <BlogListRow
                      blog={blog}
                      isSelected={selectedItem?.id === blog.id}
                      onClick={() => setSelectedItem(selectedItem?.id === blog.id ? null : blog)}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          <Pagination currentPage={currentPage} totalPages={totalPages}
            onPageChange={(p) => { setCurrentPage(p); setSelectedItem(null) }} />
        </div>

        {/* RIGHT — detail */}
        <div className="flex-1 rounded-2xl overflow-hidden transition-colors duration-200"
          style={{
            background: "var(--uv-bg)",
            border:     `1px solid ${selectedItem ? "var(--uv-border-active)" : "var(--uv-border)"}`,
          }}>
          {selectedItem ? (
            <BlogDetailPane
              key={selectedItem.id}
              blog={selectedItem}
              onDelete={() => openDelete(selectedItem)}
              onUpdate={() => onBlogUpdate?.()}
              actionLoading={actionLoading}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-4 select-none">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: "var(--uv-empty-placeholder-bg)",
                  border:     "1px solid var(--uv-empty-placeholder-border)",
                }}>
                <FileText className="w-6 h-6" style={{ color: "var(--uv-empty-placeholder-icon)" }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: "var(--uv-empty-placeholder-text)" }}>
                  No blog selected
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--uv-empty-placeholder-sub)" }}>
                  Pick a post from the left to read or manage it
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={(open) => { if (!open) closeDelete() }}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-950 via-rose-950/25 to-slate-950 backdrop-blur-xl border border-red-500/20 shadow-2xl shadow-red-900/25 max-w-md">
          <AlertDialogHeader className="gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <AlertDialogTitle className="text-red-200 text-base font-semibold">Delete Blog Post</AlertDialogTitle>
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
                  <p className="text-white/18 text-[11px] leading-relaxed">Optional note for the audit trail.</p>
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
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3.5 flex items-start gap-3 transition-all duration-150 group border-l-2"
      style={{
        background:  isSelected ? "var(--uv-row-selected)" : "transparent",
        borderLeftColor: isSelected ? "var(--uv-row-indicator)" : "transparent",
      }}
      onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = "var(--uv-row-hover)"; e.currentTarget.style.borderLeftColor = "var(--uv-brand-border)" } }}
      onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderLeftColor = "transparent" } }}
    >
      {/* dot */}
      <span
        className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-200"
        style={{
          background: "var(--uv-brand)",
          opacity: isSelected ? 1 : 0.35,
          boxShadow: isSelected ? "0 0 6px 2px rgba(192,38,211,0.35)" : "none",
        }}
      />

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold leading-snug line-clamp-2 transition-colors"
            style={{ color: isSelected ? "var(--uv-text-primary)" : "var(--uv-text-muted)" }}>
            {blog.title}
          </p>
          <span className="text-[10px] shrink-0 mt-0.5" style={{ color: "var(--uv-text-faint)" }}>
            {new Date(blog.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>

        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          {blog.theme && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full border shrink-0"
              style={{ background: "var(--uv-badge-bg)", color: "var(--uv-badge-text)", borderColor: "var(--uv-badge-border)" }}>
              {blog.theme}
            </span>
          )}
          {blog.des && (
            <span className="text-[10px] truncate flex-1 min-w-0" style={{ color: "var(--uv-text-faint)" }}>
              {blog.des}
            </span>
          )}
        </div>

        {blog.views > 0 && (
          <p className="flex items-center gap-1 text-[10px] transition-colors" style={{ color: "var(--uv-text-faint)" }}>
            <Eye className="w-3 h-3" />{blog.views} view{blog.views !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <ChevronRight
        className="w-3.5 h-3.5 shrink-0 mt-0.5 transition-all"
        style={{ color: isSelected ? "var(--uv-brand)" : "var(--uv-text-faint)" }}
      />
    </button>
  )
}

// ── Detail pane ───────────────────────────────────────────────────────────────
function BlogDetailPane({ blog, onDelete, onUpdate, actionLoading }) {
  return (
    <div className="h-full flex flex-col">

      {/* header */}
      <div className="px-6 pt-6 pb-5 shrink-0" style={{ borderBottom: "1px solid var(--uv-header-border)" }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2.5">
            {blog.theme && (
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border"
                style={{ background: "var(--uv-badge-bg)", color: "var(--uv-badge-text)", borderColor: "var(--uv-badge-border)" }}>
                <Tag className="w-3 h-3" />{blog.theme}
              </span>
            )}
            <h2 className="text-xl font-bold leading-snug" style={{ color: "var(--uv-text-primary)" }}>
              {blog.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--uv-text-muted)" }}>
                <Clock className="w-3 h-3" />
                {new Date(blog.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
              {blog.views > 0 && (
                <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--uv-text-muted)" }}>
                  <Eye className="w-3 h-3" />{blog.views} view{blog.views !== 1 ? "s" : ""}
                </span>
              )}
              {blog.place && (
                <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--uv-text-muted)" }}>
                  <MapPin className="w-3 h-3" />{blog.place}
                </span>
              )}
            </div>
          </div>

          {/* actions */}
          <div className="flex items-center gap-2 shrink-0">
            <BlogEditOrg blog={blog} onUpdate={onUpdate}>
              <button
                className="h-9 px-3 rounded-lg border text-xs flex items-center gap-1.5 transition-all active:scale-[0.97]"
                style={{
                  border:  "1px solid var(--uv-border)",
                  color:   "var(--uv-text-muted)",
                  background: "transparent",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--uv-brand-border)"; e.currentTarget.style.color = "var(--uv-brand)"; e.currentTarget.style.background = "var(--uv-brand-soft)" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--uv-border)"; e.currentTarget.style.color = "var(--uv-text-muted)"; e.currentTarget.style.background = "transparent" }}
              >
                <Edit className="w-3.5 h-3.5" />Edit
              </button>
            </BlogEditOrg>

            <button
              onClick={onDelete}
              disabled={actionLoading}
              className="h-9 px-4 rounded-lg text-xs font-medium flex items-center gap-2 transition-all active:scale-[0.97] text-white disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, rgba(219,39,119,0.70), rgba(192,38,211,0.70))" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              <Trash2 className="w-3.5 h-3.5" />Delete
            </button>
          </div>
        </div>
      </div>

      {/* body */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-6 py-5 space-y-6">
          {blog.des && (
            <DetailBlock icon={<FileText className="w-3.5 h-3.5" />} label="Description">
              <p className="text-sm leading-relaxed" style={{ color: "var(--uv-detail-text)" }}>{blog.des}</p>
            </DetailBlock>
          )}
          {blog.author && (
            <DetailBlock icon={<Hash className="w-3.5 h-3.5" />} label="Author">
              <p className="text-sm" style={{ color: "var(--uv-detail-text)" }}>{blog.author}</p>
            </DetailBlock>
          )}
          {blog.date && (
            <DetailBlock icon={<Calendar className="w-3.5 h-3.5" />} label="Date">
              <p className="text-sm" style={{ color: "var(--uv-detail-text)" }}>
                {new Date(blog.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </DetailBlock>
          )}
          {blog.hackathon?.length > 0 && (
            <DetailBlock icon={<Link2 className="w-3.5 h-3.5" />} label="Related Hackathon(s)">
              <div className="flex flex-wrap gap-1.5">
                {blog.hackathon.map((h, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full border"
                    style={{ background: "var(--uv-badge-bg)", color: "var(--uv-badge-text)", borderColor: "var(--uv-badge-border)" }}>
                    {h}
                  </span>
                ))}
              </div>
            </DetailBlock>
          )}
          {blog.link && (
            <DetailBlock icon={<ExternalLink className="w-3.5 h-3.5" />} label="Link">
              <a href={blog.link} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm hover:underline underline-offset-2 break-all"
                style={{ color: "var(--uv-detail-link)" }}>
                {blog.link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
              </a>
            </DetailBlock>
          )}
          {blog.content && (
            <DetailBlock icon={<FileText className="w-3.5 h-3.5" />} label="Content">
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--uv-detail-text)" }}>
                {blog.content}
              </p>
            </DetailBlock>
          )}
          <div className="pt-1 pb-2">
            <p className="flex items-center gap-1.5 text-[11px] font-mono transition-colors cursor-text select-all"
              style={{ color: "var(--uv-detail-id)" }}>
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
      <p className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-2"
        style={{ color: "var(--uv-detail-label)" }}>
        <span style={{ color: "var(--uv-detail-icon)" }}>{icon}</span>{label}
      </p>
      {children}
    </div>
  )
}