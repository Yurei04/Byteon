"use client"

import { useState } from "react"
import {
  Wand2, CalendarDays, MapPin, Trophy,
  Palette, Layers, LayoutTemplate,
  Minus, Triangle, Camera, Clapperboard,
  Leaf, Square, CircleDot, Sun, ImageIcon,
  Globe, Building, Atom, Shapes,
  Zap, Moon, Flame, Star,
  RectangleHorizontal, Smartphone, Monitor, Instagram,
} from "lucide-react"

const STYLES = [
  { value: "minimalist",    label: "Minimalist",  icon: Minus        },
  { value: "modern bold",   label: "Modern",      icon: Triangle     },
  { value: "vintage retro", label: "Vintage",     icon: Sun          },
  { value: "cinematic",     label: "Cinematic",   icon: Clapperboard },
  { value: "abstract",      label: "Abstract",    icon: CircleDot    },
  { value: "brutalist",     label: "Brutalist",   icon: Square       },
  { value: "illustrated",   label: "Illustrated", icon: ImageIcon    },
]

const THEMES = [
  { value: "Space & Galaxy",    label: "Space",     icon: Globe     },
  { value: "Neon Cyberpunk",    label: "Cyberpunk", icon: Zap       },
  { value: "Nature & Earth",    label: "Nature",    icon: Leaf      },
  { value: "Ocean & Water",     label: "Ocean",     icon: Moon      },
  { value: "Fire & Energy",     label: "Fire",      icon: Flame     },
  { value: "Dark & Mysterious", label: "Dark",      icon: CircleDot },
  { value: "Light & Clean",     label: "Clean",     icon: Star      },
  { value: "Retro Sunset",      label: "Retro",     icon: Sun       },
  { value: "Urban City",        label: "Urban",     icon: Building  },
]

const RATIOS = [
  { value: "2:3",  label: "2:3",  Icon: RectangleHorizontal, sub: "Portrait", extraCls: "rotate-90" },
  { value: "1:1",  label: "1:1",  Icon: Square,              sub: "Square"                          },
  { value: "9:16", label: "9:16", Icon: Smartphone,          sub: "Story"                           },
  { value: "16:9", label: "16:9", Icon: Monitor,             sub: "Wide"                            },
  { value: "4:5",  label: "4:5",  Icon: Instagram,           sub: "Feed"                            },
]

const LIMITS = {
  eventName:   40,
  description: 80,
  prize:       20,
  venue:       40,
}

// ── Sub-components ─────────────────────────────────────────────

function CharCount({ value = "", limit }) {
  const over = value.length > limit
  return (
    <span
      className="text-[10px] tabular-nums font-semibold"
      style={{ color: over ? "rgb(var(--accent-500))" : "rgb(var(--text-faint))" }}
    >
      {value.length}/{limit}
    </span>
  )
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border: "1px solid rgb(var(--surface-border) / 0.4)",
        background: "rgb(var(--surface-raised) / 0.3)",
      }}
    >
      <div
        className="flex items-center gap-2.5 px-4 py-3"
        style={{ borderBottom: "1px solid rgb(var(--surface-border) / 0.3)" }}
      >
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgb(var(--brand-500) / 0.12)",
            border: "1px solid rgb(var(--brand-500) / 0.3)",
          }}
        >
          <Icon size={12} style={{ color: "rgb(var(--brand-400))" }} />
        </div>
        <span
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: "rgb(var(--text-muted))" }}
        >
          {title}
        </span>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  )
}

function FieldRow({ label, children }) {
  return (
    <div className="space-y-1.5">
      <p
        className="text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: "rgb(var(--text-faint))" }}
      >
        {label}
      </p>
      {children}
    </div>
  )
}

function TextInput({ icon: Icon, value, onChange, placeholder, maxLength, limit, type = "text" }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "rgb(var(--text-faint))" }}
        />
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full rounded-xl text-sm h-11 outline-none transition-colors duration-150"
        style={{
          background: "rgb(var(--surface))",
          border: "1px solid rgb(var(--surface-border) / 0.5)",
          color: "rgb(var(--text-primary))",
          paddingLeft: Icon ? "2.25rem" : "0.75rem",
          paddingRight: limit !== undefined ? "3.5rem" : "0.75rem",
        }}
        onFocus={e => {
          e.target.style.borderColor = "rgb(var(--brand-500) / 0.5)"
          e.target.style.boxShadow   = "0 0 0 3px rgb(var(--brand-500) / 0.1)"
        }}
        onBlur={e => {
          e.target.style.borderColor = "rgb(var(--surface-border) / 0.5)"
          e.target.style.boxShadow   = "none"
        }}
      />
      {limit !== undefined && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <CharCount value={value} limit={limit} />
        </div>
      )}
    </div>
  )
}

function IconGrid({ options, value, onChange, cols = 3 }) {
  const colMap = { 3: "grid-cols-3", 4: "grid-cols-4" }
  return (
    <div className={`grid ${colMap[cols] ?? "grid-cols-3"} gap-2`}>
      {options.map((opt) => {
        const Icon       = opt.icon
        const isSelected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="flex flex-col items-center gap-2 px-2 py-3 rounded-xl text-xs font-medium transition-all duration-150 text-center"
            style={
              isSelected
                ? {
                    background: "rgb(var(--brand-500) / 0.12)",
                    border: "1px solid rgb(var(--brand-500) / 0.6)",
                    color: "rgb(var(--brand-300))",
                    boxShadow: "0 0 12px rgb(var(--brand-500) / 0.2)",
                  }
                : {
                    background: "rgb(var(--surface))",
                    border: "1px solid rgb(var(--surface-border) / 0.5)",
                    color: "rgb(var(--text-muted))",
                  }
            }
            onMouseEnter={e => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = "rgb(var(--surface-border))"
                e.currentTarget.style.color = "rgb(var(--text-primary))"
                e.currentTarget.style.background = "rgb(var(--surface-raised))"
              }
            }}
            onMouseLeave={e => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = "rgb(var(--surface-border) / 0.5)"
                e.currentTarget.style.color = "rgb(var(--text-muted))"
                e.currentTarget.style.background = "rgb(var(--surface))"
              }
            }}
          >
            <Icon
              size={15}
              style={{ color: isSelected ? "rgb(var(--brand-400))" : "rgb(var(--text-faint))" }}
            />
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────
export default function PosterForm({ onGenerate, isLoading }) {
  const [form, setForm] = useState({
    eventName:   "",
    description: "",
    prize:       "",
    startDate:   "",
    endDate:     "",
    venue:       "",
    style:       "modern bold",
    theme:       "Space & Galaxy",
    ratio:       "2:3",
  })

  const set    = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const setVal = (key) => (v) => setForm((f) => ({ ...f, [key]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.eventName.trim()) return
    onGenerate(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Event Details */}
      <SectionCard icon={CalendarDays} title="Event Details">
        <FieldRow label="Event Name">
          <TextInput
            value={form.eventName}
            onChange={set("eventName")}
            placeholder="e.g. HackUnited 2027"
            maxLength={LIMITS.eventName}
            limit={LIMITS.eventName}
          />
        </FieldRow>

        <FieldRow label="Description / Tagline">
          <TextInput
            value={form.description}
            onChange={set("description")}
            placeholder="e.g. Innovation with Code"
            maxLength={LIMITS.description}
            limit={LIMITS.description}
          />
        </FieldRow>

        <div className="grid grid-cols-2 gap-3">
          <FieldRow label="Prize">
            <TextInput
              icon={Trophy}
              value={form.prize}
              onChange={set("prize")}
              placeholder="e.g. $10,000"
              maxLength={LIMITS.prize}
              limit={LIMITS.prize}
            />
          </FieldRow>

          <FieldRow label="Date Range">
            <div className="grid grid-cols-2 gap-2">
              <TextInput
                icon={CalendarDays}
                type="date"
                value={form.startDate}
                onChange={set("startDate")}
              />
              <TextInput
                icon={CalendarDays}
                type="date"
                value={form.endDate}
                onChange={set("endDate")}
              />
            </div>
          </FieldRow>
        </div>

        <FieldRow label="Venue (optional)">
          <TextInput
            icon={MapPin}
            value={form.venue}
            onChange={set("venue")}
            placeholder="e.g. Manila, Philippines"
            maxLength={LIMITS.venue}
            limit={LIMITS.venue}
          />
        </FieldRow>
      </SectionCard>

      {/* Visual Style */}
      <SectionCard icon={Layers} title="Visual Style">
        <IconGrid options={STYLES} value={form.style} onChange={setVal("style")} cols={3} />
      </SectionCard>

      {/* Theme & Colors */}
      <SectionCard icon={Palette} title="Theme & Colors">
        <IconGrid options={THEMES} value={form.theme} onChange={setVal("theme")} cols={3} />
      </SectionCard>

      {/* Poster Size */}
      <SectionCard icon={LayoutTemplate} title="Poster Size">
        <div className="grid grid-cols-5 gap-2">
          {RATIOS.map(({ value, label, Icon, sub, extraCls }) => {
            const isSelected = form.ratio === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setVal("ratio")(value)}
                className="flex flex-col items-center gap-1.5 px-1 py-3 rounded-xl text-xs transition-all duration-150"
                style={
                  isSelected
                    ? {
                        background: "rgb(var(--brand-500) / 0.12)",
                        border: "1px solid rgb(var(--brand-500) / 0.6)",
                        color: "rgb(var(--brand-300))",
                        boxShadow: "0 0 12px rgb(var(--brand-500) / 0.2)",
                      }
                    : {
                        background: "rgb(var(--surface))",
                        border: "1px solid rgb(var(--surface-border) / 0.5)",
                        color: "rgb(var(--text-muted))",
                      }
                }
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = "rgb(var(--surface-border))"
                    e.currentTarget.style.color = "rgb(var(--text-primary))"
                    e.currentTarget.style.background = "rgb(var(--surface-raised))"
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = "rgb(var(--surface-border) / 0.5)"
                    e.currentTarget.style.color = "rgb(var(--text-muted))"
                    e.currentTarget.style.background = "rgb(var(--surface))"
                  }
                }}
              >
                <Icon
                  size={16}
                  className={extraCls ?? ""}
                  style={{ color: isSelected ? "rgb(var(--brand-400))" : "rgb(var(--text-faint))" }}
                />
                <span className="font-bold">{label}</span>
                <span
                  className="text-[10px]"
                  style={{ color: isSelected ? "rgb(var(--brand-400) / 0.8)" : "rgb(var(--text-faint))" }}
                >
                  {sub}
                </span>
              </button>
            )
          })}
        </div>
      </SectionCard>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || !form.eventName.trim()}
        className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
        style={
          isLoading || !form.eventName.trim()
            ? {
                background: "rgb(var(--surface-raised))",
                border: "1px solid rgb(var(--surface-border) / 0.4)",
                color: "rgb(var(--text-faint))",
                cursor: "not-allowed",
                opacity: 0.6,
              }
            : {
                background: "linear-gradient(135deg, rgb(var(--accent-500)), rgb(var(--brand-500)))",
                color: "#ffffff",
                boxShadow: "0 0 20px rgb(var(--accent-500) / 0.3)",
                cursor: "pointer",
              }
        }
        onMouseEnter={e => {
          if (!isLoading && form.eventName.trim()) {
            e.currentTarget.style.boxShadow = "0 0 28px rgb(var(--accent-500) / 0.45)"
            e.currentTarget.style.transform = "translateY(-1px)"
          }
        }}
        onMouseLeave={e => {
          if (!isLoading && form.eventName.trim()) {
            e.currentTarget.style.boxShadow = "0 0 20px rgb(var(--accent-500) / 0.3)"
            e.currentTarget.style.transform = "translateY(0)"
          }
        }}
      >
        <Wand2 size={14} className={isLoading ? "animate-spin" : ""} />
        {isLoading ? "Generating…" : "Generate Poster"}
      </button>
    </form>
  )
}