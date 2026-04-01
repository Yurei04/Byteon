"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Type, AlignCenter, Palette, ChevronRight,
  ChevronLeft, Wand2, LayoutTemplate, ImageIcon,
  Minus, Triangle, Camera, Shapes, Clapperboard,
  Leaf, Square, Zap, Moon, Flame, PartyPopper,
  Star, CircleDot, Layers, Sun, Globe, Building,
  Atom, AlignLeft, AlignRight, AlignStartVertical,
  Columns2, RectangleHorizontal, Smartphone,
  Monitor, Instagram, Trophy, CalendarDays,
  MapPin, Users, Clock, Tag, FileText, Eye, EyeOff,
  AlertCircle, Info
} from "lucide-react"
import FieldSection from "./field-section"
import ColorSwatch from "./color-swatch"

// ── Steps ─────────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Event",   icon: CalendarDays  },
  { id: 2, label: "Text",    icon: FileText       },
  { id: 3, label: "Layout",  icon: LayoutTemplate },
  { id: 4, label: "Style",   icon: Layers         },
  { id: 5, label: "Colors",  icon: Palette        },
]

// ── Option data ───────────────────────────────────────────────────────────────
const STYLES = [
  { value: "minimalist",     label: "Minimalist",  icon: Minus        },
  { value: "vintage retro",  label: "Vintage",     icon: Sun          },
  { value: "modern bold",    label: "Modern",      icon: Triangle     },
  { value: "illustrated",    label: "Illustrated", icon: ImageIcon    },
  { value: "photorealistic", label: "Photo",       icon: Camera       },
  { value: "abstract",       label: "Abstract",    icon: CircleDot    },
  { value: "art nouveau",    label: "Art Nouveau", icon: Leaf         },
  { value: "brutalist",      label: "Brutalist",   icon: Square       },
  { value: "cinematic",      label: "Cinematic",   icon: Clapperboard },
]

const MOODS = [
  { value: "energetic and exciting", label: "Energetic",  icon: Zap         },
  { value: "calm and peaceful",      label: "Calm",       icon: Moon        },
  { value: "dramatic and intense",   label: "Dramatic",   icon: Flame       },
  { value: "playful and fun",        label: "Playful",    icon: PartyPopper },
  { value: "elegant and luxurious",  label: "Elegant",    icon: Star        },
  { value: "mysterious and dark",    label: "Mysterious", icon: CircleDot   },
]

const BACKGROUNDS = [
  { value: "gradient",     label: "Gradient",  icon: Layers    },
  { value: "solid color",  label: "Solid",     icon: Square    },
  { value: "textured",     label: "Textured",  icon: Shapes    },
  { value: "bokeh",        label: "Bokeh",     icon: CircleDot },
  { value: "geometric",    label: "Geometric", icon: Atom      },
  { value: "nature photo", label: "Nature",    icon: Leaf      },
  { value: "urban",        label: "Urban",     icon: Building  },
  { value: "abstract art", label: "Abstract",  icon: Palette   },
  { value: "space galaxy", label: "Space",     icon: Globe     },
]

const FONTS = [
  { value: "serif elegant",      label: "Serif",     icon: Type               },
  { value: "sans-serif modern",  label: "Sans",      icon: AlignLeft          },
  { value: "display bold",       label: "Display",   icon: AlignCenter        },
  { value: "handwritten script", label: "Script",    icon: AlignRight         },
  { value: "monospace",          label: "Mono",      icon: AlignStartVertical },
  { value: "condensed tall",     label: "Condensed", icon: Columns2           },
]

const RATIOS = [
  { value: "2:3",  label: "2:3",  Icon: RectangleHorizontal, sub: "Portrait", extraCls: "rotate-90" },
  { value: "1:1",  label: "1:1",  Icon: Square,              sub: "Square"                          },
  { value: "3:4",  label: "3:4",  Icon: Smartphone,          sub: "Story"                           },
  { value: "16:9", label: "16:9", Icon: Monitor,             sub: "Wide"                            },
  { value: "9:16", label: "9:16", Icon: Smartphone,          sub: "Reel"                            },
  { value: "4:5",  label: "4:5",  Icon: Instagram,           sub: "Feed"                            },
]

const PLACEMENTS = [
  { value: "top-left",      label: "Top Left"      },
  { value: "top-center",    label: "Top Center"    },
  { value: "top-right",     label: "Top Right"     },
  { value: "middle-left",   label: "Mid Left"      },
  { value: "center",        label: "Center"        },
  { value: "middle-right",  label: "Mid Right"     },
  { value: "bottom-left",   label: "Bottom Left"   },
  { value: "bottom-center", label: "Bottom Center" },
  { value: "bottom-right",  label: "Bottom Right"  },
]

// ── Character limits — keep poster text lean ──────────────────────────────────
const LIMITS = {
  eventName:   40,   // Main title — short and punchy
  tagline:     80,   // One-liner shown under the title
  prizePool:   20,   // e.g. "₱50,000"
  venue:       40,   // e.g. "DLSU Manila"
  organizer:   30,   // e.g. "ByteOn / GDSC"
  eventDate:   25,   // e.g. "July 25–26, 2025"
}

// ── Shared sub-components ─────────────────────────────────────────────────────

/** Badge shown next to fields that will appear on the poster */
function OnPosterBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-fuchsia-950/60 border border-fuchsia-700/40 text-[9px] font-bold text-fuchsia-400 uppercase tracking-widest">
      <Eye size={8} /> on poster
    </span>
  )
}

/** Character counter — turns pink when over limit */
function CharCount({ value, limit }) {
  const over = value.length > limit
  return (
    <span className={`text-[10px] tabular-nums font-semibold ${over ? "text-pink-400" : "text-zinc-600"}`}>
      {value.length}/{limit}
    </span>
  )
}

function IconOptionGrid({ options, value, onChange, cols = 3 }) {
  const gridCols = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" }
  return (
    <div className={`grid ${gridCols[cols] ?? "grid-cols-3"} gap-2`}>
      {options.map((opt) => {
        const isSelected = value === opt.value
        const Icon = opt.icon
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
            <Icon size={16} className={isSelected ? "text-fuchsia-400" : "text-zinc-500"} />
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function StepProgress({ currentStep, totalSteps }) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between mb-4 px-1">
        {STEPS.map((step) => {
          const Icon = step.icon
          const isCompleted = step.id < currentStep
          const isActive    = step.id === currentStep
          return (
            <div key={step.id} className="flex flex-col items-center gap-1.5 relative z-10">
              <div className={`
                w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all duration-300
                ${isCompleted
                  ? "bg-fuchsia-600 border-fuchsia-500 shadow-[0_0_14px_rgba(217,70,239,0.5)]"
                  : isActive
                    ? "bg-zinc-900 border-fuchsia-500 shadow-[0_0_12px_rgba(217,70,239,0.3)]"
                    : "bg-zinc-900/60 border-zinc-700/50"
                }
              `}>
                {isCompleted ? (
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l4 4 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <Icon size={14} className={isActive ? "text-fuchsia-400" : "text-zinc-600"} />
                )}
              </div>
              <span className={`text-[10px] font-semibold hidden sm:block transition-colors duration-200 tracking-wide ${
                isActive ? "text-fuchsia-300" : isCompleted ? "text-fuchsia-500/70" : "text-zinc-700"
              }`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      <div className="relative h-1 bg-zinc-800/80 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-fuchsia-600 to-pink-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, boxShadow: "0 0 10px rgba(217,70,239,0.6)" }}
        />
      </div>

      <div className="flex items-center justify-between mt-2.5 px-0.5">
        <span className="text-[11px] text-zinc-600 tabular-nums">{currentStep} / {totalSteps}</span>
        <span className="text-[11px] font-semibold text-fuchsia-500 tracking-wide uppercase">
          {STEPS[currentStep - 1].label}
        </span>
      </div>
    </div>
  )
}

function StepHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800/60">
      <div className="w-9 h-9 rounded-xl bg-fuchsia-950/70 border border-fuchsia-700/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(217,70,239,0.15)]">
        <Icon size={16} className="text-fuchsia-400" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-zinc-100 tracking-tight">{title}</h3>
        <p className="text-[11px] text-zinc-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  )
}

function ToggleRow({ id, label, checked, onCheckedChange }) {
  return (
    <div className="flex items-center gap-2.5 py-1">
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange}
        className="data-[state=checked]:bg-fuchsia-600" />
      <Label htmlFor={id} className="text-xs text-zinc-400 cursor-pointer select-none">{label}</Label>
    </div>
  )
}

// ── Placement picker ──────────────────────────────────────────────────────────
function PlacementGrid({ value, onChange }) {
  return (
    <FieldSection label="Title Placement" description="Where the main title sits on the poster">
      <div className="flex gap-4 items-stretch">
        <div className="flex-shrink-0 w-32 h-44 rounded-xl border-2 border-zinc-700/60 bg-zinc-900/60 relative overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-2 gap-1.5">
            {PLACEMENTS.map((p) => {
              const isActive = value === p.value
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => onChange(p.value)}
                  className={`
                    rounded-lg transition-all duration-150 flex items-center justify-center
                    ${isActive
                      ? "bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.8)]"
                      : "bg-zinc-800/60 hover:bg-zinc-700/70 border border-zinc-700/40"
                    }
                  `}
                >
                  {isActive && <div className="w-4 h-0.5 rounded-full bg-white/90" />}
                </button>
              )
            })}
          </div>
          <div className="absolute bottom-1.5 inset-x-0 text-center pointer-events-none">
            <span className="text-[8px] text-zinc-600 font-semibold tracking-widest uppercase">Poster</span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-3 grid-rows-3 gap-1.5">
          {PLACEMENTS.map((p) => {
            const isActive = value === p.value
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => onChange(p.value)}
                className={`
                  flex items-center justify-center rounded-lg px-1 py-2 text-[10px] font-semibold
                  transition-all duration-150 leading-tight text-center
                  ${isActive
                    ? "bg-fuchsia-950/80 border border-fuchsia-600/60 text-fuchsia-300"
                    : "bg-zinc-900/50 border border-zinc-800/50 text-zinc-600 hover:text-zinc-300 hover:border-zinc-600/60 hover:bg-zinc-800/50"
                  }
                `}
              >
                {p.label}
              </button>
            )
          })}
        </div>
      </div>
    </FieldSection>
  )
}

// ── Live poster text preview (Step 2) ─────────────────────────────────────────
function PosterTextPreview({ form }) {
  const hasContent = form.eventName || form.tagline || form.eventDate || form.venue || form.prizePool

  if (!hasContent) return null

  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-zinc-800/60 flex items-center gap-2">
        <Eye size={11} className="text-fuchsia-400" />
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Poster Text Preview</span>
      </div>

      {/* Simulated poster text layout */}
      <div className="p-4 space-y-2">
        {form.eventName && (
          <p className="text-lg font-black text-zinc-100 leading-tight tracking-tight truncate">
            {form.eventName}
          </p>
        )}
        {form.tagline && (
          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
            {form.tagline}
          </p>
        )}
        {(form.eventDate || form.venue || form.prizePool) && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
            {form.showDate && form.eventDate && (
              <span className="text-[11px] text-fuchsia-400 font-semibold flex items-center gap-1">
                <CalendarDays size={10} />
                {form.eventDate}
              </span>
            )}
            {form.showVenue && form.venue && (
              <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                <MapPin size={10} />
                {form.venue}
              </span>
            )}
            {form.showPrize && form.prizePool && (
              <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                <Trophy size={10} />
                {form.prizePool}
              </span>
            )}
          </div>
        )}
        {form.organizer && (
          <p className="text-[10px] text-zinc-600 pt-0.5">by {form.organizer}</p>
        )}
      </div>

      <div className="px-4 py-2 bg-zinc-900/60 border-t border-zinc-800/40">
        <p className="text-[10px] text-zinc-600">
          This text will be overlaid on the generated background image.
        </p>
      </div>
    </div>
  )
}

// ── Confirm modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ form, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent" />
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-fuchsia-950/60 border border-fuchsia-700/40 flex items-center justify-center flex-shrink-0">
              <Wand2 size={18} className="text-fuchsia-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Generate this poster?</h2>
              <p className="text-xs text-zinc-500">Review your settings before generating</p>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4 grid grid-cols-2 gap-x-6 gap-y-3">
            {[
              { label: "Event",  value: form.eventName    || "—" },
              { label: "Style",  value: form.style              },
              { label: "Mood",   value: form.mood               },
              { label: "Ratio",  value: form.aspectRatio        },
              { label: "Colors", value: form.colorScheme        },
              { label: "Venue",  value: form.venue        || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="min-w-0">
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">{label}</p>
                <p className="text-xs text-zinc-300 truncate capitalize mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Reminder about what the AI generates */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
            <Info size={13} className="text-fuchsia-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              The AI generates a <strong className="text-zinc-300">background image only</strong> — no text is rendered by the AI. Your event text will be overlaid cleanly on top.
            </p>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onCancel}
              className="flex-1 h-10 rounded-xl border border-zinc-700/50 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-sm font-medium transition-colors duration-150">
              Cancel
            </button>
            <button type="button" onClick={onConfirm}
              className="flex-1 h-10 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white text-sm font-semibold shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_28px_rgba(217,70,239,0.45)] transition-all duration-150 flex items-center justify-center gap-2">
              <Wand2 size={14} />
              Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Constants ─────────────────────────────────────────────────────────────────
const inputCls = "bg-zinc-900/80 border-zinc-700/50 text-zinc-100 placeholder-zinc-600 focus:border-fuchsia-600/50 focus:ring-1 focus:ring-fuchsia-600/20 rounded-xl h-11"
const halfGrid  = "grid grid-cols-1 sm:grid-cols-2 gap-4"

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PosterForm({ onGenerate, isLoading }) {
  const [step, setStep]               = useState(1)
  const [showConfirm, setShowConfirm] = useState(false)

  const [form, setForm] = useState({
    // ── Text fields (overlaid on poster) ──
    eventName:      "",   // Main title  (≤ 40 chars)
    tagline:        "",   // One-liner   (≤ 80 chars)
    eventDate:      "",   // e.g. "July 25–26, 2025"
    venue:          "",   // e.g. "DLSU Manila"
    prizePool:      "",   // e.g. "₱50,000"
    organizer:      "",   // e.g. "ByteOn"

    // ── Toggle visibility on poster ──
    showDate:       true,
    showVenue:      true,
    showPrize:      true,

    // ── Style / generation settings (NOT rendered as text) ──
    style:          "modern bold",
    mood:           "energetic and exciting",
    colorScheme:    "cyberpunk neon purple and pink",
    backgroundType: "geometric",
    fontStyle:      "display bold",
    aspectRatio:    "2:3",
    titlePlacement: "top-center",
    extraDetails:   "",
  })

  const set    = (key) => (val) => setForm((f) => ({ ...f, [key]: val }))
  const setVal = (key) => (e)   => setForm((f) => ({ ...f, [key]: e.target.value }))

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length))
  const prev = () => setStep((s) => Math.max(s - 1, 1))

  const handleSubmit = (e) => {
    e.preventDefault()
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    setShowConfirm(false)

    // ── Build a clean, minimal description for text overlay ──
    // Rule: only include a field if the user filled it in AND toggled it on.
    // Keep the total short — this text gets rendered on the poster, so less is more.
    const overlayLines = [
      form.showDate  && form.eventDate  ? form.eventDate              : null,
      form.showVenue && form.venue      ? form.venue                  : null,
      form.showPrize && form.prizePool  ? `Prize: ${form.prizePool}`  : null,
      form.organizer                    ? `by ${form.organizer}`      : null,
    ].filter(Boolean)

    const enrichedForm = {
      ...form,
      // title / subtitle / description are used by the text overlay renderer, NOT the image AI
      title:       form.eventName || "",
      subtitle:    form.tagline   || "",
      description: overlayLines.join(" · "),   // compact single line — avoids crowding
    }

    onGenerate(enrichedForm)
  }

  return (
    <div>
      {showConfirm && (
        <ConfirmModal form={form} onConfirm={handleConfirm} onCancel={() => setShowConfirm(false)} />
      )}

      <form onSubmit={handleSubmit}>
        <StepProgress currentStep={step} totalSteps={STEPS.length} />

        {/* ══════════════════════════════════════════════════════════
            STEP 1 — Event (core info)
        ══════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
            <StepHeader
              icon={CalendarDays}
              title="Event Details"
              subtitle="Keep each field short — they'll be overlaid on the poster"
            />

            {/* Info banner */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
              <AlertCircle size={13} className="text-fuchsia-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Fields marked <OnPosterBadge /> appear as text on the poster. Keep them brief to avoid crowding.
              </p>
            </div>

            {/* Event name */}
            <FieldSection
              label={<span className="flex items-center gap-2">Event Name <OnPosterBadge /></span>}
              description="The main title — short and memorable"
            >
              <div className="relative">
                <Input
                  value={form.eventName}
                  onChange={setVal("eventName")}
                  maxLength={LIMITS.eventName}
                  placeholder="e.g. Kaede Hack 2025"
                  className={inputCls}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <CharCount value={form.eventName} limit={LIMITS.eventName} />
                </div>
              </div>
            </FieldSection>

            {/* Date block */}
            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4 space-y-3">
              <ToggleRow
                id="showDate"
                label="Show date on poster"
                checked={form.showDate}
                onCheckedChange={set("showDate")}
              />
              {form.showDate && (
                <FieldSection
                  label={<span className="flex items-center gap-2">Event Date <OnPosterBadge /></span>}
                  description="Type freely — e.g. July 25–26, 2025"
                >
                  <div className="relative">
                    <CalendarDays size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                    <Input
                      value={form.eventDate}
                      onChange={setVal("eventDate")}
                      maxLength={LIMITS.eventDate}
                      placeholder="e.g. July 25–26, 2025"
                      className={`${inputCls} pl-9`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <CharCount value={form.eventDate} limit={LIMITS.eventDate} />
                    </div>
                  </div>
                </FieldSection>
              )}
            </div>

            {/* Venue block */}
            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4 space-y-3">
              <ToggleRow
                id="showVenue"
                label="Show venue on poster"
                checked={form.showVenue}
                onCheckedChange={set("showVenue")}
              />
              {form.showVenue && (
                <FieldSection
                  label={<span className="flex items-center gap-2">Venue / Location <OnPosterBadge /></span>}
                >
                  <div className="relative">
                    <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                    <Input
                      value={form.venue}
                      onChange={setVal("venue")}
                      maxLength={LIMITS.venue}
                      placeholder="e.g. DLSU Manila"
                      className={`${inputCls} pl-9`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <CharCount value={form.venue} limit={LIMITS.venue} />
                    </div>
                  </div>
                </FieldSection>
              )}
            </div>

            {/* Prize block */}
            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4 space-y-3">
              <ToggleRow
                id="showPrize"
                label="Show prize on poster"
                checked={form.showPrize}
                onCheckedChange={set("showPrize")}
              />
              {form.showPrize && (
                <FieldSection
                  label={<span className="flex items-center gap-2">Total Prize Pool <OnPosterBadge /></span>}
                >
                  <div className="relative">
                    <Trophy size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none" />
                    <Input
                      value={form.prizePool}
                      onChange={setVal("prizePool")}
                      maxLength={LIMITS.prizePool}
                      placeholder="e.g. ₱50,000"
                      className={`${inputCls} pl-9`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <CharCount value={form.prizePool} limit={LIMITS.prizePool} />
                    </div>
                  </div>
                </FieldSection>
              )}
            </div>

            {/* Organizer */}
            <FieldSection
              label={<span className="flex items-center gap-2">Organized By <OnPosterBadge /></span>}
              description="Shown in small print — keep it brief"
            >
              <div className="relative">
                <Users size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                <Input
                  value={form.organizer}
                  onChange={setVal("organizer")}
                  maxLength={LIMITS.organizer}
                  placeholder="e.g. ByteOn / GDSC DLSU"
                  className={`${inputCls} pl-9`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <CharCount value={form.organizer} limit={LIMITS.organizer} />
                </div>
              </div>
            </FieldSection>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STEP 2 — Tagline / poster text
        ══════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
            <StepHeader
              icon={FileText}
              title="Poster Tagline"
              subtitle="One short line displayed under the event name"
            />

            <FieldSection
              label={<span className="flex items-center gap-2">Tagline / Hook <OnPosterBadge /></span>}
              description="1 sentence max — shorter is always better"
            >
              <Textarea
                value={form.tagline}
                onChange={setVal("tagline")}
                maxLength={LIMITS.tagline}
                placeholder="e.g. Build. Innovate. Win. 24 hours to change the game."
                rows={3}
                className="bg-zinc-900/80 border-zinc-700/50 text-zinc-100 placeholder-zinc-600 focus:border-fuchsia-600/50 focus:ring-1 focus:ring-fuchsia-600/20 rounded-xl resize-none text-sm leading-relaxed"
              />
            </FieldSection>

            {/* Character feedback */}
            <div className="flex items-center justify-between px-0.5">
              <p className="text-[11px] text-zinc-600">
                {form.tagline.length === 0
                  ? "Optional — leave blank for a clean, text-light poster"
                  : form.tagline.length > 60
                    ? "⚠ Getting long — consider trimming for impact"
                    : "✓ Good length"
                }
              </p>
              <CharCount value={form.tagline} limit={LIMITS.tagline} />
            </div>

            {/* Live preview */}
            <PosterTextPreview form={form} />

            {/* Design tip */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
              <Info size={13} className="text-zinc-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                <strong className="text-zinc-400">Design tip:</strong> Fewer words = more impact.
                The background image does the heavy lifting — your tagline just needs to land the punch.
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STEP 3 — Layout
        ══════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
            <StepHeader
              icon={LayoutTemplate}
              title="Layout & Placement"
              subtitle="Where text sits and what dimensions to use"
            />

            <PlacementGrid value={form.titlePlacement} onChange={set("titlePlacement")} />

            <FieldSection label="Aspect Ratio" description="Choose your poster dimensions">
              <div className="grid grid-cols-3 gap-2">
                {RATIOS.map(({ value, label, Icon, sub, extraCls }) => {
                  const isSelected = form.aspectRatio === value
                  return (
                    <button key={value} type="button" onClick={() => set("aspectRatio")(value)}
                      className={`
                        flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-xs
                        transition-all duration-150
                        ${isSelected
                          ? "bg-fuchsia-950/60 border-fuchsia-500 text-fuchsia-300 shadow-[0_0_12px_rgba(217,70,239,0.2)]"
                          : "bg-zinc-900/60 border-zinc-700/50 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60"
                        }
                      `}
                    >
                      <Icon size={18} className={`${isSelected ? "text-fuchsia-400" : "text-zinc-500"} ${extraCls ?? ""}`} />
                      <span className="font-bold">{label}</span>
                      <span className={`text-[10px] ${isSelected ? "text-fuchsia-400" : "text-zinc-600"}`}>{sub}</span>
                    </button>
                  )
                })}
              </div>
            </FieldSection>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STEP 4 — Style
        ══════════════════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
            <StepHeader
              icon={Layers}
              title="Visual Style"
              subtitle="Aesthetic, mood, and background type — affects the AI image generation"
            />

            <FieldSection label="Poster Style" description="Overall design aesthetic">
              <IconOptionGrid options={STYLES} value={form.style} onChange={set("style")} cols={3} />
            </FieldSection>

            <FieldSection label="Mood" description="Emotional tone of the background">
              <IconOptionGrid options={MOODS} value={form.mood} onChange={set("mood")} cols={3} />
            </FieldSection>

            <FieldSection label="Background Type">
              <IconOptionGrid options={BACKGROUNDS} value={form.backgroundType} onChange={set("backgroundType")} cols={3} />
            </FieldSection>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STEP 5 — Colors + Generate
        ══════════════════════════════════════════════════════════ */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
            <StepHeader
              icon={Palette}
              title="Colors & Typography"
              subtitle="Color palette and font style for the overall look"
            />

            <ColorSwatch value={form.colorScheme} onChange={set("colorScheme")} />

            <FieldSection label="Font Style" description="Influences the atmosphere of the generated background">
              <IconOptionGrid options={FONTS} value={form.fontStyle} onChange={set("fontStyle")} cols={3} />
            </FieldSection>

            <FieldSection
              label="Extra AI Instructions"
              description="Describe additional visual elements — NOT text or words"
            >
              <Textarea
                value={form.extraDetails}
                onChange={setVal("extraDetails")}
                placeholder="e.g. Add glowing circuit board patterns in the background, neon grid lines, electric blue accents..."
                rows={3}
                className="bg-zinc-900/80 border-zinc-700/50 text-zinc-100 placeholder-zinc-600 focus:border-fuchsia-600/50 focus:ring-1 focus:ring-fuchsia-600/20 rounded-xl resize-none"
              />
              <p className="text-[10px] text-zinc-600 mt-1.5 flex items-center gap-1">
                <EyeOff size={10} />
                This affects the image background only — not the text overlay.
              </p>
            </FieldSection>

            {/* Final summary */}
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800/60">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Poster Summary</p>
              </div>
              <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
                {[
                  { label: "Event",  value: form.eventName   || "—" },
                  { label: "Date",   value: form.eventDate   || "—" },
                  { label: "Venue",  value: form.venue       || "—" },
                  { label: "Prize",  value: form.prizePool   || "—" },
                  { label: "Style",  value: form.style           },
                  { label: "Ratio",  value: form.aspectRatio     },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-baseline gap-1.5 min-w-0">
                    <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold flex-shrink-0">{label}</span>
                    <span className="text-xs text-zinc-300 truncate capitalize">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="flex items-center gap-3 mt-8">
          {step > 1 && (
            <Button type="button" onClick={prev} variant="outline"
              className="flex-1 h-11 border-zinc-700/50 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 rounded-xl gap-2 font-medium">
              <ChevronLeft size={15} />
              Back
            </Button>
          )}

          {step < STEPS.length ? (
            <Button type="button" onClick={next}
              className="flex-1 h-11 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white rounded-xl gap-2 font-semibold shadow-[0_0_18px_rgba(217,70,239,0.25)] hover:shadow-[0_0_26px_rgba(217,70,239,0.4)] transition-all duration-200">
              Next
              <ChevronRight size={15} />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isLoading}
              className={`
                flex-1 h-11 rounded-xl gap-2 font-semibold transition-all duration-200
                ${isLoading
                  ? "bg-zinc-800/60 border border-zinc-700/40 text-zinc-500 cursor-not-allowed opacity-60"
                  : "bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_28px_rgba(217,70,239,0.45)]"
                }
              `}
            >
              <Wand2 size={15} className={isLoading ? "animate-spin" : ""} />
              {isLoading ? "Generating..." : "Generate Poster"}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}