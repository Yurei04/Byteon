import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Palette } from "lucide-react"

export default function OrgBrandIdentity({ formData, isEditing, onChange, onColorChange }) {
  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Brand Identity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="primary_color" className="text-white">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  name="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={onChange}
                  className="w-16 h-12 p-1 bg-white/10 border-white/20 cursor-pointer"
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => onColorChange('primary_color', e.target.value)}
                  className="flex-1 bg-white/10 border-white/20 text-white"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary_color" className="text-white">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary_color"
                  name="secondary_color"
                  type="color"
                  value={formData.secondary_color}
                  onChange={onChange}
                  className="w-16 h-12 p-1 bg-white/10 border-white/20 cursor-pointer"
                />
                <Input
                  value={formData.secondary_color}
                  onChange={(e) => onColorChange('secondary_color', e.target.value)}
                  className="flex-1 bg-white/10 border-white/20 text-white"
                  placeholder="#1F2937"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color_scheme" className="text-white">Scheme Name</Label>
              <Input
                id="color_scheme"
                name="color_scheme"
                value={formData.color_scheme}
                onChange={onChange}
                className="bg-white/10 border-white/20 text-white"
                placeholder="dark-theme"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-white/60 text-sm mb-2">Color Palette</p>
              <div className="flex gap-2">
                <div 
                  className="w-16 h-16 rounded-lg border-2 border-white/20 shadow-lg"
                  style={{ backgroundColor: formData.primary_color }}
                  title={formData.primary_color}
                />
                <div 
                  className="w-16 h-16 rounded-lg border-2 border-white/20 shadow-lg"
                  style={{ backgroundColor: formData.secondary_color }}
                  title={formData.secondary_color}
                />
              </div>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Scheme</p>
              <p className="text-white font-mono">{formData.color_scheme}</p>
            </div>
          </>
        )}

        {/* Color Preview */}
        <div className="space-y-2">
          <p className="text-white/60 text-sm">Preview</p>
          <div 
            className="h-20 rounded-lg shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${formData.primary_color} 0%, ${formData.secondary_color} 100%)`
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}