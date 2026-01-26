import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function ProfileCompletion({ formData }) {
  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-white text-lg">Profile Completion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Basic Info</span>
            <CheckCircle className={`w-4 h-4 ${formData.name && formData.age ? 'text-green-400' : 'text-gray-500'}`} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Location</span>
            <CheckCircle className={`w-4 h-4 ${formData.country ? 'text-green-400' : 'text-gray-500'}`} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Affiliation</span>
            <CheckCircle className={`w-4 h-4 ${formData.affiliation ? 'text-green-400' : 'text-gray-500'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}