import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export function ReturnButton() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <Link href="/" className="block w-full group">
        <button
          className="
            relative w-full flex items-center gap-3 px-5 py-3
            rounded-xl text-sm font-medium tracking-wide
            transition-all duration-300 ease-out
            overflow-hidden cursor-pointer backdrop-blur-md border
          "
          style={{
            background:  "rgb(var(--brand-500) / 0.08)",
            borderColor: "rgb(var(--brand-500) / 0.3)",
            color:       "rgb(var(--text-primary))",
            boxShadow:   "0 0 16px rgb(var(--brand-500) / 0.1)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background   = "rgb(var(--brand-500) / 0.14)"
            e.currentTarget.style.borderColor  = "rgb(var(--brand-500) / 0.6)"
            e.currentTarget.style.boxShadow    = "0 0 28px rgb(var(--brand-500) / 0.25)"
            e.currentTarget.style.color        = "rgb(var(--text-primary))"
            const shimmer = e.currentTarget.querySelector("[data-shimmer]")
            if (shimmer) shimmer.style.transform = "translateX(200%)"
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background   = "rgb(var(--brand-500) / 0.08)"
            e.currentTarget.style.borderColor  = "rgb(var(--brand-500) / 0.3)"
            e.currentTarget.style.boxShadow    = "0 0 16px rgb(var(--brand-500) / 0.1)"
            const shimmer = e.currentTarget.querySelector("[data-shimmer]")
            if (shimmer) shimmer.style.transform = "translateX(-200%)"
          }}
        >
          {/* Shimmer sweep */}
          <span
            data-shimmer
            className="absolute inset-0 pointer-events-none"
            style={{
              background:  "linear-gradient(90deg, transparent, rgb(var(--brand-500) / 0.15), transparent)",
              transform:   "translateX(-200%)",
              transition:  "transform 0.7s ease",
            }}
          />

          <ArrowLeft
            size={18}
            className="transition-transform duration-300 group-hover:-translate-x-1 relative z-10 flex-shrink-0"
            strokeWidth={2.5}
            style={{ color: "rgb(var(--brand-500))" }}
          />

          <span className="relative z-10">Back to Home</span>
        </button>
      </Link>
    </div>
  )
}