"use client"

import { motion } from "framer-motion"
import { Trophy, Star, Lock, Zap } from "lucide-react"

/**
 * Maps achievement IDs to cosmetic metadata used in the UI.
 * Extend this as you add more achievements to the game.
 */
const ACHIEVEMENT_CATALOG = {
  myth_buster: {
    label: "Hackathon Myth Buster",
    flavor: "Busted every common myth about hackathons.",
    color: "from-fuchsia-500/20 to-purple-600/20",
    border: "border-fuchsia-500/40",
    glow: "shadow-fuchsia-900/40",
    textColor: "text-fuchsia-300",
  },
  first_steps: {
    label: "First Steps",
    flavor: "Completed Chapter 1 of How to Hackathon.",
    color: "from-emerald-500/20 to-teal-600/20",
    border: "border-emerald-500/40",
    glow: "shadow-emerald-900/40",
    textColor: "text-emerald-300",
  },
  // Future achievements — add here as chapters expand
}

/** Friendly date formatter */
function formatDate(iso) {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function AchievementsTab({ achievementsMetadata = {} }) {
  const earned = Object.entries(achievementsMetadata)
  const totalPoints = earned.reduce(
    (sum, [, a]) => sum + (a.reward_points ?? 0),
    0
  )
  const locked = Object.entries(ACHIEVEMENT_CATALOG).filter(
    ([id]) => !achievementsMetadata[id]
  )

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 rounded-xl border border-fuchsia-500/30 bg-fuchsia-950/30 px-4 py-2">
          <Trophy className="h-4 w-4 text-fuchsia-300" />
          <span className="text-sm font-semibold text-fuchsia-200">
            {earned.length} Earned
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-950/30 px-4 py-2">
          <Star className="h-4 w-4 text-purple-300 fill-purple-300" />
          <span className="text-sm font-semibold text-purple-200">
            {totalPoints} pts total
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-600/30 bg-slate-900/30 px-4 py-2">
          <Lock className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-400">
            {locked.length} Locked
          </span>
        </div>
      </div>

      {/* Earned achievements */}
      {earned.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full border border-fuchsia-500/20 bg-fuchsia-950/20 p-6">
            <Trophy className="h-10 w-10 text-fuchsia-700" />
          </div>
          <p className="text-fuchsia-300/60 font-medium">No achievements yet.</p>
          <p className="text-sm text-fuchsia-400/40 mt-1">
            Play through the visual novel to unlock them!
          </p>
        </div>
      ) : (
        <>
          <h3 className="text-xs font-mono font-bold tracking-widest text-fuchsia-400/70 uppercase">
            Unlocked
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {earned.map(([id, achievement], i) => {
              const meta = ACHIEVEMENT_CATALOG[id] ?? {
                color: "from-fuchsia-500/20 to-purple-600/20",
                border: "border-fuchsia-500/30",
                glow: "shadow-fuchsia-900/30",
                textColor: "text-fuchsia-300",
              }

              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`relative overflow-hidden rounded-2xl border ${meta.border} bg-gradient-to-br ${meta.color} backdrop-blur-lg shadow-lg ${meta.glow} p-4`}
                >
                  {/* Shimmer line */}
                  <div className="absolute top-0 left-0 h-0.5 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border ${meta.border} bg-black/30`}>
                      <Trophy className={`h-5 w-5 ${meta.textColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${meta.textColor} truncate`}>
                        {achievement.title}
                      </p>
                      <p className="text-xs text-white/50 mt-0.5 leading-relaxed">
                        {achievement.description ??
                          meta.flavor ??
                          "Achievement unlocked."}
                      </p>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        {achievement.reward_points > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                            <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                            +{achievement.reward_points} pts
                          </span>
                        )}
                        <span className="text-[10px] text-white/30 font-mono">
                          {formatDate(achievement.earned_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </>
      )}

      {/* Locked preview */}
      {locked.length > 0 && (
        <>
          <h3 className="text-xs font-mono font-bold tracking-widest text-slate-500/70 uppercase pt-2">
            Locked
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {locked.map(([id, meta]) => (
              <div
                key={id}
                className="flex items-center gap-3 rounded-2xl border border-slate-700/30 bg-slate-900/20 p-4 opacity-50"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-slate-600/30 bg-black/30">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400">{meta.label}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{meta.flavor}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}