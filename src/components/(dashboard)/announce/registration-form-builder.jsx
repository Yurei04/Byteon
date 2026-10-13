"use client"

import { Plus, X, ClipboardList, ChevronUp, ChevronDown, Sparkles, User, Mail } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  FIELD_TYPES, FIELD_PRESETS, MAX_FIELDS, MAX_OPTIONS, getFieldType, newField,
} from "@/lib/registration-form"

/**
 * Organizer-side "Google Form"-style builder.
 * Name + email are always collected from the participant's Byteon account,
 * so organizers only add the extra questions here.
 */
export default function RegistrationFormBuilder({ fields, setFields, hasError, uiT }) {
  const add     = (over) => fields.length < MAX_FIELDS && setFields(prev => [...prev, newField(over)])
  const remove  = (id)   => setFields(prev => prev.filter(f => f.id !== id))
  const update  = (id, patch) => setFields(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f))
  const move    = (i, dir) => setFields(prev => {
    const j = i + dir
    if (j < 0 || j >= prev.length) return prev
    const next = [...prev]; [next[i], next[j]] = [next[j], next[i]]
    return next
  })
  const setType = (id, key) => update(id, {
    type: key,
    options: getFieldType(key).hasOptions ? (fields.find(f => f.id === id)?.options?.length ? fields.find(f => f.id === id).options : ["Option 1", "Option 2"]) : [],
  })

  const border = uiT?.borderSubtle ?? "rgba(255,255,255,0.12)"
  const inputStyle = { background: uiT?.inputBg ?? "rgba(255,255,255,0.06)", borderColor: border, color: uiT?.headingText ?? "#fff" }
  const selStyle = { background: uiT?.inputBg ?? "rgba(255,255,255,0.06)", border: `1px solid ${border}`, color: uiT?.headingText ?? "#fff" }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-sky-400/15 border border-sky-400/25 shrink-0">
          <ClipboardList className="w-3.5 h-3.5 text-sky-500" />
        </div>
        <div>
          <Label className="font-semibold leading-none" style={{ color: uiT?.headingText }}>Registration form</Label>
          <p className="text-[11px] mt-0.5 leading-snug" style={{ color: uiT?.mutedText }}>
            Build the form participants fill in when they join. Answers appear in your dashboard’s Participants tab
            (Form responses), so you don’t need a Google Form.
          </p>
        </div>
      </div>

      {/* always-collected fields */}
      <div className="flex flex-wrap gap-1.5">
        {[[User, "Name"], [Mail, "Email"]].map(([Icon, label]) => (
          <span key={label} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] border"
            style={{ borderColor: border, color: uiT?.mutedText, background: uiT?.surfaceBg2 }}>
            <Icon className="w-3 h-3" /> {label} · collected automatically
          </span>
        ))}
      </div>

      {/* presets */}
      <div className="p-3 rounded-xl space-y-2" style={{ background: uiT?.surfaceBg2 ?? "rgba(255,255,255,0.03)", border: `1px solid ${uiT?.borderBase ?? "rgba(255,255,255,0.07)"}` }}>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-sky-500" />
          <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: uiT?.mutedText }}>Quick questions</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FIELD_PRESETS.map(p => (
            <button key={p.label} type="button" onClick={() => add({ label: p.label, type: p.type, options: p.options ?? [] })}
              disabled={fields.length >= MAX_FIELDS}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] border transition-all hover:opacity-80 disabled:opacity-40"
              style={{ borderColor: border, color: uiT?.headingText, background: uiT?.inputBg }}>
              <Plus className="w-3 h-3 opacity-60" />{p.label}
            </button>
          ))}
        </div>
      </div>

      {/* questions */}
      {fields.length === 0 ? (
        <div className="py-5 rounded-xl border border-dashed text-center text-xs"
          style={{ borderColor: hasError ? "rgba(239,68,68,0.4)" : border, color: uiT?.mutedText }}>
          No extra questions yet. Participants will only provide their name and email.
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((f, i) => {
            const type = getFieldType(f.type)
            return (
              <div key={f.id} className="rounded-xl p-3 space-y-2.5"
                style={{ background: uiT?.surfaceBg2 ?? "rgba(255,255,255,0.03)", border: `1px solid ${uiT?.borderBase ?? "rgba(255,255,255,0.07)"}` }}>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold tabular-nums w-5 shrink-0" style={{ color: uiT?.mutedText }}>{i + 1}.</span>
                  <Input value={f.label} maxLength={120} placeholder="Question"
                    onChange={(e) => update(f.id, { label: e.target.value })}
                    className="h-8 text-sm rounded-lg flex-1" style={inputStyle} />
                  <select value={f.type} onChange={(e) => setType(f.id, e.target.value)}
                    className="text-xs rounded-lg px-2 py-1.5 outline-none cursor-pointer shrink-0" style={selStyle}>
                    {FIELD_TYPES.map(t => <option key={t.key} value={t.key} style={{ background: uiT?.inputBg ?? "#1a1a2e" }}>{t.label}</option>)}
                  </select>
                </div>

                {type.hasOptions && (
                  <div className="pl-7 space-y-1.5">
                    {f.options.map((o, oi) => (
                      <div key={oi} className="flex items-center gap-1.5">
                        <Input value={o} maxLength={80} placeholder={`Option ${oi + 1}`}
                          onChange={(e) => update(f.id, { options: f.options.map((x, xi) => xi === oi ? e.target.value : x) })}
                          className="h-7 text-xs rounded-lg" style={inputStyle} />
                        {f.options.length > 2 && (
                          <button type="button" title="Remove option"
                            onClick={() => update(f.id, { options: f.options.filter((_, xi) => xi !== oi) })}
                            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-slate-500 hover:text-red-500 dark:text-white/60 dark:hover:text-red-400">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                    {f.options.length < MAX_OPTIONS && (
                      <button type="button" onClick={() => update(f.id, { options: [...f.options, ""] })}
                        className="text-[11px] hover:underline" style={{ color: uiT?.mutedText }}>+ Add option</button>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pl-7">
                  <label className="flex items-center gap-2 text-xs cursor-pointer select-none" style={{ color: uiT?.mutedText }}>
                    <input type="checkbox" checked={f.required} onChange={(e) => update(f.id, { required: e.target.checked })} className="accent-fuchsia-500" />
                    Required
                  </label>
                  <div className="flex items-center gap-0.5">
                    <button type="button" title="Move up" disabled={i === 0} onClick={() => move(i, -1)}
                      className="w-6 h-6 rounded-md flex items-center justify-center disabled:opacity-30" style={{ color: uiT?.mutedText }}><ChevronUp className="w-3.5 h-3.5" /></button>
                    <button type="button" title="Move down" disabled={i === fields.length - 1} onClick={() => move(i, 1)}
                      className="w-6 h-6 rounded-md flex items-center justify-center disabled:opacity-30" style={{ color: uiT?.mutedText }}><ChevronDown className="w-3.5 h-3.5" /></button>
                    <button type="button" title="Delete question" onClick={() => remove(f.id)}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-slate-500 hover:text-red-500 dark:text-white/60 dark:hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button type="button" onClick={() => add()} disabled={fields.length >= MAX_FIELDS}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed text-sm transition-all hover:opacity-80 disabled:opacity-40"
        style={{ borderColor: border, color: uiT?.mutedText }}>
        <Plus className="w-4 h-4" /> Add question {fields.length > 0 && <span className="text-[11px] opacity-70">({fields.length}/{MAX_FIELDS})</span>}
      </button>

      {hasError && (
        <p className="text-xs text-red-400/80 flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />{hasError}
        </p>
      )}
    </div>
  )
}