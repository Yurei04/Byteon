"use client"

import { Edit, Save, X, Calendar, MapPin, Award, User2, Loader2, LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

const getInitials = (name) =>
  name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

export default function ProfileHeader({ formData, profile, isEditing, isLoading, onEdit, onSave, onCancel }) {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) { console.error("Sign out error:", error); alert("Failed to sign out."); return }
      router.push("/")
      router.refresh()
    } catch (err) {
      console.error("Sign out exception:", err)
      alert("An error occurred while signing out.")
    }
  }

  return (
    <div className="rounded-2xl overflow-hidden backdrop-blur-lg transition-colors duration-300 bg-surface/75 dark:bg-surface/70 border border-surface-border/40 shadow-[0_4px_24px_rgba(192,38,211,0.08)] dark:shadow-none">

      {/* Banner */}
      <div className="h-32 relative bg-gradient-to-r from-brand-600 via-accent-600 to-brand-700">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative -mt-16 px-6 pb-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">

          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white/90 dark:border-white/18 bg-gradient-to-br from-brand-600 to-accent-600">
              <span className="text-4xl font-bold text-white">
                {formData.name ? getInitials(formData.name) : <User2 className="w-16 h-16" />}
              </span>
            </div>
            {/* Online dot */}
            <div className="absolute -bottom-2 -right-2 rounded-full p-2 bg-green-500 border-4 border-white/90 dark:border-bg-base">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <div>
                <h2 className="text-3xl font-bold mb-1 text-text-primary dark:text-primary-100 ">
                  {formData.name || "User Profile"}
                </h2>
                <p className="flex items-center gap-2 text-sm text-text-secondary">
                  <Calendar className="w-4 h-4 text-text-muted" />
                  Member since {profile?.created_at ? formatDate(profile.created_at) : "N/A"}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                {!isEditing ? (
                  <>
                    <button
                      onClick={onEdit}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97] hover:opacity-90 bg-gradient-to-br from-brand-600 to-accent-600 cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit Profile</span>
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.97] border border-red-500/40 bg-red-700/90 text-red-100  hover:bg-red-500 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline">Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={onSave}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97] disabled:opacity-60 hover:opacity-90 bg-gradient-to-br from-green-600 to-emerald-600"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span className="hidden sm:inline">Save Changes</span>
                    </button>
                    <button
                      onClick={onCancel}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.97] border border-surface-border/60 text-text-secondary hover:bg-brand-500/5"
                    >
                      <X className="w-4 h-4" />
                      <span className="hidden sm:inline">Cancel</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.age && (
                <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium bg-accent-500/10 text-accent-600 dark:text-accent-400 border-accent-500/30">
                  {formData.age} years old
                </span>
              )}
              {formData.country && (
                <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25">
                  <MapPin className="w-3 h-3" />{formData.country}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/28">
                <Award className="w-3 h-3" />{formData.achievements?.length ?? 0} Achievements
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}