// components/poster-maker/ColorSwatch.jsx
const SCHEMES = [
  { value: "monochrome black and white",    label: "Mono",      colors: ["#000", "#555", "#fff"]           },
  { value: "vibrant neon",                   label: "Neon",      colors: ["#ff00ff", "#00ffff", "#ff0080"]  },
  { value: "warm earthy tones",             label: "Earth",     colors: ["#8B4513", "#D2691E", "#F4A460"]  },
  { value: "cool ocean blues and teals",    label: "Ocean",     colors: ["#003366", "#0077b6", "#90e0ef"]  },
  { value: "sunset warm orange and pink",   label: "Sunset",    colors: ["#ff6b35", "#f7c59f", "#e63946"]  },
  { value: "forest deep greens",            label: "Forest",    colors: ["#1b4332", "#40916c", "#95d5b2"]  },
  { value: "pastel soft and dreamy",        label: "Pastel",    colors: ["#ffd6ff", "#c8b6ff", "#b8c0ff"]  },
  { value: "luxury gold and black",         label: "Luxury",    colors: ["#1a1a1a", "#c9a84c", "#f5e6c8"]  },
  { value: "retro 70s muted warm",          label: "Retro",     colors: ["#c1440e", "#e8a838", "#f2e0b0"]  },
  { value: "cyberpunk neon purple and pink",label: "Cyber",     colors: ["#1a0030", "#9b59b6", "#ff007f"]  },
  { value: "minimal clean white",           label: "Clean",     colors: ["#fff", "#e5e5e5", "#222"]         },
  { value: "dark moody dramatic",           label: "Moody",     colors: ["#0d0d0d", "#1a1a2e", "#533483"]  },
]

export default function ColorSwatch({ value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-200">Color Scheme</label>
      <div className="grid grid-cols-4 gap-2">
        {SCHEMES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange(s.value)}
            className={`
              flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-150
              ${value === s.value
                ? "border-fuchsia-500 bg-fuchsia-950/40 shadow-[0_0_10px_rgba(217,70,239,0.2)]"
                : "border-zinc-700/50 bg-zinc-900 hover:border-zinc-500"
              }
            `}
          >
            <div className="flex gap-0.5 rounded-md overflow-hidden w-full h-6">
              {s.colors.map((c, i) => (
                <div key={i} className="flex-1" style={{ background: c }} />
              ))}
            </div>
            <span className={`text-[10px] font-medium ${value === s.value ? "text-fuchsia-300" : "text-zinc-500"}`}>
              {s.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}