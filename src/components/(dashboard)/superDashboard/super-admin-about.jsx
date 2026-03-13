"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ShieldCheck, Building2, Mail, Calendar, Link2,
} from "lucide-react"

export default function SuperAdminAboutSection({ profile, session }) {
  const linkedOrg = profile?.linkedOrg

  const rows = [
    {
      icon:  <Mail className="w-4 h-4 text-fuchsia-400" />,
      label: "Login Email",
      value: session?.user?.email || "—",
    },
    {
      icon:  <ShieldCheck className="w-4 h-4 text-purple-400" />,
      label: "Role",
      value: (
        <Badge className="bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 text-xs">
          Super Admin
        </Badge>
      ),
    },
    {
      icon:  <Calendar className="w-4 h-4 text-purple-400" />,
      label: "Account Created",
      value: profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric",
          })
        : "—",
    },
    {
      icon:  <Building2 className="w-4 h-4 text-fuchsia-400" />,
      label: "Platform Org",
      value: linkedOrg ? (
        <span className="flex items-center gap-1 text-white">
          <Link2 className="w-3 h-3 text-fuchsia-400" />
          {linkedOrg.name}
        </span>
      ) : (
        <span className="text-amber-400 text-xs italic">
          No platform org linked — set organization_id in super_admins row
        </span>
      ),
    },
  ]

  return (
    <Card className="bg-black/20 backdrop-blur-lg border border-purple-500/20">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-purple-200 mb-5 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />Admin Information
        </h3>

        <div className="space-y-3">
          {rows.map(({ icon, label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-purple-500/15"
            >
              <div className="flex items-center gap-2 text-sm text-white/50">
                {icon}{label}
              </div>
              <div className="text-sm text-white font-medium text-right max-w-[60%]">
                {value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}