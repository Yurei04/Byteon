"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  Users, Building2, Megaphone, FileText,
  BookOpen, Clock, TrendingUp, BarChart3,
} from "lucide-react"

const STAT_CONFIG = [
  { key: "totalUsers",          label: "Users",          Icon: Users,      color: "blue"    },
  { key: "totalOrgs",           label: "Organizations",  Icon: Building2,  color: "fuchsia" },
  { key: "totalPending",        label: "Pending",        Icon: Clock,      color: "amber"   },
  { key: "totalAnnouncements",  label: "Announcements",  Icon: Megaphone,  color: "purple"  },
  { key: "totalBlogs",          label: "Blogs",          Icon: FileText,   color: "pink"    },
  { key: "totalResources",      label: "Resources",      Icon: BookOpen,   color: "emerald" },
  { key: "activeAnnouncements", label: "Active Events",  Icon: TrendingUp, color: "orange"  },
]

const COLOR_MAP = {
  blue:    { row: "from-blue-900/20 border-blue-500/15",    icon: "bg-blue-500/20 border-blue-400/30",     text: "text-blue-300",    label: "text-blue-200/60"    },
  fuchsia: { row: "from-fuchsia-900/20 border-fuchsia-500/15", icon: "bg-fuchsia-500/20 border-fuchsia-400/30", text: "text-fuchsia-300", label: "text-fuchsia-200/60" },
  amber:   { row: "from-amber-900/20 border-amber-500/15",  icon: "bg-amber-500/20 border-amber-400/30",   text: "text-amber-300",   label: "text-amber-200/60"   },
  purple:  { row: "from-purple-900/20 border-purple-500/15", icon: "bg-purple-500/20 border-purple-400/30", text: "text-purple-300", label: "text-purple-200/60"  },
  pink:    { row: "from-pink-900/20 border-pink-500/15",    icon: "bg-pink-500/20 border-pink-400/30",     text: "text-pink-300",    label: "text-pink-200/60"    },
  emerald: { row: "from-emerald-900/20 border-emerald-500/15", icon: "bg-emerald-500/20 border-emerald-400/30", text: "text-emerald-300", label: "text-emerald-200/60" },
  orange:  { row: "from-orange-900/20 border-orange-500/15", icon: "bg-orange-500/20 border-orange-400/30", text: "text-orange-300", label: "text-orange-200/60"  },
}

export default function SuperAdminQuickStat({ stats = {} }) {
  return (
    <Card className="bg-black/20 backdrop-blur-lg border border-purple-500/20">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-purple-200 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />Platform Stats
        </h3>

        <div className="space-y-2">
          {STAT_CONFIG.map(({ key, label, Icon, color }) => {
            const c = COLOR_MAP[color]
            const value = stats[key] ?? 0
            return (
              <div
                key={key}
                className={`flex items-center justify-between p-3 bg-gradient-to-r ${c.row} to-slate-950/20 rounded-lg border`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 ${c.icon} rounded-lg border`}>
                    <Icon className={`w-4 h-4 ${c.text}`} />
                  </div>
                  <span className={`text-sm ${c.label}`}>{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {key === "totalPending" && value > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                  <span className={`text-xl font-bold ${c.text}`}>{value}</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}