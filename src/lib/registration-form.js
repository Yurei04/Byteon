// Shared helpers for the custom "Join on Byteon" registration form.

export const MAX_FIELDS = 20
export const MAX_OPTIONS = 12

export const FIELD_TYPES = [
  { key: "short",    label: "Short answer",    hasOptions: false, max: 200  },
  { key: "long",     label: "Paragraph",       hasOptions: false, max: 1000 },
  { key: "url",      label: "Link (URL)",      hasOptions: false, max: 300  },
  { key: "radio",    label: "Multiple choice", hasOptions: true },
  { key: "dropdown", label: "Dropdown",        hasOptions: true },
  { key: "checkbox", label: "Checkboxes",      hasOptions: true },
]
export const getFieldType = (key) => FIELD_TYPES.find(t => t.key === key) ?? FIELD_TYPES[0]

export const FIELD_PRESETS = [
  { label: "School / Organization",        type: "short" },
  { label: "Student ID",                   type: "short" },
  { label: "Department / Course",          type: "short" },
  { label: "Telegram / Discord username",  type: "short" },
  { label: "Why do you want to join?",     type: "long" },
  { label: "Skill level",                  type: "radio", options: ["Beginner", "Intermediate", "Advanced"] },
]

const uid = () => `f_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export const newField = (over = {}) => ({
  id: uid(), type: "short", label: "", required: false, options: [], ...over,
})

// Clean what the organizer built before saving it.
export function sanitizeForm(fields) {
  return (fields || [])
    .map(f => {
      const type = getFieldType(f.type)
      const options = type.hasOptions
        ? [...new Set((f.options || []).map(o => String(o).trim().slice(0, 80)).filter(Boolean))].slice(0, MAX_OPTIONS)
        : []
      return { id: String(f.id), type: type.key, label: String(f.label || "").trim().slice(0, 120), required: !!f.required, options }
    })
    .filter(f => f.label)
    .slice(0, MAX_FIELDS)
}

// Returns an error message or null.
export function validateFormDefinition(fields) {
  const raw = fields || []
  if (raw.some(f => !String(f.label || "").trim()))
    return "Every registration question needs a label (or remove the empty one)."
  const bad = sanitizeForm(raw).find(f => getFieldType(f.type).hasOptions && f.options.length < 2)
  if (bad) return `"${bad.label}" needs at least 2 options.`
  return null
}

const isUrl = (v) => { try { return /^https?:$/.test(new URL(v).protocol) } catch { return false } }

// Returns { errors: { [fieldId]: msg }, clean: { [fieldId]: value } }
export function validateAnswers(fields, answers) {
  const errors = {}, clean = {}
  ;(fields || []).forEach(f => {
    const type = getFieldType(f.type)
    const raw = answers?.[f.id]
    if (f.type === "checkbox") {
      const arr = (Array.isArray(raw) ? raw : []).filter(v => f.options.includes(v))
      if (f.required && arr.length === 0) errors[f.id] = "Select at least one option."
      else if (arr.length) clean[f.id] = arr
      return
    }
    const v = String(raw ?? "").trim()
    if (!v) { if (f.required) errors[f.id] = "This question is required."; return }
    if (type.hasOptions && !f.options.includes(v)) { errors[f.id] = "Pick one of the options."; return }
    if (f.type === "url" && !isUrl(v)) { errors[f.id] = "Enter a valid link starting with https://"; return }
    clean[f.id] = type.max ? v.slice(0, type.max) : v
  })
  return { errors, clean }
}

export const formatAnswer = (v) => Array.isArray(v) ? v.join(", ") : (v ?? "")