"use client"

import { useState } from "react"
import { Lock, Loader2, KeyRound } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { normalizeInviteCode, isValidInviteCode } from "@/lib/announcement-config"

// Verifies the code on the server (redeem_invite_code RPC) and, if it matches,
// hands the registration links back to the parent via onUnlock(links).
export default function InviteCodeGate({ announcementId, onUnlock }) {
  const [code, setCode]       = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const submit = async (e) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (!isValidInviteCode(code)) { setError("Enter the invite code you were given."); return }

    setLoading(true); setError(null)
    try {
      const { data, error: rpcError } = await supabase.rpc("redeem_invite_code", {
        p_announcement_id: announcementId,
        p_code: normalizeInviteCode(code),
      })
      if (rpcError) throw rpcError
      if (!data) { setError("That code isn't valid for this hackathon."); return }
      onUnlock(data)
    } catch (err) {
      console.error("Invite code check failed:", err)
      setError("Couldn't verify the code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      onClick={(e) => e.stopPropagation()}
      className="rounded-xl p-4 space-y-3"
      style={{ background: "rgb(var(--surface-raised))", border: "1px solid rgb(var(--surface-border) / 0.60)" }}
    >
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-400/15 border border-indigo-400/25">
          <Lock className="w-4 h-4 text-indigo-400" />
        </span>
        <div>
          <p className="text-sm font-semibold" style={{ color: "rgb(var(--text-primary))" }}>Invite only</p>
          <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
            Enter your invite code to see how to join.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 17)); setError(null) }}
          placeholder="XXXX-XXXX"
          spellCheck={false}
          autoComplete="off"
          className="flex-1 min-w-0 rounded-lg px-3 py-2 text-sm font-mono tracking-widest outline-none"
          style={{
            background: "rgb(var(--bg-overlay))",
            color: "rgb(var(--text-primary))",
            border: `1px solid ${error ? "rgba(239,68,68,0.5)" : "rgb(var(--surface-border) / 0.60)"}`,
          }}
        />
        <button
          type="submit"
          disabled={loading || !code}
          className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
          style={{ background: "rgb(var(--bg-overlay))", color: "rgb(var(--text-primary))", border: "1px solid rgb(var(--surface-border) / 0.60)" }}
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
          Unlock
        </button>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </form>
  )
}