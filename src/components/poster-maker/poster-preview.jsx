"use client"

import { useEffect, useState } from "react"
import { Download, Wand2, Loader2, Bookmark, BookmarkCheck, RefreshCw, X } from "lucide-react"

const RATIO_CLASS = {
  "1:1": "aspect-square",
  "2:3": "aspect-[2/3]",
  "3:4": "aspect-[3/4]",
  "4:5": "aspect-[4/5]",
  "16:9": "aspect-video",
  "9:16": "aspect-[9/16]",
}

const SUGGESTIONS = ["Make the title bigger", "Darker background", "Make the logo smaller", "Add more glow"]

const BUSY_LABEL = { tweak: "Applying change…", regenerate: "Regenerating…" }

const iconBtn = "p-2 rounded-lg disabled:opacity-40 transition-colors"
const iconBtnStyle = { color: "rgb(var(--text-muted))" }

function download(image, index) {
  if (!image) return
  const a = document.createElement("a")
  a.href = image
  a.download = `poster-${index + 1}-${Date.now()}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function TweakDialog({ result, index, onClose, onApply }) {
  const [instruction, setInstruction] = useState("")
  const working = result.busy === "tweak"

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && !working) onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [working, onClose])

  const submit = async () => {
    const text = instruction.trim()
    if (!text || working) return
    const ok = await onApply(result.key, text)
    if (ok) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={() => !working && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Tweak poster ${index + 1}`}
        className="w-full max-w-lg rounded-2xl p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        style={{
          background: "rgb(var(--bg-base))",
          border: "1px solid rgb(var(--surface-border) / 0.5)",
          boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold" style={{ color: "rgb(var(--text-primary))" }}>
              Tweak poster {index + 1}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-faint))" }}>
              Describe one small change. The rest of the poster stays the same.
            </p>
          </div>
          <button
            type="button" onClick={onClose} disabled={working} aria-label="Close"
            className="p-1.5 rounded-lg disabled:opacity-40" style={{ color: "rgb(var(--text-faint))" }}
          >
            <X size={14} />
          </button>
        </div>

        <img
          src={result.image}
          alt={`Poster ${index + 1} being tweaked`}
          className="max-h-48 w-auto self-center rounded-lg object-contain"
        />

        <textarea
          autoFocus
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit() }}
          disabled={working}
          rows={3}
          maxLength={300}
          placeholder="e.g. Make the venue text easier to read"
          className="w-full rounded-lg p-3 text-sm outline-none resize-none bg-transparent disabled:opacity-50"
          style={{ border: "1px solid rgb(var(--surface-border) / 0.5)", color: "rgb(var(--text-primary))" }}
        />

        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s} type="button" disabled={working} onClick={() => setInstruction(s)}
              className="text-[11px] px-2.5 py-1 rounded-full disabled:opacity-40"
              style={{ border: "1px solid rgb(var(--surface-border) / 0.5)", color: "rgb(var(--text-muted))" }}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px]" style={{ color: "rgb(var(--text-faint))" }}>
            {instruction.length}/300
          </span>
          <div className="flex gap-2">
            <button
              type="button" onClick={onClose} disabled={working}
              className="h-9 px-4 rounded-lg text-sm disabled:opacity-40"
              style={{ border: "1px solid rgb(var(--surface-border) / 0.5)", color: "rgb(var(--text-muted))" }}
            >
              Cancel
            </button>
            <button
              type="button" onClick={submit} disabled={!instruction.trim() || working}
              className="flex items-center gap-2 h-9 px-4 rounded-lg text-white text-sm font-medium disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, rgb(var(--accent-500)), rgb(var(--brand-500)))" }}
            >
              {working ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
              Apply change
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PosterPreview({
  results = [], isLoading, prompt, aspectRatio,
  onToggleSave, onRegenerate, onTweak,
}) {
  const [tweakKey, setTweakKey] = useState(null)
  const hasResults = results.length > 0
  const placeholderRatio = RATIO_CLASS[aspectRatio] ?? "aspect-[2/3]"

  const tweakIndex = results.findIndex((r) => r.key === tweakKey)
  const tweakResult = tweakIndex >= 0 ? results[tweakIndex] : null

  // Show placeholders while generating a fresh batch, or before the first one.
  const showPlaceholders = !hasResults || isLoading

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {showPlaceholders
          ? [0, 1, 2].map((i) => (
              <div
                key={i}
                className={`relative ${placeholderRatio} w-full rounded-xl overflow-hidden`}
                style={{ border: "1px solid rgb(var(--surface-border) / 0.4)", background: "rgb(var(--surface))" }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center p-4">
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" style={{ color: "rgb(var(--brand-500))" }} />
                      <p className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>Generating {i + 1}… up to 40s</p>
                    </>
                  ) : (
                    <p className="text-xs" style={{ color: "rgb(var(--text-faint))" }}>Poster {i + 1}: fill the form and generate</p>
                  )}
                </div>
              </div>
            ))
          : results.map((r, index) => {
              const saved = !!r.savedId
              const busy = !!r.busy
              const overlayText = BUSY_LABEL[r.busy]
              return (
                <div key={r.key} className="flex flex-col gap-2">
                  <div
                    className={`relative ${RATIO_CLASS[r.ratio] ?? "aspect-[2/3]"} w-full rounded-xl overflow-hidden`}
                    style={{
                      border: saved ? "2px solid rgb(var(--brand-500))" : "1px solid rgb(var(--surface-border) / 0.4)",
                      background: "rgb(var(--surface))",
                    }}
                  >
                    <img src={r.image} alt={`Generated poster ${index + 1}`} className="w-full h-full object-cover" />
                    {overlayText && (
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                        style={{ background: "rgba(0,0,0,0.6)" }}
                      >
                        <Loader2 size={20} className="animate-spin text-white" />
                        <p className="text-xs text-white">{overlayText}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onToggleSave?.(r.key)}
                      disabled={busy}
                      aria-pressed={saved}
                      className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium disabled:opacity-40 transition-colors"
                      style={{
                        border: "1px solid rgb(var(--surface-border) / 0.5)",
                        color: saved ? "rgb(var(--brand-400))" : "rgb(var(--text-muted))",
                        background: saved ? "rgb(var(--brand-500) / 0.1)" : "transparent",
                      }}
                    >
                      {r.busy === "save"
                        ? <Loader2 size={14} className="animate-spin" />
                        : saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                      {saved ? "Bookmarked" : "Bookmark"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setTweakKey(r.key)}
                      disabled={busy}
                      className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium disabled:opacity-40"
                      style={{ border: "1px solid rgb(var(--surface-border) / 0.5)", color: "rgb(var(--text-muted))" }}
                    >
                      <Wand2 size={14} /> Tweak
                    </button>

                    <div className="ml-auto flex items-center">
                      <button
                        type="button"
                        onClick={() => onRegenerate?.(r.key)}
                        disabled={busy}
                        aria-label={`Regenerate poster ${index + 1}`}
                        title="Regenerate this poster"
                        className={iconBtn}
                        style={iconBtnStyle}
                      >
                        <RefreshCw size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => download(r.image, index)}
                        disabled={busy}
                        aria-label={`Download poster ${index + 1}`}
                        title="Save image to your device"
                        className={iconBtn}
                        style={iconBtnStyle}
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
      </div>

      {hasResults && !isLoading && (
        <p className="text-xs" style={{ color: "rgb(var(--text-faint))" }}>
          Bookmark a poster to keep it in your history. Unbookmarked posters are lost when you generate again.
        </p>
      )}

      {prompt && !isLoading && (
        <details className="text-xs" style={{ color: "rgb(var(--text-faint))" }}>
          <summary className="cursor-pointer select-none font-medium py-2">View AI prompt used</summary>
          <p className="mt-2 p-3 rounded-lg leading-relaxed" style={{ background: "rgb(var(--surface))", color: "rgb(var(--text-secondary))" }}>
            {prompt}
          </p>
        </details>
      )}

      {tweakResult && (
        <TweakDialog
          result={tweakResult}
          index={tweakIndex}
          onClose={() => setTweakKey(null)}
          onApply={onTweak}
        />
      )}
    </div>
  )
}