"use client"

import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  Field, FieldDescription, FieldGroup, FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabase"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  ArrowLeft, Building2, User, Upload, AlertCircle,
  ChevronRight, ChevronLeft, Palette, Check,
} from "lucide-react"
import Link from "next/link"
import { PrivacyDialog } from "@/components/privacy-policies/privacy-policy-dialog"
import { TermsDialog } from "@/components/terms-and-condition/terms-and-condition-dialog"

const ORG_PALETTES = [
  { id: "midnight", label: "Midnight", primary: "#6366f1", secondary: "#0ea5e9", scheme: "midnight" },
  { id: "forest",   label: "Forest",   primary: "#10b981", secondary: "#84cc16", scheme: "forest"   },
  { id: "sunset",   label: "Sunset",   primary: "#f43f5e", secondary: "#f59e0b", scheme: "sunset"   },
  { id: "ocean",    label: "Ocean",    primary: "#0ea5e9", secondary: "#14b8a6", scheme: "ocean"    },
  { id: "royal",    label: "Royal",    primary: "#8b5cf6", secondary: "#d946ef", scheme: "royal"    },
  { id: "ember",    label: "Ember",    primary: "#ef4444", secondary: "#f97316", scheme: "ember"    },
  { id: "aurora",   label: "Aurora",   primary: "#22d3ee", secondary: "#a78bfa", scheme: "aurora"   },
  { id: "slate",    label: "Slate",    primary: "#64748b", secondary: "#94a3b8", scheme: "slate"    },
]

function OrgPalettePicker({ value, onChange }) {
  return (
    <Field>
      <FieldLabel
        className="text-xs font-medium flex items-center gap-1.5"
        style={{ color: "rgb(var(--text-secondary))" }}
      >
        <Palette className="size-3" /> Brand Color Scheme
        <span className="font-normal" style={{ color: "rgb(var(--text-faint))" }}>(optional)</span>
      </FieldLabel>
      <div className="grid grid-cols-4 gap-2 mt-1">
        {ORG_PALETTES.map((p) => {
          const isSelected = value === p.id
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(p)}
              className="relative flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-200 hover:scale-105 focus:outline-none"
              style={{
                borderColor: isSelected ? "rgb(var(--brand-400) / 0.6)" : "rgb(var(--surface-border) / 0.3)",
                background: isSelected ? "rgb(var(--brand-500) / 0.08)" : "rgb(var(--surface-raised))",
                transform: isSelected ? "scale(1.05)" : undefined,
              }}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden relative shrink-0">
                <div className="absolute inset-0 left-0 w-1/2" style={{ backgroundColor: p.primary }} />
                <div className="absolute inset-0 left-1/2 w-1/2" style={{ backgroundColor: p.secondary }} />
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="size-3.5 text-white drop-shadow" />
                  </div>
                )}
              </div>
              <span
                className="text-[10px] font-medium leading-none"
                style={{ color: "rgb(var(--text-secondary))" }}
              >
                {p.label}
              </span>
            </button>
          )
        })}
      </div>
      {value && (() => {
        const pal = ORG_PALETTES.find((p) => p.id === value)
        if (!pal) return null
        return (
          <div
            className="mt-2 rounded-lg px-3 py-2 text-xs font-medium flex items-center gap-2 border"
            style={{
              background: `linear-gradient(135deg, ${pal.primary}22, ${pal.secondary}22)`,
              borderColor: `${pal.primary}50`,
            }}
          >
            <span
              className="inline-block w-3 h-3 rounded-full shrink-0"
              style={{ background: `linear-gradient(135deg, ${pal.primary}, ${pal.secondary})` }}
            />
            <span style={{ color: pal.primary }}>{pal.label}</span>
            <span style={{ color: "rgb(var(--text-faint))" }}>palette applied to your org page</span>
          </div>
        )
      })()}
    </Field>
  )
}

function ErrorBanner({ message }) {
  return (
    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
      <AlertCircle className="size-3.5 text-red-400 shrink-0" />
      <p className="text-red-400 text-xs leading-snug">{message}</p>
    </div>
  )
}

export function SignupForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const [orgName, setOrgName] = useState("")
  const [mode, setMode] = useState("user")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [userName, setUserName] = useState("")
  const [age, setAge] = useState("")
  const [country, setCountry] = useState("")
  const [occupation, setOccupation] = useState("")
  const [orgDescription, setOrgDescription] = useState("")
  const [step, setStep] = useState(1)
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [orgPalette, setOrgPalette] = useState(null)

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) { setError("Please select an image file"); return }
      if (file.size > 5 * 1024 * 1024) { setError("Image must be less than 5MB"); return }
      setProfilePhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
      setError(null)
    }
  }

  const uploadProfilePhoto = async (userId) => {
    if (!profilePhoto) return null
    const fileExt = profilePhoto.name.split(".").pop()
    const fileName = `${userId}/profile.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(fileName, profilePhoto, { upsert: true })
    if (uploadError) throw uploadError
    const { data: { publicUrl } } = supabase.storage.from("profile-photos").getPublicUrl(fileName)
    return publicUrl
  }

  const handleNext = () => {
    setError(null)
    if (mode === "organization" && !orgName.trim()) { setError("Organization name is required"); return }
    if (!email.trim()) { setError("Email is required"); return }
    if (!password) { setError("Password is required"); return }
    if (password !== confirmPass) { setError("Passwords do not match"); return }
    if (password.length < 8) { setError("Password must be at least 8 characters long"); return }
    setStep(2)
  }

  const handleBack = () => { setError(null); setStep(1) }

  const handleSignUp = async () => {
    setError(null)
    if (mode === "user") {
      if (!userName.trim()) { setError("Name is required"); return }
      const parsedAge = parseInt(age)
      if (!age || parsedAge < 1 || parsedAge > 120) { setError("Please enter a valid age"); return }
      if (parsedAge < 18) { setError("You must be at least 18 years old to join Byteon."); return }
      if (!country.trim()) { setError("Country is required"); return }
      if (!occupation.trim()) { setError("Occupation is required"); return }
    } else {
      if (!orgDescription.trim()) { setError("Organization description is required"); return }
    }
    if (!agreedToTerms) { setError("You must agree to the Terms of Service and Privacy Policy to continue."); return }

    setLoading(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ email: email.trim(), password })
      if (signUpError) {
        setError(
          signUpError.message.includes("already registered")
            ? "This email is already registered. Please use a different email or try logging in."
            : signUpError.message
        )
        setLoading(false)
        return
      }
      if (!data.user) { setError("Failed to create user account"); setLoading(false); return }

      let profilePhotoUrl = null
      if (profilePhoto) {
        try { profilePhotoUrl = await uploadProfilePhoto(data.user.id) } catch (e) { console.error(e) }
      }

      if (mode === "user") {
        const { error: userError } = await supabase.from("users").insert({
          user_id: data.user.id, name: userName.trim(), age: parseInt(age),
          country: country.trim(), affiliation: occupation.trim(),
          profile_photo_url: profilePhotoUrl,
        })
        if (userError) { setError(`Failed to create user profile: ${userError.message}`); setLoading(false); return }
      }

      if (mode === "organization") {
        const { error: orgError } = await supabase.from("organizations").insert({
          user_id: data.user.id, name: orgName.trim(), author_name: orgName.trim(),
          description: orgDescription.trim(), profile_photo_url: profilePhotoUrl,
          approval_status: "pending", rejection_reason: null,
          ...(orgPalette ? {
            primary_color: orgPalette.primary,
            secondary_color: orgPalette.secondary,
            color_scheme: orgPalette.scheme,
          } : {}),
        })
        if (orgError) { setError(`Failed to create organization profile: ${orgError.message}`); setLoading(false); return }
      }

      setLoading(false)
      try { await supabase.auth.signOut({ scope: "local" }) } catch {}
      router.push("/log-in?registered=true&pending=true")
    } catch (err) {
      setError(err.message || "An unexpected error occurred")
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); step === 1 ? handleNext() : handleSignUp() }
  }

  const inputCls = "h-8 text-sm rounded-lg"
  const inputStyle = {
    background: "rgb(var(--surface-raised))",
    borderColor: "rgb(var(--surface-border) / 0.5)",
    color: "rgb(var(--text-primary))",
  }
  const labelStyle = { color: "rgb(var(--text-secondary))", fontSize: "0.75rem", fontWeight: 500 }

  return (
    <div className="h-full w-full flex items-center justify-center overflow-hidden py-2">
      <div className="w-full max-w-md">
        <Tabs
          defaultValue="user"
          onValueChange={(value) => {
            setMode(value); setStep(1); setError(null)
            setProfilePhoto(null); setPhotoPreview(null); setAgreedToTerms(false)
            setOrgPalette(null)
          }}
        >
          {/* Tab switcher */}
          <div className="flex justify-center mb-3">
            <TabsList
              className="p-1 rounded-xl gap-1"
              style={{
                background: "rgb(var(--surface-raised))",
                border: "1px solid rgb(var(--surface-border) / 0.3)",
              }}
            >
              {[
                { value: "user", label: "User", icon: User },
                { value: "organization", label: "Organization", icon: Building2 },
              ].map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 data-[state=active]:shadow-md"
                  style={{ color: "rgb(var(--text-muted))" }}
                >
                  <Icon className="size-3" /> {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {["user", "organization"].map((type) => (
            <TabsContent key={type} value={type} className="mt-0">
              <Card
                className="relative overflow-hidden backdrop-blur-xl shadow-2xl rounded-2xl"
                style={{
                  background: "rgb(var(--surface-raised))",
                  border: "1px solid rgb(var(--surface-border) / 0.3)",
                  color: "rgb(var(--text-primary))",
                }}
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{
                    background: `linear-gradient(to right, transparent, rgb(var(--brand-400) / 0.5), transparent)`,
                  }}
                />

                <CardHeader className="px-5 pt-4 pb-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1 text-xs transition-colors group"
                      style={{ color: "rgb(var(--text-faint))" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "rgb(var(--text-primary))")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgb(var(--text-faint))")}
                    >
                      <ArrowLeft className="size-3 group-hover:-translate-x-0.5 transition-transform" />
                      Back to home
                    </Link>
                    <div className="flex items-center gap-1.5">
                      {[1, 2].map(s => (
                        <div
                          key={s}
                          className="h-1 rounded-full transition-all duration-300"
                          style={{
                            width: step === s ? "24px" : "12px",
                            background: step === s ? "rgb(var(--brand-400))" : "rgb(var(--surface-border))",
                          }}
                        />
                      ))}
                      <span className="text-[10px] ml-0.5" style={{ color: "rgb(var(--text-faint))" }}>{step}/2</span>
                    </div>
                  </div>

                  <div>
                    <CardTitle className="text-base font-semibold tracking-tight" style={{ color: "rgb(var(--text-primary))" }}>
                      {step === 1
                        ? (type === "user" ? "Create your account" : "Create organization account")
                        : (type === "user" ? "Complete your profile" : "Organization details")}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5" style={{ color: "rgb(var(--text-faint))" }}>
                      {step === 1
                        ? (type === "user" ? "Enter your login credentials to get started" : "Set up your organization's name and credentials")
                        : (type === "user" ? "Tell us a bit about yourself" : "Add details and choose your brand colors")}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="px-5 pb-5 pt-1">
                  {step === 1 ? (
                    <div onKeyDown={handleKeyDown}>
                      <FieldGroup className="space-y-2.5">
                        {type === "organization" && (
                          <Field>
                            <FieldLabel style={labelStyle}>Organization Name</FieldLabel>
                            <Input placeholder="My Organization" value={orgName} onChange={(e) => setOrgName(e.target.value)} className={inputCls} style={inputStyle} />
                          </Field>
                        )}
                        <Field>
                          <FieldLabel style={labelStyle}>Email</FieldLabel>
                          <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} style={inputStyle} required />
                          <FieldDescription className="text-xs mt-0.5" style={{ color: "rgb(var(--text-faint))" }}>Each email can only be used once.</FieldDescription>
                        </Field>
                        <Field>
                          <FieldLabel style={labelStyle}>Password</FieldLabel>
                          <div className="grid grid-cols-2 gap-2">
                            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} style={inputStyle} required />
                            <Input type="password" placeholder="Confirm password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className={inputCls} style={inputStyle} required />
                          </div>
                          <FieldDescription className="text-xs mt-0.5" style={{ color: "rgb(var(--text-faint))" }}>Must be at least 8 characters.</FieldDescription>
                        </Field>

                        {error && <ErrorBanner message={error} />}

                        <Button
                          onClick={handleNext}
                          className="cursor-pointer w-full h-9 text-sm font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200"
                          style={{
                            background: `linear-gradient(135deg, rgb(var(--brand-600)), rgb(var(--accent-600)))`,
                            color: "rgb(var(--fg-on-brand, 255 255 255))",
                          }}
                        >
                          Continue <ChevronRight className="size-3.5" />
                        </Button>

                        <p className="text-center text-xs" style={{ color: "rgb(var(--text-faint))" }}>
                          Already have an account?{" "}
                          <a href="/log-in" className="underline underline-offset-2 transition-colors" style={{ color: "rgb(var(--text-secondary))" }}>
                            Sign in
                          </a>
                        </p>
                      </FieldGroup>
                    </div>
                  ) : (
                    <div onKeyDown={handleKeyDown}>
                      <FieldGroup className="space-y-2.5">
                        {/* Profile Photo */}
                        <Field>
                          <FieldLabel style={labelStyle}>
                            Profile Photo <span className="font-normal" style={{ color: "rgb(var(--text-faint))" }}>(optional)</span>
                          </FieldLabel>
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="shrink-0">
                              {photoPreview ? (
                                <Image width={40} height={40} src={photoPreview} alt="Preview"
                                  className="w-10 h-10 rounded-full object-cover border-2"
                                  style={{ borderColor: "rgb(var(--brand-400) / 0.5)" }}
                                />
                              ) : (
                                <div
                                  className="w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center transition-colors"
                                  style={{ borderColor: "rgb(var(--surface-border) / 0.5)", background: "rgb(var(--surface-raised))" }}
                                >
                                  <Upload className="size-3.5" style={{ color: "rgb(var(--text-faint))" }} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Input
                                type="file" accept="image/*" onChange={handlePhotoChange}
                                className="cursor-pointer h-8 text-xs rounded-lg"
                                style={{ background: "rgb(var(--surface-raised))", borderColor: "rgb(var(--surface-border) / 0.4)", color: "rgb(var(--text-secondary))" }}
                              />
                              <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-faint))" }}>JPG, PNG, GIF · Max 5MB</p>
                            </div>
                          </label>
                        </Field>

                        {type === "user" ? (
                          <>
                            <Field>
                              <FieldLabel style={labelStyle}>Full Name</FieldLabel>
                              <Input type="text" placeholder="John Doe" value={userName} onChange={(e) => setUserName(e.target.value)} className={inputCls} style={inputStyle} required />
                            </Field>
                            <div className="grid grid-cols-2 gap-2">
                              <Field>
                                <FieldLabel style={labelStyle}>Age</FieldLabel>
                                <Input type="number" placeholder="25" min="18" max="120" value={age} onChange={(e) => setAge(e.target.value)} className={inputCls} style={inputStyle} required />
                              </Field>
                              <Field>
                                <FieldLabel style={labelStyle}>Country</FieldLabel>
                                <Input type="text" placeholder="Philippines" value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls} style={inputStyle} required />
                              </Field>
                            </div>
                            <Field>
                              <FieldLabel style={labelStyle}>Occupation</FieldLabel>
                              <Input type="text" placeholder="Software Developer" value={occupation} onChange={(e) => setOccupation(e.target.value)} className={inputCls} style={inputStyle} required />
                            </Field>
                          </>
                        ) : (
                          <>
                            <Field>
                              <FieldLabel style={labelStyle}>Organization Description</FieldLabel>
                              <Textarea
                                placeholder="Tell us about your organization…"
                                value={orgDescription}
                                onChange={(e) => setOrgDescription(e.target.value)}
                                required
                                className="min-h-[72px] text-sm rounded-lg resize-none"
                                style={{ background: "rgb(var(--surface-raised))", borderColor: "rgb(var(--surface-border) / 0.5)", color: "rgb(var(--text-primary))" }}
                              />
                            </Field>
                            <div className="border-t pt-2.5" style={{ borderColor: "rgb(var(--surface-border) / 0.2)" }}>
                              <OrgPalettePicker value={orgPalette?.id ?? ""} onChange={setOrgPalette} />
                            </div>
                          </>
                        )}

                        {/* Single terms checkbox per tab, in step 2 */}
                        <div
                          className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 border transition-all duration-200"
                          style={{
                            background: agreedToTerms ? "rgba(16,185,129,0.08)" : "rgb(var(--surface-raised))",
                            borderColor: agreedToTerms ? "rgba(16,185,129,0.3)" : "rgb(var(--surface-border) / 0.3)",
                          }}
                        >
                          <Checkbox
                            id={`terms-${type}`}
                            checked={agreedToTerms}
                            onCheckedChange={(checked) => { setAgreedToTerms(!!checked); if (checked) setError(null) }}
                            className="mt-0.5 shrink-0"
                          />
                          <label
                            htmlFor={`terms-${type}`}
                            className="text-xs leading-relaxed cursor-pointer"
                            style={{ color: "rgb(var(--text-secondary))" }}
                          >
                            I agree to Byteon&apos;s{" "}
                            <TermsDialog trigger={
                              <button type="button" className="underline underline-offset-2 transition-colors" style={{ color: "rgb(var(--text-primary))" }}>
                                Terms of Service
                              </button>
                            } />{" "}and{" "}
                            <PrivacyDialog trigger={
                              <button type="button" className="underline underline-offset-2 transition-colors" style={{ color: "rgb(var(--text-primary))" }}>
                                Privacy Policy
                              </button>
                            } />,{" "}and confirm I am at least 18 years of age.
                            {agreedToTerms && (
                              <span className="ml-1.5 inline-flex items-center gap-0.5 text-emerald-500 font-medium">
                                <Check className="size-3" /> Agreed
                              </span>
                            )}
                          </label>
                        </div>

                        {error && <ErrorBanner message={error} />}

                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                            className="cursor-pointer h-9 rounded-lg text-sm flex items-center justify-center gap-1 transition-all duration-200"
                            style={{
                              borderColor: "rgb(var(--surface-border) / 0.4)",
                              background: "rgb(var(--surface-raised))",
                              color: "rgb(var(--text-secondary))",
                            }}
                          >
                            <ChevronLeft className="size-3.5" /> Back
                          </Button>
                          <Button
                            onClick={handleSignUp}
                            disabled={loading}
                            className="h-9 rounded-lg text-sm font-medium transition-all duration-200"
                            style={{
                              background: `linear-gradient(135deg, rgb(var(--brand-600)), rgb(var(--accent-600)))`,
                              color: "rgb(var(--fg-on-brand, 255 255 255))",
                            }}
                          >
                            {loading ? (
                              <span className="flex items-center gap-2">
                                <svg className="animate-spin size-3.5" viewBox="0 0 24 24" fill="none">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Creating…
                              </span>
                            ) : "Create Account"}
                          </Button>
                        </div>
                      </FieldGroup>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}