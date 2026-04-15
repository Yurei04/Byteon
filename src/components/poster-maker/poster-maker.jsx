"use client"

import { useState } from "react"
import PosterForm from "./poster-form"
import PosterPreview from "./poster-preview"
import PosterHistory from "./poster-history"

export default function PosterMaker({ embedded = false }) {
  const [activeTab, setActiveTab] = useState("create")
  const [result, setResult] = useState({ images: [], prompt: null })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [aspectRatio, setAspectRatio] = useState("2:3")
  const [historyRefresh, setHistoryRefresh] = useState(0)

  const handleGenerate = async (formData) => {
    setIsLoading(true)
    setError(null)
    setAspectRatio(formData.aspectRatio)

    try {
      const res = await fetch("/api/generate-poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Generation failed")

      setResult({ images: data.images || [], prompt: data.prompt })
      setHistoryRefresh((n) => n + 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const inner = (
    <div className={embedded ? "p-6" : "max-w-7xl mx-auto px-6 py-8"}>
      <div className="flex items-center justify-between mb-6">
        {!embedded && (
          <div>
            <h2 className="text-lg font-bold text-zinc-100">AI Poster Maker</h2>
            <p className="text-sm text-zinc-500 mt-0.5">Free · Pollinations.ai</p>
          </div>
        )}

        <div className="flex items-center gap-1 bg-zinc-900/80 border border-fuchsia-900/40 rounded-xl p-1">
          {[
            { key: "create", label: "Create", icon: "✦" },
            { key: "history", label: "History", icon: "◷" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
                ${activeTab === tab.key
                  ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white"
                  : "text-zinc-500 hover:text-zinc-200"
                }
              `}
            >
              <span className="text-xs">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "create" && (
        <div className="flex flex-col gap-6">
          
          {/* FORM (top) */}
          <div className="bg-zinc-900/50 border border-fuchsia-900/30 rounded-2xl p-6">
            <PosterForm onGenerate={handleGenerate} isLoading={isLoading} />
          </div>

          {/* PREVIEW (bottom) */}
          <div className="bg-zinc-900/50 border border-fuchsia-900/30 rounded-2xl p-6">
            
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-100">Preview</h3>

              {result.images.length > 0 && (
                <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-1 rounded-full">
                  3 posters saved ✓
                </span>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-800/40 rounded-xl">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <PosterPreview
              images={result.images}
              isLoading={isLoading}
              prompt={result.prompt}
              aspectRatio={aspectRatio}
            />
          </div>

        </div>
      )}

      {activeTab === "history" && (
        <div className="bg-zinc-900/50 border border-fuchsia-900/30 rounded-2xl p-6">
          <PosterHistory refreshTrigger={historyRefresh} />
        </div>
      )}
    </div>
  )

  return inner
}
