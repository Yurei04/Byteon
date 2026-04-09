import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ReturnButton({ primaryC = "#c026d3", secondaryC = "#db2777" }) {
  return (
    <Link href="/" className="group inline-flex items-center">
      <button
        style={{
          background: `linear-gradient(135deg, ${primaryC}20, ${secondaryC}15)`,
          borderColor: `${primaryC}50`,
          color: "#ffffff",
          boxShadow: `0 0 16px ${primaryC}30`
        }}
        className="
          relative flex items-center gap-2 px-4 py-2.5
          rounded-xl
          text-sm font-medium tracking-wide
          transition-all duration-300 ease-out
          overflow-hidden cursor-pointer
          backdrop-blur-md
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
          size={16}
          className="transition-transform duration-300 group-hover:-translate-x-0.5"
          strokeWidth={2.5}
        />

        <span className="
          max-w-0 overflow-hidden whitespace-nowrap
          group-hover:max-w-[3rem]
          transition-all duration-300 ease-out
          opacity-0 group-hover:opacity-100
        ">
          Back
        </span>
      </button>
    </Link>
  );
}