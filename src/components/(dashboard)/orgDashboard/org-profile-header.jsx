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
  onCancel,
  orgTheme,
  primaryC,
  secondaryC,
  addToast
}) {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        addToast("success", "Sign out Unsuccessful"); 
        return
      }

      router.push('/')
      router.refresh()
      addToast("success", "Sign out successful"); 

    } catch (err) {
      console.error('Sign out exception:', err)
      alert('An error occurred while signing out.')
    }
  }

  return (
    <Card 
      className="overflow-hidden"
      style={{
        background: orgTheme?.background_color || "rgba(0,0,0,0.9)",
        border: `2px solid ${primaryC}80`,
        boxShadow: `0 10px 40px ${primaryC}20, inset 0 1px 0 rgba(255,255,255,0.05)`
      }}
    >
      {/* HEADER GRADIENT */}
      <div 
        className="h-32 relative"
        style={{
          background: `linear-gradient(135deg, ${primaryC}, ${secondaryC})`
        }}
      >
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: orgTheme?.background_color
          }}
        />
      </div>

      <CardContent className="relative -mt-16 px-6 pb-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
          
          {/* AVATAR */}
          <div className="relative">
            <div 
              className="w-32 h-32 rounded-2xl border-4 shadow-2xl flex items-center justify-center text-5xl backdrop-blur-xl"
              style={{
                borderColor: `${primaryC}40`,
                background: `linear-gradient(135deg, ${primaryC}dd, ${secondaryC}dd)`
              }}
            >
              <Building2 className="w-16 h-16 text-white" />
            </div>

            {formData.active && (
              <div 
                className="absolute -bottom-2 -right-2 rounded-full p-2 border-4"
                style={{
                  background: secondaryC,
                  borderColor: orgTheme?.background_color || "#000"
                }}
              >
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              
              <div>
                <h2 
                  className="text-3xl font-bold mb-1"
                  style={{ color: primaryC }}
                >
                  {formData.name}
                </h2>

                <p 
                  className="flex items-center gap-2"
                  style={{ color: `${primaryC}aa` }}
                >
                  <Calendar className="w-4 h-4" />
                  Member since {profile?.created_at ? formatDate(profile.created_at) : 'N/A'}
                </p>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-wrap gap-2">
                {!isEditing ? (
                  <>
                    <Button 
                      onClick={onEdit}
                      style={{
                        background: `linear-gradient(135deg, ${primaryC}, ${secondaryC})`,
                        color: "#fff"
                      }}
                    >
                      <Edit className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Edit Profile</span>
                    </Button>

                    <Button 
                      onClick={handleSignOut}
                      variant="outline"
                      style={{
                        borderColor: `${secondaryC}80`,
                        color: secondaryC
                      }}
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
                      style={{
                        background: `linear-gradient(135deg, ${primaryC}, ${secondaryC})`,
                        color: "#fff"
                      }}
                    >
                      {isLoading 
                        ? <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" /> 
                        : <Save className="w-4 h-4 sm:mr-2" />
                      }
                      <span className="hidden sm:inline">Save Changes</span>
                    </Button>

                    <Button 
                      onClick={onCancel}
                      variant="outline"
                      style={{
                        borderColor: `${primaryC}50`,
                        color: primaryC
                      }}
                    >
                      <X className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Cancel</span>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* BADGES */}
            <div className="flex flex-wrap gap-2 mt-3">
              
              <Badge 
                style={{
                  background: `${primaryC}20`,
                  color: primaryC,
                  border: `1px solid ${primaryC}40`
                }}
              >
                {formData.color_scheme}
              </Badge>

              <Badge 
                style={{
                  background: `${secondaryC}20`,
                  color: secondaryC,
                  border: `1px solid ${secondaryC}40`
                }}
              >
                {formData.active ? "● Active" : "○ Inactive"}
              </Badge>

              <Badge 
                style={{
                  background: `${primaryC}15`,
                  color: primaryC,
                  border: `1px solid ${primaryC}30`
                }}
              >
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