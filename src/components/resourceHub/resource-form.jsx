"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Loader2,
  AlertCircle,
  CheckCircle,
  Award
} from "lucide-react"


export default function ResourceForm({ onSuccess }) {
  const [organizations, setOrganizations] = useState([])
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    des: "",
    link: "",
    category: ""
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
    if (!selectedOrg || !formData.title || !formData.link) {
      setAlert({ type: 'error', message: 'Please fill in required fields' })
      return
    }

    setIsLoading(true)
    try {
      const resourceData = {
        ...formData,
        organization_id: selectedOrg.id
      }

      await supabase.from('resource_hub').insert([resourceData]).select()
      setAlert({ type: 'success', message: 'Resource created successfully!' })
      
      setFormData({
        title: "",
        des: "",
        link: "",
        category: ""
      })

      setTimeout(() => onSuccess?.(), 1000)
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to create resource' })
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

          <div className="space-y-2">
            <Label className="text-white">Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="bg-white/10 border-white/20 text-white"
              placeholder="React Documentation"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Description</Label>
            <Textarea
              value={formData.des}
              onChange={(e) => setFormData({...formData, des: e.target.value})}
              className="bg-white/10 border-white/20 text-white"
              rows={3}
              placeholder="Helpful resource for learning React"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Link *</Label>
            <Input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({...formData, link: e.target.value})}
              className="bg-white/10 border-white/20 text-white"
              placeholder="https://react.dev"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Category</Label>
            <Input
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="bg-white/10 border-white/20 text-white"
              placeholder="Development, Design, Learning"
            />
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create Resource'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}