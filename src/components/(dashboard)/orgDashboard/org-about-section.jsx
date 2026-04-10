import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building2 } from "lucide-react"

const LIMITS = {
  name: 80,
  description: 500,
  author_name: 100,
  contact_email: 100,
}

function CharCount({ value = "", max, primaryC }) {
  const len = value.length
  const near = len >= max * 0.85
  return (
    <span style={{ color: near ? "#facc15" : `${primaryC}60` }} className="text-xs">
      {len}/{max}
    </span>
  )
}

export default function OrgAboutSection({
  formData,
  isEditing,
  onChange,
  orgTheme,
  primaryC,
  secondaryC,
}) {
  return (
    <Card
      className="backdrop-blur-lg"
      style={{
        background: `${orgTheme?.background_color || "#0b0f1a"}cc`,
        border: `1px solid ${primaryC}40`,
        boxShadow: `0 10px 30px ${primaryC}20`,
      }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: primaryC }}>
          <Building2 className="w-5 h-5" />
          About Organization
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            {/* NAME */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="name" style={{ color: primaryC }}>
                  Organization Name *
                </Label>
                <CharCount value={formData.name} max={LIMITS.name} primaryC={primaryC} />
              </div>
              <Input
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={onChange}
                maxLength={LIMITS.name}
                placeholder="Your Organization"
                required
                style={{
                  background: `${primaryC}10`,
                  border: `1px solid ${primaryC}40`,
                  color: primaryC,
                }}
              />
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="description" style={{ color: primaryC }}>
                  Description *
                </Label>
                <CharCount value={formData.description} max={LIMITS.description} primaryC={primaryC} />
              </div>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={onChange}
                maxLength={LIMITS.description}
                placeholder="Describe your organization..."
                required
                className="min-h-[120px]"
                style={{
                  background: `${primaryC}10`,
                  border: `1px solid ${primaryC}40`,
                  color: primaryC,
                }}
              />
            </div>

            {/* CONTACT PERSON — split into first / last name */}
            <div className="space-y-3">
              <Label style={{ color: primaryC }}>Contact Person *</Label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="author_first_name" style={{ color: `${primaryC}cc` }} className="text-sm">
                      First Name
                    </Label>
                    <CharCount
                      value={formData.author_first_name}
                      max={LIMITS.author_name / 2}
                      primaryC={primaryC}
                    />
                  </div>
                  <Input
                    id="author_first_name"
                    name="author_first_name"
                    value={formData.author_first_name || ""}
                    onChange={onChange}
                    maxLength={LIMITS.author_name / 2}
                    placeholder="Jane"
                    style={{
                      background: `${primaryC}10`,
                      border: `1px solid ${primaryC}40`,
                      color: primaryC,
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="author_last_name" style={{ color: `${primaryC}cc` }} className="text-sm">
                      Last Name
                    </Label>
                    <CharCount
                      value={formData.author_last_name}
                      max={LIMITS.author_name / 2}
                      primaryC={primaryC}
                    />
                  </div>
                  <Input
                    id="author_last_name"
                    name="author_last_name"
                    value={formData.author_last_name || ""}
                    onChange={onChange}
                    maxLength={LIMITS.author_name / 2}
                    placeholder="Smith"
                    style={{
                      background: `${primaryC}10`,
                      border: `1px solid ${primaryC}40`,
                      color: primaryC,
                    }}
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="contact_email" style={{ color: primaryC }}>
                    Email *
                  </Label>
                  <CharCount value={formData.contact_email} max={LIMITS.contact_email} primaryC={primaryC} />
                </div>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  value={formData.contact_email || ""}
                  onChange={onChange}
                  maxLength={LIMITS.contact_email}
                  placeholder="admin@example.com"
                  style={{
                    background: `${primaryC}10`,
                    border: `1px solid ${primaryC}40`,
                    color: primaryC,
                  }}
                />
              </div>
            </div>

            {/* ACTIVE */}
            <div className="flex items-center gap-2 pt-2">
              <input
                id="active"
                name="active"
                type="checkbox"
                checked={formData.active}
                onChange={onChange}
                className="h-5 w-5 rounded"
                style={{
                  accentColor: secondaryC,
                  background: `${primaryC}20`,
                  border: `1px solid ${primaryC}40`,
                }}
              />
              <Label htmlFor="active" className="cursor-pointer" style={{ color: primaryC }}>
                Organization is Active
              </Label>
            </div>
          </>
        ) : (
          <>
            {/* VIEW MODE */}
            {[
              { label: "Organization Name", value: formData.name || "No name provided" },
              { label: "Description", value: formData.description || "No description provided" },
              {
                label: "Contact Person",
                value:
                  formData.author_first_name || formData.author_last_name
                    ? `${formData.author_first_name || ""} ${formData.author_last_name || ""}`.trim()
                    : formData.author_name || "Not specified",
              },
              { label: "Contact Email", value: formData.contact_email || "Not specified" },
            ].map((item, i) => (
              <div key={i}>
                <p style={{ color: `${primaryC}aa` }} className="text-sm mb-1">
                  {item.label}
                </p>
                <p style={{ color: primaryC }}>{item.value}</p>
              </div>
            ))}

            <div>
              <p style={{ color: `${primaryC}aa` }} className="text-sm mb-1">
                Status
              </p>
              <p style={{ color: formData.active ? secondaryC : `${primaryC}aa` }}>
                {formData.active ? "● Active" : "○ Inactive"}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}