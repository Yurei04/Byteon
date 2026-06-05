"use client"

import { User2, MapPin, Briefcase, Calendar, Globe } from "lucide-react"

const THEME_STYLES = `
  /* ── Light ── */
  :root {
    --pi-card-bg:      rgba(255,255,255,0.75);
    --pi-card-border:  rgba(192,38,211,0.18);
    --pi-card-shadow:  0 4px 24px rgba(192,38,211,0.07);

    --pi-header-border: rgba(192,38,211,0.12);

    --pi-icon-wrap-bg:     rgba(192,38,211,0.10);
    --pi-icon-wrap-border: rgba(192,38,211,0.20);
    --pi-icon-color:       #c026d3;

    --pi-title-color:   #1e0320;
    --pi-meta-color:    rgba(161,27,176,0.45);

    --pi-field-bg:      rgba(253,244,255,0.70);
    --pi-field-border:  rgba(192,38,211,0.12);
    --pi-field-hover:   rgba(192,38,211,0.22);

    --pi-label-color:   rgba(161,27,176,0.55);
    --pi-value-color:   #1e0320;
    --pi-empty-color:   rgba(161,27,176,0.30);

    --pi-char-ok:       rgba(161,27,176,0.35);
    --pi-char-warn:     #ca8a04;

    --pi-input-bg:      rgba(255,255,255,0.80);
    --pi-input-border:  rgba(192,38,211,0.20);
    --pi-input-text:    #1e0320;
    --pi-input-placeholder: rgba(161,27,176,0.35);
    --pi-input-focus-border: rgba(192,38,211,0.50);
    --pi-input-focus-ring:   rgba(192,38,211,0.15);

    --pi-req-star:      #c026d3;
  }

  /* ── Dark ── */
  .dark {
    --pi-card-bg:      rgba(20,5,30,0.60);
    --pi-card-border:  rgba(168,85,247,0.20);
    --pi-card-shadow:  none;

    --pi-header-border: rgba(168,85,247,0.12);

    --pi-icon-wrap-bg:     rgba(168,85,247,0.12);
    --pi-icon-wrap-border: rgba(168,85,247,0.22);
    --pi-icon-color:       #e879f9;

    --pi-title-color:   #fae8ff;
    --pi-meta-color:    rgba(232,121,249,0.40);

    --pi-field-bg:      rgba(255,255,255,0.04);
    --pi-field-border:  rgba(168,85,247,0.12);
    --pi-field-hover:   rgba(168,85,247,0.22);

    --pi-label-color:   rgba(216,180,254,0.45);
    --pi-value-color:   #fae8ff;
    --pi-empty-color:   rgba(255,255,255,0.22);

    --pi-char-ok:       rgba(232,121,249,0.35);
    --pi-char-warn:     #facc15;

    --pi-input-bg:      rgba(255,255,255,0.05);
    --pi-input-border:  rgba(168,85,247,0.22);
    --pi-input-text:    #fae8ff;
    --pi-input-placeholder: rgba(216,180,254,0.30);
    --pi-input-focus-border: rgba(232,121,249,0.50);
    --pi-input-focus-ring:   rgba(232,121,249,0.12);

    --pi-req-star:      #e879f9;
  }
`

const LIMITS = { name: 100, age: 3, country: 60, affiliation: 100 }

function CharCount({ value, max }) {
  const len  = String(value ?? "").length
  const near = len >= max * 0.85
  return (
    <span className="text-xs font-mono" style={{ color: near ? "var(--pi-char-warn)" : "var(--pi-char-ok)" }}>
      {len}/{max}
    </span>
  )
}

function InfoField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl transition-colors"
      style={{ background: "var(--pi-field-bg)", border: "1px solid var(--pi-field-border)" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--pi-field-hover)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--pi-field-border)"}>
      <div className="mt-0.5 p-1.5 rounded-lg"
        style={{ background: "var(--pi-icon-wrap-bg)", border: "1px solid var(--pi-icon-wrap-border)" }}>
        <Icon className="w-3.5 h-3.5" style={{ color: "var(--pi-icon-color)" }} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-widest font-semibold mb-0.5"
          style={{ color: "var(--pi-label-color)" }}>{label}</p>
        {value
          ? <p className="text-sm font-medium truncate" style={{ color: "var(--pi-value-color)" }}>{value}</p>
          : <p className="text-sm font-normal italic" style={{ color: "var(--pi-empty-color)" }}>Not provided</p>}
      </div>
    </div>
  )
}

function EditInput({ id, name, value, onChange, maxLength, placeholder, type = "text", min, max }) {
  return (
    <input
      id={id} name={name} type={type}
      value={value ?? ""} onChange={onChange}
      maxLength={maxLength} min={min} max={max}
      placeholder={placeholder}
      className="w-full px-3 h-10 rounded-lg text-sm outline-none transition-all"
      style={{
        background:  "var(--pi-input-bg)",
        border:      "1px solid var(--pi-input-border)",
        color:       "var(--pi-input-text)",
      }}
      onFocus={e => {
        e.target.style.borderColor = "var(--pi-input-focus-border)"
        e.target.style.boxShadow   = "0 0 0 3px var(--pi-input-focus-ring)"
      }}
      onBlur={e => {
        e.target.style.borderColor = "var(--pi-input-border)"
        e.target.style.boxShadow   = "none"
      }}
    />
  )
}

export default function PersonalInformation({ formData, isEditing, onChange }) {
  return (
    <>
      <style>{THEME_STYLES}</style>

      <div className="rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl transition-colors duration-300"
        style={{
          background: "var(--pi-card-bg)",
          border:     "1px solid var(--pi-card-border)",
          boxShadow:  "var(--pi-card-shadow)",
        }}>

        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-2.5"
          style={{ borderBottom: "1px solid var(--pi-header-border)" }}>
          <div className="p-1.5 rounded-lg"
            style={{ background: "var(--pi-icon-wrap-bg)", border: "1px solid var(--pi-icon-wrap-border)" }}>
            <User2 className="w-4 h-4" style={{ color: "var(--pi-icon-color)" }} />
          </div>
          <span className="text-base font-semibold" style={{ color: "var(--pi-title-color)" }}>
            Personal Information
          </span>
          {!isEditing && (
            <span className="ml-auto text-[10px] uppercase tracking-widest font-normal"
              style={{ color: "var(--pi-meta-color)" }}>Overview</span>
          )}
        </div>

        {/* Body */}
        <div className="p-5">
          {isEditing ? (
            <div className="space-y-4">

              {/* Name */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="name" className="text-xs uppercase tracking-wider font-semibold"
                    style={{ color: "var(--pi-label-color)" }}>
                    Full Name <span style={{ color: "var(--pi-req-star)" }}>*</span>
                  </label>
                  <CharCount value={formData.name} max={LIMITS.name} />
                </div>
                <EditInput id="name" name="name" value={formData.name} onChange={onChange}
                  maxLength={LIMITS.name} placeholder="John Doe" />
              </div>

              {/* Age + Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="age" className="text-xs uppercase tracking-wider font-semibold"
                      style={{ color: "var(--pi-label-color)" }}>
                      Age <span style={{ color: "var(--pi-req-star)" }}>*</span>
                    </label>
                    <CharCount value={formData.age} max={LIMITS.age} />
                  </div>
                  <EditInput id="age" name="age" type="number" value={formData.age} onChange={onChange}
                    min={1} max={120} placeholder="30" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="country" className="text-xs uppercase tracking-wider font-semibold"
                      style={{ color: "var(--pi-label-color)" }}>Country</label>
                    <CharCount value={formData.country} max={LIMITS.country} />
                  </div>
                  <EditInput id="country" name="country" value={formData.country} onChange={onChange}
                    maxLength={LIMITS.country} placeholder="Philippines" />
                </div>
              </div>

              {/* Affiliation */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="affiliation" className="text-xs uppercase tracking-wider font-semibold"
                    style={{ color: "var(--pi-label-color)" }}>
                    Affiliation / Organization
                  </label>
                  <CharCount value={formData.affiliation} max={LIMITS.affiliation} />
                </div>
                <EditInput id="affiliation" name="affiliation" value={formData.affiliation} onChange={onChange}
                  maxLength={LIMITS.affiliation} placeholder="Tech University / Company Name" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <InfoField icon={User2}     label="Full Name"   value={formData.name} />
              </div>
              <InfoField icon={Calendar}    label="Age"         value={formData.age ? `${formData.age} years old` : null} />
              <InfoField icon={Globe}       label="Country"     value={formData.country} />
              <div className="sm:col-span-2">
                <InfoField icon={Briefcase} label="Affiliation" value={formData.affiliation} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}