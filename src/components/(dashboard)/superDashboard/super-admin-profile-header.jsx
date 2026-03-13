"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Calendar, CheckCircle } from "lucide-react"

export default function SuperAdminProfileHeader({ profile, session }) {
  return (
    <Card className="bg-gradient-to-br from-fuchsia-900/30 via-purple-900/30 to-slate-950/30 backdrop-blur-xl border border-fuchsia-500/30">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-full border-2 border-fuchsia-500/50 bg-gradient-to-br from-fuchsia-600 to-purple-700 flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
              <ShieldCheck className="w-12 h-12 text-white" />
            </div>
            {/* Active dot */}
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-950" />
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-300">
              {profile?.name || "Super Admin"}
            </h2>

            <p className="text-fuchsia-200/50 text-sm">{session?.user?.email || "—"}</p>

            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <Badge className="text-xs px-3 py-1 bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />Super Admin
              </Badge>
              <Badge className="text-xs px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />Active
              </Badge>
              {profile?.created_at && (
                <Badge className="text-xs px-3 py-1 bg-slate-800/60 text-slate-400 border border-slate-600/30 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Since {new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </Badge>
              )}
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}