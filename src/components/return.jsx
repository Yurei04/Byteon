import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ReturnButton({ primaryC = "#c026d3", secondaryC = "#db2777" }) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <Link href="/" className="block w-full group">
        <button
          style={{
            background: `linear-gradient(135deg, ${primaryC}20, ${secondaryC}15)`,
            borderColor: `${primaryC}50`,
            color: "#ffffff",
            boxShadow: `0 0 16px ${primaryC}30`
          }}
          className="
            relative w-full flex items-center gap-3 px-5 py-3
            rounded-xl
            text-sm font-medium tracking-wide
            transition-all duration-300 ease-out
            overflow-hidden cursor-pointer
            backdrop-blur-md border
          "
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `linear-gradient(135deg, ${primaryC}50, ${secondaryC}40)`
            e.currentTarget.style.borderColor = `${primaryC}`
            e.currentTarget.style.boxShadow = `0 0 28px ${primaryC}60`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `linear-gradient(135deg, ${primaryC}20, ${secondaryC}15)`
            e.currentTarget.style.borderColor = `${primaryC}50`
            e.currentTarget.style.boxShadow = `0 0 16px ${primaryC}30`
          }}
        >
          {/* shimmer effect */}
          <span
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent, ${primaryC}30, transparent)`,
              transform: "translateX(-200%)",
              transition: "transform 0.7s ease"
            }}
          />

          <ArrowLeft
            size={18}
            className="transition-transform duration-300 group-hover:-translate-x-1"
            strokeWidth={2.5}
          />

          {/* ALWAYS visible label */}
          <span className="opacity-100">
            Back to Home
          </span>
        </button>
      </Link>
    </div>
  );
}