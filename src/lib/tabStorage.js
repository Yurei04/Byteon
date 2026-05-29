// lib/tabStorage.js
// Pure sessionStorage adapter — each tab is fully isolated.
// sessionStorage survives page refresh but NOT tab duplication or new tabs.

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