"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "../ui/card"
import { Alert, AlertDescription } from "../ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"

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
        hackathon: formData.hackathon ? formData.hackathon.split(',').map(s => s.trim()) : []
      }

      await mockSupabase.from('blogs').insert([blogData]).select()
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
          <div className="space-y-2">
            <Label className="text-white">Organization *</Label>
            <Select onValueChange={(val) => setSelectedOrg(organizations.find(o => o.id === parseInt(val)))} value={selectedOrg?.id?.toString()}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id.toString()}>{org.name}</SelectItem>
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

            <div className="space-y-2">
              <Label className="text-white">Theme</Label>
              <Input
                value={formData.theme}
                onChange={(e) => setFormData({...formData, theme: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
                placeholder="Technology, Education, etc."
              />
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

            <div className="space-y-2">
              <Label className="text-white">Related Hackathons (comma-separated)</Label>
              <Input
                value={formData.hackathon}
                onChange={(e) => setFormData({...formData, hackathon: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
                placeholder="AI Hackathon, Web3 Event"
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