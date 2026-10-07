"use client"

import { useEffect } from "react"
import { X, Download } from "lucide-react"

// Full-screen image viewer. Esc or a click on the dark area closes it.
export default function PosterViewer({ src, alt = "Poster", onClose, onDownload }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const btn =
    "p-2.5 rounded-lg text-white cursor-pointer bg-black/50 hover:bg-white/20 transition-colors"

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-8 bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
    >
      <div className="absolute top-4 right-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
        {onDownload && (
          <button type="button" onClick={onDownload} aria-label="Download" title="Download" className={btn}>
            <Download size={18} />
          </button>
        )}
        <button type="button" onClick={onClose} aria-label="Close full screen" title="Close (Esc)" className={btn}>
          <X size={18} />
        </button>
      </div>

      <img
        src={src}
        alt={alt}
        className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}