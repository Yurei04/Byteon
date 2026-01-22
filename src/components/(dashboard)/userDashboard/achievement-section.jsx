import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, CheckCircle } from "lucide-react"
import { achievementCategories } from "./achievement-data"

export default function AchievementsSection({ achievements, availableAchievements }) {
  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Award className="w-5 h-5" />
          Achievements & Badges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-white/70 text-sm mb-4">
          Earn achievements by completing activities and milestones on the platform.
        </p>
        
        {/* Achievement Progress */}
        <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/80 text-sm font-medium">Overall Progress</span>
            <span className="text-white font-bold">
              {achievements.length} / {availableAchievements.length}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500"
              style={{ width: `${(achievements.length / availableAchievements.length) * 100}%` }}
            />
          </div>
          <p className="text-white/60 text-xs mt-2 text-center">
            {Math.round((achievements.length / availableAchievements.length) * 100)}% Complete
          </p>
        </div>

        {/* Achievements by Category */}
        <div className="space-y-4">
          {achievementCategories.map(category => {
            const categoryAchievements = availableAchievements.filter(a => a.category === category)
            if (categoryAchievements.length === 0) return null
            
            return (
              <div key={category}>
                <h4 className="text-white/70 font-semibold text-sm mb-2 uppercase tracking-wide">{category}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {categoryAchievements.map(achievement => {
                    const isUnlocked = achievements.includes(achievement.id)
                    return (
                      <div
                        key={achievement.id}
                        className={`p-3 rounded-lg border transition-all ${
                          isUnlocked
                            ? 'bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border-yellow-400/50 shadow-lg shadow-yellow-500/10'
                            : 'bg-gray-800/30 border-gray-600/30 opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{achievement.icon}</span>
                          <span className={`text-sm font-medium flex-1 ${isUnlocked ? 'text-yellow-100' : 'text-gray-400'}`}>
                            {achievement.label}
                          </span>
                          {isUnlocked && (
                            <CheckCircle className="w-5 h-5 text-yellow-400" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}