"use client"

import { useEffect, useState } from "react"
import { Download, Wand2, Loader2 } from "lucide-react"

const RATIO_CLASS = {
  "1:1": "aspect-square",
  "2:3": "aspect-[2/3]",
  "3:4": "aspect-[3/4]",
  "4:5": "aspect-[4/5]",
  "16:9": "aspect-video",
  "9:16": "aspect-[9/16]",
}

const SUGGESTIONS = ["Make the title bigger", "Darker background", "Move logo slightly smaller", "Add more glow"]

export default function PosterPreview({ images = [], ids = [], isLoading, prompt, aspectRatio, onModify }) {
  const ratioClass = RATIO_CLASS[aspectRatio] ?? "aspect-[2/3]"
  const [selected, setSelected] = useState(0)
  const [instruction, setInstruction] = useState("")

  const hasImages = images.length > 0
  const slots = hasImages ? images : isLoading ? [null, null, null] : [null, null, null]
  const selectedId = ids[selected] ?? null
  const canModify = hasImages && selectedId && onModify

  // New results arrive at index 0 after a modify, so keep that one selected.
  useEffect(() => { setSelected(0) }, [images.length, images[0]])

  const download = (image, index) => {
    if (!image) return
    const a = document.createElement("a")
    a.href = image
    a.download = `poster-${index + 1}-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const submit = async () => {
    if (!canModify || !instruction.trim() || isLoading) return
    const ok = await onModify(selectedId, instruction.trim())
    if (ok) setInstruction("")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {slots.map((image, index) => {
          const active = hasImages && index === selected
          return (
            <div
              key={index}
              role={image ? "button" : undefined}
              tabIndex={image ? 0 : undefined}
              onClick={() => image && setSelected(index)}
              onKeyDown={(e) => image && e.key === "Enter" && setSelected(index)}
              className={`relative ${ratioClass} w-full rounded-xl overflow-hidden group transition-all duration-200 ${image ? "cursor-pointer" : ""}`}
              style={{
                border: active ? "2px solid rgb(var(--brand-500))" : "1px solid rgb(var(--surface-border) / 0.4)",
                background: "rgb(var(--surface))",
              }}
            >
              {image ? (
                <>
                  <img src={image} alt={`Generated poster ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => { e.stopPropagation(); download(image, index) }}
                    aria-label={`Download poster ${index + 1}`}
                    className="absolute bottom-2 right-2 p-2 rounded-lg text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    style={{ background: "rgba(0,0,0,0.6)" }}
                  >
                    <Download size={14} />
                  </button>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center p-4">
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" style={{ color: "rgb(var(--brand-500))" }} />
                      <p className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>Generating {index + 1}… up to 40s</p>
                    </>
                  ) : (
                    <p className="text-xs" style={{ color: "rgb(var(--text-faint))" }}>Poster {index + 1}: fill the form and generate</p>
                  )}
                </div>
              )}

              {isLoading && image && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)" }}>
                  <Loader2 size={20} className="animate-spin text-white" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modify the selected poster */}
      {hasImages && (
        <div className="rounded-xl p-4 space-y-3" style={{ border: "1px solid rgb(var(--surface-border) / 0.4)", background: "rgb(var(--surface))" }}>
          <div>
            <p className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
              Adjust poster {selected + 1}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-faint))" }}>
              {canModify
                ? "Describe one small change. The rest of the poster stays the same."
                : "This poster wasn't saved, so it can't be adjusted. Generate again to enable edits."}
            </p>
          </div>

          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit() }}
            disabled={!canModify || isLoading}
            rows={2}
            maxLength={300}
            placeholder="e.g. Make the venue text easier to read"
            className="w-full rounded-lg p-3 text-sm outline-none resize-none bg-transparent disabled:opacity-50"
            style={{ border: "1px solid rgb(var(--surface-border) / 0.5)", color: "rgb(var(--text-primary))" }}
          />

          <div className="flex flex-wrap items-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                disabled={!canModify || isLoading}
                onClick={() => setInstruction(s)}
                className="text-[11px] px-2.5 py-1 rounded-full disabled:opacity-40"
                style={{ border: "1px solid rgb(var(--surface-border) / 0.5)", color: "rgb(var(--text-muted))" }}
              >
                {s}
              </button>
            ))}
            <button
              type="button"
              onClick={submit}
              disabled={!canModify || !instruction.trim() || isLoading}
              className="ml-auto flex items-center gap-2 h-9 px-4 rounded-lg text-white text-sm font-medium disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, rgb(var(--accent-500)), rgb(var(--brand-500)))" }}
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
              Apply change
            </button>
          </div>
        </div>
      )}

      {prompt && !isLoading && (
        <details className="text-xs" style={{ color: "rgb(var(--text-faint))" }}>
          <summary className="cursor-pointer select-none font-medium py-2">View AI prompt used</summary>
          <p className="mt-2 p-3 rounded-lg leading-relaxed" style={{ background: "rgb(var(--surface))", color: "rgb(var(--text-secondary))" }}>
            {prompt}
          </p>
        </details>
      )}
    </div>
  )
}