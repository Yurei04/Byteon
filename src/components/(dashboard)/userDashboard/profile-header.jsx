"use client"

import { Edit, Save, X, Calendar, MapPin, Award, User2, Loader2, LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const THEME_STYLES = `
  /* ── Light ── */
  :root {
    --ph-card-bg:          rgba(255,255,255,0.75);
    --ph-card-border:      rgba(192,38,211,0.18);
    --ph-card-shadow:      0 4px 24px rgba(192,38,211,0.08);

    --ph-banner-from:      #c026d3;
    --ph-banner-via:       #9333ea;
    --ph-banner-to:        #db2777;

    --ph-avatar-border:    rgba(255,255,255,0.90);
    --ph-avatar-from:      #c026d3;
    --ph-avatar-to:        #9333ea;
    --ph-avatar-text:      #ffffff;

    --ph-online-ring:      rgba(255,255,255,0.90);

    --ph-name-color:       #1e0320;
    --ph-meta-color:       rgba(112,25,118,0.60);
    --ph-meta-icon:        #a11bb0;

    --ph-badge-age-bg:     rgba(168,85,247,0.12);
    --ph-badge-age-text:   #6d28d9;
    --ph-badge-age-border: rgba(168,85,247,0.28);

    --ph-badge-loc-bg:     rgba(59,130,246,0.10);
    --ph-badge-loc-text:   #1d4ed8;
    --ph-badge-loc-border: rgba(59,130,246,0.25);

    --ph-badge-ach-bg:     rgba(245,158,11,0.10);
    --ph-badge-ach-text:   #92400e;
    --ph-badge-ach-border: rgba(245,158,11,0.28);

    --ph-btn-edit-from:    #c026d3;
    --ph-btn-edit-to:      #9333ea;
    --ph-btn-signout-border: rgba(239,68,68,0.40);
    --ph-btn-signout-text:   #dc2626;
    --ph-btn-signout-hover:  rgba(239,68,68,0.10);

    --ph-btn-save-from:    #16a34a;
    --ph-btn-save-to:      #059669;
    --ph-btn-cancel-border: rgba(112,25,118,0.25);
    --ph-btn-cancel-text:   rgba(112,25,118,0.70);
    --ph-btn-cancel-hover:  rgba(192,38,211,0.06);
  }

  /* ── Dark ── */
  .dark {
    --ph-card-bg:          rgba(15,2,20,0.70);
    --ph-card-border:      rgba(255,255,255,0.12);
    --ph-card-shadow:      none;

    --ph-banner-from:      #86198f;
    --ph-banner-via:       #6b21a8;
    --ph-banner-to:        #9d174d;

    --ph-avatar-border:    rgba(255,255,255,0.18);
    --ph-avatar-from:      #c026d3;
    --ph-avatar-to:        #9333ea;
    --ph-avatar-text:      #ffffff;

    --ph-online-ring:      #0a0014;

    --ph-name-color:       #fae8ff;
    --ph-meta-color:       rgba(255,255,255,0.50);
    --ph-meta-icon:        rgba(232,121,249,0.70);

    --ph-badge-age-bg:     rgba(168,85,247,0.18);
    --ph-badge-age-text:   #d8b4fe;
    --ph-badge-age-border: rgba(168,85,247,0.35);

    --ph-badge-loc-bg:     rgba(59,130,246,0.14);
    --ph-badge-loc-text:   #93c5fd;
    --ph-badge-loc-border: rgba(59,130,246,0.28);

    --ph-badge-ach-bg:     rgba(245,158,11,0.12);
    --ph-badge-ach-text:   #fcd34d;
    --ph-badge-ach-border: rgba(245,158,11,0.28);

    --ph-btn-edit-from:    #c026d3;
    --ph-btn-edit-to:      #9333ea;
    --ph-btn-signout-border: rgba(239,68,68,0.40);
    --ph-btn-signout-text:   #fca5a5;
    --ph-btn-signout-hover:  rgba(239,68,68,0.12);

    --ph-btn-save-from:    #16a34a;
    --ph-btn-save-to:      #059669;
    --ph-btn-cancel-border: rgba(255,255,255,0.14);
    --ph-btn-cancel-text:   rgba(255,255,255,0.55);
    --ph-btn-cancel-hover:  rgba(255,255,255,0.06);
  }
`

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
    <>
      <style>{THEME_STYLES}</style>

      <div className="rounded-2xl overflow-hidden backdrop-blur-lg transition-colors duration-300"
        style={{
          background:  "var(--ph-card-bg)",
          border:      "1px solid var(--ph-card-border)",
          boxShadow:   "var(--ph-card-shadow)",
        }}>

        {/* Banner */}
        <div className="h-32 relative"
          style={{ background: `linear-gradient(to right, var(--ph-banner-from), var(--ph-banner-via), var(--ph-banner-to))` }}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.35), transparent)" }} />
        </div>

        {/* Content */}
        <div className="relative -mt-16 px-6 pb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">

            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl flex items-center justify-center shadow-2xl"
                style={{
                  border:     "4px solid var(--ph-avatar-border)",
                  background: `linear-gradient(135deg, var(--ph-avatar-from), var(--ph-avatar-to))`,
                }}>
                <span className="text-4xl font-bold" style={{ color: "var(--ph-avatar-text)" }}>
                  {formData.name ? getInitials(formData.name) : <User2 className="w-16 h-16" />}
                </span>
              </div>
              {/* Online dot */}
              <div className="absolute -bottom-2 -right-2 rounded-full p-2 bg-green-500"
                style={{ border: `4px solid var(--ph-online-ring)` }}>
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                  <h2 className="text-3xl font-bold mb-1" style={{ color: "var(--ph-name-color)" }}>
                    {formData.name || "User Profile"}
                  </h2>
                  <p className="flex items-center gap-2 text-sm" style={{ color: "var(--ph-meta-color)" }}>
                    <Calendar className="w-4 h-4" style={{ color: "var(--ph-meta-icon)" }} />
                    Member since {profile?.created_at ? formatDate(profile.created_at) : "N/A"}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  {!isEditing ? (
                    <>
                      <button onClick={onEdit}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97]"
                        style={{ background: `linear-gradient(135deg, var(--ph-btn-edit-from), var(--ph-btn-edit-to))` }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit Profile</span>
                      </button>
                      <button onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]"
                        style={{
                          border:      "1px solid var(--ph-btn-signout-border)",
                          color:       "var(--ph-btn-signout-text)",
                          background:  "transparent",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--ph-btn-signout-hover)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={onSave} disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97] disabled:opacity-60"
                        style={{ background: `linear-gradient(135deg, var(--ph-btn-save-from), var(--ph-btn-save-to))` }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                        {isLoading
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Save className="w-4 h-4" />}
                        <span className="hidden sm:inline">Save Changes</span>
                      </button>
                      <button onClick={onCancel}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]"
                        style={{
                          border:     "1px solid var(--ph-btn-cancel-border)",
                          color:      "var(--ph-btn-cancel-text)",
                          background: "transparent",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--ph-btn-cancel-hover)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
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
                  <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium"
                    style={{ background: "var(--ph-badge-age-bg)", color: "var(--ph-badge-age-text)", borderColor: "var(--ph-badge-age-border)" }}>
                    {formData.age} years old
                  </span>
                )}
                {formData.country && (
                  <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium"
                    style={{ background: "var(--ph-badge-loc-bg)", color: "var(--ph-badge-loc-text)", borderColor: "var(--ph-badge-loc-border)" }}>
                    <MapPin className="w-3 h-3" />{formData.country}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium"
                  style={{ background: "var(--ph-badge-ach-bg)", color: "var(--ph-badge-ach-text)", borderColor: "var(--ph-badge-ach-border)" }}>
                  <Award className="w-3 h-3" />{formData.achievements?.length ?? 0} Achievements
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}