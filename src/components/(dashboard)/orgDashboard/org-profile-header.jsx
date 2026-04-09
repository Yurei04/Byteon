"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Save, X, Calendar, Award, Building2, Loader2, LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useMemo } from "react"

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

// 🔒 Name constraints
const NAME_MIN = 3
const NAME_MAX = 40

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

  // 🧠 Validate name
  const nameError = useMemo(() => {
    if (!formData?.name) return "Name is required"
    if (formData.name.length < NAME_MIN) return `Minimum ${NAME_MIN} characters`
    if (formData.name.length > NAME_MAX) return `Maximum ${NAME_MAX} characters`
    return null
  }, [formData?.name])

  const isNameValid = !nameError

  const handleSave = () => {
    if (!isNameValid) {
      addToast("error", nameError)
      return
    }
    onSave()
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        addToast("error", "Sign out unsuccessful")
        return
      }

      router.push('/')
      router.refresh()
      addToast("success", "Sign out successful")

    } catch (err) {
      console.error('Sign out exception:', err)
      addToast("error", "Unexpected error during sign out")
    }
  }

  return (
    <Card 
      className="overflow-hidden backdrop-blur-xl"
      style={{
        background: "rgba(10,10,15,0.85)",
        border: `1px solid ${primaryC}40`,
        boxShadow: `
          0 20px 60px ${primaryC}25,
          inset 0 1px 0 rgba(255,255,255,0.06)
        `
      }}
    >
      {/* HEADER */}
      <div 
        className="h-36 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${primaryC}, ${secondaryC})`
        }}
      >
        {/* Glow */}
        <div
          className="absolute inset-0 opacity-30 blur-2xl"
          style={{
            background: `radial-gradient(circle at 30% 20%, ${primaryC}, transparent 60%)`
          }}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <CardContent className="relative -mt-16 px-6 pb-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
          
          {/* AVATAR */}
          <div className="relative">
            <div 
              className="w-32 h-32 rounded-2xl flex items-center justify-center backdrop-blur-xl"
              style={{
                background: `linear-gradient(135deg, ${primaryC}, ${secondaryC})`,
                boxShadow: `
                  0 0 0 4px rgba(0,0,0,0.6),
                  0 10px 30px ${primaryC}50
                `
              }}
            >
              <Building2 className="w-16 h-16 text-white drop-shadow-lg" />
            </div>

            {formData.active && (
              <div 
                className="absolute -bottom-2 -right-2 rounded-full p-2 border-4"
                style={{
                  background: secondaryC,
                  borderColor: "#0a0a0f"
                }}
              >
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              
              <div className="w-full">
                {/* NAME */}
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  {formData.name}
                </h2>

                {/* VALIDATION */}
                {isEditing && (
                  <p className={`text-xs mt-1 ${nameError ? "text-red-400" : "text-white/50"}`}>
                    {nameError || `${formData.name.length}/${NAME_MAX} characters`}
                  </p>
                )}

                {/* DATE */}
                <p className="flex items-center gap-2 text-white/70 mt-1">
                  <Calendar className="w-4 h-4 opacity-80" />
                  Member since {profile?.created_at ? formatDate(profile.created_at) : 'N/A'}
                </p>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-wrap gap-2">
                {!isEditing ? (
                  <>
                    <Button 
                      onClick={onEdit}
                      className="transition-all duration-200"
                      style={{
                        background: `linear-gradient(135deg, ${primaryC}, ${secondaryC})`,
                        color: "#fff",
                        boxShadow: `0 6px 20px ${primaryC}40`
                      }}
                    >
                      <Edit className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Edit Profile</span>
                    </Button>

                    <Button 
                      onClick={handleSignOut}
                      variant="outline"
                      className="transition-all duration-200"
                      style={{
                        borderColor: `${secondaryC}70`,
                        color: "#fff",
                        background: "rgba(255,255,255,0.05)"
                      }}
                    >
                      <LogOut className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Sign Out</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      onClick={handleSave}
                      disabled={isLoading || !isNameValid}
                      className="transition-all duration-200"
                      style={{
                        background: isNameValid
                          ? `linear-gradient(135deg, ${primaryC}, ${secondaryC})`
                          : "gray",
                        color: "#fff",
                        boxShadow: isNameValid ? `0 6px 20px ${primaryC}40` : "none"
                      }}
                    >
                      {isLoading 
                        ? <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" /> 
                        : <Save className="w-4 h-4 sm:mr-2" />
                      }
                      <span className="hidden sm:inline">Save</span>
                    </Button>

                    <Button 
                      onClick={onCancel}
                      variant="outline"
                      style={{
                        borderColor: `${primaryC}50`,
                        color: "#fff"
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
                  background: `${primaryC}30`,
                  color: "#fff",
                  border: `1px solid ${primaryC}50`
                }}
              >
                {formData.color_scheme}
              </Badge>

              <Badge 
                style={{
                  background: `${secondaryC}30`,
                  color: "#fff",
                  border: `1px solid ${secondaryC}50`
                }}
              >
                {formData.active ? "● Active" : "○ Inactive"}
              </Badge>

              <Badge 
                style={{
                  background: `${primaryC}25`,
                  color: "#fff",
                  border: `1px solid ${primaryC}40`
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