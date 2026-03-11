"use client"
import { useState, useEffect, useRef } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import ProfileHeader from "./profile-header"
import PersonalInformation from "./personal-information"
import ProfileStats from "./profile-stats"
import ProfileCompletion from "./profile-completion"
import AchievementsTab from "@/components/achievements/achievementStab"

export default function UserProfile({ onSuccess, currentUser, authUserId }) {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [alert, setAlert] = useState(null)
  const [userId, setUserId] = useState(null)
  const [achievementsMetadata, setAchievementsMetadata] = useState({})

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    affiliation: "",
    country: "",
    achievements: [], // kept so ProfileHeader's .length read never throws
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.age) {
      setAlert({ type: "error", message: "Name and Age are required fields." })
      return
    }
    if (!profile?.user_id) {
      setAlert({ type: "error", message: "Cannot update: User profile not found." })
      return
    }

    setIsLoading(true)
    setAlert(null)

    try {
      const { data, error } = await supabase
        .from("users")
        .update({
          name: formData.name,
          age: formData.age,
          affiliation: formData.affiliation,
          country: formData.country,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", profile.user_id)
        .select()
        .single()

      if (error) throw error

      setAlert({ type: "success", message: "Profile updated successfully!" })
      setIsEditing(false)
      setProfile(data)
      // Realtime handles achievements_metadata live, but sync here too as a safety net
      setAchievementsMetadata(data.achievements_metadata ?? {})

      setTimeout(() => {
        setAlert(null)
        if (onSuccess) onSuccess()
      }, 2000)
    } catch (error) {
      console.error("Error updating profile:", error.message)
      setAlert({ type: "error", message: `Failed to update profile: ${error.message}` })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (userId) fetchUserProfile(userId)
  }

  const earnedCount = Object.keys(achievementsMetadata).length
  const totalPoints = Object.values(achievementsMetadata).reduce(
    (sum, a) => sum + (a.reward_points ?? 0), 0
  )

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center p-12 text-white">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" /> Loading User Profile...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert && (
        <Alert
          variant={alert.type === "error" ? "destructive" : "default"}
          className={alert.type === "error"
            ? "bg-red-500/20 border-red-500 text-red-100"
            : "bg-green-500/20 border-green-500 text-green-100"}
        >
          {alert.type === "error"
            ? <AlertCircle className="h-4 w-4" />
            : <CheckCircle className="h-4 w-4" />}
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <ProfileHeader
        formData={formData}
        profile={profile}
        isEditing={isEditing}
        isLoading={isLoading}
        onEdit={() => setIsEditing(true)}
        onSave={handleSubmit}
        onCancel={handleCancel}
      />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PersonalInformation
            formData={formData}
            isEditing={isEditing}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-6">
          <ProfileStats
            achievementsCount={earnedCount}
            totalPoints={totalPoints}
          />
        </div>
      </div>

      {/* Achievements panel */}
      <div className="rounded-2xl border border-fuchsia-500/20 bg-black/20 backdrop-blur-lg p-4 sm:p-6">
        <h2 className="text-sm font-mono font-bold tracking-widest text-fuchsia-400/80 uppercase mb-4 flex items-center gap-2">
          🏆 Achievements
        </h2>
        <AchievementsTab achievementsMetadata={achievementsMetadata} />
      </div>
    </div>
  )
}