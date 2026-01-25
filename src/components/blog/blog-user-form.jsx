"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2, FileText, User, Tag, Camera } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

const THEME_OPTIONS = [
  "Technology",
  "Education",
  "Lifestyle",
  "Business",
  "Health & Wellness",
  "Science",
  "Arts & Culture",
  "Travel",
  "Food & Cooking",
  "Sports",
  "Gaming",
  "Finance",
  "Environment",
  "Personal Development",
  "Other"
]

export default function BlogUserForm({ onSuccess }) {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState(null)
  const [userId, setUserId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingUser, setIsFetchingUser] = useState(true)
  const [alert, setAlert] = useState(null)
  const [imageError, setImageError] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    des: "",
    content: "",
    image: "",
    theme: ""
  })

  useEffect(() => {
    fetchCurrentUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUserId(session.user.id)
        await fetchUserProfile(session.user.id)
      } else {
        setCurrentUser(null)
        setUserId(null)
        router.push('/log-in')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchCurrentUser = async () => {
    setIsFetchingUser(true)
    try {
      // Get authenticated user
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        setAlert({ type: 'error', message: 'You must be logged in to create a blog post.' })
        router.push('/log-in')
        return
      }

      setUserId(session.user.id)
      await fetchUserProfile(session.user.id)
      
    } catch (error) {
      console.error('Error fetching user:', error)
      setAlert({ type: 'error', message: 'Failed to load user information' })
    } finally {
      setIsFetchingUser(false)
    }
  }

  const fetchUserProfile = async (authUserId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', authUserId)
        .single()

      if (error) throw error

      if (data) {
        setCurrentUser(data)
      } else {
        setAlert({ type: 'error', message: 'User profile not found. Please complete your profile.' })
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setAlert({ type: 'error', message: 'Failed to load user profile' })
    }
  }

  const handleImageChange = (e) => {
    setFormData({...formData, image: e.target.value})
    setImageError(false)
  }

  const handleSubmit = async () => {
    if (!currentUser || !userId) {
      setAlert({ type: 'error', message: 'User not found. Please refresh the page and log in again.' })
      return
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      setAlert({ type: 'error', message: 'Please fill in all required fields (Title and Content)' })
      return
    }

    setIsLoading(true)
    setAlert(null)

    try {
      const blogData = {
        title: formData.title.trim(),
        des: formData.des.trim() || null,
        content: formData.content.trim(),
        image: formData.image.trim() || null,
        theme: formData.theme || null,
        user_id: currentUser.id, 
        author: currentUser.name, 
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('blogs')
        .insert([blogData])
        .select()
      
      if (error) throw error

      setAlert({ type: 'success', message: 'Blog created successfully! 🎉' })
      
      // Reset form
      setFormData({
        title: "",
        des: "",
        content: "",
        image: "",
        theme: ""
      })
      setImageError(false)

      setTimeout(() => {
        if (onSuccess) onSuccess()
      }, 1500)
    } catch (error) {
      console.error('Error creating blog:', error)
      setAlert({ type: 'error', message: `Failed to create blog: ${error.message}` })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetchingUser) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-fuchsia-900/20 via-purple-900/20 to-slate-950/20 backdrop-blur-xl border border-fuchsia-500/30">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-fuchsia-300" />
            <p className="text-fuchsia-200/70">Loading user information...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-red-900/20 via-slate-900/20 to-slate-950/20 backdrop-blur-xl border border-red-500/30">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p className="text-red-200 text-lg mb-4">You must be logged in to create a blog post.</p>
            <Button 
              onClick={() => router.push('/log-in')}
              className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="bg-gradient-to-br from-fuchsia-900/20 via-purple-900/20 to-slate-950/20 backdrop-blur-xl border border-fuchsia-500/30">
        <CardHeader className="border-b border-fuchsia-500/20 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-300">
                Create New Blog Post
              </CardTitle>
              <CardDescription className="text-fuchsia-200/70 text-base mt-2">
                Share your thoughts, experiences, and insights with the Byteon community
              </CardDescription>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-fuchsia-500/20 rounded-lg border border-fuchsia-400/30">
              <User className="w-4 h-4 text-fuchsia-300" />
              <span className="text-fuchsia-200 text-sm font-medium">{currentUser.name}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {alert && (
            <Alert className={`mb-6 ${alert.type === 'error' ? 'border-red-500 bg-red-500/10 text-red-100' : 'border-green-500 bg-green-500/10 text-green-100'}`}>
              {alert.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
              <AlertDescription className="text-base">{alert.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-purple-500/10 rounded-lg border border-purple-400/30">
              <User className="w-5 h-5 text-purple-300" />
              <div>
                <p className="text-purple-200/70 text-sm">Publishing as</p>
                <p className="text-purple-100 font-semibold">{currentUser.name}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-fuchsia-100 text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Blog Title *
              </Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="bg-white/5 border-fuchsia-500/30 text-white placeholder:text-fuchsia-200/40 focus:border-fuchsia-400 focus:ring-fuchsia-400/20 h-12 text-lg"
                placeholder="Enter an engaging title for your blog post..."
              />
            </div>

            <div className="space-y-3">
              <Label className="text-fuchsia-100 text-lg font-semibold">
                Short Description
              </Label>
              <Textarea
                value={formData.des}
                onChange={(e) => setFormData({...formData, des: e.target.value})}
                className="bg-white/5 border-fuchsia-500/30 text-white placeholder:text-fuchsia-200/40 focus:border-fuchsia-400 focus:ring-fuchsia-400/20 resize-none"
                placeholder="Write a brief summary that captures the essence of your post..."
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-fuchsia-100 text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Blog Content *
              </Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="bg-white/5 border-fuchsia-500/30 text-white placeholder:text-fuchsia-200/40 focus:border-fuchsia-400 focus:ring-fuchsia-400/20 resize-none"
                placeholder="Share your story, insights, or knowledge here..."
                rows={10}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-fuchsia-100 font-semibold flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Theme/Category
              </Label>
              <Select value={formData.theme} onValueChange={(value) => setFormData({...formData, theme: value})}>
                <SelectTrigger className="bg-white/5 border-fuchsia-500/30 text-white focus:border-fuchsia-400 focus:ring-fuchsia-400/20">
                  <SelectValue placeholder="Select a theme for your blog..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-fuchsia-500/30">
                  {THEME_OPTIONS.map((theme) => (
                    <SelectItem key={theme} value={theme} className="text-white hover:bg-fuchsia-500/20">
                      {theme}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-fuchsia-100 font-semibold flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Featured Image URL
              </Label>
              <Input
                type="url"
                value={formData.image}
                onChange={handleImageChange}
                className="bg-white/5 border-fuchsia-500/30 text-white placeholder:text-fuchsia-200/40 focus:border-fuchsia-400"
                placeholder="https://example.com/image.jpg"
              />
              {formData.image && !imageError && (
                <div className="mt-4 rounded-lg overflow-hidden border border-fuchsia-500/30 relative w-full h-48">
                  <Image
                    src={formData.image} 
                    alt="Blog preview"
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>
              )}
              {imageError && formData.image && (
                <div className="mt-4 p-4 rounded-lg border border-red-500/30 bg-red-500/10">
                  <p className="text-red-200 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Unable to load image. Please check the URL.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-fuchsia-500/20">
              <Button 
                onClick={handleSubmit}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white shadow-lg shadow-fuchsia-500/30 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Publishing Your Blog...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-5 w-5" />
                    Publish Blog Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}