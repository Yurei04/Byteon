// lib/restoreSession.js
import { supabase } from "@/lib/supabase"
import {
  getAccounts,
  saveAccount,
  setActiveAccountId,
  updateAccountTokens,
  removeAccount,
} from "@/lib/accountManager"

const SESSION_CACHE_KEY = "auth_cache"

export async function switchAccount(targetUserId, refreshProfile) {
  const accounts = getAccounts()
  const target   = accounts.find(a => a.userId === targetUserId)

  if (!target) {
    return { success: false, error: "Account not found in saved accounts." }
  }

  try {
    const { data, error } = await supabase.auth.setSession({
      access_token:  target.accessToken,
      refresh_token: target.refreshToken,
    })

    if (error) {
      console.warn("[restoreSession] setSession failed:", error.message)
      removeAccount(targetUserId)
      return { success: false, error: "Session expired. Please sign in to this account again." }
    }

    if (data?.session) {
      updateAccountTokens(
        targetUserId,
        data.session.access_token,
        data.session.refresh_token,
      )
    }

    setActiveAccountId(targetUserId)

    // Clear tab cache — onAuthStateChange SIGNED_IN will re-hydrate automatically
    try { sessionStorage.removeItem(SESSION_CACHE_KEY) } catch {}

    // Small tick to let onAuthStateChange fire before caller reads new state
    await new Promise(r => setTimeout(r, 50))

    return { success: true }

  } catch (err) {
    console.error("[restoreSession] Unexpected error:", err)
    return { success: false, error: err.message || "Unexpected error during account switch." }
  }
}

export async function persistCurrentSession(profile, role) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) saveAccount(session, profile, role)
  } catch (err) {
    console.warn("[restoreSession] Could not persist session:", err)
  }
}

export async function logoutAccount(userId, activeUserId, refreshProfile, logout) {
  removeAccount(userId)

  if (userId !== activeUserId) {
    // Clean up any stale cache for this account in the current tab
    try {
      const cached = sessionStorage.getItem(SESSION_CACHE_KEY)
      if (cached && JSON.parse(cached)?.id === userId) {
        sessionStorage.removeItem(SESSION_CACHE_KEY)
      }
    } catch {}
    return { success: true }
  }

  const remaining = getAccounts()
  if (remaining.length > 0) {
    return switchAccount(remaining[0].userId, refreshProfile)
  }

  if (typeof logout === "function") await logout()
  return { success: true }
}