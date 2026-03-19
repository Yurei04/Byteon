// components/poster-maker/PlacementPicker.jsx
const POSITIONS = [
  "top-left",    "top-center",    "top-right",
  "middle-left", "center",        "middle-right",
  "bottom-left", "bottom-center", "bottom-right",
]

const LABELS = {
  "top-left": "↖", "top-center": "↑", "top-right": "↗",
  "middle-left": "←", "center": "●", "middle-right": "→",
  "bottom-left": "↙", "bottom-center": "↓", "bottom-right": "↘",
}

export default function PlacementPicker({ value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-200">Title Placement</label>
      <p className="text-xs text-zinc-500">Where the main text appears on the poster</p>
      <div className="grid grid-cols-3 gap-1.5 p-3 bg-zinc-900 rounded-xl border border-zinc-700/50 w-fit">
        {POSITIONS.map((pos) => (
          <button
            key={pos}
            type="button"
            onClick={() => onChange(pos)}
            title={pos.replace("-", " ")}
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold
              transition-all duration-150
              ${value === pos
                ? "bg-fuchsia-600 text-white shadow-[0_0_10px_rgba(217,70,239,0.4)]"
                : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-200"
              }
            `}
          >
            {LABELS[pos]}
          </button>
        ))}
      </div>
      <p className="text-xs text-zinc-600 capitalize">Selected: {value?.replace(/-/g, " ")}</p>
    </div>
  )
}