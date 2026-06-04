"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return "just now"
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const RATIO_CLASS = {
  "1:1":  "aspect-square",
  "2:3":  "aspect-[2/3]",
  "3:4":  "aspect-[3/4]",
  "4:5":  "aspect-[4/5]",
  "16:9": "aspect-video",
  "9:16": "aspect-[9/16]",
}

export default function PosterHistory({ refreshTrigger }) {
  const [posters,  setPosters]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [selected, setSelected] = useState(null)

  const fetchPosters = async () => {
    setLoading(true)
    try {
      const res  = await fetch("/api/poster-history")
      const data = await res.json()
      setPosters(data.posters ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPosters() }, [refreshTrigger])

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    setDeleting(id)
    try {
      await fetch("/api/poster-history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      setPosters((prev) => prev.filter((p) => p.id !== id))
      if (selected?.id === id) setSelected(null)
    } finally {
      setDeleting(null)
    }
  }

  const download = (url, title) => {
    const a = document.createElement("a")
    a.href = url
    a.download = `${title || "poster"}.jpg`
    a.target = "_blank"
    a.click()
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[2/3] rounded-xl animate-pulse"
            style={{ background: "rgb(var(--surface-raised))" }}
          />
        ))}
      </div>
    )
  }

  if (posters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: "rgb(var(--surface-raised))",
            border: "1px solid rgb(var(--surface-border) / 0.5)",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="3" y="3" width="22" height="22" rx="4" stroke="rgb(var(--text-faint))" strokeWidth="1.5"/>
            <circle cx="10" cy="10" r="2.5" stroke="rgb(var(--text-muted))" strokeWidth="1.5"/>
            <path d="M3 19l6-5 4 4 4-4 8 7" stroke="rgb(var(--text-muted))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: "rgb(var(--text-muted))" }}>
            No posters yet
          </p>
          <p className="text-xs mt-1" style={{ color: "rgb(var(--text-faint))" }}>
            Generate your first poster to see it here
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Gallery grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {posters.map((poster) => (
          <div
            key={poster.id}
            onClick={() => setSelected(poster)}
            className="group relative cursor-pointer rounded-xl overflow-hidden transition-all duration-200"
            style={{
              border: "1px solid rgb(var(--surface-border) / 0.4)",
              background: "rgb(var(--surface))",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgb(var(--brand-500) / 0.4)"
              e.currentTarget.style.boxShadow   = "0 0 16px rgb(var(--brand-500) / 0.15)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgb(var(--surface-border) / 0.4)"
              e.currentTarget.style.boxShadow   = "none"
            }}
          >
            <div className={`${RATIO_CLASS[poster.aspect_ratio] ?? "aspect-[2/3]"} relative`}>
              <img
                src={poster.image_url}
                alt={poster.title || "Generated poster"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="absolute bottom-0 left-0 right-0 p-2.5 flex items-end justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {poster.title && (
                      <p className="text-xs font-semibold text-white truncate leading-tight">
                        {poster.title}
                      </p>
                    )}
                    <p className="text-[10px] mt-0.5" style={{ color: "rgb(var(--text-muted))" }}>
                      {timeAgo(poster.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(poster.id, e)}
                    disabled={deleting === poster.id}
                    className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
                    style={{
                      background: "rgba(239,68,68,0.15)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: "#f87171",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.3)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}
                  >
                    {deleting === poster.id
                      ? <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                      : <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 2.5h7M4 2.5V2a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v.5M4 4.5v2.5M6 4.5v2.5M2 2.5l.5 6a.5.5 0 00.5.5h3a.5.5 0 00.5-.5L7 2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    }
                  </button>
                </div>
              </div>
            </div>

            {/* Style badge */}
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {poster.style && (
                <span
                  className="text-[9px] font-medium px-1.5 py-0.5 rounded-md capitalize"
                  style={{
                    background: "rgb(var(--bg-base) / 0.85)",
                    border: "1px solid rgb(var(--surface-border) / 0.6)",
                    color: "rgb(var(--text-muted))",
                  }}
                >
                  {poster.style}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={() => setSelected(null)}
        >
          <div
            className="rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col lg:flex-row"
            style={{
              background: "rgb(var(--bg-base))",
              border: "1px solid rgb(var(--surface-border) / 0.5)",
              boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image panel */}
            <div
              className="lg:flex-1 flex items-center justify-center p-4 min-h-[300px]"
              style={{ background: "rgb(var(--surface))" }}
            >
              <img
                src={selected.image_url}
                alt={selected.title || "Poster"}
                className="max-h-[70vh] max-w-full rounded-xl object-contain shadow-lg"
              />
            </div>

            {/* Info panel */}
            <div
              className="w-full lg:w-72 p-5 flex flex-col gap-4"
              style={{ borderTop: "1px solid rgb(var(--surface-border) / 0.3)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3
                    className="text-sm font-bold"
                    style={{ color: "rgb(var(--text-primary))" }}
                  >
                    {selected.title || "Untitled Poster"}
                  </h3>
                  {selected.subtitle && (
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "rgb(var(--text-faint))" }}
                    >
                      {selected.subtitle}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-1.5 rounded-lg flex-shrink-0 transition-colors"
                  style={{ color: "rgb(var(--text-faint))" }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = "rgb(var(--text-primary))"
                    e.currentTarget.style.background = "rgb(var(--surface-raised))"
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = "rgb(var(--text-faint))"
                    e.currentTarget.style.background = "transparent"
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M10 3L3 10M3 3l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                {selected.style && (
                  <Badge
                    variant="outline"
                    className="text-[10px] capitalize"
                    style={{
                      borderColor: "rgb(var(--surface-border))",
                      color: "rgb(var(--text-muted))",
                    }}
                  >
                    {selected.style}
                  </Badge>
                )}
                {selected.aspect_ratio && (
                  <Badge
                    variant="outline"
                    className="text-[10px]"
                    style={{
                      borderColor: "rgb(var(--surface-border))",
                      color: "rgb(var(--text-muted))",
                    }}
                  >
                    {selected.aspect_ratio}
                  </Badge>
                )}
                {selected.color_scheme && (
                  <Badge
                    variant="outline"
                    className="text-[10px] max-w-[140px] truncate"
                    style={{
                      borderColor: "rgb(var(--brand-500) / 0.4)",
                      color: "rgb(var(--brand-400))",
                      background: "rgb(var(--brand-500) / 0.08)",
                    }}
                  >
                    {selected.color_scheme}
                  </Badge>
                )}
              </div>

              {/* Date */}
              <div className="text-xs" style={{ color: "rgb(var(--text-faint))" }}>
                <p
                  className="uppercase tracking-wide text-[10px] mb-1"
                  style={{ color: "rgb(var(--text-faint))" }}
                >
                  Generated
                </p>
                <p style={{ color: "rgb(var(--text-muted))" }}>
                  {new Date(selected.created_at).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>

              {/* Prompt */}
              {selected.prompt && (
                <div className="flex-1 min-h-0">
                  <p
                    className="uppercase tracking-wide text-[10px] mb-1"
                    style={{ color: "rgb(var(--text-faint))" }}
                  >
                    AI Prompt
                  </p>
                  <p
                    className="text-xs leading-relaxed line-clamp-6"
                    style={{ color: "rgb(var(--text-muted))" }}
                  >
                    {selected.prompt}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-auto">
                <Button
                  onClick={() => download(selected.image_url, selected.title)}
                  className="flex-1 h-9 text-xs font-medium rounded-lg text-white"
                  style={{
                    background: "linear-gradient(135deg, rgb(var(--accent-500)), rgb(var(--brand-500)))",
                    boxShadow: "0 0 12px rgb(var(--accent-500) / 0.3)",
                    border: "none",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="mr-1.5">
                    <path d="M6 1v7M3 5.5L6 8.5l3-3M1 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDelete(selected.id, { stopPropagation: () => {} })}
                  className="h-9 px-3 rounded-lg"
                  style={{
                    borderColor: "rgba(239,68,68,0.3)",
                    color: "#f87171",
                    background: "transparent",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1.5 3h9M4.5 3V2.5A.5.5 0 015 2h2a.5.5 0 01.5.5V3M5 5.5v3M7 5.5v3M2.5 3l.5 7.5a.5.5 0 00.5.5h5a.5.5 0 00.5-.5L9.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}