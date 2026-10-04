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
  ratio: ["1:1", "2:3", "3:4", "4:5", "16:9", "9:16"],
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

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <Label>{label}</Label>
      <select className={`${box} capitalize`} style={boxStyle} value={value} onChange={onChange}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
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

export default function PosterMaker({ onSaved }) {
  const { session } = useAuth()
  const fileRef = useRef(null)
  const [form, setForm] = useState(EMPTY)
  const [logo, setLogo] = useState(null)
  const [results, setResults] = useState([]) // [{ id, image }]
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const call = async (payload) => {
    if (!session?.access_token) throw new Error("Please sign in again")
    const res = await fetch("/api/generate-poster", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Generation failed")
    return data
  }

  const generate = async () => {
    if (!form.eventName.trim()) return setError("Add an event name first")
    setLoading(true)
    setError(null)
    try {
      const data = await call({ ...form, logo })
      setResults(data.images.map((image, i) => ({ id: data.ids?.[i] ?? null, image })))
      setPrompt(data.prompt)
      onSaved?.()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Minor adjustment on one generated poster; the edited version replaces it.
  const modify = async (baseId, instruction) => {
    setLoading(true)
    setError(null)
    try {
      const data = await call({ baseId, instruction, logo })
      setResults((prev) =>
        prev.map((r) => (r.id === baseId ? { id: data.ids?.[0] ?? null, image: data.images[0] } : r))
      )
      setPrompt(data.prompt)
      onSaved?.()
      return true
    } catch (e) {
      setError(e.message)
      return false
    } finally {
      setLoading(false)
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
        <div className="rounded-lg p-3" style={{ border: "1px dashed rgb(var(--surface-border) / 0.6)" }}>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={pickLogo} />
          {logo ? (
            <div className="flex flex-wrap items-end gap-4">
              <img src={logo} alt="Logo preview" className="h-12 w-12 rounded-md object-contain bg-white/90 p-1" />
              <div className="w-48">
                <Select label="Logo position" value={form.logoPosition} onChange={set("logoPosition")} options={OPTIONS.logoPosition} />
              </div>
              <button type="button" onClick={() => setLogo(null)} aria-label="Remove logo"
                className="ml-auto p-2 rounded-md" style={{ color: "rgb(var(--text-faint))" }}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 h-10 text-sm"
              style={{ color: "rgb(var(--text-muted))" }}>
              <Upload size={14} /> Upload organization logo
            </button>
          )}
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button type="button" onClick={generate} disabled={loading}
          className="h-11 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, rgb(var(--accent-500)), rgb(var(--brand-500)))" }}>
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Working…" : "Generate 3 posters"}
        </button>
      </div>

      {/* Preview */}
      <PosterPreview
        images={results.map((r) => r.image)}
        ids={results.map((r) => r.id)}
        isLoading={loading}
        prompt={prompt}
        aspectRatio={form.ratio}
        onModify={modify}
      />
    </div>
  )
}