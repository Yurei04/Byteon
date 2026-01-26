import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User2, MapPin, Briefcase } from "lucide-react"

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
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Name / Username *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={onChange}
                className="bg-white/10 border-white/20 text-white"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age" className="text-white">Age *</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={onChange}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="30"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-white">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={onChange}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Philippines"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="affiliation" className="text-white">Affiliation / Organization</Label>
              <Input
                id="affiliation"
                name="affiliation"
                value={formData.affiliation}
                onChange={onChange}
                className="bg-white/10 border-white/20 text-white"
                placeholder="Tech University / Company Name"
              />
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-white/60 text-sm mb-1">Full Name</p>
              <p className="text-white font-medium">{formData.name || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Age</p>
              <p className="text-white font-medium">{formData.age || 'Not provided'}</p>
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
                  'Not provided'
                )}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Affiliation</p>
              <p className="text-white font-medium flex items-center gap-2">
                {formData.affiliation ? (
                  <>
                    <Briefcase className="w-4 h-4 text-white/60" />
                    {formData.affiliation}
                  </>
                ) : (
                  'Not provided'
                )}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}