// lib/supabase.js
"use client"

import { createClient } from "@supabase/supabase-js"

const tabStorage = {
  getItem(key) {
    if (typeof window === "undefined") return null
    return sessionStorage.getItem(key)
  },

  setItem(key, value) {
    if (typeof window === "undefined") return
    sessionStorage.setItem(key, value)
  },

  removeItem(key) {
    if (typeof window === "undefined") return
    sessionStorage.removeItem(key)
  },
}

let supabaseInstance = null

export function getSupabase() {
  if (supabaseInstance) return supabaseInstance

  supabaseInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        storage: tabStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,

        // IMPORTANT
        // disables cross-tab syncing
        multiTab: false,
      },
    }
  )

  return supabaseInstance
}

export const supabase = getSupabase()