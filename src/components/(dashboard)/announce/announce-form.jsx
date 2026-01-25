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
import { AlertCircle, CheckCircle, Loader2, Info } from "lucide-react"
import { supabase } from "@/lib/supabase"

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
]

export default function AnnounceForm({ onSuccess }) {
  const router = useRouter()
  const [currentOrg, setCurrentOrg] = useState(null)
  const [authUserId, setAuthUserId] = useState(null)
  const [isFetchingOrg, setIsFetchingOrg] = useState(true)
  const [organizations, setOrganizations] = useState([])
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
    prize_currency: "USD",
    website_link: "",
    dev_link: "",
    color_scheme: "purple",
    google_sheet_csv_url: ""
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

    if (!currentOrg || !authUserId) {
      setAlert({ type: 'error', message: 'Organization not found. Please refresh the page and log in again.' })
      return
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      setAlert({ type: 'error', message: 'Please fill in all required fields (Title and Content)' })
      return
    }

    if (!formData.title || !formData.des || !formData.author || !formData.date_begin || !formData.date_end) {
      setAlert({ type: 'error', message: 'Please fill in all required fields' })
      return
    }

    if (!formData.google_sheet_csv_url) {
      setAlert({ type: 'error', message: 'Please provide the Google Sheet CSV URL' })
      return
    }

    // Validate URL format
    if (!formData.google_sheet_csv_url.includes('docs.google.com/spreadsheets')) {
      setAlert({ type: 'error', message: 'Invalid Google Sheets URL' })
      return
    }

    setIsLoading(true)
    setAlert(null)

    try {
      const announcementData = {
        title: formData.title,
        des: formData.des,
        author: formData.author,
        date_begin: formData.date_begin,
        date_end: formData.date_end,
        open_to: formData.open_to,
        countries: formData.countries,
        prizes: formData.prizes ? parseInt(formData.prizes) : null,
        prize_currency: formData.prize_currency,
        website_link: formData.website_link,
        dev_link: formData.dev_link,
        color_scheme: formData.color_scheme,
        organization: currentOrg.name,
        organization_id: currentOrg.id,
        registrants_count: 0,
        google_sheet_csv_url: formData.google_sheet_csv_url.trim() || null,
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
        prize_currency: "USD",
        website_link: "",
        dev_link: "",
        color_scheme: currentOrg.color_scheme || "purple",
        google_sheet_csv_url: ""
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
          <div className="space-y-2 p-2 border border-red-400 rounded-xl">
            <Label className="text-white">Organization</Label>
            <Select onValueChange={(val) => setCurrentOrg(organizations.find(o => o.id === parseInt(val)))} value={selectedOrg?.id?.toString()}>
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
              <Label className="text-white">Prize Amount</Label>
              <div className="flex gap-2">
                <Select value={formData.prize_currency} onValueChange={(val) => setFormData({...formData, prize_currency: val})}>
                  <SelectTrigger className="w-28 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={formData.prizes}
                  onChange={(e) => setFormData({...formData, prizes: e.target.value})}
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="10000"
                />
              </div>
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

          {/* Google Forms Tracking */}
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
                Google Sheet Published CSV URL *
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