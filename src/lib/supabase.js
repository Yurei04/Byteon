// lib/supabase.js
import { createClient } from "@supabase/supabase-js"
import { tabStorage } from "@/lib/tabStorage"

// ── Kill cross-tab auth broadcasting BEFORE the Supabase client is created ──
// We override window.BroadcastChannel globally so that when GoTrueClient
// calls `new BroadcastChannel('supabase:auth-message')` internally,
// it gets a silent no-op instead of the real thing.
// This is more reliable than nulling internal properties after the fact
// because property names change across Supabase versions.
if (typeof window !== "undefined" && typeof window.BroadcastChannel !== "undefined") {
  const _OriginalBC = window.BroadcastChannel
  window.BroadcastChannel = function (name) {
    // Intercept only Supabase auth channels
    if (typeof name === "string" && name.includes("supabase")) {
      // Return a completely silent no-op object
      return {
        name,
        postMessage:         () => {},
        addEventListener:    () => {},
        removeEventListener: () => {},
        dispatchEvent:       () => true,
        close:               () => {},
        onmessage:           null,
        onmessageerror:      null,
      }
    }
    // All other BroadcastChannels work normally
    return new _OriginalBC(name)
  }
  // Preserve prototype so `instanceof` checks don't break
  window.BroadcastChannel.prototype = _OriginalBC.prototype
}

let supabaseInstance = null

function createSupabaseClient() {
  if (supabaseInstance) return supabaseInstance

  supabaseInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        storage:            tabStorage, // tab-isolated sessionStorage
        persistSession:     true,
        autoRefreshToken:   true,
        detectSessionInUrl: true,
      },
    }
  )

  return supabaseInstance
}

export const supabase = createSupabaseClient()