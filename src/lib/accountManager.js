// lib/accountsManager.js
const ACCOUNTS_KEY = "multi_accounts"
const ACTIVE_ID_KEY = "active_account_id"   // sessionStorage key now

function readAccounts() {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]") }
  catch { return [] }
}
function writeAccounts(accounts) {
  try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)) }
  catch (err) { console.error("[accountsManager] Failed to write accounts:", err) }
}

export function getAccounts() {
  return readAccounts()
}

export function saveAccount(supabaseSession, profile, role) {
  if (!supabaseSession?.user?.id) return
  const userId   = supabaseSession.user.id
  const accounts = readAccounts()
  const idx      = accounts.findIndex(a => a.userId === userId)

  const entry = {
    userId,
    role,
    displayName:  profile?.name || profile?.author_name || supabaseSession.user.email || "Unknown",
    avatarUrl:    profile?.profile_photo_url || null,
    accessToken:  supabaseSession.access_token,
    refreshToken: supabaseSession.refresh_token,
    savedAt:      Date.now(),
  }

  if (idx >= 0) accounts[idx] = entry
  else           accounts.push(entry)

  writeAccounts(accounts)
  setActiveAccountId(userId)
}

export function removeAccount(userId) {
  const accounts = readAccounts().filter(a => a.userId !== userId)
  writeAccounts(accounts)

  // ✅ Only update THIS tab's active pointer
  if (getActiveAccountId() === userId) {
    const next = accounts[0]?.userId ?? null
    try {
      if (next) sessionStorage.setItem(ACTIVE_ID_KEY, next)
      else      sessionStorage.removeItem(ACTIVE_ID_KEY)
    } catch {}
  }
}

// ✅ Per-tab: sessionStorage only
export function getActiveAccountId() {
  try { return sessionStorage.getItem(ACTIVE_ID_KEY) || null }
  catch { return null }
}

// ✅ Per-tab: sessionStorage only
export function setActiveAccountId(userId) {
  try { sessionStorage.setItem(ACTIVE_ID_KEY, userId) }
  catch {}
}

export function getActiveAccount() {
  const id = getActiveAccountId()
  if (!id) return null
  return readAccounts().find(a => a.userId === id) ?? null
}

export function updateAccountTokens(userId, accessToken, refreshToken) {
  const accounts = readAccounts()
  const idx      = accounts.findIndex(a => a.userId === userId)
  if (idx < 0) return
  accounts[idx] = { ...accounts[idx], accessToken, refreshToken, savedAt: Date.now() }
  writeAccounts(accounts)
}

// ✅ Nuclear option: clears the shared list only.
// Each tab's sessionStorage clears on its own when the tab closes.
export function clearAllAccounts() {
  try {
    localStorage.removeItem(ACCOUNTS_KEY)
    sessionStorage.removeItem(ACTIVE_ID_KEY)
  } catch {}
}