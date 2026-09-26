import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export function ReturnButton() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <Link
        href="/"
        className="inline-flex items-center gap-2 group"
        style={{ textDecoration: "none" }}
      >
        <span
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
          style={{
            color: "rgb(var(--text-secondary))",
            background: "transparent",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgb(var(--brand-500) / 0.08)"
            e.currentTarget.style.color = "rgb(var(--brand-500))"
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent"
            e.currentTarget.style.color = "rgb(var(--text-secondary))"
          }}
        >
          <ArrowLeft
            size={15}
            strokeWidth={2}
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          />
          Back to Home
        </span>
      </Link>
    </div>
  )
}