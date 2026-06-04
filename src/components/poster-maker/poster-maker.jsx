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
            <h2
              className="text-lg font-bold"
              style={{ color: "rgb(var(--text-primary))" }}
            >
              AI Poster Maker
            </h2>
            <p
              className="text-sm mt-0.5"
              style={{ color: "rgb(var(--text-faint))" }}
            >
              Free · Pollinations.ai
            </p>
          </div>
        )}

        {/* Tab switcher */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl"
          style={{
            background: "rgb(var(--surface))",
            border: "1px solid rgb(var(--brand-500) / 0.2)",
          }}
        >
          {[
            { key: "create",  label: "Create",  icon: "✦" },
            { key: "history", label: "History", icon: "◷" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
              style={
                activeTab === tab.key
                  ? {
                      background: "linear-gradient(135deg, rgb(var(--accent-500)), rgb(var(--brand-500)))",
                      color: "#ffffff",
                    }
                  : {
                      background: "transparent",
                      color: "rgb(var(--text-faint))",
                    }
              }
            >
              <span className="text-xs">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "create" && (
        <div className="flex flex-col gap-6">
          {/* Form */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "rgb(var(--surface) / 0.5)",
              border: "1px solid rgb(var(--brand-500) / 0.15)",
            }}
          >
            <PosterForm onGenerate={handleGenerate} isLoading={isLoading} />
          </div>

          {/* Preview */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "rgb(var(--surface) / 0.5)",
              border: "1px solid rgb(var(--brand-500) / 0.15)",
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3
                className="text-sm font-bold"
                style={{ color: "rgb(var(--text-primary))" }}
              >
                Preview
              </h3>
              {result.images.length > 0 && (
                <span
                  className="text-[10px] px-2 py-1 rounded-full"
                  style={{
                    color: "#4ade80",
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.25)",
                  }}
                >
                  3 posters saved ✓
                </span>
              )}
            </div>

            {error && (
              <div
                className="mb-4 p-3 rounded-xl"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.25)",
                }}
              >
                <p className="text-xs" style={{ color: "#f87171" }}>{error}</p>
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
        <div
          className="rounded-2xl p-6"
          style={{
            background: "rgb(var(--surface) / 0.5)",
            border: "1px solid rgb(var(--brand-500) / 0.15)",
          }}
        >
          <PosterHistory refreshTrigger={historyRefresh} />
        </div>
      )}
    </div>
  )

  return inner
}