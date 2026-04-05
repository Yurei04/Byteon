import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function OrgQuickStats({ formData, totalAchievements }) {
  const completionPercentage = Math.round((formData.achievements.length / totalAchievements) * 100)

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-white text-lg">Quick Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-white/60 text-sm">Achievements</span>
          <span className="text-white font-bold">{formData.achievements.length}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/60 text-sm">Completion</span>
          <span className="text-white font-bold">
            {completionPercentage}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/60 text-sm">Theme</span>
          <span className="text-white text-sm font-mono">{formData.color_scheme}</span>
        </div>
      </CardContent>
    </Card>
  )
}