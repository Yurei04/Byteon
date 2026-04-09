import { CheckCircle, AlertCircle, Info, X } from "lucide-react"

// ─── Config ───────────────────────────────────────────────────────────────────
const TOAST_CONFIG = {
  success: {
    bg:     "rgba(12, 30, 16, 0.85)",
    border: "rgba(74, 222, 128, 0.25)",
    glow:   "rgba(74, 222, 128, 0.35)",
    bar:    "rgba(74, 222, 128, 0.7)",
    label:  "#86efac",
    icon:   CheckCircle,
    iconBg: "rgba(74, 222, 128, 0.18)",
    iconColor: "text-green-400",
    title:  "Success",
  },
  error: {
    bg:     "rgba(30, 10, 10, 0.85)",
    border: "rgba(248, 113, 113, 0.25)",
    glow:   "rgba(248, 113, 113, 0.35)",
    bar:    "rgba(248, 113, 113, 0.7)",
    label:  "#fca5a5",
    icon:   AlertCircle,
    iconBg: "rgba(248, 113, 113, 0.18)",
    iconColor: "text-red-400",
    title:  "Error",
  },
  info: {
    bg:     "rgba(10, 20, 35, 0.85)",
    border: "rgba(96, 165, 250, 0.25)",
    glow:   "rgba(96, 165, 250, 0.35)",
    bar:    "rgba(96, 165, 250, 0.7)",
    label:  "#93c5fd",
    icon:   Info,
    iconBg: "rgba(96, 165, 250, 0.18)",
    iconColor: "text-blue-400",
    title:  "Info",
  },
}

// ─── Single Toast Item ────────────────────────────────────────────────────────
function ToastItem({ toast, onRemove }) {
  const cfg = TOAST_CONFIG[toast.type] ?? TOAST_CONFIG.info
  const Icon = cfg.icon

  return (
    <div
      role="alert"
      className="relative flex items-start gap-4 px-4 py-2 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        backdropFilter: "blur(18px)",
        boxShadow: `
          0 10px 40px rgba(0,0,0,0.6),
          0 0 0 1px ${cfg.border},
          0 0 20px ${cfg.glow}
        `,
        animation: "toast-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        minWidth: "360px",
        maxWidth: "560px",
      }}
    >
      {/* subtle gradient overlay */}
      <div className="absolute inset-0 opacity-[0.06] bg-gradient-to-br from-white to-transparent pointer-events-none" />

      {/* Icon */}
      <span
        className="relative shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
        style={{ background: cfg.iconBg }}
      >
        <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0 pr-6">
        <p
          className="text-sm font-semibold tracking-wide"
          style={{ color: cfg.label }}
        >
          {cfg.title}
        </p>
        <p className="text-xs text-white/70 mt-1 leading-relaxed">
          {toast.message}
        </p>
      </div>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className="absolute top-3 right-3 w-6 h-6 rounded-lg flex items-center justify-center text-white/30 hover:text-white/80 hover:bg-white/10 transition-all"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] overflow-hidden">
        <div
          className="h-full origin-left rounded-full"
          style={{
            background: cfg.bar,
            boxShadow: `0 0 10px ${cfg.bar}`,
            animation: `toast-progress ${toast.duration}ms linear both`,
          }}
        />
      </div>
    </div>
  )
}

// ─── Toast Container ──────────────────────────────────────────────────────────
export function Toast({ toasts = [], onRemove = () => {} }) {
  return (
    <>
      <div
        aria-live="polite"
        className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 pointer-events-none"
        style={{
          width: "calc(100vw - 3rem)",
          maxWidth: "640px", // 🔥 wider container
        }}
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto w-full">
            <ToastItem toast={toast} onRemove={onRemove} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(-18px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toast-progress {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </>
  )
}