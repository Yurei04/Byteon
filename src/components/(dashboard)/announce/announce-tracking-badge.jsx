"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { AlertCircle, Loader2, CheckCircle, RefreshCw, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function AnnouncementTrackingBadge({ announcementId }) {
  const [loading, setLoading] = useState(false)
  const [announcement, setAnnouncement] = useState(null)
  const [liveCount, setLiveCount] = useState(0)
  const [error, setError] = useState(null)
  // Ref to hold the interval ID for external control
  const intervalRef = useRef(null) 

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

  const fetchLiveCount = useCallback(async (csvUrl) => {
    if (!csvUrl) return 0;

    setLoading(true);
    setError(null);

    try {
      // Single, fast read
      const res = await fetch(csvUrl, { cache: "no-store" });
      if (!res.ok) throw new Error("CSV fetch failed");
      const text = await res.text();

      const rows = text.trim().split("\n").filter(r => r.trim().length > 0);
      const latestCount = Math.max(0, rows.length - 1);

      let finalCount = liveCount; 

      if (latestCount > liveCount) {
        // Only update if the new count is STRICTLY higher
        finalCount = latestCount;
      } else {
        // If the new count is equal or lower, we stick to the existing liveCount (Monotonicity Lock)
        finalCount = liveCount;
      }

      setLiveCount(finalCount);
      return finalCount;

    } catch (err) {
      console.error("Error fetching live count:", err);
      setError("Live count error. Check CSV URL.");
      return liveCount; 
    } finally {
      setLoading(false);
    }
  }, [liveCount]);


  // Polling logic with conditional interval changes (optional faster confirmation)
  useEffect(() => {
    const urlPromise = fetchAnnouncementDetails()
    let initialCountSet = false;
    const POLLING_INTERVAL = 3000;
    const QUICK_INTERVAL = 2000; // Faster check after an increase is observed

    const poll = async () => {
        const url = await urlPromise;
        if (!url) return;
        
        const oldCount = liveCount;
        const newCount = await fetchLiveCount(url);

        if (!initialCountSet) {
            initialCountSet = true;
            // Set up the first official interval after the initial fetch
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = setInterval(poll, POLLING_INTERVAL);
        } else if (newCount > oldCount) {
          console.log(`📈 Count increased: ${oldCount} → ${newCount}. Switching to quick confirmation.`);
          
          // Clear the current interval
          if (intervalRef.current) clearInterval(intervalRef.current);
          
          // Set up QUICK interval for fast confirmation
          let quickCheckCount = 0;
          const MAX_QUICK_CHECKS = 2; // Do 2 quick checks then revert
          
          const quickPoll = async () => {
              const url = await urlPromise;
              if (!url) return;
              
              quickCheckCount++;
              console.log(`⚡ Quick check ${quickCheckCount}/${MAX_QUICK_CHECKS}`);
              
              await fetchLiveCount(url);
              
              // After max quick checks, revert to normal polling
              if (quickCheckCount >= MAX_QUICK_CHECKS) {
                  console.log(`🔄 Reverting to normal ${POLLING_INTERVAL}ms interval`);
                  if (intervalRef.current) clearInterval(intervalRef.current);
                  intervalRef.current = setInterval(poll, POLLING_INTERVAL);
              }
          };
          
          // Start quick polling (2 second interval)
          intervalRef.current = setInterval(quickPoll, QUICK_INTERVAL);

        }
    }

    // Run initial fetch
    poll();
    
    // Initial cleanup function
    return () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    }
    
  }, [announcementId, fetchLiveCount]) // dependency array uses fetchLiveCount

  const handleRefreshClick = () => {
    // Manually trigger a fetch on button click
    fetchLiveCount(announcement?.google_sheet_csv_url)
  }

  if (!announcement || !announcement.google_sheet_csv_url) return null

  return (
    <div className="flex items-center gap-2">
      <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-400/30 text-blue-300 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg shadow-blue-500/10">
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Users className="w-3.5 h-3.5" />}
        {liveCount} {liveCount === 1 ? 'registrant' : 'registrants'}
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