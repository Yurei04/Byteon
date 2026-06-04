"use client"

const RATIO_CLASS = {
  "1:1":  "aspect-square",
  "2:3":  "aspect-[2/3]",
  "3:4":  "aspect-[3/4]",
  "4:5":  "aspect-[4/5]",
  "16:9": "aspect-video",
  "9:16": "aspect-[9/16]",
}

export default function PosterPreview({ images = [], isLoading, prompt, aspectRatio }) {
  const ratioClass = RATIO_CLASS[aspectRatio] ?? "aspect-[2/3]"

  const download = (image, index) => {
    if (!image) return
    const a = document.createElement("a")
    a.href = image
    a.download = `poster-${index + 1}-${Date.now()}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Poster grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(isLoading
          ? [null, null, null]
          : (images.length ? images : [null, null, null])
        ).map((image, index) => (
          <div
            key={index}
            className={`relative ${ratioClass} w-full rounded-2xl overflow-hidden`}
            style={{
              border: "1px solid rgb(var(--surface-border) / 0.4)",
              background: "rgb(var(--surface))",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            {/* Loading */}
            {isLoading ? (
              <div
                className="absolute inset-0 flex items-center justify-center gap-4 z-10"
                style={{ background: "rgb(var(--bg-base))" }}
              >
                <div className="relative w-16 h-16">
                  <div
                    className="absolute inset-0 rounded-full border-2"
                    style={{ borderColor: "rgb(var(--brand-500) / 0.2)" }}
                  />
                  <div
                    className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
                    style={{ borderTopColor: "rgb(var(--brand-500))" }}
                  />
                  <div
                    className="absolute inset-2 rounded-full border-2 border-transparent animate-spin [animation-duration:0.7s]"
                    style={{ borderTopColor: "rgb(var(--accent-400))" }}
                  />
                </div>
                <div className="text-center px-4">
                  <p
                    className="text-sm font-medium"
                    style={{ color: "rgb(var(--text-secondary))" }}
                  >
                    Generating poster {index + 1}…
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "rgb(var(--text-faint))" }}
                  >
                    Fetching from AI — takes 10–40 seconds
                  </p>
                </div>
              </div>
            ) : image ? (
              /* Image */
              <img
                src={image}
                alt={`Generated poster ${index + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              /* Empty */
              <div className="absolute inset-0 flex items-center justify-center gap-3 text-center p-6">
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
                  <p
                    className="text-sm font-medium"
                    style={{ color: "rgb(var(--text-muted))" }}
                  >
                    Poster {index + 1} appears here
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "rgb(var(--text-faint))" }}
                  >
                    Fill the form and click Generate
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Download buttons */}
      {images.length > 0 && !isLoading && (
        <div className="flex flex-wrap gap-2 justify-between">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => download(image, index)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-all"
              style={{
                background: "linear-gradient(135deg, rgb(var(--accent-500)), rgb(var(--brand-500)))",
                boxShadow: "0 0 16px rgb(var(--accent-500) / 0.3)",
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 24px rgb(var(--accent-500) / 0.5)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 16px rgb(var(--accent-500) / 0.3)"}
            >
              Download {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Prompt details */}
      {prompt && !isLoading && (
        <details
          className="text-xs cursor-pointer group"
          style={{ color: "rgb(var(--text-faint))" }}
        >
          <summary
            className="transition-colors select-none"
            style={{ color: "rgb(var(--text-faint))" }}
            onMouseEnter={e => e.currentTarget.style.color = "rgb(var(--text-muted))"}
            onMouseLeave={e => e.currentTarget.style.color = "rgb(var(--text-faint))"}
          >
            View AI prompt used
          </summary>
          <p
            className="mt-2 p-3 rounded-lg leading-relaxed"
            style={{
              background: "rgb(var(--surface))",
              border: "1px solid rgb(var(--surface-border) / 0.4)",
              color: "rgb(var(--text-muted))",
            }}
          >
            {prompt}
          </p>
        </details>
      )}
    </div>
  )
}