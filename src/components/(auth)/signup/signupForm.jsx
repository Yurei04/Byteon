"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabase"
import { useState } from "react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Building2, User, Upload, AlertCircle, ChevronRight, ChevronLeft } from "lucide-react"
import Link from "next/link"

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
    const { error: uploadError } = await supabase.storage.from("profile-photos").upload(fileName, profilePhoto, { upsert: true })
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
        setError(signUpError.message.includes("already registered")
          ? "This email is already registered. Please use a different email or try logging in."
          : signUpError.message)
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
          country: country.trim(), affiliation: occupation.trim(), profile_photo_url: profilePhotoUrl,
        })
        if (userError) { setError(`Failed to create user profile: ${userError.message}`); setLoading(false); return }
      }

      if (mode === "organization") {
        const { error: orgError } = await supabase.from("organizations").insert({
          user_id: data.user.id, name: orgName.trim(), author_name: orgName.trim(),
          description: orgDescription.trim(), profile_photo_url: profilePhotoUrl,
        })
        if (orgError) { setError(`Failed to create organization profile: ${orgError.message}`); setLoading(false); return }
      }

      setLoading(false)
      try { await supabase.auth.signOut({ scope: "local" }) } catch {}
      router.push("/log-in?registered=true")
    } catch (err) {
      console.error("Signup error:", err)
      setError(err.message || "An unexpected error occurred")
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); step === 1 ? handleNext() : handleSignUp() }
  }

  const inputCls = "h-8 text-sm bg-purple-900/30 border-purple-500/40 focus:border-purple-400 placeholder:text-purple-500/60 text-purple-50 rounded-lg"
  const labelCls = "text-purple-200 text-xs font-medium"

  return (
    <div className="h-full w-full flex items-center justify-center overflow-hidden py-2">
      <div className="w-full max-w-md">
        <Tabs
          defaultValue="user"
          onValueChange={(value) => {
            setMode(value); setStep(1); setError(null)
            setProfilePhoto(null); setPhotoPreview(null); setAgreedToTerms(false)
          }}
        >
          {/* Tab switcher */}
          <div className="flex justify-center mb-3">
            <TabsList className="bg-purple-950/60 border border-purple-500/30 p-1 rounded-xl gap-1">
              <TabsTrigger
                value="user"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-purple-300 data-[state=inactive]:hover:text-purple-100"
              >
                <User className="size-3" /> User
              </TabsTrigger>
              <TabsTrigger
                value="organization"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-purple-300 data-[state=inactive]:hover:text-purple-100"
              >
                <Building2 className="size-3" /> Organization
              </TabsTrigger>
            </TabsList>
          </div>

          {["user", "organization"].map((type) => (
            <TabsContent key={type} value={type} className="mt-0">
              <Card className="relative overflow-hidden bg-purple-950/50 border border-purple-500/30 text-purple-50 backdrop-blur-xl shadow-2xl shadow-purple-900/40 rounded-2xl">
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />

                <CardHeader className="px-5 pt-4 pb-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1 text-xs text-purple-400/80 hover:text-purple-200 transition-colors group cursor-pointer"
                    >
                      <ArrowLeft className="size-3 group-hover:-translate-x-0.5 transition-transform" />
                      Back to home
                    </Link>
                    {/* Step pills */}
                    <div className="flex items-center gap-1.5">
                      <div className={`h-1 rounded-full transition-all duration-300 ${step === 1 ? "w-6 bg-purple-400" : "w-3 bg-purple-700"}`} />
                      <div className={`h-1 rounded-full transition-all duration-300 ${step === 2 ? "w-6 bg-purple-400" : "w-3 bg-purple-700"}`} />
                      <span className="text-[10px] text-purple-400/60 ml-0.5">{step}/2</span>
                    </div>
                  </div>

                  <div>
                    <CardTitle className="text-base font-semibold tracking-tight">
                      {step === 1
                        ? (type === "user" ? "Create your account" : "Create organization account")
                        : (type === "user" ? "Complete your profile" : "Organization details")}
                    </CardTitle>
                    <CardDescription className="text-purple-300/70 text-xs mt-0.5">
                      {step === 1
                        ? (type === "user" ? "Enter your login credentials to get started" : "Set up your organization's name and credentials")
                        : (type === "user" ? "Tell us a bit about yourself" : "Help others understand your organization")}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="px-5 pb-5 pt-1">
                  {step === 1 ? (
                    <div onKeyDown={handleKeyDown}>
                      <FieldGroup className="space-y-2.5">
                        {type === "organization" && (
                          <Field>
                            <FieldLabel className={labelCls}>Organization Name</FieldLabel>
                            <Input placeholder="My Organization" value={orgName} onChange={(e) => setOrgName(e.target.value)} className={inputCls} />
                          </Field>
                        )}

                        <Field>
                          <FieldLabel className={labelCls}>Email</FieldLabel>
                          <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} required />
                          <FieldDescription className="text-purple-400/60 text-xs mt-0.5">
                            Each email can only be used once.
                          </FieldDescription>
                        </Field>

                        <Field>
                          <FieldLabel className={labelCls}>Password</FieldLabel>
                          <div className="grid grid-cols-2 gap-2">
                            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} required />
                            <Input type="password" placeholder="Confirm password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className={inputCls} required />
                          </div>
                          <FieldDescription className="text-purple-400/60 text-xs mt-0.5">
                            Must be at least 8 characters.
                          </FieldDescription>
                        </Field>

                        {error && (
                          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                            <AlertCircle className="size-3.5 text-red-400 shrink-0" />
                            <p className="text-red-400 text-xs leading-snug">{error}</p>
                          </div>
                        )}

                        <Button
                          onClick={handleNext}
                          className=" cursor-pointer w-full h-9 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 shadow-lg shadow-purple-900/50"
                        >
                          Continue <ChevronRight className="size-3.5" />
                        </Button>

                        <p className="text-center text-purple-400/70 text-xs">
                          Already have an account?{" "}
                          <a href="/log-in" className="text-purple-300 hover:text-white underline underline-offset-2 transition-colors">
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
                          <FieldLabel className={labelCls}>
                            Profile Photo <span className="text-purple-500/60 font-normal">(optional)</span>
                          </FieldLabel>
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="shrink-0">
                              {photoPreview ? (
                                <Image width={40} height={40} src={photoPreview} alt="Preview"
                                  className="w-10 h-10 rounded-full object-cover border-2 border-purple-400/60" />
                              ) : (
                                <div className="w-10 h-10 rounded-full border-2 border-dashed border-purple-500/50 bg-purple-900/20 flex items-center justify-center group-hover:border-purple-400/80 transition-colors">
                                  <Upload className="size-3.5 text-purple-500/60 group-hover:text-purple-400 transition-colors" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Input type="file" accept="image/*" onChange={handlePhotoChange}
                                className="cursor-pointer h-8 text-xs bg-purple-900/30 border-purple-500/40 text-purple-300 rounded-lg file:bg-purple-800/60 file:border-0 file:text-purple-200 file:text-[11px] file:mr-2 file:px-2 file:py-1 file:rounded file:cursor-pointer" />
                              <p className="text-purple-400/50 text-xs mt-0.5">JPG, PNG, GIF · Max 5MB</p>
                            </div>
                          </label>
                        </Field>

                        {type === "user" ? (
                          <>
                            <Field>
                              <FieldLabel className={labelCls}>Full Name</FieldLabel>
                              <Input type="text" placeholder="John Doe" value={userName} onChange={(e) => setUserName(e.target.value)} className={inputCls} required />
                            </Field>

                            <div className="grid grid-cols-2 gap-2">
                              <Field>
                                <FieldLabel className={labelCls}>Age</FieldLabel>
                                <Input type="number" placeholder="25" min="18" max="120" value={age} onChange={(e) => setAge(e.target.value)} className={inputCls} required />
                              </Field>
                              <Field>
                                <FieldLabel className={labelCls}>Country</FieldLabel>
                                <Input type="text" placeholder="Philippines" value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls} required />
                              </Field>
                            </div>

                            <Field>
                              <FieldLabel className={labelCls}>Occupation</FieldLabel>
                              <Input type="text" placeholder="Software Developer" value={occupation} onChange={(e) => setOccupation(e.target.value)} className={inputCls} required />
                            </Field>
                          </>
                        ) : (
                          <Field>
                            <FieldLabel className={labelCls}>Organization Description</FieldLabel>
                            <Textarea
                              placeholder="Tell us about your organization — your mission, what you do, who you serve…"
                              value={orgDescription}
                              onChange={(e) => setOrgDescription(e.target.value)}
                              required
                              className="min-h-[80px] text-sm bg-purple-900/30 border-purple-500/40 focus:border-purple-400 placeholder:text-purple-500/60 text-purple-50 rounded-lg resize-none"
                            />
                          </Field>
                        )}

                        {/* Terms */}
                        <div className="flex items-start gap-2.5 bg-purple-900/20 border border-purple-500/20 rounded-lg px-3 py-2">
                          <Checkbox
                            id="terms"
                            checked={agreedToTerms}
                            onCheckedChange={(checked) => { setAgreedToTerms(checked); if (checked) setError(null) }}
                            className="mt-0.5 shrink-0 border-purple-400/50 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                          />
                          <label htmlFor="terms" className="text-xs text-purple-300/80 leading-relaxed cursor-pointer">
                            I agree to Byteon&apos;s{" "}
                            <a href="/terms-and-conditions" target="_blank" className="underline underline-offset-2 text-purple-200 hover:text-white transition-colors">Terms of Service</a>
                            {" "}and{" "}
                            <a href="/privacy-policy" target="_blank" className="underline underline-offset-2 text-purple-200 hover:text-white transition-colors">Privacy Policy</a>
                            , and confirm I am at least 18 years of age.
                          </label>
                        </div>

                        {error && (
                          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                            <AlertCircle className="size-3.5 text-red-400 shrink-0" />
                            <p className="text-red-400 text-xs leading-snug">{error}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                            className="cursor-pointer h-9 border-purple-500/40 bg-purple-900/20 hover:bg-purple-900/40 text-purple-300 hover:text-purple-100 rounded-lg text-sm flex items-center justify-center gap-1 transition-all duration-200"
                          >
                            <ChevronLeft className="size-3.5" /> Back
                          </Button>
                          <Button
                            onClick={handleSignUp}
                            disabled={loading}
                            className="h-9 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg shadow-purple-900/50"
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