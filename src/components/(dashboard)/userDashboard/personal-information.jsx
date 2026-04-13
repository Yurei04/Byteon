import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User2, MapPin, Briefcase, Calendar, Globe } from "lucide-react"

const LIMITS = {
  name:        100,
  age:           3,
  country:      60,
  affiliation: 100,
}

function CharCount({ value, max }) {
  const str = value == null ? "" : String(value)
  const len  = str.length
  const near = len >= max * 0.85
  return (
    <span className={`text-xs font-mono ${near ? "text-yellow-400" : "text-fuchsia-300/40"}`}>
      {len}/{max}
    </span>
  )
}

function InfoField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-fuchsia-500/10 hover:border-fuchsia-500/20 transition-colors">
      <div className="mt-0.5 p-1.5 rounded-lg bg-fuchsia-500/10">
        <Icon className="w-3.5 h-3.5 text-fuchsia-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-widest text-fuchsia-300/50 font-semibold mb-0.5">{label}</p>
        <p className="text-sm text-white font-medium truncate">{value || <span className="text-white/30 font-normal italic">Not provided</span>}</p>
      </div>
    </div>
  )
}

export default function PersonalInformation({ formData, isEditing, onChange }) {
  return (
    <Card className="bg-gradient-to-br from-fuchsia-950/50 via-purple-950/40 to-slate-950/50 backdrop-blur-xl border border-fuchsia-500/20 shadow-xl shadow-fuchsia-950/30">
      <CardHeader className="pb-3 border-b border-fuchsia-500/10">
        <CardTitle className="text-white flex items-center gap-2.5 text-base">
          <div className="p-1.5 rounded-lg bg-fuchsia-500/15 border border-fuchsia-500/20">
            <User2 className="w-4 h-4 text-fuchsia-400" />
          </div>
          Personal Information
          {!isEditing && (
            <span className="ml-auto text-[10px] uppercase tracking-widest text-fuchsia-400/40 font-normal">
              Overview
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            {/* NAME */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="name" className="text-fuchsia-200/80 text-xs uppercase tracking-wider">
                  Full Name <span className="text-pink-400">*</span>
                </Label>
                <CharCount value={formData.name} max={LIMITS.name} />
              </div>
              <Input
                id="name"
                name="name"
                value={formData.name ?? ""}
                onChange={onChange}
                maxLength={LIMITS.name}
                className="bg-white/5 border-fuchsia-500/20 text-white placeholder:text-white/20
                  focus:border-fuchsia-400/50 focus:ring-1 focus:ring-fuchsia-400/20 h-10"
                placeholder="John Doe"
                required
              />
            </div>

            {/* AGE / COUNTRY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="age" className="text-fuchsia-200/80 text-xs uppercase tracking-wider">
                    Age <span className="text-pink-400">*</span>
                  </Label>
                  <CharCount value={formData.age} max={LIMITS.age} />
                </div>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age ?? ""}
                  onChange={onChange}
                  min={1}
                  max={120}
                  className="bg-white/5 border-fuchsia-500/20 text-white placeholder:text-white/20
                    focus:border-fuchsia-400/50 focus:ring-1 focus:ring-fuchsia-400/20 h-10"
                  placeholder="30"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="country" className="text-fuchsia-200/80 text-xs uppercase tracking-wider">
                    Country
                  </Label>
                  <CharCount value={formData.country} max={LIMITS.country} />
                </div>
                <Input
                  id="country"
                  name="country"
                  value={formData.country ?? ""}
                  onChange={onChange}
                  maxLength={LIMITS.country}
                  className="bg-white/5 border-fuchsia-500/20 text-white placeholder:text-white/20
                    focus:border-fuchsia-400/50 focus:ring-1 focus:ring-fuchsia-400/20 h-10"
                  placeholder="Philippines"
                />
              </div>
            </div>

            {/* AFFILIATION */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="affiliation" className="text-fuchsia-200/80 text-xs uppercase tracking-wider">
                  Affiliation / Organization
                </Label>
                <CharCount value={formData.affiliation} max={LIMITS.affiliation} />
              </div>
              <Input
                id="affiliation"
                name="affiliation"
                value={formData.affiliation ?? ""}
                onChange={onChange}
                maxLength={LIMITS.affiliation}
                className="bg-white/5 border-fuchsia-500/20 text-white placeholder:text-white/20
                  focus:border-fuchsia-400/50 focus:ring-1 focus:ring-fuchsia-400/20 h-10"
                placeholder="Tech University / Company Name"
              />
            </div>
          </div>
        ) : (
          /* ── VIEW MODE ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <InfoField
                icon={User2}
                label="Full Name"
                value={formData.name}
              />
            </div>
            <InfoField
              icon={Calendar}
              label="Age"
              value={formData.age ? `${formData.age} years old` : null}
            />
            <InfoField
              icon={Globe}
              label="Country"
              value={formData.country}
            />
            <div className="sm:col-span-2">
              <InfoField
                icon={Briefcase}
                label="Affiliation"
                value={formData.affiliation}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}