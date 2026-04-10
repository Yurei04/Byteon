import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User2, MapPin, Briefcase } from "lucide-react"

const LIMITS = {
  firstName:   50,
  lastName:    50,
  age:          3,
  country:     60,
  affiliation: 100,
}

// ── null-safe: Supabase returns null for empty columns, not undefined ─────────
function CharCount({ value, max }) {
  const str = value == null ? "" : String(value)
  const len  = str.length
  const near = len >= max * 0.85
  return (
    <span className={`text-xs ${near ? "text-yellow-400" : "text-white/40"}`}>
      {len}/{max}
    </span>
  )
}

export default function PersonalInformation({ formData, isEditing, onChange }) {
  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <User2 className="w-5 h-5" />
          Personal Information
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            {/* FIRST / LAST NAME */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="first_name" className="text-white">First Name *</Label>
                  <CharCount value={formData.first_name} max={LIMITS.firstName} />
                </div>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name ?? ""}
                  onChange={onChange}
                  maxLength={LIMITS.firstName}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                  placeholder="John"
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="last_name" className="text-white">Last Name *</Label>
                  <CharCount value={formData.last_name} max={LIMITS.lastName} />
                </div>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name ?? ""}
                  onChange={onChange}
                  maxLength={LIMITS.lastName}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            {/* AGE / COUNTRY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="age" className="text-white">Age *</Label>
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
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                  placeholder="30"
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="country" className="text-white">Country</Label>
                  <CharCount value={formData.country} max={LIMITS.country} />
                </div>
                <Input
                  id="country"
                  name="country"
                  value={formData.country ?? ""}
                  onChange={onChange}
                  maxLength={LIMITS.country}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                  placeholder="Philippines"
                />
              </div>
            </div>

            {/* AFFILIATION */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="affiliation" className="text-white">
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
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                placeholder="Tech University / Company Name"
              />
            </div>
          </>
        ) : (
          /* ── VIEW MODE ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <p className="text-white/60 text-sm mb-1">Full Name</p>
              <p className="text-white font-medium">
                {formData.first_name || formData.last_name
                  ? `${formData.first_name ?? ""} ${formData.last_name ?? ""}`.trim()
                  : "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Age</p>
              <p className="text-white font-medium">{formData.age || "Not provided"}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Country</p>
              <p className="text-white font-medium flex items-center gap-2">
                {formData.country ? (
                  <>
                    <MapPin className="w-4 h-4 text-white/60" />
                    {formData.country}
                  </>
                ) : (
                  "Not provided"
                )}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-white/60 text-sm mb-1">Affiliation</p>
              <p className="text-white font-medium flex items-center gap-2">
                {formData.affiliation ? (
                  <>
                    <Briefcase className="w-4 h-4 text-white/60" />
                    {formData.affiliation}
                  </>
                ) : (
                  "Not provided"
                )}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}