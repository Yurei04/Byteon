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
  const router = useRouter()
  const [currentOrg, setCurrentOrg] = useState(null)
  const [authUserId, setAuthUserId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingOrg, setIsFetchingOrg] = useState(true)
  const [organizations, setOrganizations] = useState([])
  const [alert, setAlert] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    des: "",
    link: "",
    category: ""
  })

  useEffect(() => {
    fetchCurrentOrg()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setAuthUserId(session.user.id)
        await fetchOrgProfile(session.user.id)
      } else {
        setCurrentOrg(null)
        setAuthUserId(null)
        router.push('/log-in')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchCurrentOrg = async () => {
    setIsFetchingOrg(true)
    try {
      // Get authenticated user
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        setAlert({ type: 'error', message: 'You must be logged in to create a blog post.' })
        router.push('/log-in')
        return
      }

      setAuthUserId(session.user.id)
      await fetchOrgProfile(session.user.id)
      
    } catch (error) {
      console.error('Error fetching organization:', error)
      setAlert({ type: 'error', message: 'Failed to load organization information' })
    } finally {
      setIsFetchingOrg(false)
    }
  }

  const fetchOrgProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error

      if (data) {
        setCurrentOrg(data)
      } else {
        setAlert({ type: 'error', message: 'Organization profile not found. Please complete your profile.' })
      }
    } catch (error) {
      console.error('Error fetching organization profile:', error)
      setAlert({ type: 'error', message: 'Failed to load organization profile' })
    }
  }

  const handleSubmit = async () => {
    if (!currentOrg || !formData.title || !formData.link) {
      setAlert({ type: 'error', message: 'Please fill in required fields' })
      return
    }

    setIsLoading(true)
    setAlert(null)

    try {
      const resourceData = {
        ...formData,
        organization_id: currentOrg.id
      } 
      await supabase
      .from('resource_hub')
      .insert([resourceData])
      .select()

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

  if (isFetchingOrg) {
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

  if (!currentOrg) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-red-900/20 via-slate-900/20 to-slate-950/20 backdrop-blur-xl border border-red-500/30">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p className="text-red-200 text-lg mb-4">You must be logged in as an organization to create a blog post.</p>
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
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardContent className="p-6">
        {alert && (
          <Alert className={`mb-6 ${alert.type === 'error' ? 'border-red-500 bg-red-500/10' : 'border-green-500 bg-green-500/10'}`}>
            {alert.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div className="space-y-2 border border-red-400 p-2 rounded-xl">
            <Label className="text-white">Organization - This Is For Testing Purposes Only!</Label>
            <Select onValueChange={(val) => setCurrentOrg(organizations.find(o => o.id === parseInt(val)))} value={currentOrg?.id?.toString()}>
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