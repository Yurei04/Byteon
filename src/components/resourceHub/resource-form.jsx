"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ResourceForm({ onSuccess, currentOrg, authUserId }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingOrg, setIsFetchingOrg] = useState(true)
  const [alert, setAlert] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    des: "",
    link: "",
    category: ""
  })

  const handleSubmit = async () => {
    if (!currentOrg) {
      setAlert({ type: 'error', message: 'Organization not found. Please refresh and log in again.' })
      return
    }

    if (!formData.title || !formData.link) {
      setAlert({ type: 'error', message: 'Please fill in required fields (Title and Link)' })
      return
    }

    setIsLoading(true)
    setAlert(null)

    try {
      const resourceData = {
        title: formData.title.trim(),
        des: formData.des.trim() || null,
        link: formData.link.trim(),
        category: formData.category.trim() || null,
        organization_id: currentOrg.id,
        organization: currentOrg.name
      }

      console.log('Submitting resource:', resourceData)

      const { data, error } = await supabase
        .from('resource_hub')
        .insert([resourceData])
        .select()

      if (error) {
        console.error('Insert error:', error)
        throw error
      }

      console.log('Resource created:', data)
      setAlert({ type: 'success', message: 'Resource created successfully!' })
      
      setFormData({
        title: "",
        des: "",
        link: "",
        category: ""
      })

      setTimeout(() => {
        if (onSuccess) onSuccess()
      }, 1000)

    } catch (error) {
      console.error('Error creating resource:', error)
      setAlert({ type: 'error', message: `Failed to create resource: ${error.message}` })
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentOrg) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-fuchsia-900/20 via-purple-900/20 to-slate-950/20 backdrop-blur-xl border border-fuchsia-500/30">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-fuchsia-300" />
            <p className="text-fuchsia-200/70">Loading organization information...</p>
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
          <div className="space-y-2 p-4 border border-blue-400/30 rounded-xl bg-blue-950/20">
            <Label className="text-white font-semibold">Publishing as:</Label>
            <p className="text-white/90">{currentOrg.name}</p>
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