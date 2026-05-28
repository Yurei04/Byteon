// lib/tabStorage.js
// A Supabase-compatible storage adapter that isolates each browser tab.
// - Reads inherit from localStorage once (so opening a new tab picks up your login)
// - All writes are sessionStorage-only (so sign-out in Tab B never touches Tab A)

export const tabStorage = {
  getItem(key) {
    try { return sessionStorage.getItem(key) }
    catch { return null }
  },
  setItem(key, value) {
    try { sessionStorage.setItem(key, value) }
    catch {}
  },
  removeItem(key) {
    try { sessionStorage.removeItem(key) }
    catch {}
  },
}