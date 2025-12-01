"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "../ui/card"
import { Alert, AlertDescription } from "../ui/alert"
import { AlertCircle, CheckCircle, Loader2, Tag } from "lucide-react"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"


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

export default function BlogForm ({ onSuccess }) {
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
    if (!selectedOrg || !formData.title) {
      setAlert({ type: 'error', message: 'Please fill in required fields' })
      return
    }

    setIsLoading(true)
    try {
      const blogData = {
        ...formData,
        organization_id: selectedOrg.id,
        organization: selectedOrg.name,
        hackathon: formData.hackathon ? formData.hackathon.split(',').map(s => s.trim()) : []
      }

      await supabase.from('blogs').insert([blogData]).select()
      setAlert({ type: 'success', message: 'Blog created successfully!' })
      
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

      setTimeout(() => onSuccess?.(), 1000)
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to create blog' })
    } finally {
      setIsLoading(false)
    }
  }

  if (!organizations) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-fuchsia-900/20 via-purple-900/20 to-slate-950/20 backdrop-blur-xl border border-fuchsia-500/30">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-fuchsia-300" />
            <p className="text-fuchsia-200/70">Loading Organization information...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardContent className="p-6">
        {alert && (
          <Alert className={`mb-6 ${alert.type === 'error' ? 'border-red-500 bg-red-500/10' : 'border-green-500 bg-green-500/10'}`}>
            {alert.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div className="space-y-2 p-2 border border-red-400 rounded-xl">
            <Label className="text-white">Organization - This Is For Testing Purposes Only!</Label>
              <Select 
                onValueChange={(val) => {
                  const selected = organizations.find(o => o.id === parseInt(val));
                  setSelectedOrg(selected);
                }} 
                value={selectedOrg?.id?.toString()}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem 
                      key={org.id} 
                      value={org.id.toString()} 
                    >
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label className="text-white">Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-white">Description</Label>
              <Textarea
                value={formData.des}
                onChange={(e) => setFormData({...formData, des: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
                rows={3}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-white">Content</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Author</Label>
              <Input
                value={formData.author}
                onChange={(e) => setFormData({...formData, author: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
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

            <div className="space-y-2">
              <Label className="text-white">Place</Label>
              <Input
                value={formData.place}
                onChange={(e) => setFormData({...formData, place: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
                placeholder="Online, New York, etc."
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-white">Image URL</Label>
              <Input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create Blog'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}