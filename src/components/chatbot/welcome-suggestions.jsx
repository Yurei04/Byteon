const CHIPS = [
  { icon: "✦", text: "Explain something simply" },
  { icon: "⌘", text: "Help me write content"    },
  { icon: "◈", text: "Debug my code"            },
  { icon: "◎", text: "Summarize key points"     },
]

export default function WelcomeSuggestions({ onSelect }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-6 px-3 text-center">
      <div
        className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, rgb(var(--brand-800) / 0.6), rgb(var(--accent-600) / 0.4))",
          border: "1px solid rgb(var(--brand-500) / 0.3)",
          boxShadow: "0 0 24px rgb(var(--accent-500) / 0.2)",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M14 3L24 8.5V19.5L14 25L4 19.5V8.5L14 3Z" fill="url(#wsG)" opacity="0.9"/>
          <defs>
            <linearGradient id="wsG" x1="4" y1="3" x2="24" y2="25" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f0abfc"/><stop offset="1" stopColor="#a21caf"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      <h3
        className="text-sm font-semibold mb-1"
        style={{ color: "rgb(var(--text-secondary))" }}
      >
        How can I help?
      </h3>
      <p
        className="text-xs mb-5 max-w-[210px] leading-relaxed"
        style={{ color: "rgb(var(--text-faint))" }}
      >
        Powered by free Groq models — ask me anything
      </p>

      <div className="flex flex-col gap-2 w-full">
        {CHIPS.map((c) => (
          <button
            key={c.text}
            onClick={() => onSelect(c.text)}
            className="w-full flex items-center gap-2.5 text-left text-xs px-3 py-2.5 rounded-xl transition-all duration-150"
            style={{
              background: "rgb(var(--surface))",
              border: "1px solid rgb(var(--surface-border) / 0.5)",
              color: "rgb(var(--text-muted))",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgb(var(--brand-500) / 0.5)"
              e.currentTarget.style.color = "rgb(var(--brand-300))"
              e.currentTarget.style.background = "rgb(var(--surface-raised))"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgb(var(--surface-border) / 0.5)"
              e.currentTarget.style.color = "rgb(var(--text-muted))"
              e.currentTarget.style.background = "rgb(var(--surface))"
            }}
          >
            <span
              className="text-sm leading-none"
              style={{ color: "rgb(var(--accent-500))" }}
            >
              {c.icon}
            </span>
            {c.text}
          </button>
        ))}
      </div>
    </div>
  )
}