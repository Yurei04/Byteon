import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Save, X, Calendar, MapPin, Award, User2, Loader2 } from "lucide-react"

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const getInitials = (name) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function ProfileHeader({ 
  formData, 
  profile, 
  isEditing, 
  isLoading, 
  onEdit, 
  onSave, 
  onCancel 
}) {
  return (
    <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border-white/20 overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-pink-600 relative">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      <CardContent className="relative -mt-16 px-6 pb-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
          {/* User Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl border-4 border-white/20 shadow-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center backdrop-blur-xl">
              <span className="text-4xl font-bold text-white">
                {formData.name ? getInitials(formData.name) : <User2 className="w-16 h-16" />}
              </span>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-slate-950">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">
                  {formData.name || 'User Profile'}
                </h2>
                <p className="text-white/60 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member since {profile?.created_at ? formatDate(profile.created_at) : 'N/A'}
                </p>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button 
                    onClick={onEdit}
                    className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={onSave}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Changes
                    </Button>
                    <Button 
                      onClick={onCancel}
                      variant="outline"
                      className="border-white/20 hover:bg-white/10"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.age && (
                <Badge className="bg-purple-500/20 text-purple-200 border border-purple-500/30">
                  {formData.age} years old
                </Badge>
              )}
              {formData.country && (
                <Badge className="bg-blue-500/20 text-blue-200 border border-blue-500/30">
                  <MapPin className="w-3 h-3 mr-1" />
                  {formData.country}
                </Badge>
              )}
              <Badge className="bg-amber-500/20 text-amber-200 border border-amber-500/30">
                <Award className="w-3 h-3 mr-1" />
                {formData.achievements.length} Achievements
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}