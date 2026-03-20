"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Type, AlignCenter, Palette, Sparkles, ChevronRight,
  ChevronLeft, Wand2, LayoutTemplate, ImageIcon,
  Minus, Triangle, Camera, Shapes, Clapperboard,
  Leaf, Square, Zap, Moon, Flame, PartyPopper,
  Star, CircleDot, Layers, Sun, Globe, Building,
  Atom, AlignLeft, AlignRight, AlignStartVertical,
  Columns2, RectangleHorizontal, Smartphone,
  Monitor, Instagram, Trophy, CalendarDays,
  MapPin, Users, Clock, AlertCircle, Tag
} from "lucide-react"
import FieldSection from "./field-section"
import PlacementPicker from "./placement-picker"
import ColorSwatch from "./color-swatch"

// ── Steps ─────────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Event",   icon: CalendarDays  },
  { id: 2, label: "Text",    icon: Type          },
  { id: 3, label: "Layout",  icon: LayoutTemplate },
  { id: 4, label: "Style",   icon: Layers        },
  { id: 5, label: "Colors",  icon: Palette       },
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
  { value: "gradient",    label: "Gradient",  icon: Layers    },
  { value: "solid color", label: "Solid",     icon: Square    },
  { value: "textured",    label: "Textured",  icon: Shapes    },
  { value: "bokeh",       label: "Bokeh",     icon: CircleDot },
  { value: "geometric",   label: "Geometric", icon: Atom      },
  { value: "nature photo",label: "Nature",    icon: Leaf      },
  { value: "urban",       label: "Urban",     icon: Building  },
  { value: "abstract art",label: "Abstract",  icon: Palette   },
  { value: "space galaxy",label: "Space",     icon: Globe     },
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
  { value: "1:1",  label: "1:1",  Icon: Square,              sub: "Square"   },
  { value: "3:4",  label: "3:4",  Icon: Smartphone,          sub: "Story"    },
  { value: "16:9", label: "16:9", Icon: Monitor,             sub: "Wide"     },
  { value: "9:16", label: "9:16", Icon: Smartphone,          sub: "Reel"     },
  { value: "4:5",  label: "4:5",  Icon: Instagram,           sub: "Feed"     },
]

// ── Shared sub-components ─────────────────────────────────────────────────────
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
      <div className="flex items-center justify-between mb-3">
        {STEPS.map((step) => {
          const Icon = step.icon
          const isCompleted = step.id < currentStep
          const isActive    = step.id === currentStep
          return (
            <div key={step.id} className="flex flex-col items-center gap-1.5">
              <div className={`
                w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-300
                ${isCompleted
                  ? "bg-fuchsia-600 border-fuchsia-500 shadow-[0_0_12px_rgba(217,70,239,0.4)]"
                  : isActive
                    ? "bg-fuchsia-950/80 border-fuchsia-500 shadow-[0_0_12px_rgba(217,70,239,0.3)]"
                    : "bg-zinc-900/60 border-zinc-700/50"
                }
              `}>
                {isCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l4 4 6-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <Icon size={15} className={isActive ? "text-fuchsia-300" : "text-zinc-600"} />
                )}
              </div>
              <span className={`text-[10px] font-medium hidden sm:block transition-colors duration-200 ${
                isActive ? "text-fuchsia-300" : isCompleted ? "text-fuchsia-500" : "text-zinc-600"
              }`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Track */}
      <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-fuchsia-600 to-pink-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(217,70,239,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-zinc-500">Step {currentStep} of {totalSteps}</span>
        <span className="text-xs font-medium text-fuchsia-400">{STEPS[currentStep - 1].label}</span>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PosterForm({ onGenerate, isLoading }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    // Hackathon event details
    eventName:        "",
    eventDate:        "",
    eventEndDate:     "",
    eventTime:        "",
    venue:            "",
    prizePool:        "",
    firstPrize:       "",
    secondPrize:      "",
    thirdPrize:       "",
    teamSize:         "",
    registrationLink: "",
    registrationDeadline: "",
    organizer:        "",
    theme:            "",
    showPrize:        true,
    showDate:         true,
    showVenue:        true,
    showTeamSize:     true,
    // Poster content
    title:            "",
    subtitle:         "",
    description:      "",
    showTitle:        true,
    showSubtitle:     true,
    extraDetails:     "",
    // Design
    style:            "modern bold",
    mood:             "energetic and exciting",
    colorScheme:      "cyberpunk neon purple and pink",
    titlePlacement:   "top-center",
    backgroundType:   "geometric",
    aspectRatio:      "2:3",
    fontStyle:        "display bold",
  })

  const set    = (key) => (val) => setForm((f) => ({ ...f, [key]: val }))
  const setVal = (key) => (e)   => setForm((f) => ({ ...f, [key]: e.target.value }))

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length))
  const prev = () => setStep((s) => Math.max(s - 1, 1))

  const handleSubmit = (e) => {
    e.preventDefault()
    // Build enriched description from hackathon fields
    const enrichedForm = {
      ...form,
      description: [
        form.theme         ? `Theme: ${form.theme}` : "",
        form.eventDate     ? `Date: ${form.eventDate}${form.eventEndDate ? ` to ${form.eventEndDate}` : ""}` : "",
        form.eventTime     ? `Time: ${form.eventTime}` : "",
        form.venue         ? `Venue: ${form.venue}` : "",
        form.prizePool     ? `Total prize pool: ${form.prizePool}` : "",
        form.firstPrize    ? `1st place: ${form.firstPrize}` : "",
        form.secondPrize   ? `2nd place: ${form.secondPrize}` : "",
        form.thirdPrize    ? `3rd place: ${form.thirdPrize}` : "",
        form.teamSize      ? `Team size: ${form.teamSize}` : "",
        form.organizer     ? `Organized by: ${form.organizer}` : "",
        form.registrationDeadline ? `Registration deadline: ${form.registrationDeadline}` : "",
        form.description,
      ].filter(Boolean).join(". "),
    }
    onGenerate(enrichedForm)
  }

  const inputCls = "bg-zinc-900/80 border-zinc-700/50 text-zinc-100 placeholder-zinc-600 focus:border-fuchsia-600/50 focus:ring-1 focus:ring-fuchsia-600/20 rounded-xl h-11"
  const halfGrid = "grid grid-cols-1 sm:grid-cols-2 gap-4"

  return (
    <form onSubmit={handleSubmit}>
      <StepProgress currentStep={step} totalSteps={STEPS.length} />

      {/* ── Step 1: Event Details ── */}
      {step === 1 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-950/60 border border-fuchsia-700/40 flex items-center justify-center">
              <CalendarDays size={15} className="text-fuchsia-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Event Details</h3>
              <p className="text-xs text-zinc-500">Hackathon info that will appear on the poster</p>
            </div>
          </div>

          {/* Event name + theme */}
          <div className={halfGrid}>
            <FieldSection label="Event Name" description="Name of the hackathon">
              <Input value={form.eventName} onChange={setVal("eventName")}
                placeholder="e.g. Kaede Hackathon 2025" className={inputCls} />
            </FieldSection>
            <FieldSection label="Theme" description="Hackathon theme or track">
              <div className="relative">
                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <Input value={form.theme} onChange={setVal("theme")}
                  placeholder="e.g. AI for Social Good" className={`${inputCls} pl-9`} />
              </div>
            </FieldSection>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-2">
            <Switch id="showDate" checked={form.showDate} onCheckedChange={set("showDate")} />
            <Label htmlFor="showDate" className="text-xs text-zinc-400 cursor-pointer">Show dates on poster</Label>
          </div>

          {form.showDate && (
            <div className={halfGrid}>
              <FieldSection label="Start Date">
                <div className="relative">
                  <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <Input type="date" value={form.eventDate} onChange={setVal("eventDate")}
                    className={`${inputCls} pl-9 [color-scheme:dark]`} />
                </div>
              </FieldSection>
              <FieldSection label="End Date">
                <div className="relative">
                  <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <Input type="date" value={form.eventEndDate} onChange={setVal("eventEndDate")}
                    className={`${inputCls} pl-9 [color-scheme:dark]`} />
                </div>
              </FieldSection>
              <FieldSection label="Time">
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <Input type="time" value={form.eventTime} onChange={setVal("eventTime")}
                    className={`${inputCls} pl-9 [color-scheme:dark]`} />
                </div>
              </FieldSection>
              <FieldSection label="Registration Deadline">
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <Input type="date" value={form.registrationDeadline} onChange={setVal("registrationDeadline")}
                    className={`${inputCls} pl-9 [color-scheme:dark]`} />
                </div>
              </FieldSection>
            </div>
          )}

          {/* Venue */}
          <div className="flex items-center gap-2">
            <Switch id="showVenue" checked={form.showVenue} onCheckedChange={set("showVenue")} />
            <Label htmlFor="showVenue" className="text-xs text-zinc-400 cursor-pointer">Show venue on poster</Label>
          </div>

          {form.showVenue && (
            <FieldSection label="Venue / Location">
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <Input value={form.venue} onChange={setVal("venue")}
                  placeholder="e.g. DLSU Manila, TechHub, Online" className={`${inputCls} pl-9`} />
              </div>
            </FieldSection>
          )}

          {/* Prizes */}
          <div className="flex items-center gap-2">
            <Switch id="showPrize" checked={form.showPrize} onCheckedChange={set("showPrize")} />
            <Label htmlFor="showPrize" className="text-xs text-zinc-400 cursor-pointer">Show prizes on poster</Label>
          </div>

          {form.showPrize && (
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Trophy size={14} className="text-amber-400" />
                <span className="text-xs font-semibold text-zinc-300">Prize Breakdown</span>
              </div>

              <FieldSection label="Total Prize Pool">
                <div className="relative">
                  <Trophy size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                  <Input value={form.prizePool} onChange={setVal("prizePool")}
                    placeholder="e.g. ₱50,000 or $10,000" className={`${inputCls} pl-9`} />
                </div>
              </FieldSection>

              <div className={halfGrid}>
                <FieldSection label="🥇 1st Place">
                  <Input value={form.firstPrize} onChange={setVal("firstPrize")}
                    placeholder="e.g. ₱20,000" className={inputCls} />
                </FieldSection>
                <FieldSection label="🥈 2nd Place">
                  <Input value={form.secondPrize} onChange={setVal("secondPrize")}
                    placeholder="e.g. ₱10,000" className={inputCls} />
                </FieldSection>
                <FieldSection label="🥉 3rd Place">
                  <Input value={form.thirdPrize} onChange={setVal("thirdPrize")}
                    placeholder="e.g. ₱5,000" className={inputCls} />
                </FieldSection>
                <FieldSection label="Team Size">
                  <div className="relative">
                    <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <Input value={form.teamSize} onChange={setVal("teamSize")}
                      placeholder="e.g. 2–4 members" className={`${inputCls} pl-9`} />
                  </div>
                </FieldSection>
              </div>
            </div>
          )}

          {/* Organizer */}
          <FieldSection label="Organized By" description="Who's hosting the hackathon">
            <Input value={form.organizer} onChange={setVal("organizer")}
              placeholder="e.g. ByteOn, GDSC DLSU, ACM Chapter"
              className={inputCls} />
          </FieldSection>
        </div>
      )}

      {/* ── Step 2: Poster Text ── */}
      {step === 2 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-950/60 border border-fuchsia-700/40 flex items-center justify-center">
              <Type size={15} className="text-fuchsia-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Poster Text</h3>
              <p className="text-xs text-zinc-500">Headlines and descriptions shown on the poster</p>
            </div>
          </div>

          <FieldSection label="Main Title" description="Big headline — usually the hackathon name">
            <div className="flex items-center gap-3">
              <Input value={form.title} onChange={setVal("title")}
                placeholder="e.g. KAEDE HACKATHON" disabled={!form.showTitle}
                className={inputCls} />
              <div className="flex items-center gap-2 flex-shrink-0">
                <Switch id="showTitle" checked={form.showTitle} onCheckedChange={set("showTitle")} />
                <Label htmlFor="showTitle" className="text-xs text-zinc-500 cursor-pointer whitespace-nowrap">Show</Label>
              </div>
            </div>
          </FieldSection>

          <FieldSection label="Subtitle" description="A tagline or date line below the title">
            <div className="flex items-center gap-3">
              <Input value={form.subtitle} onChange={setVal("subtitle")}
                placeholder="e.g. Build. Innovate. Win." disabled={!form.showSubtitle}
                className={inputCls} />
              <div className="flex items-center gap-2 flex-shrink-0">
                <Switch id="showSubtitle" checked={form.showSubtitle} onCheckedChange={set("showSubtitle")} />
                <Label htmlFor="showSubtitle" className="text-xs text-zinc-500 cursor-pointer whitespace-nowrap">Show</Label>
              </div>
            </div>
          </FieldSection>

          <FieldSection label="Extra Description" description="Any other copy to include">
            <Textarea value={form.description} onChange={setVal("description")}
              placeholder="e.g. Join us for 24 hours of building, learning, and competing for amazing prizes..."
              rows={4}
              className="bg-zinc-900/80 border-zinc-700/50 text-zinc-100 placeholder-zinc-600 focus:border-fuchsia-600/50 focus:ring-1 focus:ring-fuchsia-600/20 rounded-xl resize-none" />
          </FieldSection>
        </div>
      )}

      {/* ── Step 3: Layout ── */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-950/60 border border-fuchsia-700/40 flex items-center justify-center">
              <LayoutTemplate size={15} className="text-fuchsia-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Layout & Placement</h3>
              <p className="text-xs text-zinc-500">Where text sits and what dimensions to use</p>
            </div>
          </div>

          <PlacementPicker value={form.titlePlacement} onChange={set("titlePlacement")} />

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

      {/* ── Step 4: Style ── */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-950/60 border border-fuchsia-700/40 flex items-center justify-center">
              <Layers size={15} className="text-fuchsia-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Visual Style</h3>
              <p className="text-xs text-zinc-500">Aesthetic, mood, and background type</p>
            </div>
          </div>

          <FieldSection label="Poster Style" description="Overall design aesthetic">
            <IconOptionGrid options={STYLES} value={form.style} onChange={set("style")} cols={3} />
          </FieldSection>

          <FieldSection label="Mood" description="Emotional tone">
            <IconOptionGrid options={MOODS} value={form.mood} onChange={set("mood")} cols={3} />
          </FieldSection>

          <FieldSection label="Background Type">
            <IconOptionGrid options={BACKGROUNDS} value={form.backgroundType} onChange={set("backgroundType")} cols={3} />
          </FieldSection>
        </div>
      )}

      {/* ── Step 5: Colors + Generate ── */}
      {step === 5 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-950/60 border border-fuchsia-700/40 flex items-center justify-center">
              <Palette size={15} className="text-fuchsia-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Colors & Typography</h3>
              <p className="text-xs text-zinc-500">Color scheme and font style</p>
            </div>
          </div>

          <ColorSwatch value={form.colorScheme} onChange={set("colorScheme")} />

          <FieldSection label="Font Style">
            <IconOptionGrid options={FONTS} value={form.fontStyle} onChange={set("fontStyle")} cols={3} />
          </FieldSection>

          <FieldSection label="Extra AI Instructions" description="Any other details for the AI">
            <Textarea value={form.extraDetails} onChange={setVal("extraDetails")}
              placeholder="e.g. Add circuit board patterns in the background, use glowing neon outlines, make it feel futuristic..."
              rows={3}
              className="bg-zinc-900/80 border-zinc-700/50 text-zinc-100 placeholder-zinc-600 focus:border-fuchsia-600/50 focus:ring-1 focus:ring-fuchsia-600/20 rounded-xl resize-none" />
          </FieldSection>

          {/* Summary */}
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide mb-3">Poster summary</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {[
                { label: "Event",   value: form.eventName || form.title || "—"  },
                { label: "Date",    value: form.eventDate  || "—"               },
                { label: "Venue",   value: form.venue      || "—"               },
                { label: "Prize",   value: form.prizePool  || "—"               },
                { label: "Style",   value: form.style                           },
                { label: "Ratio",   value: form.aspectRatio                     },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-baseline gap-1.5 min-w-0">
                  <span className="text-[10px] text-zinc-600 uppercase tracking-wide flex-shrink-0">{label}</span>
                  <span className="text-xs text-zinc-300 truncate capitalize">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Disabled notice */}
          <div className="flex items-start gap-3 p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl">
            <AlertCircle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-300">Image generation temporarily unavailable</p>
              <p className="text-xs text-amber-500/80 mt-0.5">
                The free AI image service is being fixed. Your poster settings are saved — generation will be enabled once the API is stable.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="flex items-center gap-3 mt-8">
        {step > 1 && (
          <Button type="button" onClick={prev} variant="outline"
            className="flex-1 h-11 border-zinc-700/50 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 rounded-xl gap-2">
            <ChevronLeft size={16} />
            Back
          </Button>
        )}

        {step < STEPS.length ? (
          <Button type="button" onClick={next}
            className="flex-1 h-11 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600/50 text-zinc-100 rounded-xl gap-2 font-medium">
            Next
            <ChevronRight size={16} />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={true}  // ← disabled until API is stable
            title="Image generation is temporarily unavailable"
            className="flex-1 h-11 rounded-xl gap-2 font-semibold
              bg-zinc-800/60 border border-zinc-700/40 text-zinc-500
              cursor-not-allowed opacity-60 select-none"
          >
            <Wand2 size={16} />
            Generate Poster
            <Badge variant="outline" className="ml-1 text-[9px] border-amber-700/50 text-amber-500 bg-amber-950/30 py-0">
              Soon
            </Badge>
          </Button>
        )}
      </div>

      {step === STEPS.length && (
        <p className="text-center text-xs text-zinc-700 mt-3">
          Will use FLUX.1-schnell · Hugging Face free tier
        </p>
      )}
    </form>
  )
}