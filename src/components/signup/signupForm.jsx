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

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confrimPass, setConfrimPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignUp = async (e) => {
    e.preventDefault()

    if(password !== confrimPass) {
      setError("Password do not match");
      alert("Password do not match!");
      return;
    }

    const {error} = await supabase.auth.signUp({
      email,
      password,
    })

    if(error) {
      setError(error.message)
    } else {
      alert("Account created successfully!")
    }

    setLoading(false)
  }



  return (
    
    <div className="flex flex-col gap-6 ">
      <Tabs defaultValue="user">
        <TabsList className="flex text-center justify-center items-center">
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="user">User</TabsTrigger>
        </TabsList>
        <TabsContent value="user">
           <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Create your account</CardTitle>
              <CardDescription>
                Enter your email below to create your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="" onSubmit={handleSignUp}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Full Name</FieldLabel>
                    <Input 
                      id="name" 
                      type="text" 
                      placeholder="John Doe"
                      onChange={(e => setEmail(e.target.value))} 
                      required 
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                    />
                  </Field>
                  <Field>
                    <Field className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Input 
                          onChange={e => setPassword(e.target.value)}
                          id="password" 
                          type="password" 
                          required 
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="confirm-password">
                          Confirm Password
                        </FieldLabel>
                        <Input 
                          id="confirm-password" 
                          type="password" 
                          required 
                          onChange={e => setConfrimPass(e.target.value)}
                          />
                      </Field>
                    </Field>
                    <FieldDescription>
                      Must be at least 8 characters long.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <Button 
                      type="submit"
                      className={`cursor-pointer {}`}
                      onClick={handleSignUp}
                      disabled={loading}
                    >
                      Create Account
                    </Button>
                    <FieldDescription className="text-center">
                      Already have an account? <a href="#">Sign in</a>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="organization">
           <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Create your organization account</CardTitle>
              <CardDescription>
                Enter your email below to create your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="" onSubmit={handleSignUp}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Organization Name</FieldLabel>
                    <Input 
                      id="name" 
                      type="text" 
                      placeholder="John Doe"
                      onChange={(e => setEmail(e.target.value))} 
                      required 
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                    />
                  </Field>
                  <Field>
                    <Field className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Input 
                          onChange={e => setPassword(e.target.value)}
                          id="password" 
                          type="password" 
                          required 
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="confirm-password">
                          Confirm Password
                        </FieldLabel>
                        <Input 
                          id="confirm-password" 
                          type="password" 
                          required 
                          onChange={e => setConfrimPass(e.target.value)}
                          />
                      </Field>
                    </Field>
                    <FieldDescription>
                      Must be at least 8 characters long.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <Button 
                      type="submit"
                      className={`cursor-pointer {}`}
                      onClick={handleSignUp}
                      disabled={loading}
                    >
                      Create Account
                    </Button>
                    <FieldDescription className="text-center">
                      Already have an account? <a href="#">Sign in</a>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
     
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
