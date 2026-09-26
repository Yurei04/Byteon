"use client"

export default function ChatBubbleButton({ isOpen, onClick, hasUnread }) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? "Close chat" : "Open Nova AI"}
      className="relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none"
      style={{
        background: "linear-gradient(135deg, rgb(var(--accent-500)), rgb(var(--brand-500)))",
        boxShadow: "0 4px 24px rgb(var(--accent-500) / 0.55)",
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 32px rgb(var(--accent-500) / 0.75)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 24px rgb(var(--accent-500) / 0.55)"}
    >
      {/* Unread ping */}
      {hasUnread && !isOpen && (
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-25"
          style={{ background: "rgb(var(--accent-400))" }}
        />
      )}
      {hasUnread && !isOpen && (
        <span
          className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full border-2"
          style={{
            background: "rgb(var(--brand-300))",
            borderColor: "rgb(var(--bg-base))",
          }}
        />
      )}

      {/* Chat icon */}
      <span className={`absolute transition-all duration-300 ${isOpen ? "opacity-0 scale-50 rotate-90" : "opacity-100 scale-100 rotate-0"}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
          <path
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          />
          <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>

      {/* Close icon */}
      <span className={`absolute transition-all duration-300 ${isOpen ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-90"}`}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-white">
          <path d="M17 5L5 17M5 5l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </span>
    </button>
  )
}