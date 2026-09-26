"use client"

import { Download } from "lucide-react"

const RATIO_CLASS = {
  "1:1": "aspect-square",
  "2:3": "aspect-[2/3]",
  "3:4": "aspect-[3/4]",
  "4:5": "aspect-[4/5]",
  "16:9": "aspect-video",
  "9:16": "aspect-[9/16]",
}

export default function PosterPreview({
  images = [],
  isLoading,
  prompt,
  aspectRatio,
}) {
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
    <div className="flex flex-col gap-6">
      {/* Poster Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(isLoading ? [null, null, null] : images.length ? images : [null, null, null]).map(
          (image, index) => (
            <div
              key={index}
              className={`relative ${ratioClass} w-full rounded-xl overflow-hidden group transition-all duration-300`}
              style={{
                border: "1px solid rgb(var(--surface-border) / 0.4)",
                background: "rgb(var(--surface))",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              }}
            >
              {/* Loading State */}
              {isLoading ? (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 p-4"
                  style={{ background: "rgb(var(--bg-base))" }}
                >
                  <div className="relative w-12 h-12">
                    <div
                      className="absolute inset-0 rounded-full border-2"
                      style={{ borderColor: "rgb(var(--brand-500) / 0.15)" }}
                    />
                    <div
                      className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
                      style={{ borderTopColor: "rgb(var(--brand-500))" }}
                    />
                  </div>
                  <div className="text-center">
                    <p
                      className="text-xs font-medium"
                      style={{ color: "rgb(var(--text-secondary))" }}
                    >
                      Generating {index + 1}…
                    </p>
                    <p
                      className="text-[10px] mt-0.5"
                      style={{ color: "rgb(var(--text-faint))" }}
                    >
                      10–40 seconds
                    </p>
                  </div>
                </div>
              ) : image ? (
                /* Loaded Image */
                <>
                  <img
                    src={image}
                    alt={`Generated poster ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Hover Overlay with Download */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-sm"
                    style={{
                      background: "rgba(0,0,0,0.3)",
                    }}
                  >
                    <button
                      onClick={() => download(image, index)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-xs font-medium transition-all duration-150 hover:scale-105"
                      style={{
                        background: "linear-gradient(135deg, rgb(var(--accent-500)), rgb(var(--brand-500)))",
                        boxShadow: "0 4px 12px rgb(var(--accent-500) / 0.3)",
                      }}
                    >
                      <Download size={12} />
                      Download
                    </button>
                  </div>
                </>
              ) : (
                /* Empty State */
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      background: "rgb(var(--surface-raised))",
                      border: "1px solid rgb(var(--surface-border) / 0.5)",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 28 28"
                      fill="none"
                    >
                      <rect
                        x="3"
                        y="3"
                        width="22"
                        height="22"
                        rx="4"
                        stroke="rgb(var(--text-faint))"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="10"
                        cy="10"
                        r="2.5"
                        stroke="rgb(var(--text-muted))"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M3 19l6-5 4 4 4-4 8 7"
                        stroke="rgb(var(--text-muted))"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p
                      className="text-xs font-medium"
                      style={{ color: "rgb(var(--text-muted))" }}
                    >
                      Poster {index + 1}
                    </p>
                    <p
                      className="text-[10px] mt-0.5"
                      style={{ color: "rgb(var(--text-faint))" }}
                    >
                      Fill form & generate
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* Download All Buttons */}
      {images.length > 0 && !isLoading && (
        <div className="flex flex-wrap gap-2 justify-start sm:justify-between">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => download(image, index)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-150 hover:shadow-lg"
              style={{
                background: "linear-gradient(135deg, rgb(var(--accent-500)), rgb(var(--brand-500)))",
                boxShadow: "0 0 12px rgb(var(--accent-500) / 0.25)",
              }}
            >
              <Download size={14} />
              Download {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Prompt Details */}
      {prompt && !isLoading && (
        <details
          className="text-xs cursor-pointer group"
          style={{ color: "rgb(var(--text-faint))" }}
        >
          <summary
            className="transition-colors select-none font-medium py-2"
            style={{ color: "rgb(var(--text-faint))" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "rgb(var(--text-muted))")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgb(var(--text-faint))")
            }
          >
            📋 View AI prompt used
          </summary>
          <p
            className="mt-3 p-3 rounded-lg leading-relaxed"
            style={{
              background: "rgb(var(--surface))",
              border: "1px solid rgb(var(--surface-border) / 0.4)",
              color: "rgb(var(--text-secondary))",
            }}
          >
            {prompt}
          </p>
        </details>
      )}
    </div>
  )
}