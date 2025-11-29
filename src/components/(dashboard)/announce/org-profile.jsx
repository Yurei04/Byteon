"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Loader2, Building2, Edit, Save, X, Award, Calendar, Palette } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function OrganizationProfile({ onSuccess }) {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [alert, setAlert] = useState(null)

  // Initial state for profile fields
  const [formData, setFormData] = useState({
    name: "",
    des: "",
    author_name: "",
    primary_color: "#000000",
    secondary_color: "#1F2937",
    color_scheme: "black",
    active: true,
    achievements: [],
  })

  // Available achievements/badges for organizations
  const availableAchievements = [
    { id: 'first_announcement', label: 'First Announcement', icon: '📢', category: 'Content' },
    { id: 'five_announcements', label: '5+ Announcements', icon: '📢', category: 'Content' },
    { id: 'ten_announcements', label: '10+ Announcements', icon: '🎯', category: 'Content' },
    { id: 'first_blog', label: 'First Blog Post', icon: '✍️', category: 'Content' },
    { id: 'five_blogs', label: '5+ Blog Posts', icon: '📝', category: 'Content' },
    { id: 'ten_blogs', label: '10+ Blog Posts', icon: '📚', category: 'Content' },
    { id: 'first_resource', label: 'First Resource', icon: '📖', category: 'Resources' },
    { id: 'five_resources', label: '5+ Resources', icon: '📚', category: 'Resources' },
    { id: 'ten_resources', label: '10+ Resources', icon: '🎓', category: 'Resources' },
    { id: 'active_30_days', label: '30 Days Active', icon: '🔥', category: 'Engagement' },
    { id: 'active_90_days', label: '90 Days Active', icon: '⚡', category: 'Engagement' },
    { id: 'active_year', label: '1 Year Anniversary', icon: '🎉', category: 'Engagement' },
    { id: 'community_builder', label: 'Community Builder', icon: '👥', category: 'Impact' },
    { id: 'event_organizer', label: 'Event Organizer', icon: '🎪', category: 'Impact' },
    { id: 'profile_complete', label: 'Profile Complete', icon: '✅', category: 'Setup' },
    { id: 'customized_theme', label: 'Custom Theme', icon: '🎨', category: 'Setup' },
  ]

  useEffect(() => {
    fetchOrganization()
  }, [])

  const fetchOrganization = async () => {
    setIsLoading(true)
    try {
      // Fetch ByteonAdmin organization
      const { data, error } = await supabase
        .from('organization')
        .select('*')
        .eq('name', 'ByteonAdmin')
        .single()

      if (error) throw error

      if (data) {
        setProfile(data)
        
        // Parse achievements
        let orgAchievements = []
        if (data.achievements) {
          orgAchievements = typeof data.achievements === 'string' 
            ? JSON.parse(data.achievements) 
            : data.achievements
        }
        
        setFormData({
          name: data.name || "",
          des: data.des || "",
          author_name: data.author_name || "",
          primary_color: data.primary_color || "#000000",
          secondary_color: data.secondary_color || "#1F2937",
          color_scheme: data.color_scheme || "black",
          active: data.active !== false,
          achievements: orgAchievements,
        })
      }
    } catch (error) {
      console.error('Error fetching organization profile:', error.message)
      setAlert({ type: 'error', message: 'Failed to load organization profile.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.des) {
      setAlert({ type: 'error', message: 'Organization Name and Description are required fields.' })
      return
    }

    if (!profile || !profile.id) {
        setAlert({ type: 'error', message: 'Cannot update: Organization profile not found.' })
        return
    }

    setIsLoading(true)
    setAlert(null)

    try {
      const profileUpdates = {
        name: formData.name,
        des: formData.des,
        author_name: formData.author_name,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        color_scheme: formData.color_scheme,
        active: formData.active,
        achievements: JSON.stringify(formData.achievements),
      }

      const { data, error } = await supabase
        .from('organization')
        .update(profileUpdates)
        .eq('id', profile.id) 
        .select()
      
      if (error) throw error

      setAlert({ type: 'success', message: 'Organization profile updated successfully!' })
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

  if (isLoading && !profile) {
    return (
      <div className="flex justify-center items-center p-12 text-white">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" /> Loading Organization Profile...
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
        <div 
          className="h-32 relative"
          style={{
            background: `linear-gradient(135deg, ${formData.primary_color} 0%, ${formData.secondary_color} 100%)`
          }}
        >
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <CardContent className="relative -mt-16 px-6 pb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
            {/* Organization Avatar */}
            <div className="relative">
              <div 
                className="w-32 h-32 rounded-2xl border-4 border-white/20 shadow-2xl flex items-center justify-center text-5xl backdrop-blur-xl"
                style={{
                  background: `linear-gradient(135deg, ${formData.primary_color}dd 0%, ${formData.secondary_color}dd 100%)`
                }}
              >
                <Building2 className="w-16 h-16 text-white" />
              </div>
              {formData.active && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-slate-950">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                </div>
              )}
            </div>

            {/* Organization Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">{formData.name}</h2>
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
                          fetchOrganization()
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
                <Badge className="bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-500/30">
                  {formData.color_scheme}
                </Badge>
                {formData.active ? (
                  <Badge className="bg-green-500/20 text-green-200 border border-green-500/30">
                    ● Active
                  </Badge>
                ) : (
                  <Badge className="bg-gray-500/20 text-gray-200 border border-gray-500/30">
                    ○ Inactive
                  </Badge>
                )}
                <Badge className="bg-purple-500/20 text-purple-200 border border-purple-500/30">
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
                <Building2 className="w-5 h-5" />
                About Organization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Organization Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="ByteonAdmin"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="des" className="text-white">Description *</Label>
                    <Textarea
                      id="des"
                      name="des"
                      value={formData.des}
                      onChange={handleChange}
                      className="bg-white/10 border-white/20 text-white min-h-[120px]"
                      placeholder="Describe your organization..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="author_name" className="text-white">Contact Person</Label>
                    <Input
                      id="author_name"
                      name="author_name"
                      value={formData.author_name}
                      onChange={handleChange}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Admin Name"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      id="active"
                      name="active"
                      type="checkbox"
                      checked={formData.active}
                      onChange={handleChange}
                      className="h-5 w-5 rounded border-white/20 bg-white/10"
                    />
                    <Label htmlFor="active" className="text-white cursor-pointer">
                      Organization is Active
                    </Label>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-white/60 text-sm mb-1">Description</p>
                    <p className="text-white">{formData.des || 'No description provided'}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">Contact Person</p>
                    <p className="text-white">{formData.author_name || 'Not specified'}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Achievements Section */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="w-5 h-5" />
                Achievements & Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/70 text-sm mb-4">
                Unlock achievements by growing and engaging your community.
              </p>
              
              {/* Achievement Progress */}
              <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/80 text-sm font-medium">Progress</span>
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
              </div>

              {/* Achievements by Category */}
              <div className="space-y-4">
                {['Content', 'Resources', 'Engagement', 'Impact', 'Setup'].map(category => {
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

        {/* Right Column - Brand Settings */}
        <div className="space-y-6">
          
          {/* Brand Colors */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Brand Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="primary_color" className="text-white">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary_color"
                        name="primary_color"
                        type="color"
                        value={formData.primary_color}
                        onChange={handleChange}
                        className="w-16 h-12 p-1 bg-white/10 border-white/20 cursor-pointer"
                      />
                      <Input
                        value={formData.primary_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                        className="flex-1 bg-white/10 border-white/20 text-white"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary_color" className="text-white">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary_color"
                        name="secondary_color"
                        type="color"
                        value={formData.secondary_color}
                        onChange={handleChange}
                        className="w-16 h-12 p-1 bg-white/10 border-white/20 cursor-pointer"
                      />
                      <Input
                        value={formData.secondary_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                        className="flex-1 bg-white/10 border-white/20 text-white"
                        placeholder="#1F2937"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color_scheme" className="text-white">Scheme Name</Label>
                    <Input
                      id="color_scheme"
                      name="color_scheme"
                      value={formData.color_scheme}
                      onChange={handleChange}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="dark-theme"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-white/60 text-sm mb-2">Color Palette</p>
                    <div className="flex gap-2">
                      <div 
                        className="w-16 h-16 rounded-lg border-2 border-white/20 shadow-lg"
                        style={{ backgroundColor: formData.primary_color }}
                        title={formData.primary_color}
                      />
                      <div 
                        className="w-16 h-16 rounded-lg border-2 border-white/20 shadow-lg"
                        style={{ backgroundColor: formData.secondary_color }}
                        title={formData.secondary_color}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">Scheme</p>
                    <p className="text-white font-mono">{formData.color_scheme}</p>
                  </div>
                </>
              )}

              {/* Color Preview */}
              <div className="space-y-2">
                <p className="text-white/60 text-sm">Preview</p>
                <div 
                  className="h-20 rounded-lg shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${formData.primary_color} 0%, ${formData.secondary_color} 100%)`
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Status</span>
                <Badge className={formData.active ? "bg-green-500/20 text-green-200" : "bg-gray-500/20 text-gray-200"}>
                  {formData.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Achievements</span>
                <span className="text-white font-bold">{formData.achievements.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Completion</span>
                <span className="text-white font-bold">
                  {Math.round((formData.achievements.length / availableAchievements.length) * 100)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}