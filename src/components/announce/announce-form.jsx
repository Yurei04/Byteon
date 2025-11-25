"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function AnnounceForm({ onSuccess }) {
  const [organizations, setOrganizations] = useState([])
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    des: "",
    author: "",
    date_begin: "",
    date_end: "",
    open_to: "",
    countries: "",
    prizes: "",
    website_link: "",
    dev_link: "",
    color_scheme: "purple"
  })

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organization')
        .select('*')

      if (error) throw error
      setOrganizations(data || [])
      if (data?.length > 0) {
        setSelectedOrg(data[0])
        setFormData(prev => ({ ...prev, color_scheme: data[0].color_scheme || 'purple' }))
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSubmit = async () => {
    if (!selectedOrg) {
      setAlert({ type: 'error', message: 'Please select an organization' })
      return
    }
    if (!formData.title || !formData.des || !formData.author || !formData.date_begin || !formData.date_end) {
      setAlert({ type: 'error', message: 'Please fill in all required fields' })
      return
    }

    setIsLoading(true)
    setAlert(null)

    try {
      const announcementData = {
        ...formData,
        prizes: formData.prizes ? parseInt(formData.prizes) : null,
        organization: selectedOrg.name,
        organization_id: selectedOrg.id,
        record: 0,
        record_after: 0
      }

      const { data, error } = await supabase
        .from('announcements')
        .insert([announcementData])
        .select()

      if (error) throw error

      setAlert({ type: 'success', message: 'Announcement created successfully!' })
      
      setFormData({
        title: "",
        des: "",
        author: "",
        date_begin: "",
        date_end: "",
        open_to: "",
        countries: "",
        prizes: "",
        website_link: "",
        dev_link: "",
        color_scheme: selectedOrg.color_scheme || "purple"
      })

      setTimeout(() => {
        if (onSuccess) onSuccess()
      }, 1000)

    } catch (error) {
      console.error('Error:', error)
      setAlert({ type: 'error', message: 'Failed to create announcement' })
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
                placeholder="AI Hackathon 2025"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-white">Description *</Label>
              <Textarea
                value={formData.des}
                onChange={(e) => setFormData({...formData, des: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Author *</Label>
              <Input
                value={formData.author}
                onChange={(e) => setFormData({...formData, author: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Prizes (USD)</Label>
              <Input
                type="number"
                value={formData.prizes}
                onChange={(e) => setFormData({...formData, prizes: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Start Date *</Label>
              <Input
                type="datetime-local"
                value={formData.date_begin}
                onChange={(e) => setFormData({...formData, date_begin: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">End Date *</Label>
              <Input
                type="datetime-local"
                value={formData.date_end}
                onChange={(e) => setFormData({...formData, date_end: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Open To</Label>
              <Input
                value={formData.open_to}
                onChange={(e) => setFormData({...formData, open_to: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
                placeholder="Students, Professionals, Everyone"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Countries</Label>
              <Input
                value={formData.countries}
                onChange={(e) => setFormData({...formData, countries: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
                placeholder="Global, USA, Canada"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Website Link</Label>
              <Input
                type="url"
                value={formData.website_link}
                onChange={(e) => setFormData({...formData, website_link: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">DevPost Link</Label>
              <Input
                type="url"
                value={formData.dev_link}
                onChange={(e) => setFormData({...formData, dev_link: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create Announcement'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}