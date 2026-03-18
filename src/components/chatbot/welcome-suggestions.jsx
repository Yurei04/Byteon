const CHIPS = [
  { icon: "✦", text: "Explain something simply" },
  { icon: "⌘", text: "Help me write content" },
  { icon: "◈", text: "Debug my code" },
  { icon: "◎", text: "Summarize key points" },
]

export default function WelcomeSuggestions({ onSelect }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-6 px-3 text-center">
      <div className="w-14 h-14 rounded-2xl mb-4 bg-gradient-to-br from-fuchsia-800/60 to-pink-900/60 border border-fuchsia-600/30 shadow-[0_0_24px_rgba(217,70,239,0.2)] flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M14 3L24 8.5V19.5L14 25L4 19.5V8.5L14 3Z" fill="url(#wsG)" opacity="0.9"/>
          <defs>
            <linearGradient id="wsG" x1="4" y1="3" x2="24" y2="25" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f0abfc"/><stop offset="1" stopColor="#a21caf"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-zinc-200 mb-1">How can I help?</h3>
      <p className="text-xs text-zinc-500 mb-5 max-w-[210px] leading-relaxed">
        Powered by free Groq models — ask me anything
      </p>
      <div className="flex flex-col gap-2 w-full">
        {CHIPS.map((c) => (
          <button
            key={c.text}
            onClick={() => onSelect(c.text)}
            className="w-full flex items-center gap-2.5 text-left text-xs px-3 py-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700/50 text-zinc-400 hover:border-fuchsia-500/50 hover:text-fuchsia-300 hover:bg-zinc-800 transition-all duration-150"
          >
            <span className="text-fuchsia-500 text-sm leading-none">{c.icon}</span>
            {c.text}
          </button>
        ))}
      </div>
    </div>
  )
}