"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2, Image, FileText, User, MapPin, Tag } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function BlogUserForm({ onSuccess }) {
  const [organizations, setOrganizations] = useState([])
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    des: "",
    content: "",
    author: "Byteon Team",
    image: "",
    hackathon: "",
    place: "",
    theme: ""
  })

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    const { data } = await supabase.from('organization').select('*')
    setOrganizations(data || [])
    if (data?.length > 0) setSelectedOrg(data[0])
  }

  const handleSubmit = async () => {
    if (!selectedOrg || !formData.title || !formData.content) {
      setAlert({ type: 'error', message: 'Please fill in all required fields (Title and Content)' })
      return
    }

    setIsLoading(true)
    setAlert(null)

    try {
      const blogData = {
        ...formData,
        organization_id: selectedOrg.id,
        hackathon: formData.hackathon ? formData.hackathon.split(',').map(s => s.trim()) : []
      }

      const { error } = await supabase.from('blogs').insert([blogData]).select()
      
      if (error) throw error

      setAlert({ type: 'success', message: 'Blog created successfully! 🎉' })
      
      // Reset form
      setFormData({
        title: "",
        des: "",
        content: "",
        author: "Byteon Team",
        image: "",
        hackathon: "",
        place: "",
        theme: ""
      })

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

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="bg-gradient-to-br from-fuchsia-900/20 via-purple-900/20 to-slate-950/20 backdrop-blur-xl border border-fuchsia-500/30">
        <CardHeader className="border-b border-fuchsia-500/20 pb-6">
          <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-300">
            Create New Blog Post
          </CardTitle>
          <CardDescription className="text-fuchsia-200/70 text-base">
            Share your thoughts, experiences, and insights with the Byteon community
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {alert && (
            <Alert className={`mb-6 ${alert.type === 'error' ? 'border-red-500 bg-red-500/10 text-red-100' : 'border-green-500 bg-green-500/10 text-green-100'}`}>
              {alert.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
              <AlertDescription className="text-base">{alert.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Title Section */}
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

            {/* Description */}
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

            {/* Content */}
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

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Author */}
              <div className="space-y-3">
                <Label className="text-fuchsia-100 font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Author
                </Label>
                <Input
                  value={formData.author}
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                  className="bg-white/5 border-fuchsia-500/30 text-white placeholder:text-fuchsia-200/40 focus:border-fuchsia-400"
                  placeholder="Your name or pen name"
                />
              </div>

              {/* Theme */}
              <div className="space-y-3">
                <Label className="text-fuchsia-100 font-semibold flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Theme/Category
                </Label>
                <Input
                  value={formData.theme}
                  onChange={(e) => setFormData({...formData, theme: e.target.value})}
                  className="bg-white/5 border-fuchsia-500/30 text-white placeholder:text-fuchsia-200/40 focus:border-fuchsia-400"
                  placeholder="Technology, Education, Lifestyle..."
                />
              </div>

              {/* Place */}
              <div className="space-y-3">
                <Label className="text-fuchsia-100 font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                <Input
                  value={formData.place}
                  onChange={(e) => setFormData({...formData, place: e.target.value})}
                  className="bg-white/5 border-fuchsia-500/30 text-white placeholder:text-fuchsia-200/40 focus:border-fuchsia-400"
                  placeholder="Online, New York, Remote..."
                />
              </div>

              {/* Hackathons */}
              <div className="space-y-3">
                <Label className="text-fuchsia-100 font-semibold">
                  Related Events/Hackathons
                </Label>
                <Input
                  value={formData.hackathon}
                  onChange={(e) => setFormData({...formData, hackathon: e.target.value})}
                  className="bg-white/5 border-fuchsia-500/30 text-white placeholder:text-fuchsia-200/40 focus:border-fuchsia-400"
                  placeholder="Separate with commas: Event1, Event2"
                />
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-3">
              <Label className="text-fuchsia-100 font-semibold flex items-center gap-2">
                <Image width={""} height={""} alt="" className="w-4 h-4" />
                Featured Image URL
              </Label>
              <Input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                className="bg-white/5 border-fuchsia-500/30 text-white placeholder:text-fuchsia-200/40 focus:border-fuchsia-400"
                placeholder="https://example.com/image.jpg"
              />
              {formData.image && (
                <div className="mt-4 rounded-lg overflow-hidden border border-fuchsia-500/30">
                  <Image
                    src={formData.image} 
                    alt="Preview"
                    width={""}
                    height={""} 
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
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