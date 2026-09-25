"use client"

import { useState } from "react"
import {
  Wand2, CalendarDays, MapPin, Trophy,
  Palette, Layers, LayoutTemplate,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const STYLES = [
  { value: "minimalist", label: "Minimalist" },
  { value: "modern bold", label: "Modern" },
  { value: "vintage retro", label: "Vintage" },
  { value: "cinematic", label: "Cinematic" },
  { value: "abstract", label: "Abstract" },
  { value: "brutalist", label: "Brutalist" },
  { value: "illustrated", label: "Illustrated" },
]

const THEMES = [
  { value: "Space & Galaxy", label: "Space" },
  { value: "Neon Cyberpunk", label: "Cyberpunk" },
  { value: "Nature & Earth", label: "Nature" },
  { value: "Ocean & Water", label: "Ocean" },
  { value: "Fire & Energy", label: "Fire" },
  { value: "Dark & Mysterious", label: "Dark" },
  { value: "Light & Clean", label: "Clean" },
  { value: "Retro Sunset", label: "Retro" },
  { value: "Urban City", label: "Urban" },
]

const RATIOS = [
  { value: "2:3", label: "2:3 (Portrait)" },
  { value: "1:1", label: "1:1 (Square)" },
  { value: "9:16", label: "9:16 (Story)" },
  { value: "16:9", label: "16:9 (Wide)" },
  { value: "4:5", label: "4:5 (Feed)" },
]

const LIMITS = {
  eventName: 40,
  description: 80,
  prize: 20,
  venue: 40,
}

function CharCount({ value = "", limit }) {
  const over = value.length > limit
  return (
    <span
      className="text-xs font-semibold tabular-nums"
      style={{ color: over ? "rgb(var(--accent-500))" : "rgb(var(--text-faint))" }}
    >
      {value.length}/{limit}
    </span>
  )
}

function FormGrid({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  )
}

function FormTile({ label, children, icon: Icon }) {
  return (
    <div
      className="rounded-lg p-4 space-y-2"
      style={{
        background: "rgb(var(--surface) / 0.5)",
        border: "1px solid rgb(var(--surface-border) / 0.5)",
      }}
    >
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon size={14} style={{ color: "rgb(var(--brand-400))" }} />
        )}
        <Label
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "rgb(var(--text-faint))" }}
        >
          {label}
        </Label>
      </div>
      {children}
    </div>
  )
}

function TextInputField({ icon: Icon, value, onChange, placeholder, maxLength, limit, type = "text" }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "rgb(var(--text-faint))" }}
        />
      )}
      <Input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="h-9 text-sm rounded-md"
        style={{
          paddingLeft: Icon ? "2.25rem" : "0.75rem",
          paddingRight: limit !== undefined ? "3rem" : "0.75rem",
        }}
      />
      {limit !== undefined && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <CharCount value={value} limit={limit} />
        </div>
      )}
    </div>
  )
}

export default function PosterForm({ onGenerate, isLoading }) {
  const [form, setForm] = useState({
    eventName: "",
    description: "",
    prize: "",
    startDate: "",
    endDate: "",
    venue: "",
    style: "modern bold",
    theme: "Space & Galaxy",
    ratio: "2:3",
  })

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))
  const setVal = (key) => (v) =>
    setForm((f) => ({ ...f, [key]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.eventName.trim()) return
    onGenerate(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Row - Event Name & Dates */}
      <FormGrid>
        <FormTile label="Event Name" icon={CalendarDays}>
          <div className="flex gap-2">
            <div className="flex-1">
              <TextInputField
                value={form.eventName}
                onChange={set("eventName")}
                placeholder="e.g. HackUnited 2027"
                maxLength={LIMITS.eventName}
                limit={LIMITS.eventName}
              />
            </div>
          </div>
        </FormTile>

        <FormTile label="Start Date">
          <TextInputField
            type="date"
            value={form.startDate}
            onChange={set("startDate")}
          />
        </FormTile>

        <FormTile label="End Date">
          <TextInputField
            type="date"
            value={form.endDate}
            onChange={set("endDate")}
          />
        </FormTile>
      </FormGrid>

      {/* Middle Row - Description, Prize, Venue */}
      <FormGrid>
        <FormTile label="Description / Tagline">
          <TextInputField
            value={form.description}
            onChange={set("description")}
            placeholder="e.g. Innovation with Code"
            maxLength={LIMITS.description}
            limit={LIMITS.description}
          />
        </FormTile>

        <FormTile label="Prize" icon={Trophy}>
          <TextInputField
            value={form.prize}
            onChange={set("prize")}
            placeholder="e.g. $10,000"
            maxLength={LIMITS.prize}
            limit={LIMITS.prize}
          />
        </FormTile>

        <FormTile label="Venue" icon={MapPin}>
          <TextInputField
            value={form.venue}
            onChange={set("venue")}
            placeholder="e.g. Manila, Philippines"
            maxLength={LIMITS.venue}
            limit={LIMITS.venue}
          />
        </FormTile>
      </FormGrid>

      {/* Bottom Row - Style, Theme, Ratio */}
      <FormGrid>
        <FormTile label="Visual Style" icon={Layers}>
          <Select value={form.style} onValueChange={setVal("style")}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STYLES.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormTile>

        <FormTile label="Theme & Colors" icon={Palette}>
          <Select value={form.theme} onValueChange={setVal("theme")}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THEMES.map((theme) => (
                <SelectItem key={theme.value} value={theme.value}>
                  {theme.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormTile>

        <FormTile label="Poster Size" icon={LayoutTemplate}>
          <Select value={form.ratio} onValueChange={setVal("ratio")}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RATIOS.map((ratio) => (
                <SelectItem key={ratio.value} value={ratio.value}>
                  {ratio.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormTile>
      </FormGrid>

      {/* Submit Button - Full Width */}
      <Button
        type="submit"
        disabled={isLoading || !form.eventName.trim()}
        className="w-full h-11 text-sm font-semibold flex items-center justify-center gap-2"
        style={
          isLoading || !form.eventName.trim()
            ? {
                background: "rgb(var(--surface-raised))",
                border: "1px solid rgb(var(--surface-border) / 0.4)",
                color: "rgb(var(--text-faint))",
              }
            : {
                background: "linear-gradient(135deg, rgb(var(--accent-500)), rgb(var(--brand-500)))",
                color: "#ffffff",
                boxShadow: "0 0 20px rgb(var(--accent-500) / 0.3)",
              }
        }
      >
        <Wand2 size={14} className={isLoading ? "animate-spin" : ""} />
        {isLoading ? "Generating…" : "Generate Poster"}
      </Button>
    </form>
  )
}