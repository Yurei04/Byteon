"use client"
import { useState, useEffect, useCallback } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import ProfileHeader from "./profile-header"
import PersonalInformation from "./personal-information"
import ProfileStats from "./profile-stats"
import AchievementsTab from "@/components/achievements/achievementStab"

export default function UserProfile({ onSuccess, currentUser, authUserId }) {
  const [profile, setProfile]   = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [alert, setAlert]       = useState(null)
  const [achievementsMetadata, setAchievementsMetadata] = useState({})

  const [formData, setFormData] = useState({
    name:        "",
    age:         "",
    affiliation: "",
    country:     "",
    achievements: [],
  })

  // ── Fetch profile from DB ─────────────────────────────────────────────────
  // currentUser = Supabase auth UUID (profile.user_id from authContext)
  const fetchUserProfile = useCallback(async (authUUID) => {
    if (!authUUID) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", authUUID)
        .maybeSingle()

      if (error) throw error
      if (!data) return

      setProfile(data)
      setAchievementsMetadata(data.achievements_metadata ?? {})
      setFormData({
        name:         data.name        ?? "",
        age:          data.age         ?? "",
        affiliation:  data.affiliation ?? "",
        country:      data.country     ?? "",
        achievements: data.achievements ?? [],
      })
    } catch (err) {
      console.error("fetchUserProfile error:", err.message)
      setAlert({ type: "error", message: "Failed to load profile. Please refresh." })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── Trigger fetch when currentUser prop arrives ───────────────────────────
  useEffect(() => {
    if (currentUser) fetchUserProfile(currentUser)
  }, [currentUser, fetchUserProfile])

  // ── Realtime — keep achievements_metadata live ────────────────────────────
  useEffect(() => {
    if (!currentUser) return
    const channel = supabase
      .channel(`profile-achievements-${currentUser}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "users",
        filter: `user_id=eq.${currentUser}`,
      }, (payload) => {
        if (payload.new?.achievements_metadata !== undefined) {
          setAchievementsMetadata(payload.new.achievements_metadata ?? {})
        }
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [currentUser])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!currentUser) {
      setAlert({ type: "error", message: "User not found. Please refresh." })
      return
    }
    if (!formData.name || !formData.age) {
      setAlert({ type: "error", message: "Name and Age are required fields." })
      return
    }

    setIsLoading(true)
    setAlert(null)

    try {
      const { data, error } = await supabase
        .from("users")
        .update({
          name:        formData.name,
          age:         formData.age,
          affiliation: formData.affiliation,
          country:     formData.country,
          updated_at:  new Date().toISOString(),
        })
        .eq("user_id", currentUser)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      setAchievementsMetadata(data.achievements_metadata ?? {})
      setFormData({
        name:         data.name        ?? "",
        age:          data.age         ?? "",
        affiliation:  data.affiliation ?? "",
        country:      data.country     ?? "",
        achievements: data.achievements ?? [],
      })
      setIsEditing(false)
      setAlert({ type: "success", message: "Profile updated successfully!" })
      setTimeout(() => {
        setAlert(null)
        if (onSuccess) onSuccess()
      }, 2000)
    } catch (err) {
      console.error("Error updating profile:", err.message)
      setAlert({ type: "error", message: `Failed to update profile: ${err.message}` })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // ✅ fetchUserProfile is now defined — this no longer crashes
    if (currentUser) fetchUserProfile(currentUser)
  }

  const earnedCount = Object.keys(achievementsMetadata).length
  const totalPoints = Object.values(achievementsMetadata).reduce(
    (sum, a) => sum + (a.reward_points ?? 0), 0
  )

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12 text-white">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-fuchsia-300" />
        <span className="text-fuchsia-200">Loading profile...</span>
      </div>
    )
  }

  // ── No profile found ──────────────────────────────────────────────────────
  if (!profile) {
    return (
      <div className="flex justify-center items-center p-12 text-white/50">
        <AlertCircle className="mr-2 h-6 w-6" />
        <span>Profile not found.</span>
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