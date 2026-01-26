import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAchievementLevel } from "./achievement-data"

export default function ProfileStats({ achievementsCount, totalAchievements }) {
  const completionPercentage = Math.round((achievementsCount / totalAchievements) * 100)
  const level = getAchievementLevel(achievementsCount)

  const getLevelBadge = () => {
    if (level.gradient) {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500/30 to-amber-500/30 text-yellow-100 border border-yellow-400/50">
          {level.name}
        </Badge>
      )
    }
    
    const colorClasses = {
      gray: 'bg-gray-500/20 text-gray-200',
      blue: 'bg-blue-500/20 text-blue-200',
      purple: 'bg-purple-500/20 text-purple-200',
      amber: 'bg-amber-500/20 text-amber-200'
    }
    
    return (
      <Badge className={colorClasses[level.color]}>
        {level.name}
      </Badge>
    )
  }

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-white text-lg">Profile Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">Achievements</span>
            <span className="text-white font-bold text-lg">{achievementsCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">Completion</span>
            <span className="text-white font-bold text-lg">
              {completionPercentage}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">Profile Status</span>
            <Badge className="bg-green-500/20 text-green-200 border border-green-500/30">
              Active
            </Badge>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10">
          <p className="text-white/60 text-xs mb-2">Achievement Level</p>
          <div className="flex items-center gap-2">
            {getLevelBadge()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}