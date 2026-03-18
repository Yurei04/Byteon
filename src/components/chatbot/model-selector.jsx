"use client"

import { useState, useRef, useEffect } from "react"

const MODELS = [
  { key: "llama-3.3-70b", label: "Llama 3.3 70B", badge: "Smart",    dot: "bg-fuchsia-400" },
  { key: "llama-3.1-8b",  label: "Llama 3.1 8B",  badge: "Fast ⚡",  dot: "bg-pink-400"    },
  { key: "mixtral-8x7b",  label: "Mixtral 8×7B",  badge: "Long ctx", dot: "bg-violet-400"  },
  { key: "gemma2-9b",     label: "Gemma 2 9B",     badge: "Google",   dot: "bg-purple-400"  },
]

export default function ModelSelector({ selected, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = MODELS.find((m) => m.key === selected) ?? MODELS[0]

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-fuchsia-900/40 text-xs font-medium text-zinc-300 hover:border-fuchsia-500/60 hover:text-fuchsia-300 transition-all duration-150 focus:outline-none"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
        <span>{current.label}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
          className={`opacity-50 mt-px transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-48 bg-zinc-900 border border-fuchsia-900/50 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.7)]">
          <div className="p-1.5 space-y-0.5">
            {MODELS.map((m) => (
              <button
                key={m.key}
                onClick={() => { onChange(m.key); setOpen(false) }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors duration-100 ${
                  selected === m.key
                    ? "bg-fuchsia-900/50 text-fuchsia-200"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                  {m.label}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                  selected === m.key ? "bg-fuchsia-800 text-fuchsia-300" : "bg-zinc-800 text-zinc-500"
                }`}>
                  {m.badge}
                </span>
              </button>
            ))}
          </div>
          <div className="px-3 pb-2.5 pt-1 border-t border-zinc-800/60">
            <p className="text-[10px] text-zinc-600">All models free via Groq</p>
          </div>
        </div>
      )}
    </div>
  )
}