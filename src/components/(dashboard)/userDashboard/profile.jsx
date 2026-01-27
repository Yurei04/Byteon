"use client"
import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import ProfileHeader from "./profile-header"
import PersonalInformation from "./personal-information"
import AchievementsSection from "./achievement-section"
import ProfileStats from "./profile-stats"
import ProfileCompletion from "./profile-completion"
import RecentActivity from "./recent-activity"
import { availableAchievements } from "./achievement-data"

export default function UserProfile({ onSuccess }) {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [alert, setAlert] = useState(null)
  const [userId, setUserId] = useState(null)

  // Initial state for profile fields
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    affiliation: "",
    country: "",
    achievements: [],
  })

  useEffect(() => {
    // Get the authenticated user
    const getAuthUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUserId(session.user.id)
        fetchUserProfile(session.user.id)
      } else {
        setAlert({ type: 'error', message: 'You must be logged in to view this page.' })
        setIsLoading(false)
      }
    }

    getAuthUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserId(session.user.id)
        fetchUserProfile(session.user.id)
      } else {
        setProfile(null)
        setUserId(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (authUserId) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', authUserId)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setProfile(data)
        
        let userAchievements = []
        if (data.achievements) {
          userAchievements = typeof data.achievements === 'string' 
            ? JSON.parse(data.achievements) 
            : data.achievements
        }
        
        setFormData({
          name: data.name || "",
          age: data.age || "",
          affiliation: data.affiliation || "",
          country: data.country || "",
          achievements: userAchievements,
        })
      } else {
        // User profile doesn't exist yet - create one
        await createUserProfile(authUserId)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error.message)
      setAlert({ type: 'error', message: 'Failed to load user profile.' })
    } finally {
      setIsLoading(false)
    }
  }

  const createUserProfile = async (authUserId) => {
    try {
      const { data: authUser } = await supabase.auth.getUser()
      
      const newProfile = {
        user_id: authUserId,
        name: authUser.user?.user_metadata?.name || authUser.user?.email?.split('@')[0] || "User",
        achievements: JSON.stringify([]),
        created_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('users')
        .insert([newProfile])
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      setFormData({
        name: data.name,
        age: "",
        affiliation: "",
        country: "",
        achievements: [],
      })
      
      setAlert({ type: 'success', message: 'Profile created! Please complete your information.' })
      setIsEditing(true)
    } catch (error) {
      console.error('Error creating profile:', error.message)
      setAlert({ type: 'error', message: 'Failed to create profile.' })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.age) {
      setAlert({ type: 'error', message: 'Name and Age are required fields.' })
      return
    }

    if (!profile?.user_id) {
        setAlert({ type: 'error', message: 'Cannot update: User profile not found.' })
        return
    }

    setIsLoading(true)
    setAlert(null)

    try {
      const profileUpdates = {
        name: formData.name,
        age: formData.age,
        affiliation: formData.affiliation,
        country: formData.country,
        achievements: JSON.stringify(formData.achievements),
        updated_at: new Date().toISOString(), 
      }

      const { data, error } = await supabase
        .from('users')
        .update(profileUpdates)
        .eq('user_id', profile.user_id)
        .select()
        .single()
      
      if (error) throw error

      setAlert({ type: 'success', message: 'User profile updated successfully!' })
      setIsEditing(false)
      setProfile(data)

      setTimeout(() => {
        setAlert(null)
        if (onSuccess) onSuccess()
      }, 2000)

    } catch (error) {
      console.error('Error updating profile:', error.message)
      setAlert({ type: 'error', message: `Failed to update profile: ${error.message}` })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (profile) {
      fetchUserProfile(userId)
    }
  }

  if (isLoading && !profile) {
    return (
      <div className="flex justify-center items-center p-12 text-white">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" /> Loading User Profile...
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="flex justify-center items-center p-12">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to view your profile.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alert Display */}
      {alert && (
        <Alert variant={alert.type === 'error' ? "destructive" : "default"} className={`${alert.type === 'error' ? 'bg-red-500/20 border-red-500 text-red-100' : 'bg-green-500/20 border-green-500 text-green-100'}`}>
          {alert.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Profile Header */}
      <ProfileHeader
        formData={formData}
        profile={profile}
        isEditing={isEditing}
        isLoading={isLoading}
        onEdit={() => setIsEditing(true)}
        onSave={handleSubmit}
        onCancel={handleCancel}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          <PersonalInformation
            formData={formData}
            isEditing={isEditing}
            onChange={handleChange}
          />

          <AchievementsSection
            achievements={formData.achievements}
            availableAchievements={availableAchievements}
          />
        </div>

        {/* Right Column - Stats & Info */}
        <div className="space-y-6">
          <ProfileStats
            achievementsCount={formData.achievements.length}
            totalAchievements={availableAchievements.length}
          />

          <ProfileCompletion
            formData={formData}
          />

        </div>
      </div>
    </div>
  )
}