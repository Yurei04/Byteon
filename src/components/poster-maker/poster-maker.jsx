"use client"

import { useState } from "react"
import PosterForm from "./poster-form"
import PosterPreview from "./poster-preview"
import { useAuth } from "../(auth)/authContext"

export default function PosterMaker({ embedded = false }) {
  const { session } = useAuth()
  const [result, setResult] = useState({ images: [], prompt: null })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [aspectRatio, setAspectRatio] = useState("2:3")

  const handleGenerate = async (formData) => {
    setIsLoading(true)
    setError(null)
    setAspectRatio(formData.ratio)
    try {
      const res = await fetch("/api/generate-poster", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Generation failed")
      setResult({ images: data.images || [], prompt: data.prompt })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={embedded ? "p-6" : "max-w-7xl mx-auto px-4 sm:px-6 py-8"}>
      {!embedded && (
        <div className="mb-8">
          <h2
            className="text-2xl sm:text-3xl font-bold"
            style={{ color: "rgb(var(--text-primary))" }}
          >
            AI Poster Maker
          </h2>
          <p
            className="text-sm mt-1"
            style={{ color: "rgb(var(--text-faint))" }}
          >
            Generate stunning event posters with AI
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Preview Section - Top Priority */}
        <div
          className="rounded-2xl p-6 lg:p-8"
          style={{
            background: "rgb(var(--surface) / 0.3)",
            border: "1px solid rgb(var(--brand-500) / 0.15)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h3
                className="text-lg font-bold"
                style={{ color: "rgb(var(--text-primary))" }}
              >
                Preview
              </h3>
              <p
                className="text-xs mt-1"
                style={{ color: "rgb(var(--text-faint))" }}
              >
                Your generated posters will appear below
              </p>
            </div>
            {result.images.length > 0 && (
              <span
                className="text-xs px-3 py-1.5 rounded-full font-medium w-fit"
                style={{
                  color: "#4ade80",
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.3)",
                }}
              >
                ✓ {result.images.length} posters ready
              </span>
            )}
          </div>

          {error && (
            <div
              className="mb-6 p-4 rounded-lg text-sm"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171",
              }}
            >
              {error}
            </div>
          )}

          <PosterPreview
            images={result.images}
            isLoading={isLoading}
            prompt={result.prompt}
            aspectRatio={aspectRatio}
          />
        </div>

        {/* Form Section - Below Preview */}
        <div
          className="rounded-2xl p-6 lg:p-8"
          style={{
            background: "rgb(var(--surface) / 0.3)",
            border: "1px solid rgb(var(--brand-500) / 0.15)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="mb-6">
            <h3
              className="text-lg font-bold"
              style={{ color: "rgb(var(--text-primary))" }}
            >
              Create Your Poster
            </h3>
            <p
              className="text-xs mt-1"
              style={{ color: "rgb(var(--text-faint))" }}
            >
              Fill in the details below and click generate
            </p>
          </div>

          <PosterForm onGenerate={handleGenerate} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}