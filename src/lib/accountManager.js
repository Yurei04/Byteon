// lib/accountsManager.js
// Manages multiple signed-in Supabase accounts stored in localStorage.
// Each entry holds the tokens + lightweight profile info needed for the switcher UI.
// sessionStorage (used by authContext for per-tab caching) is kept separate
// so switching accounts only affects the current tab.

const ACCOUNTS_KEY     = "multi_accounts"      // all saved accounts
const ACTIVE_ID_KEY    = "active_account_id"   // userId of the active account

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]")
  } catch {
    return []
  }
}

function writeAccounts(accounts) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  } catch (err) {
    console.error("[accountsManager] Failed to write accounts:", err)
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns all saved accounts.
 * Shape of each entry:
 * {
 *   userId:       string,
 *   role:         "user" | "org_admin" | "super_admin",
 *   displayName:  string,   // name or org name
 *   avatarUrl:    string | null,
 *   accessToken:  string,
 *   refreshToken: string,
 *   savedAt:      number,   // Date.now()
 * }
 */
export function getAccounts() {
  return readAccounts()
}

/**
 * Saves (or updates) an account after a successful login.
 * Called from authContext once hydrateUser() resolves.
 *
 * @param {object} supabaseSession  - data.session from supabase.auth.signInWithPassword()
 * @param {object} profile          - resolved profile from authContext hydrateUser()
 * @param {string} role             - "user" | "org_admin" | "super_admin"
 */
export function saveAccount(supabaseSession, profile, role) {
  if (!supabaseSession?.user?.id) return

  const userId = supabaseSession.user.id
  const accounts = readAccounts()
  const idx = accounts.findIndex(a => a.userId === userId)

  const entry = {
    userId,
    role,
    displayName:  profile?.name || profile?.author_name || supabaseSession.user.email || "Unknown",
    avatarUrl:    profile?.profile_photo_url || null,
    accessToken:  supabaseSession.access_token,
    refreshToken: supabaseSession.refresh_token,
    savedAt:      Date.now(),
  }

  if (idx >= 0) {
    accounts[idx] = entry          // update existing
  } else {
    accounts.push(entry)           // add new
  }

  writeAccounts(accounts)
  setActiveAccountId(userId)       // newly logged-in account becomes active
}

/**
 * Removes an account from storage (e.g. after logging out of that account).
 */
export function removeAccount(userId) {
  const accounts = readAccounts().filter(a => a.userId !== userId)
  writeAccounts(accounts)

  // If we removed the active account, fall back to the first remaining one
  if (getActiveAccountId() === userId) {
    const next = accounts[0]?.userId ?? null
    try {
      if (next) localStorage.setItem(ACTIVE_ID_KEY, next)
      else       localStorage.removeItem(ACTIVE_ID_KEY)
    } catch {}
  }
}

/**
 * Returns the userId of the currently active account (current tab).
 */
export function getActiveAccountId() {
  try {
    return localStorage.getItem(ACTIVE_ID_KEY) || null
  } catch {
    return null
  }
}

/**
 * Sets the active account without switching the Supabase session.
 * Use switchAccount() (from restoreSession.js) to also swap the session.
 */
export function setActiveAccountId(userId) {
  try {
    localStorage.setItem(ACTIVE_ID_KEY, userId)
  } catch {}
}

/**
 * Returns the full saved entry for the currently active account, or null.
 */
export function getActiveAccount() {
  const id = getActiveAccountId()
  if (!id) return null
  return readAccounts().find(a => a.userId === id) ?? null
}

/**
 * Updates only the tokens for an account (called on Supabase TOKEN_REFRESHED).
 * Keeps displayName / avatarUrl intact.
 */
export function updateAccountTokens(userId, accessToken, refreshToken) {
  const accounts = readAccounts()
  const idx = accounts.findIndex(a => a.userId === userId)
  if (idx < 0) return

  accounts[idx] = { ...accounts[idx], accessToken, refreshToken, savedAt: Date.now() }
  writeAccounts(accounts)
}

/**
 * Clears ALL saved accounts from storage (nuclear option / full sign-out).
 */
export function clearAllAccounts() {
  try {
    localStorage.removeItem(ACCOUNTS_KEY)
    localStorage.removeItem(ACTIVE_ID_KEY)
  } catch {}
}