"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Calendar, CheckCircle } from "lucide-react"

export default function SuperAdminProfileHeader({ profile, session }) {
  return (
    <Card className="bg-gradient-to-br from-brand-50 via-bg-subtle to-bg-muted border border-brand-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-full border-2 border-brand-400 bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center shadow-lg shadow-brand-200">
              <ShieldCheck className="w-12 h-12 text-white" />
            </div>
            {/* Active dot */}
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-500">
              {profile?.name || "Super Admin"}
            </h2>

            <p className="text-text-muted text-sm">{session?.user?.email || "—"}</p>

            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <Badge className="text-xs px-3 py-1 bg-brand-100 text-brand-700 border border-brand-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />Super Admin
              </Badge>
              <Badge className="text-xs px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />Active
              </Badge>
              {profile?.created_at && (
                <Badge className="text-xs px-3 py-1 bg-bg-muted text-text-secondary border border-surface-border flex items-center gap-1">
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