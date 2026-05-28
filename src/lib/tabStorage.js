// lib/tabStorage.js
// A Supabase-compatible storage adapter that isolates each browser tab.
// - Reads inherit from localStorage once (so opening a new tab picks up your login)
// - All writes are sessionStorage-only (so sign-out in Tab B never touches Tab A)

export const tabStorage = {
  getItem(key) {
    // ── 1. Tab-local hit ───────────────────────────────────────────────────
    try {
      const tabValue = sessionStorage.getItem(key)
      if (tabValue !== null) return tabValue
    } catch {}

    // ── 2. First-open: inherit from shared localStorage, then go independent ─
    try {
      const sharedValue = localStorage.getItem(key)
      if (sharedValue !== null) {
        // Copy once into this tab's sessionStorage; after this the tab is isolated
        try { sessionStorage.setItem(key, sharedValue) } catch {}
        return sharedValue
      }
    } catch {}

    return null
  },

  setItem(key, value) {
    // Writes are sessionStorage-only — never pollute other tabs
    try { sessionStorage.setItem(key, value) } catch {}
  },

  removeItem(key) {
    // Removal is sessionStorage-only — other tabs keep their own copy
    try { sessionStorage.removeItem(key) } catch {}
  },
}