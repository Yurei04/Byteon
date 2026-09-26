"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Loader2, FileText, User, Tag, Clock } from "lucide-react"

const THEME_OPTIONS = [
  "Technology","Education","Lifestyle","Business","Health & Wellness",
  "Science","Arts & Culture","Travel","Food & Cooking","Sports",
  "Gaming","Finance","Environment","Personal Development","Other"
]

// ── Shared field label ────────────────────────────────────────────────────────
function FieldLabel({ icon: Icon, children, required }) {
  return (
    <label className="text-base font-semibold flex items-center gap-2 mb-1 text-text-primary">
      {Icon && <Icon className="w-4 h-4 text-brand-600" />}
      {children}{required && <span className="text-brand-600"> *</span>}
    </label>
  )
}

// ── Shared text input ─────────────────────────────────────────────────────────
function Field({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-3 h-12 rounded-lg text-base outline-none transition-all
        bg-surface-raised border border-surface-border text-text-primary
        placeholder:text-text-faint
        focus:border-brand-500 ${className}`}
    />
  )
}

// ── Shared textarea ───────────────────────────────────────────────────────────
function Tarea({ rows = 3, className = "", ...props }) {
  return (
    <textarea
      {...props}
      rows={rows}
      className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all resize-none
        bg-surface-raised border border-surface-border text-text-primary
        placeholder:text-text-faint
        focus:border-brand-500 ${className}`}
    />
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────
export default function PendingBlogUserForm({ onSuccess, currentUser, authUserId, addToast }) {
  const [isLoading, setIsLoading]   = useState(false)
  const [formData, setFormData]     = useState({ title: "", des: "", content: "", theme: "" })

  const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }))

  const handleSubmit = async () => {
    if (!currentUser || !authUserId) {
      addToast("error", "User not found. Please refresh and log in again."); return
    }
    if (!formData.title || !formData.content) {
      addToast("error", "Please add a Title and Content"); return
    }
    if (!formData.theme) {
      addToast("error", "Please add a theme"); return
    }

    setIsLoading(true)
    try {
      const payload = {
        title:           formData.title.trim(),
        des:             formData.des.trim() || null,
        content:         formData.content.trim(),
        image:           null,
        theme:           formData.theme || null,
        user_id:         authUserId,
        organization_id: null,
        author:          currentUser.name || "Anonymous",
        user_name:       currentUser.name || null,
        status:          "pending",
        submitted_by:    currentUser.user_id,
      }
      const { error } = await supabase.from("pending_blogs").insert([payload])
      if (error) throw error
      addToast("success", "Submitted for approval! The super admin will review your announcement.")
      setFormData({ title: "", des: "", content: "", theme: "" })
      setTimeout(() => { if (onSuccess) onSuccess() }, 1500)
    } catch {
      addToast("error", "Submission Failed. Try Again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentUser) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="rounded-2xl p-12 text-center bg-surface border border-surface-border">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-brand-600" />
          <p className="text-text-muted">Loading user information…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="rounded-2xl overflow-hidden backdrop-blur-xl bg-surface border border-surface-border">

        {/* Card header */}
        <div className="px-6 pt-6 pb-5 flex items-center justify-between border-b border-surface-border">
          <div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-brand-600 to-accent-500">
              Create New Blog Post
            </h2>
            <p className="text-base mt-1 text-text-muted">
              Your post will be reviewed before going live
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-100 border border-brand-300">
            <User className="w-4 h-4 text-brand-600" />
            <span className="text-sm font-medium text-brand-700">
              {currentUser.name}
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="p-6 space-y-6">

          {/* Pending notice */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25">
            <Clock className="w-4 h-4 shrink-0 text-amber-500" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              This blog will be <strong className="text-amber-900 dark:text-amber-200">reviewed by the super admin</strong> before going live.
            </p>
          </div>

          {/* Author chip */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-accent-500/10 border border-accent-500/25">
            <User className="w-5 h-5 text-accent-500" />
            <div>
              <p className="text-sm text-text-muted">Submitting as</p>
              <p className="font-semibold text-text-primary">{currentUser.name}</p>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <FieldLabel icon={FileText} required>Blog Title</FieldLabel>
            <Field
              value={formData.title}
              onChange={e => set("title", e.target.value)}
              placeholder="Enter an engaging title…"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <FieldLabel>Short Description</FieldLabel>
            <Tarea
              value={formData.des}
              onChange={e => set("des", e.target.value)}
              placeholder="Brief summary…"
              rows={3}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <FieldLabel icon={FileText} required>Blog Content</FieldLabel>
            <Tarea
              value={formData.content}
              onChange={e => set("content", e.target.value)}
              placeholder="Share your story, insights, or knowledge here…"
              rows={10}
            />
          </div>

          {/* Theme select */}
          <div className="space-y-2">
            <FieldLabel icon={Tag}>Theme / Category</FieldLabel>
            <select
              value={formData.theme}
              onChange={e => set("theme", e.target.value)}
              className={`w-full px-3 h-10 rounded-lg text-sm outline-none transition-all appearance-none
                bg-surface-raised border border-surface-border
                ${formData.theme ? "text-text-primary" : "text-text-faint"}`}
            >
              <option value="" disabled hidden>Select a theme…</option>
              {THEME_OPTIONS.map(t => (
                <option key={t} value={t} className="bg-surface-raised text-text-primary">
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-surface-border">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full h-14 rounded-xl text-lg font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70 bg-gradient-to-br from-brand-600 to-accent-500 shadow-[0_4px_20px_rgba(192,38,211,0.30)] hover:opacity-90"
            >
              {isLoading
                ? <><Loader2 className="w-5 h-5 animate-spin" />Submitting…</>
                : <><Clock className="w-5 h-5" />Submit for Approval</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}