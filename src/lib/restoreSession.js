// lib/restoreSession.js
// Switches the active Supabase session to another saved account in the current tab.
// Flow:
//   1. Look up the target account's saved tokens from accountsManager
//   2. Call supabase.auth.setSession() — this replaces the active localStorage token
//   3. Clear the tab-specific sessionStorage cache so authContext re-hydrates fresh
//   4. authContext's onAuthStateChange fires SIGNED_IN → hydrateUser() runs
//   5. Update accountsManager with refreshed tokens (Supabase may rotate them)

import { supabase } from "@/lib/supabase"
import {
  getAccounts,
  setActiveAccountId,
  updateAccountTokens,
  removeAccount,
} from "@/lib/accountManager"

const SESSION_CACHE_KEY = "auth_cache"   // must match authContext.jsx CACHE_KEY

/**
 * Switches the current tab to a different saved account.
 *
 * @param {string}   targetUserId   - userId of the account to switch to
 * @param {Function} refreshProfile - refreshProfile() from useAuth() — triggers re-hydration
 * @returns {{ success: boolean, error?: string }}
 */
export async function switchAccount(targetUserId, refreshProfile) {
  const accounts = getAccounts()
  const target   = accounts.find(a => a.userId === targetUserId)

  if (!target) {
    return { success: false, error: "Account not found in saved accounts." }
  }

  try {
    // 1. Restore the Supabase session for the target account
    const { data, error } = await supabase.auth.setSession({
      access_token:  target.accessToken,
      refresh_token: target.refreshToken,
    })

    if (error) {
      // Token likely expired and can't be refreshed — remove stale account
      console.warn("[restoreSession] setSession failed, removing stale account:", error.message)
      removeAccount(targetUserId)
      return {
        success: false,
        error: "Session expired. Please sign in to this account again.",
      }
    }

    // 2. Persist any rotated tokens Supabase returned
    if (data?.session) {
      updateAccountTokens(
        targetUserId,
        data.session.access_token,
        data.session.refresh_token
      )
    }

    // 3. Mark this account as active BEFORE clearing the cache
    setActiveAccountId(targetUserId)

    // 4. Clear the tab-specific sessionStorage cache
    //    authContext reads this on every visibility change / mount;
    //    clearing forces it to re-query the DB for the new account's profile.
    try { sessionStorage.removeItem(SESSION_CACHE_KEY) } catch {}

    // 5. Tell authContext to re-hydrate (fires the DB queries in hydrateUser)
    if (typeof refreshProfile === "function") {
      await refreshProfile()
    }

    return { success: true }

  } catch (err) {
    console.error("[restoreSession] Unexpected error:", err)
    return { success: false, error: err.message || "Unexpected error during account switch." }
  }
}

/**
 * Adds the current Supabase session to saved accounts right after login.
 * Call this inside LoginForm.jsx after a successful signInWithPassword().
 * Wraps saveAccount() with a live session fetch so tokens are always fresh.
 *
 * @param {object} profile  - resolved profile from authContext (after hydrateUser)
 * @param {string} role     - "user" | "org_admin" | "super_admin"
 */
export async function persistCurrentSession(profile, role) {
  const { saveAccount } = await import("@/lib/accountManager")

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      saveAccount(session, profile, role)
    }
  } catch (err) {
    console.warn("[restoreSession] Could not persist session:", err)
  }
}

/**
 * Logs out of a specific account without disturbing the active session.
 * If the account to remove IS the active session, it also signs out of Supabase
 * and switches to the next available saved account (if any).
 *
 * @param {string}   userId         - account to remove
 * @param {string}   activeUserId   - current active userId from useAuth()
 * @param {Function} refreshProfile - refreshProfile() from useAuth()
 * @param {Function} logout         - logout() from useAuth()
 */
export async function logoutAccount(userId, activeUserId, refreshProfile, logout) {
  const accounts = getAccounts()

  // Remove from saved list first
  removeAccount(userId)

  if (userId !== activeUserId) {
    // Not the active account — nothing else needed
    return { success: true }
  }

  // It IS the active account — need to switch or fully sign out
  const remaining = getAccounts()   // re-read after removal
  if (remaining.length > 0) {
    // Switch to the next available account
    return switchAccount(remaining[0].userId, refreshProfile)
  }

  // No accounts left — full sign out
  if (typeof logout === "function") {
    await logout()
  }
  return { success: true }
}