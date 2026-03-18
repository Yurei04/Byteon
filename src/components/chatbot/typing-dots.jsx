export default function TypingDots() {
  return (
    <div className="flex gap-2 items-end">
      <div className="w-6 h-6 rounded-lg flex-shrink-0 bg-gradient-to-br from-fuchsia-700 to-pink-800 border border-fuchsia-600/40 flex items-center justify-center shadow-[0_0_8px_rgba(217,70,239,0.3)]">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 1L9 3.25V6.75L5 9L1 6.75V3.25L5 1Z" fill="url(#tdG)" />
          <defs>
            <linearGradient id="tdG" x1="1" y1="1" x2="9" y2="9" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f0abfc" /><stop offset="1" stopColor="#c026d3" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="bg-zinc-800/90 border border-zinc-700/40 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-bounce [animation-delay:200ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-bounce [animation-delay:400ms]" />
      </div>
    </div>
  )
}