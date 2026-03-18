// lib/apiFetch.js
// A thin fetch wrapper that automatically injects the currently active
// account's Supabase Bearer token into every request.
//
// It handles:
//   • Token injection from the live Supabase session (always fresh)
//   • 401 responses → attempts one silent token refresh, then retries
//   • Supabase REST / Storage / RPC endpoints
//   • Any other API routes you add (Next.js /api/*)
//
// Usage:
//   import { apiFetch } from "@/lib/apiFetch"
//
//   const data = await apiFetch("/api/my-route")
//   const json = await apiFetch("https://xyz.supabase.co/rest/v1/users", {
//     method: "POST",
//     body: JSON.stringify({ ... }),
//   })

import { supabase } from "@/lib/supabase"
import { updateAccountTokens, getActiveAccountId } from "@/lib/accountsManager"

// ─── Core fetch wrapper ────────────────────────────────────────────────────────

/**
 * Makes an authenticated fetch request using the active Supabase session token.
 *
 * @param {string}  url             - full URL or relative path
 * @param {object}  options         - standard fetch RequestInit options
 * @param {boolean} _isRetry        - internal flag — do not pass manually
 * @returns {Promise<Response>}
 */
export async function apiFetch(url, options = {}, _isRetry = false) {
  // 1. Get the current live session (Supabase auto-refreshes if needed)
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new AuthError("No active session. Please sign in.")
  }

  // 2. Persist any token rotation back to accountsManager
  const activeId = getActiveAccountId()
  if (activeId && session.access_token) {
    updateAccountTokens(activeId, session.access_token, session.refresh_token)
  }

  // 3. Build headers — merge caller's headers on top of auth defaults
  const headers = new Headers({
    "Content-Type": "application/json",
    ...flattenHeaders(options.headers),
    "Authorization": `Bearer ${session.access_token}`,
    // Include apikey header for direct Supabase REST calls
    ...(isSupabaseUrl(url) && {
      "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    }),
  })

  // 4. Perform the request
  const response = await fetch(url, {
    ...options,
    headers,
  })

  // 5. On 401 — try one silent token refresh, then retry
  if (response.status === 401 && !_isRetry) {
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()

    if (!refreshError && refreshData?.session) {
      updateAccountTokens(
        activeId,
        refreshData.session.access_token,
        refreshData.session.refresh_token
      )
      return apiFetch(url, options, true)   // retry once with new token
    }

    throw new AuthError("Session expired. Please sign in again.")
  }

  return response
}

// ─── Convenience methods ───────────────────────────────────────────────────────

/**
 * apiFetch + automatic JSON parsing.
 * Throws an ApiError if the response is not ok (status >= 400).
 */
export async function apiFetchJson(url, options = {}) {
  const response = await apiFetch(url, options)

  if (!response.ok) {
    let message = `HTTP ${response.status}`
    try {
      const body = await response.json()
      message = body?.message || body?.error || message
    } catch {}
    throw new ApiError(message, response.status)
  }

  // 204 No Content — return null instead of trying to parse empty body
  if (response.status === 204) return null

  return response.json()
}

/**
 * Shorthand helpers — mirrors the fetch API style
 */
export const api = {
  get:    (url, opts = {}) => apiFetchJson(url, { ...opts, method: "GET" }),
  post:   (url, body, opts = {}) => apiFetchJson(url, { ...opts, method: "POST",  body: JSON.stringify(body) }),
  put:    (url, body, opts = {}) => apiFetchJson(url, { ...opts, method: "PUT",   body: JSON.stringify(body) }),
  patch:  (url, body, opts = {}) => apiFetchJson(url, { ...opts, method: "PATCH", body: JSON.stringify(body) }),
  delete: (url, opts = {}) => apiFetchJson(url, { ...opts, method: "DELETE" }),
}

// ─── Custom error classes ──────────────────────────────────────────────────────

export class AuthError extends Error {
  constructor(message) {
    super(message)
    this.name = "AuthError"
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name   = "ApiError"
    this.status = status
  }
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function isSupabaseUrl(url) {
  return typeof url === "string" && url.includes(".supabase.co")
}

function flattenHeaders(headers) {
  if (!headers) return {}
  if (headers instanceof Headers) return Object.fromEntries(headers.entries())
  return headers
}