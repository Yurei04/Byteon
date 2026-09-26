"use client"

import { useState, useRef, useEffect } from "react"

const MODELS = [
  { key: "llama-3.3-70b", label: "Llama 3.3 70B", badge: "Smart",     dotColor: "rgb(var(--accent-400))" },
  { key: "llama-3.1-8b",  label: "Llama 3.1 8B",  badge: "Fast ⚡",   dotColor: "rgb(var(--brand-400))"  },
  { key: "mixtral-8x7b",  label: "Mixtral 8×7B",  badge: "Long ctx",  dotColor: "rgb(var(--brand-300))"  },
  { key: "gemma2-9b",     label: "Gemma 2 9B",     badge: "Google",    dotColor: "rgb(var(--brand-500))"  },
]

export default function ModelSelector({ selected, onChange }) {
  const [open, setOpen] = useState(false)
  const ref     = useRef(null)
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
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 focus:outline-none"
        style={{
          background: "rgb(var(--surface-raised))",
          border: "1px solid rgb(var(--brand-500) / 0.25)",
          color: "rgb(var(--text-secondary))",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = "rgb(var(--brand-500) / 0.5)"
          e.currentTarget.style.color = "rgb(var(--brand-300))"
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = "rgb(var(--brand-500) / 0.25)"
          e.currentTarget.style.color = "rgb(var(--text-secondary))"
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: current.dotColor }}
        />
        <span>{current.label}</span>
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          className={`opacity-50 mt-px transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 z-50 w-48 rounded-xl"
          style={{
            background: "rgb(var(--bg-base))",
            border: "1px solid rgb(var(--brand-500) / 0.25)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <div className="p-1.5 space-y-0.5">
            {MODELS.map((m) => {
              const isSelected = selected === m.key
              return (
                <button
                  key={m.key}
                  onClick={() => { onChange(m.key); setOpen(false) }}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors duration-100"
                  style={
                    isSelected
                      ? {
                          background: "rgb(var(--brand-500) / 0.12)",
                          color: "rgb(var(--brand-200))",
                        }
                      : {
                          color: "rgb(var(--text-muted))",
                        }
                  }
                  onMouseEnter={e => {
                    if (!isSelected) {
                      e.currentTarget.style.background = "rgb(var(--surface-raised))"
                      e.currentTarget.style.color = "rgb(var(--text-primary))"
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      e.currentTarget.style.background = "transparent"
                      e.currentTarget.style.color = "rgb(var(--text-muted))"
                    }
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: m.dotColor }}
                    />
                    {m.label}
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                    style={
                      isSelected
                        ? {
                            background: "rgb(var(--brand-500) / 0.2)",
                            color: "rgb(var(--brand-300))",
                          }
                        : {
                            background: "rgb(var(--surface-raised))",
                            color: "rgb(var(--text-faint))",
                          }
                    }
                  >
                    {m.badge}
                  </span>
                </button>
              )
            })}
          </div>
          <div
            className="px-3 pb-2.5 pt-1"
            style={{ borderTop: "1px solid rgb(var(--surface-border) / 0.4)" }}
          >
            <p className="text-[10px]" style={{ color: "rgb(var(--text-faint))" }}>
              All models free via Groq
            </p>
          </div>
        </div>
      )}
    </div>
  )
}