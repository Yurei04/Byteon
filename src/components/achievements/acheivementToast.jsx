"use client"

import { motion } from "framer-motion"
import { Trophy, Star, X, Zap } from "lucide-react"

/**
 * Animated achievement unlock toast.
 * Matches the fuchsia / dark-glass aesthetic of the app.
 */
export default function AchievementToast({
  title,
  description,
  rewardPoints = 0,
  onDismiss,
}) {
  return (
    <motion.div
      layout
      initial={{ x: 120, opacity: 0, scale: 0.85 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 120, opacity: 0, scale: 0.85 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="pointer-events-auto relative w-80 overflow-hidden rounded-2xl border border-fuchsia-500/40 bg-black/80 backdrop-blur-xl shadow-2xl shadow-fuchsia-900/50"
    >
      {/* Animated shimmer bar at top */}
      <motion.div
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 4.8, ease: "linear" }}
        className="absolute top-0 left-0 h-0.5 w-full bg-gradient-to-r from-fuchsia-500 via-purple-400 to-pink-500"
      />

      {/* Glow backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-950/60 via-purple-950/40 to-transparent pointer-events-none" />

      <div className="relative flex items-start gap-4 p-4">
        {/* Icon */}
        <div className="relative flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500/30 to-purple-600/30 border border-fuchsia-400/40">
            <Trophy className="h-6 w-6 text-fuchsia-300" />
          </div>
          {/* Pulse ring */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-xl border border-fuchsia-400/60"
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          {/* Badge label */}
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="h-3 w-3 text-fuchsia-400" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-fuchsia-400 uppercase">
              Achievement Unlocked
            </span>
          </div>

          <p className="text-sm font-bold text-white leading-snug truncate">{title}</p>
          {description && (
            <p className="text-xs text-fuchsia-200/60 mt-0.5 leading-relaxed line-clamp-2">
              {description}
            </p>
          )}

          {/* Points badge */}
          {rewardPoints > 0 && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-0.5">
              <Star className="h-2.5 w-2.5 text-fuchsia-300 fill-fuchsia-300" />
              <span className="text-[10px] font-semibold text-fuchsia-300">
                +{rewardPoints} pts
              </span>
            </div>
          )}
        </div>

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="flex-shrink-0 rounded-lg p-1 text-fuchsia-400/50 hover:text-fuchsia-300 hover:bg-fuchsia-800/20 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}