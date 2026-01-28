"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
import { AlertCircle, CheckCircle, Loader2, Info, Trophy, Plus, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const PRIZE_TEMPLATES = [
  { name: "1st Place", value: "$5,000" },
  { name: "2nd Place", value: "$3,000" },
  { name: "3rd Place", value: "$2,000" },
  { name: "Best Design", value: "$1,000" },
  { name: "Most Innovative", value: "$1,500" },
  { name: "Best Technical", value: "$1,000" },
  { name: "People's Choice", value: "$500" },
  { name: "NordVPN Subscription", value: "1 Year" },
  { name: "GitHub Pro", value: "1 Year" },
  { name: "Swag Pack", value: "T-shirt + Stickers" },
  { name: "Participation Prize", value: "Certificate" },
]

export default function AnnounceForm({ onSuccess }) {
  const router = useRouter()
  const [currentOrg, setCurrentOrg] = useState(null)
  const [authUserId, setAuthUserId] = useState(null)
  const [isFetchingOrg, setIsFetchingOrg] = useState(true)
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
    website_link: "",
    dev_link: "",
    color_scheme: "purple",
    google_sheet_csv_url: ""
  })

  // Prizes stored as array of objects
  const [prizes, setPrizes] = useState([
    { id: Date.now(), name: "", value: "", description: "" }
  ])

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
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        setAlert({ type: 'error', message: 'You must be logged in to create an announcement.' })
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

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      if (data) {
        setCurrentOrg(data)
        console.log('Organization loaded:', data)
      } else {
        setAlert({ type: 'error', message: 'Organization profile not found. Please complete your profile.' })
      }
    } catch (error) {
      console.error('Error fetching organization profile:', error)
      setAlert({ type: 'error', message: 'Failed to load organization profile' })
    }
  }

  const addPrize = () => {
    setPrizes([...prizes, { id: Date.now(), name: "", value: "", description: "" }])
  }

  const removePrize = (id) => {
    if (prizes.length > 1) {
      setPrizes(prizes.filter(p => p.id !== id))
    }
  }

  const updatePrize = (id, field, value) => {
    setPrizes(prizes.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const usePrizeTemplate = (id, template) => {
    setPrizes(prizes.map(p => 
      p.id === id ? { ...p, name: template.name, value: template.value } : p
    ))
  }

  const handleSubmit = async () => {
    if (!currentOrg || !authUserId) {
      setAlert({ type: 'error', message: 'Organization not found. Please refresh the page and log in again.' })
      return
    }

    if (!formData.title || !formData.des || !formData.author || !formData.date_begin || !formData.date_end) {
      setAlert({ type: 'error', message: 'Please fill in all required fields (Title, Description, Author, Start Date, End Date)' })
      return
    }

    // Validate prizes - at least one prize with name and value
    const validPrizes = prizes.filter(p => p.name.trim() && p.value.trim())
    if (validPrizes.length === 0) {
      setAlert({ type: 'error', message: 'Please add at least one prize with a name and value' })
      return
    }

    setIsLoading(true)
    setAlert(null)

    try {
      // Clean up prize data - remove id field
      const prizesData = validPrizes.map(({ id, ...prize }) => ({
        name: prize.name.trim(),
        value: prize.value.trim(),
        description: prize.description.trim() || ""
      }))

      const announcementData = {
        title: formData.title.trim(),
        des: formData.des.trim(),
        author: formData.author.trim(),
        date_begin: formData.date_begin,
        date_end: formData.date_end,
        open_to: formData.open_to.trim() || null,
        countries: formData.countries.trim() || null,
        prizes: prizesData, // Store as JSON
        website_link: formData.website_link.trim() || null,
        dev_link: formData.dev_link.trim() || null,
        color_scheme: formData.color_scheme,
        organization: currentOrg.name,
        organization_id: currentOrg.id,
        registrants_count: 0,
        tracking_method: 'automatic',
        google_sheet_csv_url: formData.google_sheet_csv_url.trim() || null,
      }

      console.log('Submitting announcement:', announcementData)

      const { data, error } = await supabase
        .from('announcements')
        .insert([announcementData])
        .select()

      if (error) {
        console.error('Insert error:', error)
        throw error
      }

      console.log('Announcement created:', data)
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
        website_link: "",
        dev_link: "",
        color_scheme: "purple",
        google_sheet_csv_url: ""
      })
      setPrizes([{ id: Date.now(), name: "", value: "", description: "" }])

      setTimeout(() => {
        if (onSuccess) onSuccess()
      }, 1000)

    } catch (error) {
      console.error('Error:', error)
      setAlert({ type: 'error', message: `Failed to create announcement: ${error.message}` })
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
            <p className="text-red-200 text-lg mb-4">You must be logged in as an organization to create an announcement.</p>
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
          <div className="space-y-2 p-4 border border-blue-400/30 rounded-xl bg-blue-950/20">
            <Label className="text-white font-semibold">Publishing as:</Label>
            <p className="text-white/90">{currentOrg.name}</p>
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

            <div className="space-y-2 md:col-span-2">
              <Label className="text-white">Author *</Label>
              <Input
                value={formData.author}
                onChange={(e) => setFormData({...formData, author: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            {/* Dynamic Prize Section */}
            <div className="space-y-4 md:col-span-2 p-5 border border-amber-400/30 rounded-xl bg-gradient-to-br from-amber-950/30 to-yellow-950/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <Label className="text-amber-200 text-base font-semibold">Prize Pool *</Label>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={addPrize}
                  className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Prize
                </Button>
              </div>

              <div className="space-y-4">
                {prizes.map((prize, index) => (
                  <div key={prize.id} className="relative bg-black/20 rounded-lg p-4 border border-amber-500/20">
                    {prizes.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removePrize(prize.id)}
                        className="absolute top-2 right-2 h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}

                    <div className="space-y-3 pr-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-amber-300 text-xs">Prize Name *</Label>
                          <Input
                            value={prize.name}
                            onChange={(e) => updatePrize(prize.id, 'name', e.target.value)}
                            className="bg-white/5 border-amber-400/30 text-white placeholder:text-gray-500"
                            placeholder="e.g., 1st Place, Best Design"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-amber-300 text-xs">Value / Prize *</Label>
                          <Input
                            value={prize.value}
                            onChange={(e) => updatePrize(prize.id, 'value', e.target.value)}
                            className="bg-white/5 border-amber-400/30 text-white placeholder:text-gray-500"
                            placeholder="$5,000 / NordVPN 1yr / Swag Pack"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-amber-300 text-xs">Description (optional)</Label>
                        <Textarea
                          value={prize.description}
                          onChange={(e) => updatePrize(prize.id, 'description', e.target.value)}
                          className="bg-white/5 border-amber-400/30 text-white placeholder:text-gray-500 resize-none"
                          placeholder="Additional details about this prize..."
                          rows={2}
                        />
                      </div>
                      
                      {/* Quick Templates */}
                      <div className="space-y-1.5">
                        <Label className="text-amber-300 text-xs">Quick Templates:</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {PRIZE_TEMPLATES.map((template) => (
                            <button
                              key={template.name}
                              type="button"
                              onClick={() => usePrizeTemplate(prize.id, template)}
                              className="px-2.5 py-1 text-xs bg-amber-900/40 hover:bg-amber-800/60 text-amber-200 rounded-md border border-amber-600/30 transition-all hover:scale-105"
                            >
                              {template.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-amber-300/70 mt-2 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Prizes can be cash, subscriptions (NordVPN, GitHub), swag, certificates, or anything else!</span>
              </p>
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

          <div className="space-y-4 p-4 border border-blue-400/30 rounded-xl bg-blue-950/20">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <Label className="text-white text-base font-semibold">Google Forms Registration Tracking</Label>
                <p className="text-sm text-gray-300 mt-1">Automatically count form responses</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">
                Google Sheet Published CSV URL
              </Label>
              <Input
                value={formData.google_sheet_csv_url}
                onChange={(e) => setFormData({ ...formData, google_sheet_csv_url: e.target.value })}
                className="bg-white/10 border-white/20 text-white font-mono text-xs"
                placeholder="https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv"
              />
              <p className="text-xs text-gray-400">
                Paste the FULL CSV URL from: File → Share → Publish to web → CSV
              </p>
            </div>

            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-200 text-sm">
                <strong>Setup Steps:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-xs">
                  <li>Create Google Form and link to Sheet</li>
                  <li>Open the response sheet</li>
                  <li>Click: File → Share → Publish to web</li>
                  <li>Choose "Entire Document" and "Comma-separated values (.csv)"</li>
                  <li>Click "Publish" and copy the CSV URL</li>
                  <li>Paste the complete URL above</li>
                </ol>
              </AlertDescription>
            </Alert>
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create Announcement'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}