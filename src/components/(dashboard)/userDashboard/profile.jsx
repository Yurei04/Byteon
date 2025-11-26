"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function UserProfile({ onSuccess }) {
  const [profile, setProfile] = useState(null) // Stores the fetched user profile data
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState(null)

  // Initial state for profile fields
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    affiliation: "",
    country: "",
    achievement: "",
  })

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('user')
        .select('*')
        .limit(1)

      if (error) throw error

      if (data && data.length > 0) {
        const userData = data[0]
        setProfile(userData)
        setFormData({
          name: userData.name || "",
          age: userData.age || "",
          affiliation: userData.affiliation || "",
          country: userData.country || "",
          achievement: userData.achievement || "",
        })
      }
    } catch (error) {
      console.error('Error fetching user profile:', error.message)
      setAlert({ type: 'error', message: 'Failed to load user profile.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.age) {
      setAlert({ type: 'error', message: 'Name and Age are required fields.' })
      return
    }

    if (!profile || !profile.id) {
        setAlert({ type: 'error', message: 'Cannot update: User profile not found.' })
        return
    }

    setIsLoading(true)
    setAlert(null)

    try {
      // Data to be updated
      const profileUpdates = {
        name: formData.name,
        age: formData.age,
        affiliation: formData.affiliation,
        country: formData.country,
        achievement: formData.achievement,
        updated_at: new Date().toISOString(), 
      }

      const { data, error } = await supabase
        .from('user')
        .update(profileUpdates)
        .eq('id', profile.id) 
        .select()
      
      if (error) throw error

      setAlert({ type: 'success', message: 'User profile updated successfully!' })

      if (data && data.length > 0) {
          setProfile(data[0])
      }
      setTimeout(() => {
        if (onSuccess) onSuccess()
      }, 1000)

    } catch (error) {
      console.error('Error updating profile:', error.message)
      setAlert({ type: 'error', message: `Failed to update profile: ${error.message}` })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-white text-2xl">👤 User Profile</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Alert Display */}
        {alert && (
          <Alert variant={alert.type === 'error' ? "destructive" : "default"} className={`mb-4 ${alert.type === 'error' ? 'bg-red-500/20 border-red-500 text-red-100' : 'bg-green-500/20 border-green-500 text-green-100'}`}>
            {alert.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        {isLoading && !profile ? (
             <div className="flex justify-center items-center p-8 text-white">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading Profile...
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Name/Username */}
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="name" className="text-white">Name / Username *</Label>
                        <Input
                            id="name"
                            name="name" // Use name attribute for generic handleChange
                            value={formData.name}
                            onChange={handleChange}
                            className="bg-white/10 border-white/20 text-white"
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    {/* Affiliation */}
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="affiliation" className="text-white">Affiliation / Organization</Label>
                        <Input
                            id="affiliation"
                            name="affiliation"
                            value={formData.affiliation}
                            onChange={handleChange}
                            className="bg-white/10 border-white/20 text-white"
                            placeholder="Tech University / Global Inc."
                        />
                    </div>

                    {/* Age */}
                    <div className="space-y-2">
                        <Label htmlFor="age" className="text-white">Age *</Label>
                        <Input
                            id="age"
                            name="age"
                            type="number"
                            value={formData.age}
                            onChange={handleChange}
                            className="bg-white/10 border-white/20 text-white"
                            placeholder="30"
                            required
                        />
                    </div>

                    {/* Country */}
                    <div className="space-y-2">
                        <Label htmlFor="country" className="text-white">Country</Label>
                        <Input
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="bg-white/10 border-white/20 text-white"
                            placeholder="USA, Canada, Philippines"
                        />
                    </div>
                    
                    {/* Achievement / Bio */}
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="achievement" className="text-white">Achievement / Bio</Label>
                        <Textarea
                            id="achievement"
                            name="achievement"
                            value={formData.achievement}
                            onChange={handleChange}
                            className="bg-white/10 border-white/20 text-white"
                            placeholder="Briefly describe your greatest achievement or bio..."
                            rows={4}
                        />
                    </div>

                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating Profile...</> : 'Save Profile'}
                </Button>
            </form>
        )}
      </CardContent>
    </Card>
  )
}