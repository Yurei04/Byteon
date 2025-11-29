"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Loader2, User2, Edit, Save, X, Award, Calendar, MapPin, Briefcase } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function UserProfile({ onSuccess }) {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [alert, setAlert] = useState(null)

  // Initial state for profile fields
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    affiliation: "",
    country: "",
    achievements: [],
  })

  // Available achievements/badges
  const availableAchievements = [
    { id: 'chapter_1', label: 'Chapter 1', icon: '📚', category: 'Learning' },
    { id: 'chapter_2', label: 'Chapter 2', icon: '📚', category: 'Learning' },
    { id: 'chapter_3', label: 'Chapter 3', icon: '📚', category: 'Learning' },
    { id: 'chapter_4', label: 'Chapter 4', icon: '📚', category: 'Learning' },
    { id: 'chapter_5', label: 'Chapter 5', icon: '📚', category: 'Learning' },
    { id: 'read_blog', label: 'Blog Explorer', icon: '📖', category: 'Engagement' },
    { id: 'joined_hackathon', label: 'Hackathon Participant', icon: '🏆', category: 'Events' },
    { id: 'viewed_hackathon', label: 'Event Scout', icon: '👀', category: 'Events' },
    { id: 'first_project', label: 'First Project', icon: '💻', category: 'Development' },
    { id: 'profile_complete', label: 'Profile Complete', icon: '✅', category: 'Profile' },
    { id: 'community_member', label: 'Community Member', icon: '👥', category: 'Social' },
    { id: 'first_login', label: 'Welcome!', icon: '🎉', category: 'Profile' },
  ]

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
        
        let userAchievements = []
        if (userData.achievements) {
          userAchievements = typeof userData.achievements === 'string' 
            ? JSON.parse(userData.achievements) 
            : userData.achievements
        }
        
        setFormData({
          name: userData.name || "",
          age: userData.age || "",
          affiliation: userData.affiliation || "",
          country: userData.country || "",
          achievements: userAchievements,
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

  const handleSubmit = async () => {
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
      const profileUpdates = {
        name: formData.name,
        age: formData.age,
        affiliation: formData.affiliation,
        country: formData.country,
        achievements: JSON.stringify(formData.achievements),
        updated_at: new Date().toISOString(), 
      }

      const { data, error } = await supabase
        .from('user')
        .update(profileUpdates)
        .eq('id', profile.id) 
        .select()
      
      if (error) throw error

      setAlert({ type: 'success', message: 'User profile updated successfully!' })
      setIsEditing(false)

      if (data && data.length > 0) {
          setProfile(data[0])
      }

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading && !profile) {
    return (
      <div className="flex justify-center items-center p-12 text-white">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" /> Loading User Profile...
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

      {/* Profile Header Card */}
      <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border-white/20 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-pink-600 relative">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
        <CardContent className="relative -mt-16 px-6 pb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
            {/* User Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl border-4 border-white/20 shadow-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center backdrop-blur-xl">
                <span className="text-4xl font-bold text-white">
                  {formData.name ? getInitials(formData.name) : <User2 className="w-16 h-16" />}
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-slate-950">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">
                    {formData.name || 'User Profile'}
                  </h2>
                  <p className="text-white/60 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Member since {profile?.created_at ? formatDate(profile.created_at) : 'N/A'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button 
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button 
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                      </Button>
                      <Button 
                        onClick={() => {
                          setIsEditing(false)
                          fetchUser()
                        }}
                        variant="outline"
                        className="border-white/20 hover:bg-white/10"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.age && (
                  <Badge className="bg-purple-500/20 text-purple-200 border border-purple-500/30">
                    {formData.age} years old
                  </Badge>
                )}
                {formData.country && (
                  <Badge className="bg-blue-500/20 text-blue-200 border border-blue-500/30">
                    <MapPin className="w-3 h-3 mr-1" />
                    {formData.country}
                  </Badge>
                )}
                <Badge className="bg-amber-500/20 text-amber-200 border border-amber-500/30">
                  <Award className="w-3 h-3 mr-1" />
                  {formData.achievements.length} Achievements
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* About Section */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User2 className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Name / Username *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-white">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="Philippines"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="affiliation" className="text-white">Affiliation / Organization</Label>
                    <Input
                      id="affiliation"
                      name="affiliation"
                      value={formData.affiliation}
                      onChange={handleChange}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Tech University / Company Name"
                    />
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/60 text-sm mb-1">Full Name</p>
                    <p className="text-white font-medium">{formData.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">Age</p>
                    <p className="text-white font-medium">{formData.age || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">Country</p>
                    <p className="text-white font-medium flex items-center gap-2">
                      {formData.country ? (
                        <>
                          <MapPin className="w-4 h-4 text-white/60" />
                          {formData.country}
                        </>
                      ) : (
                        'Not provided'
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">Affiliation</p>
                    <p className="text-white font-medium flex items-center gap-2">
                      {formData.affiliation ? (
                        <>
                          <Briefcase className="w-4 h-4 text-white/60" />
                          {formData.affiliation}
                        </>
                      ) : (
                        'Not provided'
                      )}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements Section */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="w-5 h-5" />
                Achievements & Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/70 text-sm mb-4">
                Earn achievements by completing activities and milestones on the platform.
              </p>
              
              {/* Achievement Progress */}
              <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/80 text-sm font-medium">Overall Progress</span>
                  <span className="text-white font-bold">
                    {formData.achievements.length} / {availableAchievements.length}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500"
                    style={{ width: `${(formData.achievements.length / availableAchievements.length) * 100}%` }}
                  />
                </div>
                <p className="text-white/60 text-xs mt-2 text-center">
                  {Math.round((formData.achievements.length / availableAchievements.length) * 100)}% Complete
                </p>
              </div>

              {/* Achievements by Category */}
              <div className="space-y-4">
                {['Learning', 'Engagement', 'Events', 'Development', 'Profile', 'Social'].map(category => {
                  const categoryAchievements = availableAchievements.filter(a => a.category === category)
                  if (categoryAchievements.length === 0) return null
                  
                  return (
                    <div key={category}>
                      <h4 className="text-white/70 font-semibold text-sm mb-2 uppercase tracking-wide">{category}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {categoryAchievements.map(achievement => {
                          const isUnlocked = formData.achievements.includes(achievement.id)
                          return (
                            <div
                              key={achievement.id}
                              className={`p-3 rounded-lg border transition-all ${
                                isUnlocked
                                  ? 'bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border-yellow-400/50 shadow-lg shadow-yellow-500/10'
                                  : 'bg-gray-800/30 border-gray-600/30 opacity-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{achievement.icon}</span>
                                <span className={`text-sm font-medium flex-1 ${isUnlocked ? 'text-yellow-100' : 'text-gray-400'}`}>
                                  {achievement.label}
                                </span>
                                {isUnlocked && (
                                  <CheckCircle className="w-5 h-5 text-yellow-400" />
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Info */}
        <div className="space-y-6">
          
          {/* Quick Stats */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-lg">Profile Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Achievements</span>
                  <span className="text-white font-bold text-lg">{formData.achievements.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Completion</span>
                  <span className="text-white font-bold text-lg">
                    {Math.round((formData.achievements.length / availableAchievements.length) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Profile Status</span>
                  <Badge className="bg-green-500/20 text-green-200 border border-green-500/30">
                    Active
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-white/60 text-xs mb-2">Achievement Level</p>
                <div className="flex items-center gap-2">
                  {formData.achievements.length === 0 && (
                    <Badge className="bg-gray-500/20 text-gray-200">Beginner</Badge>
                  )}
                  {formData.achievements.length > 0 && formData.achievements.length < 4 && (
                    <Badge className="bg-blue-500/20 text-blue-200">Novice</Badge>
                  )}
                  {formData.achievements.length >= 4 && formData.achievements.length < 8 && (
                    <Badge className="bg-purple-500/20 text-purple-200">Intermediate</Badge>
                  )}
                  {formData.achievements.length >= 8 && formData.achievements.length < 12 && (
                    <Badge className="bg-amber-500/20 text-amber-200">Advanced</Badge>
                  )}
                  {formData.achievements.length === 12 && (
                    <Badge className="bg-gradient-to-r from-yellow-500/30 to-amber-500/30 text-yellow-100 border border-yellow-400/50">
                      Master 🏆
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Completion */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-lg">Profile Completion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Basic Info</span>
                  <CheckCircle className={`w-4 h-4 ${formData.name && formData.age ? 'text-green-400' : 'text-gray-500'}`} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Location</span>
                  <CheckCircle className={`w-4 h-4 ${formData.country ? 'text-green-400' : 'text-gray-500'}`} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Affiliation</span>
                  <CheckCircle className={`w-4 h-4 ${formData.affiliation ? 'text-green-400' : 'text-gray-500'}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity - Placeholder */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 text-sm text-center py-4">
                Activity tracking coming soon
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}