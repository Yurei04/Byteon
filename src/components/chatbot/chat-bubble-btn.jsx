"use client"

export default function ChatBubbleButton({ isOpen, onClick, hasUnread }) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? "Close chat" : "Open Nova AI"}
      className="relative w-14 h-14 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-600 shadow-[0_4px_24px_rgba(217,70,239,0.55)] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_4px_32px_rgba(217,70,239,0.75)] active:scale-95 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
    >
      {hasUnread && !isOpen && (
        <span className="absolute inset-0 rounded-full bg-fuchsia-400 opacity-25 animate-ping" />
      )}
      {hasUnread && !isOpen && (
        <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-pink-300 border-2 border-zinc-950" />
      )}

      {/* Chat icon */}
      <span className={`absolute transition-all duration-300 ${isOpen ? "opacity-0 scale-50 rotate-90" : "opacity-100 scale-100 rotate-0"}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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