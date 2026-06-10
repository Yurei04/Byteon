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
      icon:  <Mail className="w-4 h-4 text-brand-500" />,
      label: "Login Email",
      value: session?.user?.email || "—",
    },
    {
      icon:  <ShieldCheck className="w-4 h-4 text-accent-500" />,
      label: "Role",
      value: (
        <Badge className="bg-brand-100 text-brand-700 border border-brand-200 text-xs">
          Super Admin
        </Badge>
      ),
    },
    {
      icon:  <Calendar className="w-4 h-4 text-accent-500" />,
      label: "Account Created",
      value: profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric",
          })
        : "—",
    },
    {
      icon:  <Building2 className="w-4 h-4 text-brand-500" />,
      label: "Platform Org",
      value: linkedOrg ? (
        <span className="flex items-center gap-1 text-text-primary">
          <Link2 className="w-3 h-3 text-brand-500" />
          {linkedOrg.name}
        </span>
      ) : (
        <span className="text-amber-600 text-xs italic">
          No platform org linked — set organization_id in super_admins row
        </span>
      ),
    },
  ]

  return (
    <Card className="bg-surface border border-surface-border shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-text-primary mb-5 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-600" />Admin Information
        </h3>

        <div className="space-y-3">
          {rows.map(({ icon, label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between p-3 bg-bg-subtle rounded-lg border border-surface-border"
            >
              <div className="flex items-center gap-2 text-sm text-text-muted">
                {icon}{label}
              </div>
              <div className="text-sm text-text-primary font-medium text-right max-w-[60%]">
                {value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}