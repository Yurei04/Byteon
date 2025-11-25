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

export default function AnnounceForm({ onSubmit, onSuccess, supabase }) {
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
    color_scheme: "blue"
  })

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organization')
        .select('*')
        .eq('active', true)
        .order('name')

      if (error) throw error
      setOrganizations(data || [])
    } catch (error) {
      console.error('Error fetching organizations:', error)
      setAlert({ type: 'error', message: 'Failed to load organizations' })
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleOrgSelect = (orgId) => {
    const org = organizations.find(o => o.id === parseInt(orgId))
    setSelectedOrg(org)
    if (org) {
      handleInputChange('color_scheme', org.color_scheme || 'blue')
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) return "Title is required"
    if (!formData.des.trim()) return "Description is required"
    if (!formData.author.trim()) return "Author is required"
    if (!formData.date_begin) return "Start date is required"
    if (!formData.date_end) return "End date is required"
    if (new Date(formData.date_begin) >= new Date(formData.date_end)) {
      return "End date must be after start date"
    }
    if (!selectedOrg) return "Please select an organization"
    return null
  }

  const handleSubmit = async () => {
    const validationError = validateForm()
    if (validationError) {
      setAlert({ type: 'error', message: validationError })
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
      
      // Reset form
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
        color_scheme: "blue"
      })
      setSelectedOrg(null)

      if (onSuccess) onSuccess(data[0])
      if (onSubmit) onSubmit(data[0])

    } catch (error) {
      console.error('Error creating announcement:', error)
      setAlert({ type: 'error', message: error.message || 'Failed to create announcement' })
    } finally {
      setIsLoading(false)
    }
  }

  const colorSchemes = [
    { value: 'blue', label: 'Blue' },
    { value: 'purple', label: 'Purple' },
    { value: 'green', label: 'Green' },
    { value: 'red', label: 'Red' },
    { value: 'orange', label: 'Orange' },
    { value: 'pink', label: 'Pink' }
  ]

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create New Announcement</CardTitle>
      </CardHeader>
      <CardContent>
        {alert && (
          <Alert className={`mb-6 ${alert.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
            {alert.type === 'error' ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            <AlertDescription className={alert.type === 'error' ? 'text-red-800' : 'text-green-800'}>
              {alert.message}
            </AlertDescription>
          </Alert>
        )}

        {selectedOrg && (
          <Alert className="mb-6 border-blue-500 bg-blue-50">
            <AlertDescription className="text-blue-800">
              <strong>Organization:</strong> {selectedOrg.name} - {selectedOrg.des}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Organization Selection */}
          <div className="space-y-2">
            <Label htmlFor="organization">Organization *</Label>
            <Select onValueChange={handleOrgSelect} value={selectedOrg?.id?.toString() || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select an organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id.toString()}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Global AI Hackathon 2025"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="des">Description *</Label>
              <Textarea
                id="des"
                value={formData.des}
                onChange={(e) => handleInputChange('des', e.target.value)}
                placeholder="Describe the hackathon..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author Name *</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color_scheme">Color Scheme</Label>
              <Select 
                value={formData.color_scheme} 
                onValueChange={(value) => handleInputChange('color_scheme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorSchemes.map((scheme) => (
                    <SelectItem key={scheme.value} value={scheme.value}>
                      {scheme.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_begin">Start Date *</Label>
              <Input
                id="date_begin"
                type="datetime-local"
                value={formData.date_begin}
                onChange={(e) => handleInputChange('date_begin', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_end">End Date *</Label>
              <Input
                id="date_end"
                type="datetime-local"
                value={formData.date_end}
                onChange={(e) => handleInputChange('date_end', e.target.value)}
              />
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="open_to">Open To</Label>
              <Input
                id="open_to"
                value={formData.open_to}
                onChange={(e) => handleInputChange('open_to', e.target.value)}
                placeholder="e.g., Students, Professionals, Everyone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="countries">Countries</Label>
              <Input
                id="countries"
                value={formData.countries}
                onChange={(e) => handleInputChange('countries', e.target.value)}
                placeholder="e.g., Global, USA, Canada"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prizes">Total Prizes (USD)</Label>
              <Input
                id="prizes"
                type="number"
                value={formData.prizes}
                onChange={(e) => handleInputChange('prizes', e.target.value)}
                placeholder="e.g., 50000"
              />
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website_link">Website Link</Label>
              <Input
                id="website_link"
                type="url"
                value={formData.website_link}
                onChange={(e) => handleInputChange('website_link', e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dev_link">DevPost Link</Label>
              <Input
                id="dev_link"
                type="url"
                value={formData.dev_link}
                onChange={(e) => handleInputChange('dev_link', e.target.value)}
                placeholder="https://devpost.com/..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Announcement'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}