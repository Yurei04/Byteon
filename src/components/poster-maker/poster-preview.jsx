// components/poster-maker/PosterPreview.jsx
"use client"

const RATIO_CLASS = {
  "1:1":  "aspect-square",
  "2:3":  "aspect-[2/3]",
  "3:4":  "aspect-[3/4]",
  "4:5":  "aspect-[4/5]",
  "16:9": "aspect-video",
  "9:16": "aspect-[9/16]",
}

export default function PosterPreview({ image, isLoading, prompt, aspectRatio }) {
  const ratioClass = RATIO_CLASS[aspectRatio] ?? "aspect-[2/3]"

  const download = () => {
    if (!image) return

    // image is base64 data URL — download directly, no CORS issue
    const a = document.createElement("a")
    a.href = image
    a.download = `poster-${Date.now()}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Preview */}
      <div className={`
        relative ${ratioClass} w-full max-w-sm mx-auto
        rounded-2xl overflow-hidden
        border border-zinc-700/50 bg-zinc-900
        shadow-[0_8px_32px_rgba(0,0,0,0.5)]
      `}>
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 gap-4 z-10">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-fuchsia-900/30" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-fuchsia-500 animate-spin" />
              <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-pink-400 animate-spin [animation-duration:0.7s]" />
            </div>
            <div className="text-center px-4">
              <p className="text-sm font-medium text-zinc-300">Generating your poster…</p>
              <p className="text-xs text-zinc-600 mt-1">Fetching from AI — takes 10–40 seconds</p>
            </div>
          </div>
        )}

        {image && !isLoading ? (
          <img
            src={image}
            alt="Generated poster"
            className="w-full h-full object-cover"
          />
        ) : !isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="3" y="3" width="22" height="22" rx="4" stroke="#52525b" strokeWidth="1.5"/>
                <circle cx="10" cy="10" r="2.5" stroke="#71717a" strokeWidth="1.5"/>
                <path d="M3 19l6-5 4 4 4-4 8 7" stroke="#71717a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Your poster appears here</p>
              <p className="text-xs text-zinc-600 mt-1">Fill the form and click Generate</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Actions */}
      {image && !isLoading && (
        <div className="flex gap-2 justify-center">
          <button
            onClick={download}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white text-sm font-medium transition-all shadow-[0_0_16px_rgba(217,70,239,0.3)] hover:shadow-[0_0_24px_rgba(217,70,239,0.5)]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download
          </button>
        </div>
      )}

      {/* Prompt used */}
      {prompt && !isLoading && (
        <details className="text-xs text-zinc-600 cursor-pointer group">
          <summary className="hover:text-zinc-400 transition-colors select-none">View AI prompt used</summary>
          <p className="mt-2 p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-500 leading-relaxed">{prompt}</p>
        </details>
      )}
    </div>
  )
}