"use client"
import { useState, useEffect, useCallback } from "react"
import { AlertCircle, Loader2, CheckCircle, RefreshCw, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function AnnouncementTrackingBadge({ announcementId }) {
  const [loading, setLoading] = useState(false)
  const [announcement, setAnnouncement] = useState(null)
  const [liveCount, setLiveCount] = useState(0)
  const [error, setError] = useState(null)

  // Fetch the announcement from Supabase (including its unique CSV URL)
  const fetchAnnouncementDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('google_sheet_csv_url, last_synced_at')
        .eq('id', announcementId)
        .single()

      if (error) throw error
      setAnnouncement(data)
      return data.google_sheet_csv_url
    } catch (err) {
      console.error('Error fetching announcement details:', err)
      setError('Failed to fetch announcement details.')
      return null
    }
  }

  // Fetch live count directly from CSV
  const fetchLiveCount = useCallback(async (csvUrl) => {
    if (!csvUrl) return 0

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(csvUrl)
      if (!res.ok) throw new Error('CSV fetch failed')
      const text = await res.text()

      const rows = text.trim().split("\n")
      // Assume first row is header
      const count = Math.max(0, rows.length - 1)

      setLiveCount(count)
      return count
    } catch (err) {
      console.error('Error fetching live count:', err)
      setError('Live count error. Check CSV URL.')
      setLiveCount(0)
      return 0
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load + polling every 15s
  useEffect(() => {
    let interval

    const init = async () => {
      const url = await fetchAnnouncementDetails()
      if (url) {
        await fetchLiveCount(url)
        interval = setInterval(() => fetchLiveCount(url), 15000)
      }
    }

    init()
    return () => clearInterval(interval)
  }, [announcementId, fetchLiveCount])

  const handleRefreshClick = () => {
    fetchLiveCount(announcement?.google_sheet_csv_url)
  }

  if (!announcement || !announcement.google_sheet_csv_url) return null

  return (
    <div className="flex items-center gap-2">
      <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-400/30 text-blue-300 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg shadow-blue-500/10">
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Users className="w-3.5 h-3.5" />}
        {liveCount} registrant{liveCount === 1 ? '' : 's'}
      </span>

      <Button
        size="sm"
        variant="ghost"
        onClick={handleRefreshClick}
        disabled={loading}
        className="h-7 w-7 p-0 hover:bg-blue-500/20 text-blue-300"
        title="Refresh count"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
      </Button>

      {error && (
        <span 
          className="px-2 py-1 bg-red-500/20 border border-red-400/30 text-red-300 rounded text-xs flex items-center gap-1"
          title={error}
        >
          <AlertCircle className="w-3 h-3" />
        </span>
      )}

      {announcement.last_synced_at && !error && (
        <span className="text-xs text-gray-500" title={`Last synced (DB cache): ${new Date(announcement.last_synced_at).toLocaleString()}`}>
          <CheckCircle className="w-3 h-3" />
        </span>
      )}
    </div>
  )
}
