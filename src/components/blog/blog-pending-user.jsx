"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { AlertCircle, CheckCircle, Loader2, FileText, User, Tag, Camera, Clock } from "lucide-react"
import Image from "next/image"

/* ─────────────────────────────────────────────────────────────────────────────
   CSS TOKENS
───────────────────────────────────────────────────────────────────────────── */
const THEME_STYLES = `
  /* ── Light ── */
  :root {
    --pbf-bg:             rgba(253,244,255,0.70);
    --pbf-bg-raised:      rgba(255,255,255,0.80);
    --pbf-border:         rgba(192,38,211,0.20);
    --pbf-border-subtle:  rgba(192,38,211,0.12);

    --pbf-text-primary:   #1e0320;
    --pbf-text-secondary: #701976;
    --pbf-text-muted:     #a11bb0;
    --pbf-text-faint:     rgba(161,27,176,0.55);
    --pbf-text-label:     #1e0320;

    --pbf-brand:          #c026d3;
    --pbf-brand-soft:     rgba(192,38,211,0.08);

    --pbf-title-from:     #c026d3;
    --pbf-title-to:       #a855f7;

    --pbf-header-border:  rgba(192,38,211,0.15);

    --pbf-chip-bg:        rgba(192,38,211,0.10);
    --pbf-chip-border:    rgba(192,38,211,0.28);
    --pbf-chip-text:      #701976;

    --pbf-notice-bg:      rgba(245,158,11,0.08);
    --pbf-notice-border:  rgba(245,158,11,0.22);
    --pbf-notice-text:    #92400e;
    --pbf-notice-strong:  #78350f;

    --pbf-author-bg:      rgba(168,85,247,0.08);
    --pbf-author-border:  rgba(168,85,247,0.25);
    --pbf-author-label:   rgba(109,40,217,0.55);
    --pbf-author-name:    #4c1d95;
    --pbf-author-icon:    #7c3aed;

    --pbf-input-bg:       rgba(255,255,255,0.75);
    --pbf-input-border:   rgba(192,38,211,0.22);
    --pbf-input-text:     #1e0320;
    --pbf-input-placeholder: rgba(161,27,176,0.40);
    --pbf-input-focus-border: rgba(192,38,211,0.50);

    --pbf-select-bg:      rgba(255,255,255,0.90);
    --pbf-select-border:  rgba(192,38,211,0.22);
    --pbf-select-text:    #1e0320;

    --pbf-divider:        rgba(192,38,211,0.15);

    --pbf-btn-from:       #c026d3;
    --pbf-btn-to:         #a855f7;
    --pbf-btn-shadow:     rgba(192,38,211,0.30);

    --pbf-img-border:     rgba(192,38,211,0.25);
    --pbf-img-error-bg:   rgba(239,68,68,0.08);
    --pbf-img-error-border: rgba(239,68,68,0.25);
    --pbf-img-error-text: #b91c1c;
  }

  /* ── Dark ── */
  .dark {
    --pbf-bg:             rgba(20,5,30,0.70);
    --pbf-bg-raised:      rgba(255,255,255,0.03);
    --pbf-border:         rgba(168,85,247,0.30);
    --pbf-border-subtle:  rgba(168,85,247,0.18);

    --pbf-text-primary:   #fae8ff;
    --pbf-text-secondary: #e879f9;
    --pbf-text-muted:     rgba(232,121,249,0.70);
    --pbf-text-faint:     rgba(232,121,249,0.40);
    --pbf-text-label:     #f5d0fe;

    --pbf-brand:          #e879f9;
    --pbf-brand-soft:     rgba(168,85,247,0.08);

    --pbf-title-from:     #f0abfc;
    --pbf-title-to:       #c4b5fd;

    --pbf-header-border:  rgba(168,85,247,0.20);

    --pbf-chip-bg:        rgba(168,85,247,0.18);
    --pbf-chip-border:    rgba(168,85,247,0.35);
    --pbf-chip-text:      #e879f9;

    --pbf-notice-bg:      rgba(245,158,11,0.08);
    --pbf-notice-border:  rgba(245,158,11,0.22);
    --pbf-notice-text:    #fcd34d;
    --pbf-notice-strong:  #fbbf24;

    --pbf-author-bg:      rgba(168,85,247,0.10);
    --pbf-author-border:  rgba(168,85,247,0.30);
    --pbf-author-label:   rgba(216,180,254,0.50);
    --pbf-author-name:    #e879f9;
    --pbf-author-icon:    #c4b5fd;

    --pbf-input-bg:       rgba(255,255,255,0.05);
    --pbf-input-border:   rgba(168,85,247,0.30);
    --pbf-input-text:     #fae8ff;
    --pbf-input-placeholder: rgba(216,180,254,0.35);
    --pbf-input-focus-border: rgba(232,121,249,0.55);

    --pbf-select-bg:      rgba(10,0,20,0.80);
    --pbf-select-border:  rgba(168,85,247,0.30);
    --pbf-select-text:    #fae8ff;

    --pbf-divider:        rgba(168,85,247,0.20);

    --pbf-btn-from:       #c026d3;
    --pbf-btn-to:         #a855f7;
    --pbf-btn-shadow:     rgba(192,38,211,0.30);

    --pbf-img-border:     rgba(168,85,247,0.30);
    --pbf-img-error-bg:   rgba(239,68,68,0.10);
    --pbf-img-error-border: rgba(239,68,68,0.30);
    --pbf-img-error-text: #fca5a5;
  }
`

const THEME_OPTIONS = [
  "Technology","Education","Lifestyle","Business","Health & Wellness",
  "Science","Arts & Culture","Travel","Food & Cooking","Sports",
  "Gaming","Finance","Environment","Personal Development","Other"
]

// ── Shared field label ────────────────────────────────────────────────────────
function FieldLabel({ icon: Icon, children, required }) {
  return (
    <label className="text-base font-semibold flex items-center gap-2 mb-1"
      style={{ color: "var(--pbf-text-label)" }}>
      {Icon && <Icon className="w-4 h-4" style={{ color: "var(--pbf-brand)" }} />}
      {children}{required && <span style={{ color: "var(--pbf-brand)" }}> *</span>}
    </label>
  )
}

// ── Shared text input ─────────────────────────────────────────────────────────
function Field({ ...props }) {
  return (
    <input
      {...props}
      className="w-full px-3 h-12 rounded-lg text-base outline-none transition-all"
      style={{
        background:   "var(--pbf-input-bg)",
        border:       "1px solid var(--pbf-input-border)",
        color:        "var(--pbf-input-text)",
      }}
      onFocus={e => e.target.style.borderColor = "var(--pbf-input-focus-border)"}
      onBlur={e  => e.target.style.borderColor = "var(--pbf-input-border)"}
    />
  )
}

// ── Shared textarea ───────────────────────────────────────────────────────────
function Tarea({ rows = 3, ...props }) {
  return (
    <textarea
      {...props}
      rows={rows}
      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all resize-none"
      style={{
        background:   "var(--pbf-input-bg)",
        border:       "1px solid var(--pbf-input-border)",
        color:        "var(--pbf-input-text)",
      }}
      onFocus={e => e.target.style.borderColor = "var(--pbf-input-focus-border)"}
      onBlur={e  => e.target.style.borderColor = "var(--pbf-input-border)"}
    />
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────
export default function PendingBlogUserForm({ onSuccess, currentUser, authUserId, addToast }) {
  const [isLoading, setIsLoading]   = useState(false)
  const [imageError, setImageError] = useState(false)
  const [formData, setFormData]     = useState({ title: "", des: "", content: "", image: "", theme: "" })

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
        image:           formData.image.trim() || null,
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
      setFormData({ title: "", des: "", content: "", image: "", theme: "" })
      setImageError(false)
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
        <style>{THEME_STYLES}</style>
        <div className="rounded-2xl p-12 text-center"
          style={{ background: "var(--pbf-bg)", border: "1px solid var(--pbf-border)" }}>
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "var(--pbf-brand)" }} />
          <p style={{ color: "var(--pbf-text-muted)" }}>Loading user information…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <style>{THEME_STYLES}</style>

      <div className="rounded-2xl overflow-hidden backdrop-blur-xl"
        style={{ background: "var(--pbf-bg)", border: "1px solid var(--pbf-border)" }}>

        {/* Card header */}
        <div className="px-6 pt-6 pb-5 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--pbf-header-border)" }}>
          <div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, var(--pbf-title-from), var(--pbf-title-to))` }}>
              Create New Blog Post
            </h2>
            <p className="text-base mt-1" style={{ color: "var(--pbf-text-muted)" }}>
              Your post will be reviewed before going live
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{ background: "var(--pbf-chip-bg)", border: "1px solid var(--pbf-chip-border)" }}>
            <User className="w-4 h-4" style={{ color: "var(--pbf-brand)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--pbf-chip-text)" }}>
              {currentUser.name}
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="p-6 space-y-6">

          {/* Pending notice */}
          <div className="flex items-center gap-2 p-3 rounded-xl"
            style={{ background: "var(--pbf-notice-bg)", border: "1px solid var(--pbf-notice-border)" }}>
            <Clock className="w-4 h-4 shrink-0" style={{ color: "#f59e0b" }} />
            <p className="text-sm" style={{ color: "var(--pbf-notice-text)" }}>
              This blog will be <strong style={{ color: "var(--pbf-notice-strong)" }}>reviewed by the super admin</strong> before going live.
            </p>
          </div>

          {/* Author chip */}
          <div className="flex items-center gap-3 p-4 rounded-lg"
            style={{ background: "var(--pbf-author-bg)", border: "1px solid var(--pbf-author-border)" }}>
            <User className="w-5 h-5" style={{ color: "var(--pbf-author-icon)" }} />
            <div>
              <p className="text-sm" style={{ color: "var(--pbf-author-label)" }}>Submitting as</p>
              <p className="font-semibold" style={{ color: "var(--pbf-author-name)" }}>{currentUser.name}</p>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <FieldLabel icon={FileText} required>Blog Title</FieldLabel>
            <Field
              value={formData.title}
              onChange={e => set("title", e.target.value)}
              placeholder="Enter an engaging title…"
              style={{
                background: "var(--pbf-input-bg)",
                border: "1px solid var(--pbf-input-border)",
                color: "var(--pbf-input-text)",
              }}
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
              className="w-full px-3 h-10 rounded-lg text-sm outline-none transition-all appearance-none"
              style={{
                background: "var(--pbf-select-bg)",
                border:     "1px solid var(--pbf-select-border)",
                color:      formData.theme ? "var(--pbf-select-text)" : "var(--pbf-input-placeholder)",
              }}
            >
              <option value="" disabled hidden>Select a theme…</option>
              {THEME_OPTIONS.map(t => (
                <option key={t} value={t}
                  style={{ background: "var(--pbf-select-bg)", color: "var(--pbf-select-text)" }}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <FieldLabel icon={Camera}>Featured Image URL</FieldLabel>
            <input
              type="url"
              value={formData.image}
              onChange={e => { set("image", e.target.value); setImageError(false) }}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 h-10 rounded-lg text-sm outline-none transition-all"
              style={{
                background: "var(--pbf-input-bg)",
                border:     "1px solid var(--pbf-input-border)",
                color:      "var(--pbf-input-text)",
              }}
              onFocus={e => e.target.style.borderColor = "var(--pbf-input-focus-border)"}
              onBlur={e  => e.target.style.borderColor = "var(--pbf-input-border)"}
            />
            {formData.image && !imageError && (
              <div className="mt-3 rounded-lg overflow-hidden relative w-full h-48"
                style={{ border: "1px solid var(--pbf-img-border)" }}>
                <Image src={formData.image} alt="Blog preview" fill className="object-cover"
                  onError={() => setImageError(true)} />
              </div>
            )}
            {imageError && formData.image && (
              <div className="mt-3 p-4 rounded-lg flex items-center gap-2 text-sm"
                style={{ background: "var(--pbf-img-error-bg)", border: "1px solid var(--pbf-img-error-border)", color: "var(--pbf-img-error-text)" }}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                Unable to load image. Please check the URL.
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-4" style={{ borderTop: "1px solid var(--pbf-divider)" }}>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full h-14 rounded-xl text-lg font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70"
              style={{
                background:  `linear-gradient(135deg, var(--pbf-btn-from), var(--pbf-btn-to))`,
                boxShadow:   `0 4px 20px var(--pbf-btn-shadow)`,
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.90"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
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