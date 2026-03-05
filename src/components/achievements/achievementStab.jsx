"use client"

import { motion } from "framer-motion"
import { Trophy, Star, Lock, Zap, BookOpen, Cpu, Globe } from "lucide-react"

/**
 * Full achievement catalog — matches achievementId keys used in chapterManager.jsx.
 * Three categories: chapter completions, minigame clears, special.
 */
const ACHIEVEMENT_CATALOG = {
  // ── Chapter completions ──
  first_steps: {
    label: "First Steps",
    flavor: "Completed Chapter 1: The Invitation.",
    category: "chapter",
    color: "from-fuchsia-500/20 to-purple-600/20",
    border: "border-fuchsia-500/40",
    glow: "shadow-fuchsia-900/40",
    textColor: "text-fuchsia-300",
  },
  teamwork_makes_the_dream_work: {
    label: "Teamwork Makes the Dream Work",
    flavor: "Completed Chapter 2: Building the Team.",
    category: "chapter",
    color: "from-blue-500/20 to-cyan-600/20",
    border: "border-blue-500/40",
    glow: "shadow-blue-900/40",
    textColor: "text-blue-300",
  },
  innovation_spark: {
    label: "Innovation Spark",
    flavor: "Completed Chapter 3: The Idea Sprint.",
    category: "chapter",
    color: "from-orange-500/20 to-amber-600/20",
    border: "border-orange-500/40",
    glow: "shadow-orange-900/40",
    textColor: "text-orange-300",
  },
  first_hacker_medal: {
    label: "First Hacker Medal",
    flavor: "Completed Chapter 4: Pitch Day.",
    category: "chapter",
    color: "from-emerald-500/20 to-teal-600/20",
    border: "border-emerald-500/40",
    glow: "shadow-emerald-900/40",
    textColor: "text-emerald-300",
  },
  from_rookie_to_hacker: {
    label: "From Rookie to Hacker",
    flavor: "Completed the Epilogue: The First Hackathon.",
    category: "chapter",
    color: "from-violet-500/20 to-purple-600/20",
    border: "border-violet-500/40",
    glow: "shadow-violet-900/40",
    textColor: "text-violet-300",
  },

  // ── Minigame clears ──
  hackathon_myth_buster: {
    label: "Hackathon Myth Buster",
    flavor: "Busted every common hackathon myth. Confidence boosted!",
    category: "minigame",
    color: "from-pink-500/20 to-rose-600/20",
    border: "border-pink-500/40",
    glow: "shadow-pink-900/40",
    textColor: "text-pink-300",
  },
  team_player: {
    label: "Team Player",
    flavor: "Matched all roles correctly in the Team Builder challenge.",
    category: "minigame",
    color: "from-sky-500/20 to-blue-600/20",
    border: "border-sky-500/40",
    glow: "shadow-sky-900/40",
    textColor: "text-sky-300",
  },
  task_distributor: {
    label: "Task Distributor",
    flavor: "Assigned every task to the right role. Clear roles, clean execution.",
    category: "minigame",
    color: "from-indigo-500/20 to-blue-600/20",
    border: "border-indigo-500/40",
    glow: "shadow-indigo-900/40",
    textColor: "text-indigo-300",
  },
  sdg_scenario_master: {
    label: "SDG Scenario Master",
    flavor: "Perfectly matched all problem-solution-SDG scenarios.",
    category: "minigame",
    color: "from-green-500/20 to-emerald-600/20",
    border: "border-green-500/40",
    glow: "shadow-green-900/40",
    textColor: "text-green-300",
  },
  bug_buster: {
    label: "Bug Buster",
    flavor: "Debugged every scenario correctly. No bug survives your watch!",
    category: "minigame",
    color: "from-red-500/20 to-rose-600/20",
    border: "border-red-500/40",
    glow: "shadow-red-900/40",
    textColor: "text-red-300",
  },
  recording_ready: {
    label: "Recording Ready",
    flavor: "Answered every pitch recording question perfectly.",
    category: "minigame",
    color: "from-yellow-500/20 to-amber-600/20",
    border: "border-yellow-500/40",
    glow: "shadow-yellow-900/40",
    textColor: "text-yellow-300",
  },
  pitch_perfect: {
    label: "Pitch Perfect",
    flavor: "Crafted the ideal pitch from intro to closing. Judges impressed!",
    category: "minigame",
    color: "from-fuchsia-500/20 to-pink-600/20",
    border: "border-fuchsia-500/40",
    glow: "shadow-fuchsia-900/40",
    textColor: "text-fuchsia-300",
  },

  // ── Special ──
  how_to_hack_complete: {
    label: "How to Hack: Complete",
    flavor: "Finished the entire How to Hackathon visual novel. You're ready to hack!",
    category: "special",
    color: "from-amber-400/30 to-yellow-500/20",
    border: "border-amber-400/60",
    glow: "shadow-amber-700/50",
    textColor: "text-amber-300",
  },
}

// Category display config
const CATEGORY_CONFIG = {
  chapter:  { label: "Chapter Completions", icon: BookOpen, color: "text-fuchsia-400/70" },
  minigame: { label: "Minigame Clears",      icon: Cpu,      color: "text-sky-400/70" },
  special:  { label: "Special",              icon: Globe,    color: "text-amber-400/70" },
}

function formatDate(iso) {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export default function AchievementsTab({ achievementsMetadata = {} }) {
  const earned = Object.entries(achievementsMetadata)
  const totalPoints = earned.reduce((sum, [, a]) => sum + (a.reward_points ?? 0), 0)
  const locked = Object.entries(ACHIEVEMENT_CATALOG).filter(([id]) => !achievementsMetadata[id])

  // Group earned by category
  const earnedByCategory = {}
  for (const [id, data] of earned) {
    const cat = ACHIEVEMENT_CATALOG[id]?.category ?? "special"
    if (!earnedByCategory[cat]) earnedByCategory[cat] = []
    earnedByCategory[cat].push([id, data])
  }

  const lockedByCategory = {}
  for (const [id, meta] of locked) {
    const cat = meta.category ?? "special"
    if (!lockedByCategory[cat]) lockedByCategory[cat] = []
    lockedByCategory[cat].push([id, meta])
  }

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 rounded-xl border border-fuchsia-500/30 bg-fuchsia-950/30 px-4 py-2">
          <Trophy className="h-4 w-4 text-fuchsia-300" />
          <span className="text-sm font-semibold text-fuchsia-200">
            {earned.length} / {Object.keys(ACHIEVEMENT_CATALOG).length} Earned
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-950/30 px-4 py-2">
          <Star className="h-4 w-4 text-purple-300 fill-purple-300" />
          <span className="text-sm font-semibold text-purple-200">{totalPoints} pts total</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-600/30 bg-slate-900/30 px-4 py-2">
          <Lock className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-400">{locked.length} Locked</span>
        </div>
      </div>

      {/* Empty state */}
      {earned.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full border border-fuchsia-500/20 bg-fuchsia-950/20 p-6">
            <Trophy className="h-10 w-10 text-fuchsia-700" />
          </div>
          <p className="text-fuchsia-300/60 font-medium">No achievements yet.</p>
          <p className="text-sm text-fuchsia-400/40 mt-1">Play through the visual novel to unlock them!</p>
        </div>
      )}

      {/* Earned — grouped by category */}
      {Object.entries(CATEGORY_CONFIG).map(([cat, cfg]) => {
        const items = earnedByCategory[cat]
        if (!items || items.length === 0) return null
        const Icon = cfg.icon

        return (
          <div key={cat} className="space-y-3">
            <h3 className={`text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2 ${cfg.color}`}>
              <Icon className="h-3.5 w-3.5" />
              {cfg.label}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map(([id, achievement], i) => {
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
                    transition={{ delay: i * 0.06 }}
                    className={`relative overflow-hidden rounded-2xl border ${meta.border} bg-gradient-to-br ${meta.color} backdrop-blur-lg shadow-lg ${meta.glow} p-4`}
                  >
                    <div className="absolute top-0 left-0 h-0.5 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border ${meta.border} bg-black/30`}>
                        <Trophy className={`h-5 w-5 ${meta.textColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${meta.textColor} truncate`}>{achievement.title}</p>
                        <p className="text-xs text-white/50 mt-0.5 leading-relaxed">
                          {achievement.description ?? meta.flavor}
                        </p>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          {achievement.reward_points > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                              <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                              +{achievement.reward_points} pts
                            </span>
                          )}
                          <span className="text-[10px] text-white/30 font-mono">{formatDate(achievement.earned_at)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Locked — grouped by category */}
      {locked.length > 0 && (
        <div className="space-y-4 pt-2">
          {Object.entries(CATEGORY_CONFIG).map(([cat, cfg]) => {
            const items = lockedByCategory[cat]
            if (!items || items.length === 0) return null
            const Icon = cfg.icon

            return (
              <div key={cat} className="space-y-2">
                <h3 className="text-xs font-mono font-bold tracking-widest text-slate-500/70 uppercase flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" />
                  {cfg.label} — Locked
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map(([id, meta]) => (
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
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}