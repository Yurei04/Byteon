"use client"
import { useState, useEffect, useCallback } from "react"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import ProfileHeader from "./profile-header"
import PersonalInformation from "./personal-information"
import ProfileStats from "./profile-stats"
import AchievementsTab from "@/components/achievements/achievementStab"

const THEME_STYLES = `
  /* ── Light ── */
  :root {
    --up-bg:           rgba(253,244,255,0.60);
    --up-border:       rgba(192,38,211,0.18);
    --up-heading:      #c026d3;

    --up-alert-ok-bg:      rgba(34,197,94,0.10);
    --up-alert-ok-border:  rgba(34,197,94,0.30);
    --up-alert-ok-text:    #15803d;
    --up-alert-err-bg:     rgba(239,68,68,0.10);
    --up-alert-err-border: rgba(239,68,68,0.30);
    --up-alert-err-text:   #b91c1c;

    --up-loading-text:  #a11bb0;
    --up-empty-text:    rgba(112,25,118,0.45);
  }

  /* ── Dark ── */
  .dark {
    --up-bg:           rgba(15,2,20,0.60);
    --up-border:       rgba(168,85,247,0.20);
    --up-heading:      #e879f9;

    --up-alert-ok-bg:      rgba(34,197,94,0.12);
    --up-alert-ok-border:  rgba(34,197,94,0.30);
    --up-alert-ok-text:    #86efac;
    --up-alert-err-bg:     rgba(239,68,68,0.12);
    --up-alert-err-border: rgba(239,68,68,0.30);
    --up-alert-err-text:   #fca5a5;

    --up-loading-text:  #e879f9;
    --up-empty-text:    rgba(255,255,255,0.35);
  }
`

export default function UserProfile({ onSuccess, currentUser, authUserId }) {
  const [profile, setProfile]               = useState(null)
  const [isLoading, setIsLoading]           = useState(true)
  const [isEditing, setIsEditing]           = useState(false)
  const [alert, setAlert]                   = useState(null)
  const [achievementsMetadata, setAchievementsMetadata] = useState({})

  const [formData, setFormData] = useState({
    name: "", age: "", affiliation: "", country: "", achievements: [],
  })

  const fetchUserProfile = useCallback(async (authUUID) => {
    if (!authUUID) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("users").select("*").eq("user_id", authUUID).maybeSingle()
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

  useEffect(() => { if (currentUser) fetchUserProfile(currentUser) }, [currentUser, fetchUserProfile])

  useEffect(() => {
    if (!currentUser) return
    const channel = supabase
      .channel(`profile-achievements-${currentUser}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "users",
        filter: `user_id=eq.${currentUser}`,
      }, (payload) => {
        if (payload.new?.achievements_metadata !== undefined)
          setAchievementsMetadata(payload.new.achievements_metadata ?? {})
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [currentUser])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!currentUser) { setAlert({ type: "error", message: "User not found. Please refresh." }); return }
    if (!formData.name || !formData.age) { setAlert({ type: "error", message: "Name and Age are required fields." }); return }
    setIsLoading(true)
    setAlert(null)
    try {
      const { data, error } = await supabase
        .from("users")
        .update({ name: formData.name, age: formData.age, affiliation: formData.affiliation, country: formData.country, updated_at: new Date().toISOString() })
        .eq("user_id", currentUser).select().single()
      if (error) throw error
      setProfile(data)
      setAchievementsMetadata(data.achievements_metadata ?? {})
      setFormData({ name: data.name ?? "", age: data.age ?? "", affiliation: data.affiliation ?? "", country: data.country ?? "", achievements: data.achievements ?? [] })
      setIsEditing(false)
      setAlert({ type: "success", message: "Profile updated successfully!" })
      setTimeout(() => { setAlert(null); if (onSuccess) onSuccess() }, 2000)
    } catch (err) {
      console.error("Error updating profile:", err.message)
      setAlert({ type: "error", message: `Failed to update profile: ${err.message}` })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => { setIsEditing(false); if (currentUser) fetchUserProfile(currentUser) }

  const earnedCount  = Object.keys(achievementsMetadata).length
  const totalPoints  = Object.values(achievementsMetadata).reduce((sum, a) => sum + (a.reward_points ?? 0), 0)

  if (isLoading) return (
    <div className="flex justify-center items-center p-12">
      <style>{THEME_STYLES}</style>
      <Loader2 className="mr-2 h-8 w-8 animate-spin" style={{ color: "var(--up-loading-text)" }} />
      <span style={{ color: "var(--up-loading-text)" }}>Loading profile…</span>
    </div>
  )

  if (!profile) return (
    <div className="flex justify-center items-center p-12">
      <style>{THEME_STYLES}</style>
      <AlertCircle className="mr-2 h-6 w-6" style={{ color: "var(--up-empty-text)" }} />
      <span style={{ color: "var(--up-empty-text)" }}>Profile not found.</span>
    </div>
  )

  return (
    <div className="space-y-6">
      <style>{THEME_STYLES}</style>

      {/* Alert */}
      {alert && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium"
          style={alert.type === "error" ? {
            background:   "var(--up-alert-err-bg)",
            borderColor:  "var(--up-alert-err-border)",
            color:        "var(--up-alert-err-text)",
          } : {
            background:   "var(--up-alert-ok-bg)",
            borderColor:  "var(--up-alert-ok-border)",
            color:        "var(--up-alert-ok-text)",
          }}>
          {alert.type === "error"
            ? <AlertCircle className="h-4 w-4 shrink-0" />
            : <CheckCircle className="h-4 w-4 shrink-0" />}
          {alert.message}
        </div>
      )}

      <ProfileHeader
        formData={formData} profile={profile}
        isEditing={isEditing} isLoading={isLoading}
        onEdit={() => setIsEditing(true)} onSave={handleSubmit} onCancel={handleCancel}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PersonalInformation formData={formData} isEditing={isEditing} onChange={handleChange} />
        </div>
      </div>

      {/* Achievements panel */}
      <div className="rounded-2xl backdrop-blur-lg p-4 sm:p-6"
        style={{ background: "var(--up-bg)", border: "1px solid var(--up-border)" }}>
        <h2 className="text-sm font-mono font-bold tracking-widest uppercase mb-4 flex items-center gap-2"
          style={{ color: "var(--up-heading)" }}>
          🏆 Achievements
        </h2>
        <AchievementsTab achievementsMetadata={achievementsMetadata} />
      </div>
    </div>
  )
}