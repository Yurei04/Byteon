import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building2 } from "lucide-react"

export default function OrgAboutSection({ 
  formData, 
  isEditing, 
  onChange, 
  orgTheme, 
  primaryC, 
  secondaryC 
}) {
  return (
    <Card 
      className="backdrop-blur-lg"
      style={{
        background: `${orgTheme?.background_color || "#0b0f1a"}cc`,
        border: `1px solid ${primaryC}40`,
        boxShadow: `0 10px 30px ${primaryC}20`
      }}
    >
      <CardHeader>
        <CardTitle 
          className="flex items-center gap-2"
          style={{ color: primaryC }}
        >
          <Building2 className="w-5 h-5" />
          About Organization
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            {/* NAME */}
            <div className="space-y-2">
              <Label htmlFor="name" style={{ color: primaryC }}>
                Organization Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={onChange}
                placeholder="Your Organization"
                required
                style={{
                  background: `${primaryC}10`,
                  border: `1px solid ${primaryC}40`,
                  color: primaryC
                }}
              />
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-2">
              <Label htmlFor="description" style={{ color: primaryC }}>
                Description *
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={onChange}
                placeholder="Describe your organization..."
                required
                className="min-h-[120px]"
                style={{
                  background: `${primaryC}10`,
                  border: `1px solid ${primaryC}40`,
                  color: primaryC
                }}
              />
            </div>

            {/* CONTACT */}
            <div className="space-y-2">
              <Label htmlFor="author_name" style={{ color: primaryC }}>
                Contact Person *
              </Label>
              <Input
                id="author_name"
                name="author_name"
                value={formData.author_name}
                onChange={onChange}
                placeholder="Admin Name"
                style={{
                  background: `${primaryC}10`,
                  border: `1px solid ${primaryC}40`,
                  color: primaryC
                }}
              />
              <Label htmlFor="contact_email" style={{ color: primaryC }}>
                Email *
              </Label>
              <Input
                id="contact_email"
                name="contact_email"
                value={formData.contact_email}
                onChange={onChange}
                placeholder="Admin Email"
                style={{
                  background: `${primaryC}10`,
                  border: `1px solid ${primaryC}40`,
                  color: primaryC
                }}
              />
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
                  border: `1px solid ${primaryC}40`
                }}
              />
              <Label 
                htmlFor="active" 
                className="cursor-pointer"
                style={{ color: primaryC }}
              >
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
              { label: "Contact Person", value: formData.author_name || "Not specified" },
              { label: "Contact Email", value: formData.contact_email || "Not specified" },
            ].map((item, i) => (
              <div key={i}>
                <p style={{ color: `${primaryC}aa` }} className="text-sm mb-1">
                  {item.label}
                </p>
                <p style={{ color: primaryC }}>
                  {item.value}
                </p>
              </div>
            ))}

            <div>
              <p style={{ color: `${primaryC}aa` }} className="text-sm mb-1">
                Status
              </p>
              <p 
                style={{ 
                  color: formData.active ? secondaryC : `${primaryC}aa` 
                }}
              >
                {formData.active ? "● Active" : "○ Inactive"}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}