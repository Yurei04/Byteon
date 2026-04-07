"use client"

// poster-canvas.jsx
// Receives the AI background image (base64 dataUrl) + parsed formData from the route.
// Composites event text on top using the Canvas API — zero AI hallucination possible.

import { useEffect, useRef, useState, useCallback } from "react"
import { Download, RefreshCw, Loader2 } from "lucide-react"

const FONT_MAP = {
  "serif elegant":      "Georgia, 'Times New Roman', serif",
  "sans-serif modern":  "Arial, Helvetica, sans-serif",
  "display bold":       "Impact, 'Arial Black', sans-serif",
  "handwritten script": "'Palatino Linotype', Georgia, serif",
  "monospace":          "'Courier New', Courier, monospace",
  "condensed tall":     "'Arial Narrow', Arial, sans-serif",
}

const PLACEMENT_MAP = {
  "top-left":      { x: 0.05, y: 0.04, align: "left"   },
  "top-center":    { x: 0.50, y: 0.04, align: "center" },
  "top-right":     { x: 0.95, y: 0.04, align: "right"  },
  "middle-left":   { x: 0.05, y: 0.38, align: "left"   },
  "center":        { x: 0.50, y: 0.38, align: "center" },
  "middle-right":  { x: 0.95, y: 0.38, align: "right"  },
  "bottom-left":   { x: 0.05, y: 0.72, align: "left"   },
  "bottom-center": { x: 0.50, y: 0.72, align: "center" },
  "bottom-right":  { x: 0.95, y: 0.72, align: "right"  },
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ")
  const lines = []
  let current = ""
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

function drawTextLine(ctx, text, x, y, { color = "#FFFFFF", shadow = true } = {}) {
  if (shadow) {
    ctx.shadowColor = "rgba(0,0,0,0.85)"
    ctx.shadowBlur = 18
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
  }
  ctx.fillStyle = color
  ctx.fillText(text, x, y)
  ctx.shadowColor = "transparent"
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
}

function drawDivider(ctx, x, y, width, align) {
  const len = width * 0.25
  const sx = align === "center" ? x - len / 2 : align === "right" ? x - len : x
  ctx.save()
  ctx.globalAlpha = 0.45
  ctx.strokeStyle = "#FFFFFF"
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(sx, y)
  ctx.lineTo(sx + len, y)
  ctx.stroke()
  ctx.restore()
}

function compositeText(canvas, img, formData) {
  const ctx = canvas.getContext("2d")
  const W = canvas.width
  const H = canvas.height

  ctx.drawImage(img, 0, 0, W, H)

  const {
    title, subtitle,
    eventDate, venue, prizePool, organizer,
    showDate, showVenue, showPrize,
    titlePlacement, fontStyle,
  } = formData

  const placement  = PLACEMENT_MAP[titlePlacement] ?? PLACEMENT_MAP["top-center"]
  const fontFamily = FONT_MAP[fontStyle] ?? FONT_MAP["display bold"]
  const { x: xN, y: yN, align } = placement

  const anchorX  = xN * W
  let   cursorY  = yN * H
  const maxWidth = W * 0.88
  const lineGap  = H * 0.012

  ctx.textAlign    = align
  ctx.textBaseline = "top"

  if (title) {
    const titleSize = Math.round(W * 0.085)
    ctx.font = `900 ${titleSize}px ${fontFamily}`
    for (const line of wrapText(ctx, title.toUpperCase(), maxWidth)) {
      drawTextLine(ctx, line, anchorX, cursorY)
      cursorY += titleSize + lineGap
    }
    cursorY += lineGap * 0.5
  }

  if (title && (subtitle || showDate || showVenue || showPrize)) {
    drawDivider(ctx, anchorX, cursorY + 4, W, align)
    cursorY += H * 0.022
  }

  if (subtitle) {
    const subSize = Math.round(W * 0.036)
    ctx.font = `400 ${subSize}px ${fontFamily}`
    for (const line of wrapText(ctx, subtitle, maxWidth)) {
      drawTextLine(ctx, line, anchorX, cursorY, { color: "rgba(255,255,255,0.88)" })
      cursorY += subSize + lineGap
    }
    cursorY += lineGap * 1.2
  }

  const details = [
    showDate  && eventDate  ? eventDate          : null,
    showVenue && venue      ? venue              : null,
    showPrize && prizePool  ? `🏆 ${prizePool}` : null,
  ].filter(Boolean)

  if (details.length > 0) {
    const detailSize = Math.round(W * 0.028)
    ctx.font = `600 ${detailSize}px ${fontFamily}`
    for (const line of wrapText(ctx, details.join("   ·   "), maxWidth)) {
      drawTextLine(ctx, line, anchorX, cursorY, { color: "rgba(255,255,255,0.78)" })
      cursorY += detailSize + lineGap
    }
    cursorY += lineGap
  }

  if (organizer) {
    const orgSize = Math.round(W * 0.022)
    ctx.font = `400 ${orgSize}px ${fontFamily}`
    drawTextLine(ctx, `presented by ${organizer}`, anchorX, cursorY, { color: "rgba(255,255,255,0.52)" })
  }
}

export default function PosterCanvas({ imageDataUrl, formData, onRegenerate, isLoading }) {
  const canvasRef         = useRef(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  const render = useCallback(() => {
    if (!imageDataUrl || !canvasRef.current) return
    setReady(false)
    setError(null)

    const img = new Image()
    img.onload = () => {
      const canvas  = canvasRef.current
      canvas.width  = img.naturalWidth
      canvas.height = img.naturalHeight
      try {
        compositeText(canvas, img, formData)
        setReady(true)
      } catch (err) {
        setError("Failed to composite text onto image.")
        console.error("[PosterCanvas]", err)
      }
    }
    img.onerror = () => setError("Failed to load background image.")
    img.src = imageDataUrl
  }, [imageDataUrl, formData])

  useEffect(() => { render() }, [render])

  const handleDownload = () => {
    if (!canvasRef.current || !ready) return
    const link    = document.createElement("a")
    link.download = `poster-${Date.now()}.png`
    link.href     = canvasRef.current.toDataURL("image/png")
    link.click()
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl overflow-hidden border border-zinc-800/60 bg-zinc-900/40">
        <canvas ref={canvasRef} className="w-full h-auto block" style={{ display: ready ? "block" : "none" }} />

        {!ready && !error && (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <Loader2 size={22} className="text-fuchsia-400 animate-spin" />
            <p className="text-xs text-zinc-500">Compositing text…</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center gap-2 py-20">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onRegenerate} disabled={isLoading}
          className="flex-1 h-11 rounded-xl border border-zinc-700/50 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          {isLoading ? "Generating…" : "Regenerate"}
        </button>

        <button type="button" onClick={handleDownload} disabled={!ready}
          className="flex-1 h-11 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_0_18px_rgba(217,70,239,0.3)] hover:shadow-[0_0_26px_rgba(217,70,239,0.4)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
          <Download size={14} />
          Download PNG
        </button>
      </div>
    </div>
  )
}