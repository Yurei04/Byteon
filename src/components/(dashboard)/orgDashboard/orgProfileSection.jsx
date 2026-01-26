import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Save, X, Calendar, Award, Building2, Loader2, LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

export default function OrgProfileHeader({ 
  formData, 
  profile, 
  isEditing, 
  isLoading, 
  onEdit, 
  onSave, 
  onCancel 
}) {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        alert('Failed to sign out. Please try again.')
        return
      }
      
      router.push('/')
      router.refresh()
    } catch (err) {
      console.error('Sign out exception:', err)
      alert('An error occurred while signing out.')
    }
  }

  return (
    <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border-white/20 overflow-hidden">
      <div 
        className="h-32 relative"
        style={{
          background: `linear-gradient(135deg, ${formData.primary_color} 0%, ${formData.secondary_color} 100%)`
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
      </div>
      <CardContent className="relative -mt-16 px-6 pb-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
          {/* Organization Avatar */}
          <div className="relative">
            <div 
              className="w-32 h-32 rounded-2xl border-4 border-white/20 shadow-2xl flex items-center justify-center text-5xl backdrop-blur-xl"
              style={{
                background: `linear-gradient(135deg, ${formData.primary_color}dd 0%, ${formData.secondary_color}dd 100%)`
              }}
            >
              <Building2 className="w-16 h-16 text-white" />
            </div>
            {formData.active && (
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-slate-950">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              </div>
            )}
          </div>

          {/* Organization Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">{formData.name}</h2>
                <p className="text-white/60 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member since {profile?.created_at ? formatDate(profile.created_at) : 'N/A'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {!isEditing ? (
                  <>
                    <Button 
                      onClick={onEdit}
                      className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700"
                    >
                      <Edit className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Edit Profile</span>
                    </Button>
                    <Button 
                      onClick={handleSignOut}
                      variant="outline"
                      className="border-red-500/50 text-red-300 hover:bg-red-500/20 hover:border-red-500"
                    >
                      <LogOut className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Sign Out</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      onClick={onSave}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" /> : <Save className="w-4 h-4 sm:mr-2" />}
                      <span className="hidden sm:inline">Save Changes</span>
                    </Button>
                    <Button 
                      onClick={onCancel}
                      variant="outline"
                      className="border-white/20 hover:bg-white/10"
                    >
                      <X className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Cancel</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge className="bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-500/30">
                {formData.color_scheme}
              </Badge>
              {formData.active ? (
                <Badge className="bg-green-500/20 text-green-200 border border-green-500/30">
                  ● Active
                </Badge>
              ) : (
                <Badge className="bg-gray-500/20 text-gray-200 border border-gray-500/30">
                  ○ Inactive
                </Badge>
              )}
              <Badge className="bg-purple-500/20 text-purple-200 border border-purple-500/30">
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