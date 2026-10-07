"use client"

import { useEffect, useState } from "react"
import { Download, Wand2, Loader2, Bookmark, BookmarkCheck, RefreshCw, X, Maximize2 } from "lucide-react"
import PosterViewer from "./poster-viewer"

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

// Shared button looks. `enabled:` keeps hover effects off disabled buttons.
const GRADIENT = "linear-gradient(135deg, rgb(var(--accent-500)), rgb(var(--brand-500)))"
const outlineBtn =
  "cursor-pointer border border-[rgb(var(--surface-border)/0.5)] text-[rgb(var(--text-muted))] " +
  "enabled:hover:text-[rgb(var(--text-primary))] enabled:hover:border-[rgb(var(--brand-500)/0.6)] " +
  "enabled:hover:bg-[rgb(var(--brand-500)/0.08)] disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
const ghostBtn =
  "cursor-pointer p-2 rounded-lg text-[rgb(var(--text-muted))] enabled:hover:text-[rgb(var(--text-primary))] " +
  "enabled:hover:bg-[rgb(var(--brand-500)/0.12)] disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
const primaryBtn =
  "cursor-pointer text-white enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 transition"

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
          <button type="button" onClick={onClose} disabled={working} aria-label="Close" className={ghostBtn}>
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
              className={`text-[11px] px-2.5 py-1 rounded-full ${outlineBtn}`}
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
            <button type="button" onClick={onClose} disabled={working} className={`h-9 px-4 rounded-lg text-sm ${outlineBtn}`}>
              Cancel
            </button>
            <button
              type="button" onClick={submit} disabled={!instruction.trim() || working}
              className={`flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium ${primaryBtn}`}
              style={{ background: GRADIENT }}
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
  const [fullKey, setFullKey] = useState(null)
  const hasResults = results.length > 0
  const placeholderRatio = RATIO_CLASS[aspectRatio] ?? "aspect-[2/3]"

  const tweakIndex = results.findIndex((r) => r.key === tweakKey)
  const tweakResult = tweakIndex >= 0 ? results[tweakIndex] : null
  const fullIndex = results.findIndex((r) => r.key === fullKey)
  const fullResult = fullIndex >= 0 ? results[fullIndex] : null

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
                    className={`group relative ${RATIO_CLASS[r.ratio] ?? "aspect-[2/3]"} w-full rounded-xl overflow-hidden`}
                    style={{
                      border: saved ? "2px solid rgb(var(--brand-500))" : "1px solid rgb(var(--surface-border) / 0.4)",
                      background: "rgb(var(--surface))",
                    }}
                  >
                    <img
                      src={r.image}
                      alt={`Generated poster ${index + 1}`}
                      className="w-full h-full object-cover cursor-zoom-in"
                      onClick={() => setFullKey(r.key)}
                    />
                    <button
                      type="button"
                      onClick={() => setFullKey(r.key)}
                      aria-label={`View poster ${index + 1} full screen`}
                      title="Full screen"
                      className="absolute top-2 right-2 p-2 rounded-lg text-white cursor-pointer bg-black/50 hover:bg-black/80 transition-colors"
                    >
                      <Maximize2 size={14} />
                    </button>
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
                      className={`flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium ${
                        saved
                          ? "cursor-pointer border border-[rgb(var(--brand-500)/0.5)] bg-[rgb(var(--brand-500)/0.1)] text-[rgb(var(--brand-400))] enabled:hover:bg-[rgb(var(--brand-500)/0.2)] disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                          : outlineBtn
                      }`}
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
                      className={`flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium ${outlineBtn}`}
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
                        className={ghostBtn}
                      >
                        <RefreshCw size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => download(r.image, index)}
                        disabled={busy}
                        aria-label={`Download poster ${index + 1}`}
                        title="Save image to your device"
                        className={ghostBtn}
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

      {fullResult && (
        <PosterViewer
          src={fullResult.image}
          alt={`Poster ${fullIndex + 1}`}
          onClose={() => setFullKey(null)}
          onDownload={() => download(fullResult.image, fullIndex)}
        />
      )}
    </div>
  )
}