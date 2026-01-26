import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building2 } from "lucide-react"

export default function OrgAboutSection({ formData, isEditing, onChange }) {
  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          About Organization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Organization Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={onChange}
                className="bg-white/10 border-white/20 text-white"
                placeholder="Your Organization"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="des" className="text-white">Description *</Label>
              <Textarea
                id="des"
                name="des"
                value={formData.des}
                onChange={onChange}
                className="bg-white/10 border-white/20 text-white min-h-[120px]"
                placeholder="Describe your organization..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author_name" className="text-white">Contact Person</Label>
              <Input
                id="author_name"
                name="author_name"
                value={formData.author_name}
                onChange={onChange}
                className="bg-white/10 border-white/20 text-white"
                placeholder="Admin Name"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                id="active"
                name="active"
                type="checkbox"
                checked={formData.active}
                onChange={onChange}
                className="h-5 w-5 rounded border-white/20 bg-white/10"
              />
              <Label htmlFor="active" className="text-white cursor-pointer">
                Organization is Active
              </Label>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-white/60 text-sm mb-1">Description</p>
              <p className="text-white">{formData.des || 'No description provided'}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Contact Person</p>
              <p className="text-white">{formData.author_name || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Status</p>
              <p className="text-white">{formData.active ? '✅ Active' : '⏸️ Inactive'}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}