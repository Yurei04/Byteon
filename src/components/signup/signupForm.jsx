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
import { supabase } from "@/lib/supabase"
import { useState } from "react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { useRouter } from "next/navigation"

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
  const [step, setStep] = useState(1)

  const handleNext = () => {
    setError(null)

    if (step === 1) {
      if (mode === "organization" && !orgName) {
        setError("Organization name is required")
        return
      }
      if (!email) {
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

    if (!userName) {
      setError("Name is required")
      return
    }
    if (!age) {
      setError("Age is required")
      return
    }
    if (!country) {
      setError("Country is required")
      return
    }
    if (!occupation) {
      setError("Occupation is required")
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userName,
          age: age,
          country: country,
          occupation: occupation,
        }
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (mode === "organization") {
      const { error: orgError } = await supabase
        .from("organization")
        .insert({
          user_id: data.user.id,
          name: orgName,
          author_name: email,
        })

      if (orgError) {
        setError(orgError.message)
        setLoading(false)
        return
      }
    }

    
    if(error) router.push("/login")
    setLoading(false)
    alert("Account created successfully")
    if(!error) router.push("/homepage")
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
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
                    : "Tell us more about yourself"}
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