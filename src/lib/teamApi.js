import { supabase } from "@/lib/supabase"

// All team RPCs return { ok: true, ... } or { ok: false, error: "..." }.
async function call(fn, args) {
  try {
    const { data, error } = await supabase.rpc(fn, args)
    if (error) return { ok: false, error: error.message }
    return data ?? { ok: false, error: "No response from the server." }
  } catch (e) {
    return { ok: false, error: e?.message || "Network error. Please try again." }
  }
}

export const CODE_RE = /^\d{6}$/

export const getMine         = (announcementId)       => call("get_my_participation",  { p_announcement_id: announcementId })
export const setParticipation = (announcementId, type) => call("set_participation",    { p_announcement_id: announcementId, p_type: type }) // "solo" | "looking"
export const createTeam      = (announcementId, name) => call("create_team",           { p_announcement_id: announcementId, p_name: name })
export const joinWithCode    = (announcementId, code) => call("join_team_with_code",   { p_announcement_id: announcementId, p_code: code })
export const requestJoin     = (teamId, message = null) => call("request_join_team",   { p_team_id: teamId, p_message: message })
export const cancelRequest   = (requestId)            => call("cancel_join_request",   { p_request_id: requestId })
export const respondRequest  = (requestId, accept)    => call("respond_join_request",  { p_request_id: requestId, p_accept: accept })
export const regenerateCode  = (teamId)               => call("regenerate_team_code",  { p_team_id: teamId })

// Public: group names for an announcement (no codes / emails)
export async function listTeams(announcementId) {
  const { data, error } = await supabase.rpc("list_announcement_teams", { p_announcement_id: announcementId })
  return error ? [] : (data ?? [])
}