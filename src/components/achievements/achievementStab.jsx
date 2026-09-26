"use client"

import { motion } from "framer-motion"
import { Trophy, Star, Lock, BookOpen, Cpu, Globe } from "lucide-react"

const THEME_STYLES = `
  /* ── Light ── */
  :root {
    --ach-stat-trophy-bg:     rgba(192,38,211,0.08);
    --ach-stat-trophy-border: rgba(192,38,211,0.22);
    --ach-stat-trophy-text:   #701976;
    --ach-stat-trophy-icon:   #c026d3;

    --ach-stat-pts-bg:        rgba(168,85,247,0.08);
    --ach-stat-pts-border:    rgba(168,85,247,0.22);
    --ach-stat-pts-text:      #6d28d9;
    --ach-stat-pts-icon:      #9333ea;

    --ach-stat-lock-bg:       rgba(100,116,139,0.08);
    --ach-stat-lock-border:   rgba(100,116,139,0.20);
    --ach-stat-lock-text:     #64748b;
    --ach-stat-lock-icon:     #94a3b8;

    --ach-cat-label:          rgba(112,25,118,0.55);

    --ach-empty-bg:           rgba(192,38,211,0.06);
    --ach-empty-border:       rgba(192,38,211,0.18);
    --ach-empty-icon:         rgba(192,38,211,0.40);
    --ach-empty-text:         rgba(112,25,118,0.55);
    --ach-empty-sub:          rgba(112,25,118,0.35);

    --ach-card-shine:         rgba(0,0,0,0.06);

    --ach-pts-pill-bg:        rgba(0,0,0,0.06);
    --ach-pts-pill-border:    rgba(0,0,0,0.10);
    --ach-pts-pill-text:      rgba(0,0,0,0.55);

    --ach-date-color:         rgba(0,0,0,0.30);

    --ach-locked-bg:          rgba(241,245,249,0.70);
    --ach-locked-border:      rgba(148,163,184,0.25);
    --ach-locked-icon-wrap:   rgba(255,255,255,0.60);
    --ach-locked-icon-border: rgba(148,163,184,0.25);
    --ach-locked-icon:        #94a3b8;
    --ach-locked-title:       #64748b;
    --ach-locked-sub:         #94a3b8;
    --ach-locked-cat-label:   rgba(100,116,139,0.50);
  }

  /* ── Dark ── */
  .dark {
    --ach-stat-trophy-bg:     rgba(168,85,247,0.12);
    --ach-stat-trophy-border: rgba(168,85,247,0.28);
    --ach-stat-trophy-text:   #e879f9;
    --ach-stat-trophy-icon:   #e879f9;

    --ach-stat-pts-bg:        rgba(139,92,246,0.12);
    --ach-stat-pts-border:    rgba(139,92,246,0.28);
    --ach-stat-pts-text:      #c4b5fd;
    --ach-stat-pts-icon:      #c4b5fd;

    --ach-stat-lock-bg:       rgba(51,65,85,0.30);
    --ach-stat-lock-border:   rgba(71,85,105,0.30);
    --ach-stat-lock-text:     #64748b;
    --ach-stat-lock-icon:     #64748b;

    --ach-cat-label:          rgba(232,121,249,0.55);

    --ach-empty-bg:           rgba(168,85,247,0.06);
    --ach-empty-border:       rgba(168,85,247,0.18);
    --ach-empty-icon:         rgba(168,85,247,0.50);
    --ach-empty-text:         rgba(232,121,249,0.50);
    --ach-empty-sub:          rgba(232,121,249,0.30);

    --ach-card-shine:         rgba(255,255,255,0.12);

    --ach-pts-pill-bg:        rgba(0,0,0,0.28);
    --ach-pts-pill-border:    rgba(255,255,255,0.08);
    --ach-pts-pill-text:      rgba(255,255,255,0.65);

    --ach-date-color:         rgba(255,255,255,0.28);

    --ach-locked-bg:          rgba(30,41,59,0.20);
    --ach-locked-border:      rgba(71,85,105,0.25);
    --ach-locked-icon-wrap:   rgba(0,0,0,0.28);
    --ach-locked-icon-border: rgba(71,85,105,0.28);
    --ach-locked-icon:        #64748b;
    --ach-locked-title:       #94a3b8;
    --ach-locked-sub:         #64748b;
    --ach-locked-cat-label:   rgba(100,116,139,0.50);
  }
`

/* Achievement cards keep their own vivid gradients (they read fine on both
   light and dark because the gradient itself provides the local contrast).
   We only need to theme the chrome around them. */
const ACHIEVEMENT_CATALOG = {
  first_steps: {
    label: "First Steps", flavor: "Completed Chapter 1: The Invitation.", category: "chapter",
    color: "from-fuchsia-500/20 to-purple-600/20", border: "border-fuchsia-500/40",
    glow: "shadow-fuchsia-900/40", textColor: "text-fuchsia-300",
  },
  teamwork_makes_the_dream_work: {
    label: "Teamwork Makes the Dream Work", flavor: "Completed Chapter 2: Building the Team.", category: "chapter",
    color: "from-blue-500/20 to-cyan-600/20", border: "border-blue-500/40",
    glow: "shadow-blue-900/40", textColor: "text-blue-300",
  },
  innovation_spark: {
    label: "Innovation Spark", flavor: "Completed Chapter 3: The Idea Sprint.", category: "chapter",
    color: "from-orange-500/20 to-amber-600/20", border: "border-orange-500/40",
    glow: "shadow-orange-900/40", textColor: "text-orange-300",
  },
  first_hacker_medal: {
    label: "First Hacker Medal", flavor: "Completed Chapter 4: Pitch Day.", category: "chapter",
    color: "from-emerald-500/20 to-teal-600/20", border: "border-emerald-500/40",
    glow: "shadow-emerald-900/40", textColor: "text-emerald-300",
  },
  from_rookie_to_hacker: {
    label: "From Rookie to Hacker", flavor: "Completed the Epilogue: The First Hackathon.", category: "chapter",
    color: "from-violet-500/20 to-purple-600/20", border: "border-violet-500/40",
    glow: "shadow-violet-900/40", textColor: "text-violet-300",
  },
  hackathon_myth_buster: {
    label: "Hackathon Myth Buster", flavor: "Busted every common hackathon myth.", category: "minigame",
    color: "from-pink-500/20 to-rose-600/20", border: "border-pink-500/40",
    glow: "shadow-pink-900/40", textColor: "text-pink-300",
  },
  team_player: {
    label: "Team Player", flavor: "Matched all roles correctly in the Team Builder challenge.", category: "minigame",
    color: "from-sky-500/20 to-blue-600/20", border: "border-sky-500/40",
    glow: "shadow-sky-900/40", textColor: "text-sky-300",
  },
  task_distributor: {
    label: "Task Distributor", flavor: "Assigned every task to the right role.", category: "minigame",
    color: "from-indigo-500/20 to-blue-600/20", border: "border-indigo-500/40",
    glow: "shadow-indigo-900/40", textColor: "text-indigo-300",
  },
  sdg_scenario_master: {
    label: "SDG Scenario Master", flavor: "Perfectly matched all problem-solution-SDG scenarios.", category: "minigame",
    color: "from-green-500/20 to-emerald-600/20", border: "border-green-500/40",
    glow: "shadow-green-900/40", textColor: "text-green-300",
  },
  bug_buster: {
    label: "Bug Buster", flavor: "Debugged every scenario correctly.", category: "minigame",
    color: "from-red-500/20 to-rose-600/20", border: "border-red-500/40",
    glow: "shadow-red-900/40", textColor: "text-red-300",
  },
  recording_ready: {
    label: "Recording Ready", flavor: "Answered every pitch recording question perfectly.", category: "minigame",
    color: "from-yellow-500/20 to-amber-600/20", border: "border-yellow-500/40",
    glow: "shadow-yellow-900/40", textColor: "text-yellow-300",
  },
  pitch_perfect: {
    label: "Pitch Perfect", flavor: "Crafted the ideal pitch from intro to closing.", category: "minigame",
    color: "from-fuchsia-500/20 to-pink-600/20", border: "border-fuchsia-500/40",
    glow: "shadow-fuchsia-900/40", textColor: "text-fuchsia-300",
  },
  how_to_hack_complete: {
    label: "How to Hack: Complete", flavor: "Finished the entire How to Hackathon visual novel.", category: "special",
    color: "from-amber-400/30 to-yellow-500/20", border: "border-amber-400/60",
    glow: "shadow-amber-700/50", textColor: "text-amber-300",
  },
}

const CATEGORY_CONFIG = {
  chapter:  { label: "Chapter Completions", icon: BookOpen },
  minigame: { label: "Minigame Clears",     icon: Cpu      },
  special:  { label: "Special",             icon: Globe    },
}

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : ""

export default function AchievementsTab({ achievementsMetadata = {} }) {
  const earned      = Object.entries(achievementsMetadata)
  const totalPoints = earned.reduce((sum, [, a]) => sum + (a.reward_points ?? 0), 0)
  const locked      = Object.entries(ACHIEVEMENT_CATALOG).filter(([id]) => !achievementsMetadata[id])

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
      <style>{THEME_STYLES}</style>

      {/* Stats row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 rounded-xl px-4 py-2"
          style={{ background: "var(--ach-stat-trophy-bg)", border: "1px solid var(--ach-stat-trophy-border)" }}>
          <Trophy className="h-4 w-4" style={{ color: "var(--ach-stat-trophy-icon)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--ach-stat-trophy-text)" }}>
            {earned.length} / {Object.keys(ACHIEVEMENT_CATALOG).length} Earned
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl px-4 py-2"
          style={{ background: "var(--ach-stat-pts-bg)", border: "1px solid var(--ach-stat-pts-border)" }}>
          <Star className="h-4 w-4 fill-current" style={{ color: "var(--ach-stat-pts-icon)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--ach-stat-pts-text)" }}>
            {totalPoints} pts total
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl px-4 py-2"
          style={{ background: "var(--ach-stat-lock-bg)", border: "1px solid var(--ach-stat-lock-border)" }}>
          <Lock className="h-4 w-4" style={{ color: "var(--ach-stat-lock-icon)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--ach-stat-lock-text)" }}>
            {locked.length} Locked
          </span>
        </div>
      </div>

      {/* Empty state */}
      {earned.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full p-6"
            style={{ background: "var(--ach-empty-bg)", border: "1px solid var(--ach-empty-border)" }}>
            <Trophy className="h-10 w-10" style={{ color: "var(--ach-empty-icon)" }} />
          </div>
          <p className="font-medium" style={{ color: "var(--ach-empty-text)" }}>No achievements yet.</p>
          <p className="text-sm mt-1" style={{ color: "var(--ach-empty-sub)" }}>
            Play through the visual novel to unlock them!
          </p>
        </div>
      )}

      {/* Earned — grouped by category */}
      {Object.entries(CATEGORY_CONFIG).map(([cat, cfg]) => {
        const items = earnedByCategory[cat]
        if (!items?.length) return null
        const Icon = cfg.icon

        return (
          <div key={cat} className="space-y-3">
            <h3 className="text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2"
              style={{ color: "var(--ach-cat-label)" }}>
              <Icon className="h-3.5 w-3.5" />{cfg.label}
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
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`relative overflow-hidden rounded-2xl border ${meta.border} bg-gradient-to-br ${meta.color} backdrop-blur-lg shadow-lg ${meta.glow} p-4`}
                  >
                    {/* shine line */}
                    <div className="absolute top-0 left-0 h-0.5 w-full"
                      style={{ background: `linear-gradient(to right, transparent, var(--ach-card-shine), transparent)` }} />
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border ${meta.border} bg-black/30`}>
                        <Trophy className={`h-5 w-5 ${meta.textColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate`} style={{ color: "rgb(var(--text-primary))"}}>{achievement.title}</p>
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "rgb(var(--text-primary))"}}>
                          {achievement.description ?? meta.flavor}
                        </p>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          {achievement.reward_points > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                              style={{
                                background:   "var(--ach-pts-pill-bg)",
                                border:       "1px solid var(--ach-pts-pill-border)",
                                color:        "var(--ach-pts-pill-text)",
                              }}>
                              <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                              +{achievement.reward_points} pts
                            </span>
                          )}
                          <span className="text-[10px] font-mono" style={{ color: "var(--ach-date-color)" }}>
                            {formatDate(achievement.earned_at)}
                          </span>
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
            if (!items?.length) return null
            const Icon = cfg.icon

            return (
              <div key={cat} className="space-y-2">
                <h3 className="text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2"
                  style={{ color: "var(--ach-locked-cat-label)" }}>
                  <Icon className="h-3.5 w-3.5" />{cfg.label} — Locked
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map(([id, meta]) => (
                    <div key={id}
                      className="flex items-center gap-3 rounded-2xl p-4 opacity-50 transition-opacity hover:opacity-65"
                      style={{
                        background: "var(--ach-locked-bg)",
                        border:     "1px solid var(--ach-locked-border)",
                      }}>
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                        style={{
                          background: "var(--ach-locked-icon-wrap)",
                          border:     "1px solid var(--ach-locked-icon-border)",
                        }}>
                        <Lock className="h-5 w-5" style={{ color: "var(--ach-locked-icon)" }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: "var(--ach-locked-title)" }}>{meta.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--ach-locked-sub)" }}>{meta.flavor}</p>
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