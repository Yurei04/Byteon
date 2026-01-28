"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar, ExternalLink, Award, Users, AlertCircle, MousePointerClick, Trophy, Globe } from "lucide-react"
import { Button } from "../../ui/button"
import { supabase } from "@/lib/supabase"
import AnnouncementTrackingBadge from "./announce-tracking-badge"

const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  PHP: "₱",
  CAD: "C$",
  AUD: "A$",
  INR: "₹",
}

// Prize card color schemes based on common prize names
const getPrizeColorScheme = (prizeName) => {
  const name = prizeName.toLowerCase()
  
  if (name.includes('1st') || name.includes('first') || name.includes('gold')) {
    return {
      gradient: 'from-yellow-500/10 to-amber-500/10',
      border: 'border-yellow-400/30',
      icon: 'text-yellow-400',
      text: 'text-yellow-200',
      label: 'text-yellow-300'
    }
  } else if (name.includes('2nd') || name.includes('second') || name.includes('silver')) {
    return {
      gradient: 'from-gray-400/10 to-slate-400/10',
      border: 'border-gray-400/30',
      icon: 'text-gray-400',
      text: 'text-gray-200',
      label: 'text-gray-300'
    }
  } else if (name.includes('3rd') || name.includes('third') || name.includes('bronze')) {
    return {
      gradient: 'from-orange-700/10 to-amber-700/10',
      border: 'border-orange-600/30',
      icon: 'text-orange-600',
      text: 'text-orange-200',
      label: 'text-orange-300'
    }
  } else if (name.includes('participation')) {
    return {
      gradient: 'from-purple-500/10 to-pink-500/10',
      border: 'border-purple-400/30',
      icon: 'text-purple-400',
      text: 'text-purple-200',
      label: 'text-purple-300'
    }
  } else {
    // Default for custom prizes
    return {
      gradient: 'from-blue-500/10 to-indigo-500/10',
      border: 'border-blue-400/30',
      icon: 'text-blue-400',
      text: 'text-blue-200',
      label: 'text-blue-300'
    }
  }
}

export default function AnnouncementPublicCard({ item, onDelete }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [prizes, setPrizes] = useState([])
  const [loadingPrizes, setLoadingPrizes] = useState(false)
  const isExpired = new Date(item.date_end) < new Date()
  
  // Fetch prizes when dialog opens
  useEffect(() => {
    if (isDialogOpen && prizes.length === 0) {
      fetchPrizes()
    }
  }, [isDialogOpen])

  const fetchPrizes = async () => {
    setLoadingPrizes(true)
    try {
      const { data, error } = await supabase
        .from('announcement_prizes')
        .select('*')
        .eq('announcement_id', item.id)
        .order('prize_order', { ascending: true })

      if (error) {
        console.error('Error fetching prizes:', error)
      } else {
        setPrizes(data || [])
      }
    } catch (error) {
      console.error('Error fetching prizes:', error)
    } finally {
      setLoadingPrizes(false)
    }
  }

  const handleWebsiteLinkClick = async (e) => {
    e.stopPropagation()
    
    // Track click if using manual tracking
    if (item.tracking_method === 'manual' && item.website_link) {
      try {
        const { error } = await supabase
          .from('announcements')
          .update({ 
            website_clicks: (item.website_clicks || 0) + 1,
            registrants_count: (item.registrants_count || 0) + 1
          })
          .eq('id', item.id)

        if (error) console.error('Error tracking click:', error)
      } catch (error) {
        console.error('Error tracking click:', error)
      }
    }
  }

  const getTrackingStats = () => {
    const trackingMethod = item.tracking_method || 'manual'
    
    if (trackingMethod === 'manual') {
      return {
        icon: <MousePointerClick className="w-3.5 h-3.5" />,
        label: 'Clicks',
        count: item.website_clicks || 0,
        color: 'from-cyan-500/20 to-blue-500/20 border-cyan-400/30 text-cyan-300 shadow-cyan-500/10'
      }
    } else if (trackingMethod === 'automatic') {
      return {
        icon: <Users className="w-3.5 h-3.5" />,
        label: 'Registrants',
        count: item.registrants_count || 0,
        color: 'from-blue-500/20 to-indigo-500/20 border-blue-400/30 text-blue-300 shadow-blue-500/10',
        hasError: item.sync_error,
        lastSync: item.last_synced_at
      }
    }
    
    return null
  }

  const trackingStats = getTrackingStats()
  const currencySymbol = CURRENCY_SYMBOLS[item.prize_currency] || "$"

  return (
    <>
      <Card 
        className="group relative bg-gradient-to-br from-fuchsia-950/40 via-purple-950/40 to-slate-950/40 backdrop-blur-xl border border-fuchsia-500/20 hover:border-fuchsia-400/60 transition-all duration-300 overflow-hidden hover:shadow-2xl hover:shadow-fuchsia-500/20 cursor-pointer"
        onClick={() => setIsDialogOpen(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/0 via-purple-600/5 to-fuchsia-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardContent className="relative p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              {item.organization && (
                <div className="mb-2">
                  <span className="text-xs font-semibold text-fuchsia-400 uppercase tracking-wider">
                    {item.organization}
                  </span>
                </div>
              )}
              
              <h3 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-3 group-hover:from-fuchsia-200 group-hover:via-purple-200 group-hover:to-pink-200 transition-all duration-300">
                {item.title}
              </h3>
              
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">{item.des}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-400/30 text-emerald-300 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-emerald-500/10">
                  <Award className="w-3.5 h-3.5" />
                  Prizes Available
                </span>

                {item.google_sheet_csv_url && (
                  <AnnouncementTrackingBadge announcementId={item.id} />
                )}

                {isExpired ? (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-400/30 text-red-300 rounded-full text-xs font-medium shadow-lg shadow-red-500/10">
                    Expired
                  </span>
                ) : (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-400/30 text-fuchsia-300 rounded-full text-xs font-medium shadow-lg shadow-fuchsia-500/10 animate-pulse">
                    Active
                  </span>
                )}

                {trackingStats && trackingStats.hasError && (
                  <span 
                    className="px-3 py-1.5 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/30 text-red-300 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-red-500/10 cursor-help" 
                    title={item.sync_error}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    Sync Error
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-400 space-y-2 bg-black/20 rounded-lg p-3 border border-purple-500/10">
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-fuchsia-400" />
                  <span className="text-gray-300">
                    {new Date(item.date_begin).toLocaleDateString()} - {new Date(item.date_end).toLocaleDateString()}
                  </span>
                </p>
                {item.open_to && (
                  <p className="text-gray-400">
                    <span className="text-fuchsia-400 font-medium">Open to:</span> {item.open_to}
                  </p>
                )}
                {item.countries && (
                  <p className="text-gray-400">
                    <span className="text-purple-400 font-medium">Location:</span> {item.countries}
                  </p>
                )}
                <p className="text-gray-400">
                  <span className="text-pink-400 font-medium">By:</span> {item.author}
                </p>
              </div>
            </div>
          </div>
          
          {(item.website_link || item.dev_link) && (
            <div className="flex gap-3 mt-5 pt-4 border-t border-purple-500/10">
              {item.website_link && (
                <a 
                  href={item.website_link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex-1"
                  onClick={handleWebsiteLinkClick}
                >
                  <Button 
                    size="sm" 
                    className="w-full cursor-pointer bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-fuchsia-500/30 transition-all duration-300"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                    {item.tracking_method === 'manual' ? 'Register Now' : 'Website'}
                  </Button>
                </a>
              )}
              {item.dev_link && (
                <a 
                  href={item.dev_link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button 
                    size="sm" 
                    className="w-full cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 shadow-lg shadow-purple-500/30 transition-all duration-300"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                    DevPost
                  </Button>
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-950 via-purple-950/50 to-fuchsia-950/30 border-fuchsia-500/30 text-white">
          <DialogHeader>
            <div className="mb-4">
              {item.organization && (
                <span className="text-sm font-semibold text-fuchsia-400 uppercase tracking-wider">
                  {item.organization}
                </span>
              )}
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-fuchsia-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mt-2">
                {item.title}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Description */}
            <div className="bg-white/5 rounded-xl p-4 border border-purple-500/20">
              <h4 className="text-sm font-semibold text-fuchsia-300 mb-2 uppercase tracking-wide">Description</h4>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{item.des}</p>
            </div>

            {/* Dynamic Prizes Section */}
            {prizes.length > 0 && (
              <div className="bg-gradient-to-br from-amber-950/30 to-yellow-950/20 rounded-xl p-5 border border-amber-400/30">
                <h4 className="text-sm font-semibold text-amber-300 mb-4 uppercase tracking-wide flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Prize Pool
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prizes.map((prize, index) => {
                    const colorScheme = getPrizeColorScheme(prize.prize_name)
                    return (
                      <div 
                        key={prize.id} 
                        className={`bg-gradient-to-br ${colorScheme.gradient} rounded-lg p-4 border ${colorScheme.border} text-center transition-transform hover:scale-105`}
                      >
                        <Trophy className={`w-8 h-8 mx-auto mb-2 ${colorScheme.icon}`} />
                        <div className={`text-xs ${colorScheme.label} uppercase tracking-wider mb-1`}>
                          {prize.prize_name}
                        </div>
                        <div className={`text-2xl font-bold ${colorScheme.text}`}>
                          {currencySymbol}{prize.prize_amount.toLocaleString()}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-fuchsia-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-fuchsia-300 mb-2">Event Dates</h4>
                    <p className="text-gray-300 text-sm">
                      <span className="font-medium">Start:</span> {new Date(item.date_begin).toLocaleString()}
                    </p>
                    <p className="text-gray-300 text-sm">
                      <span className="font-medium">End:</span> {new Date(item.date_end).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {item.open_to && (
                <div className="bg-white/5 rounded-xl p-4 border border-purple-500/20">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-purple-300 mb-2">Open To</h4>
                      <p className="text-gray-300 text-sm">{item.open_to}</p>
                    </div>
                  </div>
                </div>
              )}

              {item.countries && (
                <div className="bg-white/5 rounded-xl p-4 border border-purple-500/20">
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-300 mb-2">Location</h4>
                      <p className="text-gray-300 text-sm">{item.countries}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white/5 rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-pink-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-pink-300 mb-2">Organized By</h4>
                    <p className="text-gray-300 text-sm">{item.author}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-purple-500/20">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-300 mb-1">Status</h4>
                {isExpired ? (
                  <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-400/30 text-red-300 rounded-full text-sm font-medium">
                    Expired
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 text-green-300 rounded-full text-sm font-medium animate-pulse">
                    Active
                  </span>
                )}
              </div>

              {trackingStats && (
                <div className="text-right">
                  <h4 className="text-sm font-semibold text-gray-300 mb-1">{trackingStats.label}</h4>
                  <div className="flex items-center gap-2 justify-end">
                    {trackingStats.icon}
                    <span className="text-2xl font-bold text-white">{trackingStats.count}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {(item.website_link || item.dev_link) && (
              <div className="flex gap-3 pt-2">
                {item.website_link && (
                  <a 
                    href={item.website_link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleWebsiteLinkClick(e)
                    }}
                  >
                    <Button 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-fuchsia-500/30 transition-all duration-300"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {item.tracking_method === 'manual' ? 'Register Now' : 'Visit Website'}
                    </Button>
                  </a>
                )}
                {item.dev_link && (
                  <a 
                    href={item.dev_link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 shadow-lg shadow-purple-500/30 transition-all duration-300"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      DevPost
                    </Button>
                  </a>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}