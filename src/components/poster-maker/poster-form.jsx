"use client"

import { useState } from "react"
import {
  Wand2, CalendarDays, MapPin, Trophy, Users,
  Palette, Layers, LayoutTemplate, Type,
  Minus, Triangle, Camera, Clapperboard,
  Leaf, Square, CircleDot, Sun, ImageIcon,
  Globe, Building, Atom, Shapes,
  Zap, Moon, Flame, PartyPopper, Star,
  AlignLeft, AlignCenter, AlignRight,
  AlignStartVertical, Columns2,
  RectangleHorizontal, Smartphone, Monitor, Instagram,
} from "lucide-react"

// ── Option data ────────────────────────────────────────────────
const STYLES = [
  { value: "minimalist",     label: "Minimalist",  icon: Minus        },
  { value: "modern bold",    label: "Modern",      icon: Triangle     },
  { value: "vintage retro",  label: "Vintage",     icon: Sun          },
  { value: "cinematic",      label: "Cinematic",   icon: Clapperboard },
  { value: "abstract",       label: "Abstract",    icon: CircleDot    },
  { value: "brutalist",      label: "Brutalist",   icon: Square       },
  { value: "illustrated",    label: "Illustrated", icon: ImageIcon    },
]

const THEMES = [
  { value: "Space & Galaxy",    label: "Space",      icon: Globe     },
  { value: "Neon Cyberpunk",    label: "Cyberpunk",  icon: Zap       },
  { value: "Nature & Earth",    label: "Nature",     icon: Leaf      },
  { value: "Ocean & Water",     label: "Ocean",      icon: Moon      },
  { value: "Fire & Energy",     label: "Fire",       icon: Flame     },
  { value: "Dark & Mysterious", label: "Dark",       icon: CircleDot },
  { value: "Light & Clean",     label: "Clean",      icon: Star      },
  { value: "Retro Sunset",      label: "Retro",      icon: Sun       },
  { value: "Urban City",        label: "Urban",      icon: Building  },
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
  date:        25,
  venue:       40,
}

// ── Reusable pieces matching original design ───────────────────

function CharCount({ value = "", limit }) {
  const over = value.length > limit
  return (
    <span className={`text-[10px] tabular-nums font-semibold ${over ? "text-pink-400" : "text-zinc-600"}`}>
      {value.length}/{limit}
    </span>
  )
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-800/50">
        <div className="w-6 h-6 rounded-lg bg-fuchsia-950/70 border border-fuchsia-700/40 flex items-center justify-center flex-shrink-0">
          <Icon size={12} className="text-fuchsia-400" />
        </div>
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">{title}</span>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  )
}

function FieldRow({ label, children }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{label}</p>
      {children}
    </div>
  )
}

const baseCls =
  "w-full rounded-xl bg-zinc-900/80 border border-zinc-700/50 text-zinc-100 placeholder-zinc-600 text-sm px-3 h-11 focus:outline-none focus:border-fuchsia-600/50 focus:ring-1 focus:ring-fuchsia-600/20 transition-colors duration-150"

function TextInput({ icon: Icon, iconColor = "text-zinc-500", value, onChange, placeholder, maxLength, limit }) {
  return (
    <div className="relative">
      {Icon && <Icon size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${iconColor}`} />}
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`${baseCls} ${Icon ? "pl-9" : ""} pr-14`}
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
            className={`
              flex flex-col items-center gap-2 px-2 py-3 rounded-xl border text-xs font-medium
              transition-all duration-150 text-center
              ${isSelected
                ? "bg-fuchsia-950/60 border-fuchsia-500 text-fuchsia-300 shadow-[0_0_12px_rgba(217,70,239,0.2)]"
                : "bg-zinc-900/60 border-zinc-700/50 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60"
              }
            `}
          >
            <Icon size={15} className={isSelected ? "text-fuchsia-400" : "text-zinc-500"} />
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
    date:        "",
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
    // Send raw fields — route reads eventName, description, prize, date, venue, style, theme, ratio
    onGenerate(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* ── Event Details ── */}
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
              iconColor="text-amber-400"
              value={form.prize}
              onChange={set("prize")}
              placeholder="e.g. $10,000"
              maxLength={LIMITS.prize}
              limit={LIMITS.prize}
            />
          </FieldRow>
          <FieldRow label="Date">
            <TextInput
              icon={CalendarDays}
              value={form.date}
              onChange={set("date")}
              placeholder="e.g. Jan–Mar 2027"
              maxLength={LIMITS.date}
              limit={LIMITS.date}
            />
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

      {/* ── Visual Style ── */}
      <SectionCard icon={Layers} title="Visual Style">
        <IconGrid options={STYLES} value={form.style} onChange={setVal("style")} cols={3} />
      </SectionCard>

      {/* ── Theme & Colors ── */}
      <SectionCard icon={Palette} title="Theme & Colors">
        <IconGrid options={THEMES} value={form.theme} onChange={setVal("theme")} cols={3} />
      </SectionCard>

      {/* ── Poster Size ── */}
      <SectionCard icon={LayoutTemplate} title="Poster Size">
        <div className="grid grid-cols-5 gap-2">
          {RATIOS.map(({ value, label, Icon, sub, extraCls }) => {
            const isSelected = form.ratio === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setVal("ratio")(value)}
                className={`
                  flex flex-col items-center gap-1.5 px-1 py-3 rounded-xl border text-xs transition-all duration-150
                  ${isSelected
                    ? "bg-fuchsia-950/60 border-fuchsia-500 text-fuchsia-300 shadow-[0_0_12px_rgba(217,70,239,0.2)]"
                    : "bg-zinc-900/60 border-zinc-700/50 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60"
                  }
                `}
              >
                <Icon size={16} className={`${isSelected ? "text-fuchsia-400" : "text-zinc-500"} ${extraCls ?? ""}`} />
                <span className="font-bold">{label}</span>
                <span className={`text-[10px] ${isSelected ? "text-fuchsia-400/80" : "text-zinc-600"}`}>{sub}</span>
              </button>
            )
          })}
        </div>
      </SectionCard>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={isLoading || !form.eventName.trim()}
        className={`
          w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2
          transition-all duration-200
          ${isLoading || !form.eventName.trim()
            ? "bg-zinc-800/60 border border-zinc-700/40 text-zinc-500 cursor-not-allowed opacity-60"
            : "bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_28px_rgba(217,70,239,0.45)]"
          }
        `}
      >
        <Wand2 size={14} className={isLoading ? "animate-spin" : ""} />
        {isLoading ? "Generating…" : "Generate Poster"}
      </button>

    </form>
  )
}