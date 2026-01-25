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

export function SignupForm() {
  const router = useRouter();
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

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB")
        return
      }
      setProfilePhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
      setError(null)
    }
  }

  const uploadProfilePhoto = async (userId) => {
    if (!profilePhoto) return null

    const fileExt = profilePhoto.name.split('.').pop()
    const fileName = `${userId}/profile.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, profilePhoto, {
        upsert: true
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const handleNext = () => {
    setError(null)

    if (step === 1) {
      if (mode === "organization" && !orgName.trim()) {
        setError("Organization name is required")
        return
      }
      if (!email.trim()) {
        setError("Email is required")
        return
      }
      if (!password) {
        setError("Password is required")
        return
      }
      if (password !== confirmPass) {
        setError("Passwords do not match")
        return
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters long")
        return
      }
      setStep(2)
    }
  }

  const handleBack = () => {
    setError(null)
    setStep(1)
  }

  const handleSignUp = async () => {
    setError(null)

    if (mode === "user") {
      if (!userName.trim()) {
        setError("Name is required")
        return
      }
      if (!age || parseInt(age) < 1 || parseInt(age) > 120) {
        setError("Please enter a valid age")
        return
      }
      if (!country.trim()) {
        setError("Country is required")
        return
      }
      if (!occupation.trim()) {
        setError("Occupation is required")
        return
      }
    } else {
      if (!orgDescription.trim()) {
        setError("Organization description is required")
        return
      }
    }

    setLoading(true)

    try {
      // Create auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })

      if (signUpError) {
        console.error("Sign up error:", signUpError)
        if (signUpError.message.includes("already registered")) {
          setError("This email is already registered. Please use a different email or try logging in.")
        } else {
          setError(signUpError.message)
        }
        setLoading(false)
        return
      }

      if (!data.user) {
        setError("Failed to create user account")
        setLoading(false)
        return
      }

      // Upload profile photo (if provided)
      let profilePhotoUrl = null
      if (profilePhoto) {
        try {
          profilePhotoUrl = await uploadProfilePhoto(data.user.id)
        } catch (uploadError) {
          console.error("Photo upload error:", uploadError)
          // Continue without photo - don't fail the whole signup
        }
      }

      // Create profile in appropriate table
      if (mode === "user") {
        const { error: userError } = await supabase
          .from("users")
          .insert({
            user_id: data.user.id,
            name: userName.trim(),
            age: parseInt(age),
            country: country.trim(),
            affiliation: occupation.trim(),
            profile_photo_url: profilePhotoUrl,
          })

        if (userError) {
          console.error("User insert error:", userError)
          setError(`Failed to create user profile: ${userError.message}`)
          setLoading(false)
          return
        }
      }

      if (mode === "organization") {
        const { error: orgError } = await supabase
          .from("organizations")
          .insert({
            user_id: data.user.id,
            name: orgName.trim(),
            author_name: orgName.trim(), // Using org name as author_name (no email stored)
            description: orgDescription.trim(),
            profile_photo_url: profilePhotoUrl,
          })

        if (orgError) {
          console.error("Organization insert error:", orgError)
          setError(`Failed to create organization profile: ${orgError.message}`)
          setLoading(false)
          return
        }
      }

      setLoading(false)
      alert("Account created successfully! You can now log in.")
      router.push("/log-in")
      
    } catch (err) {
      console.error("Signup error:", err)
      setError(err.message || "An unexpected error occurred")
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (step === 1) {
        handleNext()
      } else {
        handleSignUp()
      }
    }
  }

  return (
    <div className="flex flex-col gap-6 items-center">
      <Tabs
        defaultValue="user"
        onValueChange={(value) => {
          setMode(value)
          setStep(1)
          setError(null)
          setProfilePhoto(null)
          setPhotoPreview(null)
        }}
        className="w-full"
      >
        <div className="flex justify-center">
          <TabsList className="bg-purple-900/40 border border-purple-400/30">
            <TabsTrigger value="user">User</TabsTrigger>
            <TabsTrigger value="organization">Organization</TabsTrigger>
          </TabsList>
        </div>

        {["user", "organization"].map((type) => (
          <TabsContent
            key={type}
            value={type}
            className="relative overflow-hidden rounded-lg bg-purple-950/40 border-2 border-purple-400/40 text-purple-50 backdrop-blur-xl shadow-2xl shadow-purple-500/30 transition-all duration-500 hover:border-purple-400/70 hover:shadow-purple-500/20 group"
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at var(--mouse-x,50%) var(--mouse-y,50%), rgba(168,85,247,0.15), transparent 50%)",
              }}
            />

            <Card className="bg-transparent border-none shadow-none">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">
                  {type === "user"
                    ? "Create your account"
                    : "Create your organization account"}
                </CardTitle>
                <CardDescription className="text-purple-200">
                  {step === 1 
                    ? (type === "user"
                        ? "Enter your login credentials"
                        : "Organization details and credentials")
                    : (type === "user"
                        ? "Tell us more about yourself"
                        : "Tell us about your organization")}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {step === 1 ? (
                  <div onKeyPress={handleKeyPress}>
                    <FieldGroup>
                      {type === "organization" && (
                        <Field>
                          <FieldLabel>Organization Name</FieldLabel>
                          <Input
                            placeholder="My Organization"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                          />
                          <FieldDescription className="text-purple-300">
                            This will be displayed as the author name for your posts.
                          </FieldDescription>
                        </Field>
                      )}

                      <Field>
                        <FieldLabel>Email</FieldLabel>
                        <Input
                          type="email"
                          placeholder="m@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                        <FieldDescription className="text-purple-300">
                          Used for login only. Each email can only be used once.
                        </FieldDescription>
                      </Field>

                      <Field>
                        <div className="grid grid-cols-2 gap-4">
                          <Field>
                            <FieldLabel>Password</FieldLabel>
                            <Input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                            />
                          </Field>
                          <Field>
                            <FieldLabel>Confirm Password</FieldLabel>
                            <Input
                              type="password"
                              value={confirmPass}
                              onChange={(e) =>
                                setConfirmPass(e.target.value)
                              }
                              required
                            />
                          </Field>
                        </div>
                        <FieldDescription className="text-purple-300">
                          Must be at least 8 characters long.
                        </FieldDescription>
                      </Field>

                      {error && (
                        <FieldDescription className="text-red-400 text-center">
                          {error}
                        </FieldDescription>
                      )}

                      <Button onClick={handleNext} className="w-full">
                        Next
                      </Button>

                      <FieldDescription className="text-center text-purple-300">
                        Already have an account?{" "}
                        <a href="/log-in" className="underline">
                          Sign in
                        </a>
                      </FieldDescription>
                    </FieldGroup>
                  </div>
                ) : (
                  <div onKeyPress={handleKeyPress}>
                    <FieldGroup>
                      {/* Profile Photo Upload */}
                      <Field>
                        <FieldLabel>Profile Photo (Optional)</FieldLabel>
                        <div className="flex items-center gap-4">
                          {photoPreview && (
                            <Image
                              width={80}
                              height={80}
                              src={photoPreview} 
                              alt="Preview" 
                              className="w-20 h-20 rounded-full object-cover border-2 border-purple-400/50"
                            />
                          )}
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="cursor-pointer"
                          />
                        </div>
                        <FieldDescription className="text-purple-300">
                          Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                        </FieldDescription>
                      </Field>

                      {type === "user" ? (
                        <>
                          <Field>
                            <FieldLabel>Full Name</FieldLabel>
                            <Input
                              type="text"
                              placeholder="John Doe"
                              value={userName}
                              onChange={(e) => setUserName(e.target.value)}
                              required
                            />
                          </Field>

                          <Field>
                            <div className="grid grid-cols-2 gap-4">
                              <Field>
                                <FieldLabel>Age</FieldLabel>
                                <Input
                                  type="number"
                                  placeholder="25"
                                  min="1"
                                  max="120"
                                  value={age}
                                  onChange={(e) => setAge(e.target.value)}
                                  required
                                />
                              </Field>
                              <Field>
                                <FieldLabel>Country</FieldLabel>
                                <Input
                                  type="text"
                                  placeholder="Philippines"
                                  value={country}
                                  onChange={(e) => setCountry(e.target.value)}
                                  required
                                />
                              </Field>
                            </div>
                          </Field>

                          <Field>
                            <FieldLabel>Occupation</FieldLabel>
                            <Input
                              type="text"
                              placeholder="Software Developer"
                              value={occupation}
                              onChange={(e) => setOccupation(e.target.value)}
                              required
                            />
                          </Field>
                        </>
                      ) : (
                        <Field>
                          <FieldLabel>Organization Description</FieldLabel>
                          <Textarea
                            placeholder="Tell us about your organization, what you do, your mission, etc."
                            value={orgDescription}
                            onChange={(e) => setOrgDescription(e.target.value)}
                            required
                            className="min-h-[120px]"
                          />
                          <FieldDescription className="text-purple-300">
                            Provide a brief description of your organization.
                          </FieldDescription>
                        </Field>
                      )}

                      {error && (
                        <FieldDescription className="text-red-400 text-center">
                          {error}
                        </FieldDescription>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleBack}
                          className="border-purple-400/50 hover:bg-purple-900/20"
                        >
                          Back
                        </Button>
                        <Button onClick={handleSignUp} disabled={loading}>
                          {loading
                            ? "Creating..."
                            : "Create Account"}
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

      <FieldDescription className="text-center text-purple-300 px-6">
        By continuing, you agree to our{" "}
        <a className="underline" href="#">
          Terms of Service
        </a>{" "}
        and{" "}
        <a className="underline" href="#">
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  )
}