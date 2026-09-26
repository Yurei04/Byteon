export default function TypingDots() {
  return (
    <div className="flex gap-2 items-end">
      <div
        className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, rgb(var(--brand-700)), rgb(var(--accent-600)))",
          border: "1px solid rgb(var(--brand-500) / 0.4)",
          boxShadow: "0 0 8px rgb(var(--accent-500) / 0.3)",
        }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 1L9 3.25V6.75L5 9L1 6.75V3.25L5 1Z" fill="url(#tdG)" />
          <defs>
            <linearGradient id="tdG" x1="1" y1="1" x2="9" y2="9" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f0abfc" /><stop offset="1" stopColor="#c026d3" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div
        className="rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center"
        style={{
          background: "rgb(var(--surface))",
          border: "1px solid rgb(var(--surface-border) / 0.5)",
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0ms]"
          style={{ background: "rgb(var(--brand-500))" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:200ms]"
          style={{ background: "rgb(var(--brand-500))" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:400ms]"
          style={{ background: "rgb(var(--brand-500))" }}
        />
      </div>
    </div>
  )
}