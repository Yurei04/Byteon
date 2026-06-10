"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Save, X, Calendar, Award, Building2, Loader2, LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useMemo } from "react"

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

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
  uiT,
  addToast,
  isDark = true,
}) {
  const router = useRouter()

  // ── Derive brand colors from formData (with fallbacks) ──────────────────
  const primaryC   = formData?.primary_color   || "#c026d3"
  const secondaryC = formData?.secondary_color || "#db2777"

  // ── All surface/text values come from uiT (light or dark) ───────────────
  const cardBg      = uiT?.cardBg      ?? (isDark ? "rgba(0,0,0,0.25)"      : "rgba(255,255,255,0.85)")
  const cardShadow  = `0 8px 32px ${primaryC}25, inset 0 1px 0 ${uiT?.borderBase ?? "rgba(255,255,255,0.06)"}`
  const avatarBorder= uiT?.cardBg      ?? (isDark ? "#0a0a0f"               : "#ffffff")
  const textPrimary = uiT?.headingText  ?? (isDark ? "#ffffff"               : "#0f172a")
  const textSecondary=uiT?.mutedText   ?? (isDark ? "rgba(255,255,255,0.5)" : "#64748b")
  const validationOk= isDark ? "#4ade80" : "#16a34a"

  // ── Button style ─────────────────────────────────────────────────────────
  const btnStyle = {
    background:  `linear-gradient(135deg, ${primaryC}, ${secondaryC})`,
    boxShadow:   `0 2px 12px ${primaryC}50`,
    color:       "#ffffff",
    border:      "none",
    opacity:     isLoading ? 0.7 : 1,
  }

  const btnOutlineStyle = {
    background:  uiT?.surfaceBg2  ?? (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"),
    border:      `1px solid ${uiT?.borderMid ?? (isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)")}`,
    color:       textPrimary,
    opacity:     isLoading ? 0.7 : 1,
  }

  // ── Validation ───────────────────────────────────────────────────────────
  const nameError = useMemo(() => {
    if (!formData?.name) return "Name is required"
    if (formData.name.length < NAME_MIN) return `Minimum ${NAME_MIN} characters`
    if (formData.name.length > NAME_MAX) return `Maximum ${NAME_MAX} characters`
    return null
  }, [formData?.name])

  const isNameValid = !nameError

  const handleSave = () => {
    if (!isNameValid) { addToast("error", nameError); return }
    onSave()
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) { addToast("error", "Sign out unsuccessful"); return }
      router.push("/")
      router.refresh()
      addToast("success", "Sign out successful")
    } catch {
      addToast("error", "Unexpected error during sign out")
    }
  }

  return (
    <Card
      className="overflow-hidden backdrop-blur-xl"
      style={{
        background:  cardBg,
        border:      `1px solid ${primaryC}40`,
        boxShadow:   cardShadow,
        // Smooth theme transition
        transition:  "background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
      }}
    >
      {/* ── Banner ── */}
      <div
        className="h-36 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${primaryC}, ${secondaryC})` }}
      >
        <div
          className="absolute inset-0 opacity-30 blur-2xl"
          style={{ background: `radial-gradient(circle at 30% 20%, ${primaryC}, transparent 60%)` }}
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <CardContent className="relative -mt-16 px-6 pb-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">

          {/* ── Avatar ── */}
          <div className="relative">
            <div
              className="w-32 h-32 rounded-2xl flex items-center justify-center backdrop-blur-xl"
              style={{
                background: `linear-gradient(135deg, ${primaryC}, ${secondaryC})`,
                boxShadow:  `0 0 0 4px ${avatarBorder}, 0 10px 30px ${primaryC}50`,
              }}
            >
              <Building2 className="w-16 h-16 text-white drop-shadow-lg" />
            </div>

            {formData?.active && (
              <div
                className="absolute -bottom-2 -right-2 rounded-full p-2 border-4"
                style={{
                  background:  secondaryC,
                  borderColor: isDark ? "#0a0a0f" : "#ffffff",
                }}
              >
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              </div>
            )}
          </div>

          {/* ── Info block ── */}
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <div className="w-full">

                {/* Org name — editable input or display */}
                {isEditing ? (
                  <input
                    name="name"
                    value={formData?.name ?? ""}
                    onChange={(e) => {
                      // bubble up through the same onChange the parent wires to handleProfileChange
                      // OrgProfileHeader doesn't own onChange, so we need the parent to pass it.
                      // If you want inline editing here, pass `onChange` as a prop; otherwise
                      // the name is edited in OrgAboutSection and this just displays it.
                    }}
                    maxLength={NAME_MAX}
                    className="w-full text-3xl font-bold tracking-tight bg-transparent outline-none border-b-2 pb-1"
                    style={{
                      color:       textPrimary,
                      borderColor: nameError ? "#f87171" : primaryC,
                    }}
                  />
                ) : (
                  <h2
                    className="text-3xl font-bold tracking-tight"
                    style={{ color: textPrimary }}
                  >
                    {formData?.name}
                  </h2>
                )}

                {/* Validation hint */}
                {isEditing && (
                  <p
                    className="text-xs mt-1 transition-colors duration-200"
                    style={{ color: nameError ? "#f87171" : validationOk }}
                  >
                    {nameError || `${(formData?.name ?? "").length}/${NAME_MAX} characters`}
                  </p>
                )}

                {/* Member since */}
                <p
                  className="flex items-center gap-2 mt-1 text-sm"
                  style={{ color: textSecondary }}
                >
                  <Calendar className="w-4 h-4 opacity-80" />
                  Member since {profile?.created_at ? formatDate(profile.created_at) : "N/A"}
                </p>
              </div>

              {/* ── Action buttons ── */}
              <div className="flex flex-wrap gap-2">
                {!isEditing ? (
                  <>
                    <Button
                      onClick={onEdit}
                      disabled={isLoading}
                      className="transition-all duration-200"
                      style={btnStyle}
                    >
                      <Edit className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Edit Profile</span>
                    </Button>

                    <Button
                      onClick={handleSignOut}
                      disabled={isLoading}
                      className="transition-all duration-200"
                      style={btnOutlineStyle}
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
                      style={btnStyle}
                    >
                      {isLoading
                        ? <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" />
                        : <Save    className="w-4 h-4 sm:mr-2" />
                      }
                      <span className="hidden sm:inline">Save</span>
                    </Button>

                    <Button
                      onClick={onCancel}
                      disabled={isLoading}
                      className="transition-all duration-200"
                      style={btnOutlineStyle}
                    >
                      <X className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Cancel</span>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* ── Badges ── */}
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge
                style={{
                  background: `${primaryC}30`,
                  color:      isDark ? "#fff" : primaryC,
                  border:     `1px solid ${primaryC}50`,
                }}
              >
                {formData?.color_scheme}
              </Badge>

              <Badge
                style={{
                  background: `${secondaryC}30`,
                  color:      isDark ? "#fff" : secondaryC,
                  border:     `1px solid ${secondaryC}50`,
                }}
              >
                {formData?.active ? "● Active" : "○ Inactive"}
              </Badge>

              <Badge
                style={{
                  background: `${primaryC}25`,
                  color:      isDark ? "#fff" : primaryC,
                  border:     `1px solid ${primaryC}40`,
                }}
              >
                <Award className="w-3 h-3 mr-1" />
                {formData?.achievements?.length ?? 0} Achievements
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}