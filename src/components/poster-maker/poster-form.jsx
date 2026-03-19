// components/poster-maker/PosterForm.jsx
"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import FieldSection from "./field-section"
import OptionGrid from "./option-grid"
import PlacementPicker from "./placement-picker"
import ColorSwatch from "./color-swatch"

const STYLES = [
  { value: "minimalist",       label: "Minimalist",  icon: "◻" },
  { value: "vintage retro",    label: "Vintage",     icon: "📻" },
  { value: "modern bold",      label: "Modern",      icon: "▲" },
  { value: "illustrated",      label: "Illustrated", icon: "🎨" },
  { value: "photorealistic",   label: "Photo",       icon: "📷" },
  { value: "abstract",         label: "Abstract",    icon: "◎" },
  { value: "art nouveau",      label: "Art Nouveau", icon: "🌿" },
  { value: "brutalist",        label: "Brutalist",   icon: "■" },
  { value: "cinematic",        label: "Cinematic",   icon: "🎬" },
]

const MOODS = [
  { value: "energetic and exciting", label: "Energetic", icon: "⚡" },
  { value: "calm and peaceful",      label: "Calm",      icon: "🌙" },
  { value: "dramatic and intense",   label: "Dramatic",  icon: "🔥" },
  { value: "playful and fun",        label: "Playful",   icon: "🎉" },
  { value: "elegant and luxurious",  label: "Elegant",   icon: "✨" },
  { value: "mysterious and dark",    label: "Mysterious",icon: "🌑" },
]

const BACKGROUNDS = [
  { value: "gradient",   label: "Gradient",  icon: "🌈" },
  { value: "solid color",label: "Solid",     icon: "🟥" },
  { value: "textured",   label: "Textured",  icon: "📄" },
  { value: "bokeh",      label: "Bokeh",     icon: "🔵" },
  { value: "geometric",  label: "Geometric", icon: "⬡" },
  { value: "nature photo",label: "Nature",   icon: "🌲" },
  { value: "urban",      label: "Urban",     icon: "🏙" },
  { value: "abstract art",label: "Abstract", icon: "🎭" },
  { value: "space galaxy",label: "Space",    icon: "🌌" },
]

const FONTS = [
  { value: "serif elegant",      label: "Serif",      icon: "T" },
  { value: "sans-serif modern",  label: "Sans",       icon: "T" },
  { value: "display bold",       label: "Display",    icon: "𝗧" },
  { value: "handwritten script", label: "Script",     icon: "𝒯" },
  { value: "monospace",          label: "Mono",       icon: "T̲" },
  { value: "condensed tall",     label: "Condensed",  icon: "Ⅎ" },
]

const RATIOS = [
  { value: "2:3",  label: "2:3",  icon: "🖼", sub: "Portrait" },
  { value: "1:1",  label: "1:1",  icon: "⬛", sub: "Square"   },
  { value: "3:4",  label: "3:4",  icon: "📱", sub: "Story"    },
  { value: "16:9", label: "16:9", icon: "🖥", sub: "Wide"     },
  { value: "9:16", label: "9:16", icon: "📲", sub: "Reel"     },
  { value: "4:5",  label: "4:5",  icon: "📸", sub: "Feed"     },
]

export default function PosterForm({ onGenerate, isLoading }) {
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    style: "modern bold",
    mood: "energetic and exciting",
    colorScheme: "luxury gold and black",
    titlePlacement: "center",
    backgroundType: "gradient",
    aspectRatio: "2:3",
    fontStyle: "display bold",
    showTitle: true,
    showSubtitle: true,
    extraDetails: "",
  })

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }))
  const setVal = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onGenerate(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ── Text Content ── */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-fuchsia-700/50 text-fuchsia-400 bg-fuchsia-950/30 text-[10px]">01</Badge>
          <h3 className="text-sm font-semibold text-zinc-200">Text Content</h3>
        </div>

        <FieldSection label="Poster Title" description="The main headline of your poster">
          <div className="flex items-center gap-3">
            <Input
              value={form.title}
              onChange={setVal("title")}
              placeholder="e.g. SUMMER FESTIVAL 2025"
              disabled={!form.showTitle}
              className="bg-zinc-900 border-zinc-700/50 text-zinc-100 placeholder-zinc-600 focus:border-fuchsia-600/50 focus:ring-fuchsia-600/20"
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              <Switch
                id="showTitle"
                checked={form.showTitle}
                onCheckedChange={set("showTitle")}
              />
              <Label htmlFor="showTitle" className="text-xs text-zinc-500 cursor-pointer">Show</Label>
            </div>
          </div>
        </FieldSection>

        <FieldSection label="Subtitle" description="Secondary text below the title">
          <div className="flex items-center gap-3">
            <Input
              value={form.subtitle}
              onChange={setVal("subtitle")}
              placeholder="e.g. August 14–16 · Central Park, NY"
              disabled={!form.showSubtitle}
              className="bg-zinc-900 border-zinc-700/50 text-zinc-100 placeholder-zinc-600 focus:border-fuchsia-600/50 focus:ring-fuchsia-600/20"
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              <Switch
                id="showSubtitle"
                checked={form.showSubtitle}
                onCheckedChange={set("showSubtitle")}
              />
              <Label htmlFor="showSubtitle" className="text-xs text-zinc-500 cursor-pointer">Show</Label>
            </div>
          </div>
        </FieldSection>

        <FieldSection label="Description / Concept" description="Describe the vibe, event, or story behind the poster">
          <Textarea
            value={form.description}
            onChange={setVal("description")}
            placeholder="e.g. An outdoor music festival with indie bands, food trucks and a golden hour aesthetic. Think Coachella meets Woodstock..."
            rows={3}
            className="bg-zinc-900 border-zinc-700/50 text-zinc-100 placeholder-zinc-600 focus:border-fuchsia-600/50 focus:ring-fuchsia-600/20 resize-none"
          />
        </FieldSection>
      </div>

      <Separator className="border-zinc-800" />

      {/* ── Layout ── */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-fuchsia-700/50 text-fuchsia-400 bg-fuchsia-950/30 text-[10px]">02</Badge>
          <h3 className="text-sm font-semibold text-zinc-200">Layout & Placement</h3>
        </div>

        <PlacementPicker value={form.titlePlacement} onChange={set("titlePlacement")} />

        <FieldSection label="Aspect Ratio" description="Choose your poster dimensions">
          <div className="grid grid-cols-3 gap-2">
            {RATIOS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => set("aspectRatio")(r.value)}
                className={`
                  flex flex-col items-center gap-1 px-2 py-3 rounded-xl border text-xs transition-all duration-150
                  ${form.aspectRatio === r.value
                    ? "bg-fuchsia-950/60 border-fuchsia-500 text-fuchsia-300 shadow-[0_0_12px_rgba(217,70,239,0.2)]"
                    : "bg-zinc-900 border-zinc-700/50 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                  }
                `}
              >
                <span className="text-lg">{r.icon}</span>
                <span className="font-bold">{r.label}</span>
                <span className={`text-[10px] ${form.aspectRatio === r.value ? "text-fuchsia-400" : "text-zinc-600"}`}>{r.sub}</span>
              </button>
            ))}
          </div>
        </FieldSection>
      </div>

      <Separator className="border-zinc-800" />

      {/* ── Visual Style ── */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-fuchsia-700/50 text-fuchsia-400 bg-fuchsia-950/30 text-[10px]">03</Badge>
          <h3 className="text-sm font-semibold text-zinc-200">Visual Style</h3>
        </div>

        <FieldSection label="Poster Style" description="Overall design aesthetic">
          <OptionGrid options={STYLES} value={form.style} onChange={set("style")} cols={3} />
        </FieldSection>

        <FieldSection label="Mood" description="The emotional feel of the poster">
          <OptionGrid options={MOODS} value={form.mood} onChange={set("mood")} cols={3} />
        </FieldSection>

        <FieldSection label="Background Type">
          <OptionGrid options={BACKGROUNDS} value={form.backgroundType} onChange={set("backgroundType")} cols={3} />
        </FieldSection>
      </div>

      <Separator className="border-zinc-800" />

      {/* ── Colors & Typography ── */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-fuchsia-700/50 text-fuchsia-400 bg-fuchsia-950/30 text-[10px]">04</Badge>
          <h3 className="text-sm font-semibold text-zinc-200">Colors & Typography</h3>
        </div>

        <ColorSwatch value={form.colorScheme} onChange={set("colorScheme")} />

        <FieldSection label="Font Style" description="Typography personality">
          <OptionGrid options={FONTS} value={form.fontStyle} onChange={set("fontStyle")} cols={3} />
        </FieldSection>
      </div>

      <Separator className="border-zinc-800" />

      {/* ── Extra ── */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-fuchsia-700/50 text-fuchsia-400 bg-fuchsia-950/30 text-[10px]">05</Badge>
          <h3 className="text-sm font-semibold text-zinc-200">Extra Details</h3>
        </div>

        <FieldSection label="Additional Instructions" description="Anything else the AI should know">
          <Textarea
            value={form.extraDetails}
            onChange={setVal("extraDetails")}
            placeholder="e.g. Include a silhouette of a crowd, make it feel like a 1970s concert poster, add a subtle film grain texture..."
            rows={3}
            className="bg-zinc-900 border-zinc-700/50 text-zinc-100 placeholder-zinc-600 focus:border-fuchsia-600/50 focus:ring-fuchsia-600/20 resize-none"
          />
        </FieldSection>
      </div>

      {/* ── Generate Button ── */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-semibold text-sm rounded-xl shadow-[0_0_24px_rgba(217,70,239,0.35)] hover:shadow-[0_0_32px_rgba(217,70,239,0.5)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating poster…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1Z" fill="currentColor"/>
            </svg>
            Generate Poster
          </span>
        )}
      </Button>

      <p className="text-center text-xs text-zinc-700">
        Powered by FLUX.1-schnell on Hugging Face · Free tier
      </p>
    </form>
  )
}