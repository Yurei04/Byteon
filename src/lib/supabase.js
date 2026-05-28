// lib/supabase.js
import { createClient } from "@supabase/supabase-js"
import { tabStorage } from "./tabStorage"

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage:            tabStorage,  // tab-isolated sessionStorage
      persistSession:     true,
      autoRefreshToken:   true,
      detectSessionInUrl: true,
    },
  }
)

// ── Kill cross-tab broadcasting ────────────────────────────────────────────────
// Supabase opens a BroadcastChannel("supabase:auth-message") that syncs
// SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED to every tab in the same origin.
// This completely defeats tab isolation, so we close and nullify it.
if (typeof window !== "undefined") {
  try {
    const auth = supabase.auth

    // Close the real channel so it stops receiving messages
    if (auth._broadcastChannel) {
      auth._broadcastChannel.close()
    }

    // Replace with a no-op so Supabase's internal postMessage calls
    // don't throw — they just silently do nothing
    auth._broadcastChannel = {
      postMessage:         () => {},
      addEventListener:    () => {},
      removeEventListener: () => {},
      close:               () => {},
    }
  } catch (e) {
    console.warn("[supabase] Could not disable BroadcastChannel:", e)
  }
}