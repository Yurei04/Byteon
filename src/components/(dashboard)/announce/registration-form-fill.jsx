"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Loader2, ClipboardList } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { validateAnswers } from "@/lib/registration-form"

/**
 * Participant-side registration form (organizer-defined questions).
 * Name / email come from the Byteon account, so they are not asked again.
 * Answers are stored once per user per announcement and shown to the organizer
 * in the dashboard's Participants → Form responses view.
 *
 * Only change vs. the original: `onSubmitted` is ALSO called when saved answers are found on
 * load. Before, a returning participant who had already submitted never triggered it, so the
 * parent kept hiding the "choose how you take part" panel.
 */
export default function RegistrationFormFill({ announcement, userId, onSubmitted }) {
  const fields = Array.isArray(announcement.registration_form) ? announcement.registration_form : []
  const [answers, setAnswers] = useState({})
  const [errors, setErrors]   = useState({})
  const [saved, setSaved]     = useState(false)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [formError, setFormError] = useState("")

  useEffect(() => {
    let alive = true
    ;(async () => {
      const { data } = await supabase.from("announcement_registration_answers")
        .select("answers").eq("announcement_id", announcement.id).eq("user_id", userId).maybeSingle()
      if (!alive) return
      if (data?.answers) { setAnswers(data.answers); setSaved(true); onSubmitted?.() }
      setLoading(false)
    })()
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcement.id, userId])

  if (fields.length === 0) return null

  const set = (id, v) => { setAnswers(p => ({ ...p, [id]: v })); setErrors(p => ({ ...p, [id]: undefined })) }
  const toggle = (id, opt) => {
    const cur = Array.isArray(answers[id]) ? answers[id] : []
    set(id, cur.includes(opt) ? cur.filter(x => x !== opt) : [...cur, opt])
  }

  const submit = async (e) => {
    e.preventDefault()
    const { errors: errs, clean } = validateAnswers(fields, answers)
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true); setFormError("")
    const { error } = await supabase.from("announcement_registration_answers").upsert(
      { announcement_id: announcement.id, user_id: userId, answers: clean, updated_at: new Date().toISOString() },
      { onConflict: "announcement_id,user_id" },
    )
    setSaving(false)
    if (error) { setFormError(error.message || "Could not save your answers. Please try again."); return }
    setAnswers(clean); setSaved(true); setEditing(false)
    onSubmitted?.()
  }

  const box = { background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.25)" }
  const fieldCls = "w-full rounded-lg px-3 py-2 text-sm outline-none border bg-transparent"
  const fieldStyle = { borderColor: "rgb(var(--surface-border) / 0.6)", color: "rgb(var(--text-primary))" }

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="w-4 h-4 animate-spin" style={{ color: "rgb(var(--text-muted))" }} /></div>

  if (saved && !editing) {
    return (
      <div className="flex items-center gap-3 rounded-xl p-4" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.28)" }}>
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: "rgb(var(--text-primary))" }}>Registration form submitted</p>
          <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>The organizer can see your answers. Now choose how you’ll take part below.</p>
        </div>
        <button type="button" onClick={() => setEditing(true)} className="text-xs font-semibold underline underline-offset-2" style={{ color: "rgb(var(--text-secondary))" }}>Edit</button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-xl p-4 space-y-4" style={box}>
      <div className="flex items-center gap-2">
        <ClipboardList className="w-4 h-4 text-sky-500" />
        <p className="text-sm font-semibold" style={{ color: "rgb(var(--text-primary))" }}>Registration form</p>
      </div>

      {fields.map(f => (
        <div key={f.id} className="space-y-1.5">
          <label className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
            {f.label} {f.required && <span className="text-red-400">*</span>}
          </label>

          {f.type === "short" && <input className={fieldCls} style={fieldStyle} maxLength={200} value={answers[f.id] ?? ""} onChange={e => set(f.id, e.target.value)} />}
          {f.type === "url"   && <input type="url" placeholder="https://" className={fieldCls} style={fieldStyle} maxLength={300} value={answers[f.id] ?? ""} onChange={e => set(f.id, e.target.value)} />}
          {f.type === "long"  && <textarea rows={3} className={`${fieldCls} resize-none`} style={fieldStyle} maxLength={1000} value={answers[f.id] ?? ""} onChange={e => set(f.id, e.target.value)} />}

          {f.type === "dropdown" && (
            <select className={fieldCls} style={fieldStyle} value={answers[f.id] ?? ""} onChange={e => set(f.id, e.target.value)}>
              <option value="">Select…</option>
              {f.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          )}

          {f.type === "radio" && (
            <div className="space-y-1">
              {f.options.map(o => (
                <label key={o} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "rgb(var(--text-secondary))" }}>
                  <input type="radio" name={`q-${f.id}`} checked={answers[f.id] === o} onChange={() => set(f.id, o)} className="accent-fuchsia-500" />{o}
                </label>
              ))}
            </div>
          )}

          {f.type === "checkbox" && (
            <div className="space-y-1">
              {f.options.map(o => (
                <label key={o} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "rgb(var(--text-secondary))" }}>
                  <input type="checkbox" checked={(answers[f.id] || []).includes(o)} onChange={() => toggle(f.id, o)} className="accent-fuchsia-500" />{o}
                </label>
              ))}
            </div>
          )}

          {errors[f.id] && <p className="text-xs text-red-400">{errors[f.id]}</p>}
        </div>
      ))}

      {formError && <p className="text-xs text-red-400">{formError}</p>}

      <div className="flex items-center gap-2">
        <button type="submit" disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#c026d3,#db2777)" }}>
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {saved ? "Update answers" : "Submit form"}
        </button>
        {editing && <button type="button" onClick={() => setEditing(false)} className="text-xs underline" style={{ color: "rgb(var(--text-muted))" }}>Cancel</button>}
      </div>
    </form>
  )
}