// components/poster-maker/OptionGrid.jsx
export default function OptionGrid({ options, value, onChange, cols = 3 }) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  }

  return (
    <div className={`grid ${gridCols[cols] ?? "grid-cols-3"} gap-2`}>
      {options.map((opt) => {
        const isSelected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`
              flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-xs font-medium
              transition-all duration-150 text-center
              ${isSelected
                ? "bg-fuchsia-950/60 border-fuchsia-500 text-fuchsia-300 shadow-[0_0_12px_rgba(217,70,239,0.2)]"
                : "bg-zinc-900 border-zinc-700/50 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
              }
            `}
          >
            {opt.icon && <span className="text-lg leading-none">{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}