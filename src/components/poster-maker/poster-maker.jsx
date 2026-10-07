"use client"

import { useRef, useState } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { useAuth } from "../(auth)/authContext"
import PosterPreview from "./poster-preview"

const OPTIONS = {
  style: ["modern", "minimalist", "cyberpunk", "futuristic", "retro", "corporate", "vibrant"],
  mood: ["energetic", "professional", "playful", "mysterious", "inspiring"],
  theme: ["blue and purple", "black and neon green", "orange and dark navy", "teal and black", "pink and violet", "monochrome"],
  backgroundType: ["abstract gradient", "circuit board tech", "geometric shapes", "city skyline", "space and stars", "solid minimal"],
  fontStyle: ["serif elegant", "sans-serif modern", "display bold", "handwritten script", "monospace", "condensed tall"],
  titlePlacement: ["top-left", "top-center", "top-right", "middle-left", "center", "middle-right", "bottom-left", "bottom-center", "bottom-right"],
  // value is sent to the API; label is what the user sees
  ratio: [
    { value: "1:1", label: "1:1 · Instagram post, profile" },
    { value: "2:3", label: "2:3 · Pinterest, standard poster" },
    { value: "3:4", label: "3:4 · Portrait print, flyer" },
    { value: "4:5", label: "4:5 · Instagram and Facebook feed" },
    { value: "16:9", label: "16:9 · YouTube, Facebook cover, slides" },
    { value: "9:16", label: "9:16 · Instagram Reels and Stories" },
  ],
  logoPosition: ["top-left", "top-right", "bottom-left", "bottom-right", "bottom-center"],
}

const EMPTY = {
  eventName: "", description: "", prize: "", startDate: "", endDate: "", venue: "",
  style: "modern", mood: "energetic", theme: "blue and purple", backgroundType: "abstract gradient",
  fontStyle: "display bold", titlePlacement: "top-center", ratio: "2:3",
  logoPosition: "top-left", extraDetails: "",
}

// Shrink the logo in the browser so the request stays small.
function readLogo(file, max = 512) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement("canvas")
      c.width = Math.round(img.width * s)
      c.height = Math.round(img.height * s)
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL("image/png"))
    }
    img.onerror = () => reject(new Error("Could not read that image"))
    img.src = url
  })
}

const box = "w-full h-10 rounded-lg px-3 text-sm outline-none"
const boxStyle = {
  background: "rgb(var(--surface))",
  border: "1px solid rgb(var(--surface-border) / 0.5)",
  color: "rgb(var(--text-primary))",
}

function Label({ children }) {
  return <label className="block text-xs mb-1.5" style={{ color: "rgb(var(--text-muted))" }}>{children}</label>
}

// options can be plain strings or { value, label }
function Select({ label, value, onChange, options }) {
  return (
    <div>
      <Label>{label}</Label>
      <select className={`${box} capitalize cursor-pointer`} style={boxStyle} value={value} onChange={onChange}>
        {options.map((o) => {
          const v = typeof o === "string" ? o : o.value
          const l = typeof o === "string" ? o : o.label
          return <option key={v} value={v}>{l}</option>
        })}
      </select>
    </div>
  )
}

function Input({ label, ...props }) {
  return (
    <div>
      <Label>{label}</Label>
      <input className={box} style={boxStyle} {...props} />
    </div>
  )
}

let keyCounter = 0
const newKey = () => `poster-${++keyCounter}`

export default function PosterMaker({ onSaved }) {
  const { session } = useAuth()
  const fileRef = useRef(null)
  const [form, setForm] = useState(EMPTY)
  const [logo, setLogo] = useState(null)
  // [{ key, image, ratio, form, prompt, savedId, busy }]
  // busy: null | "tweak" | "regenerate" | "save"
  const [results, setResults] = useState([])
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const api = async (url, method, body) => {
    if (!session?.access_token) throw new Error("Please sign in again")
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Request failed")
    return data
  }

  const patch = (key, changes) =>
    setResults((prev) => prev.map((r) => (r.key === key ? { ...r, ...changes } : r)))

  // Generate 3 new posters. Nothing is saved until the user bookmarks one.
  const generate = async () => {
    if (!form.eventName.trim()) return setError("Add an event name first")
    setLoading(true)
    setError(null)
    try {
      const data = await api("/api/generate-poster", "POST", { ...form, logo })
      const snapshot = { ...form }
      setResults(
        data.images.map((image) => ({
          key: newKey(), image, ratio: snapshot.ratio, form: snapshot,
          prompt: data.prompt, savedId: null, busy: null,
        }))
      )
      setPrompt(data.prompt)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Replace one poster with a fresh take using the same settings.
  const regenerate = async (key) => {
    const r = results.find((x) => x.key === key)
    if (!r) return
    patch(key, { busy: "regenerate" })
    setError(null)
    try {
      const data = await api("/api/generate-poster", "POST", { ...r.form, logo, count: 1 })
      patch(key, { image: data.images[0], prompt: data.prompt, savedId: null, busy: null })
      setPrompt(data.prompt)
    } catch (e) {
      setError(e.message)
      patch(key, { busy: null })
    }
  }

  // Small change on one poster. The edited version replaces it (unsaved until bookmarked).
  const tweak = async (key, instruction) => {
    const r = results.find((x) => x.key === key)
    if (!r) return false
    patch(key, { busy: "tweak" })
    setError(null)
    try {
      const data = await api("/api/generate-poster", "POST", {
        baseImage: r.image, instruction, ratio: r.ratio, logo,
      })
      patch(key, { image: data.images[0], prompt: data.prompt, savedId: null, busy: null })
      setPrompt(data.prompt)
      return true
    } catch (e) {
      setError(e.message)
      patch(key, { busy: null })
      return false
    }
  }

  // Bookmark adds the poster to history; clicking again removes it.
  const toggleSave = async (key) => {
    const r = results.find((x) => x.key === key)
    if (!r || r.busy) return
    patch(key, { busy: "save" })
    setError(null)
    try {
      if (r.savedId) {
        await api("/api/poster-history", "DELETE", { id: r.savedId })
        patch(key, { savedId: null, busy: null })
      } else {
        const data = await api("/api/poster-history", "POST", {
          image: r.image, prompt: r.prompt, form: r.form,
        })
        patch(key, { savedId: data.id, busy: null })
      }
      onSaved?.()
    } catch (e) {
      setError(e.message)
      patch(key, { busy: null })
    }
  }

  const pickLogo = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (!file.type.startsWith("image/")) return setError("Logo must be an image file")
    try {
      setLogo(await readLogo(file))
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Form */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Event name *" value={form.eventName} onChange={set("eventName")} placeholder="HackFest 2026" />
          <Input label="Tagline" value={form.description} onChange={set("description")} />
          <Input label="Prize pool" value={form.prize} onChange={set("prize")} placeholder="₱100,000" />
          <Input label="Venue" value={form.venue} onChange={set("venue")} />
          <Input label="Start date" type="date" value={form.startDate} onChange={set("startDate")} />
          <Input label="End date" type="date" value={form.endDate} onChange={set("endDate")} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Select label="Style" value={form.style} onChange={set("style")} options={OPTIONS.style} />
          <Select label="Mood" value={form.mood} onChange={set("mood")} options={OPTIONS.mood} />
          <Select label="Color scheme" value={form.theme} onChange={set("theme")} options={OPTIONS.theme} />
          <Select label="Background" value={form.backgroundType} onChange={set("backgroundType")} options={OPTIONS.backgroundType} />
          <Select label="Font style" value={form.fontStyle} onChange={set("fontStyle")} options={OPTIONS.fontStyle} />
          <Select label="Title placement" value={form.titlePlacement} onChange={set("titlePlacement")} options={OPTIONS.titlePlacement} />
          <Select label="Aspect ratio" value={form.ratio} onChange={set("ratio")} options={OPTIONS.ratio} />
        </div>

        <div>
          <Label>Extra details (optional)</Label>
          <textarea
            rows={2}
            className="w-full rounded-lg p-3 text-sm outline-none resize-none"
            style={boxStyle}
            value={form.extraDetails}
            onChange={set("extraDetails")}
            placeholder="Anything else the design should include"
          />
        </div>

        {/* Logo */}
        <div
          className="group rounded-lg p-3 border border-dashed transition-colors
                    border-[rgb(var(--surface-border)/0.6)]
                    hover:border-[rgb(var(--surface-border))]"
        >
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={pickLogo} />
          {logo ? (
            <div className="flex flex-wrap items-end gap-4">
              <img src={logo} alt="Logo preview" className="h-12 w-12 rounded-md object-contain bg-white/90 p-1" />
              <div className="w-48">
                <Select label="Logo position" value={form.logoPosition} onChange={set("logoPosition")} options={OPTIONS.logoPosition} />
              </div>
              <button
                type="button"
                onClick={() => setLogo(null)}
                aria-label="Remove logo"
                className="ml-auto p-2 rounded-md cursor-pointer transition-colors
                          text-[rgb(var(--text-faint))]
                          hover:bg-white/10 hover:text-[rgb(var(--text-muted))]"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 h-10 text-sm rounded-lg cursor-pointer transition-colors
                        text-[rgb(var(--text-muted))]
                        hover:bg-primary/20 hover:text-[rgb(var(--text-primary))]
                        active:bg-white/15
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            >
              <Upload size={14} className="transition-transform group-hover:-translate-y-0.5" />
              Upload organization logo
            </button>
          )}
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button type="button" onClick={generate} disabled={loading}
          className="h-11 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 transition"
          style={{ background: "linear-gradient(135deg, rgb(var(--accent-500)), rgb(var(--brand-500)))" }}>
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Generating…" : "Generate 3 posters"}
        </button>
      </div>

      {/* Preview */}
      <PosterPreview
        results={results}
        isLoading={loading}
        prompt={prompt}
        aspectRatio={form.ratio}
        onToggleSave={toggleSave}
        onRegenerate={regenerate}
        onTweak={tweak}
      />
    </div>
  )
}