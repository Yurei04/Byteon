import { Building2 } from "lucide-react"

const LIMITS = {
  name:          80,
  description:   500,
  author_name:   100,
  contact_email: 100,
}

function darken(hex, amount = 80) {
  if (!hex || hex.length < 7) return hex
  const n = parseInt(hex.replace("#", ""), 16)
  const r = Math.max(0, (n >> 16)         - amount)
  const g = Math.max(0, ((n >> 8) & 0xff) - amount)
  const b = Math.max(0, (n & 0xff)        - amount)
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, "0")).join("")}`
}

function CharCount({ value = "", max, accentColor }) {
  const len  = value.length
  const near = len >= max * 0.85
  return (
    <span style={{ color: near ? "#b45309" : accentColor + "70" }} className="text-xs tabular-nums">
      {len}/{max}
    </span>
  )
}

export default function OrgAboutSection({
  formData,
  isEditing,
  onChange,
  primaryC,
  secondaryC,
  uiT,
  isDark = true,
}) {
  // ── Derive all colors based on mode ──────────────────────────────────────
  // Light: push brand color dark enough to read on white
  // Dark:  keep brand color vibrant
  const brandText    = isDark ? primaryC            : darken(primaryC, 100)
  const brandLabel   = isDark ? `${primaryC}cc`     : darken(primaryC, 80)
  const brandMuted   = isDark ? `${primaryC}70`     : darken(primaryC, 60) + "99"
  const brandSecond  = isDark ? secondaryC          : darken(secondaryC, 90)
  const brandFocus   = isDark ? primaryC            : darken(primaryC, 60)

  // Surfaces — light mode is fully white-based, no gray tints
  const cardBg       = isDark ? (uiT?.cardBg ?? "rgba(0,0,0,0.25)") : "#ffffff"
  const rowBg        = isDark ? "rgba(255,255,255,0.04)"             : "#ffffff"
  const rowBorder    = isDark ? `${primaryC}18`                      : `${brandText}15`
  const inputBg      = isDark ? `${primaryC}10`                      : "#ffffff"
  const inputBorder  = isDark ? `${primaryC}45`                      : `${brandText}40`
  const inputText    = isDark ? "#ffffff"                            : darken(primaryC, 110)
  const cardBorder   = isDark ? `${primaryC}40`                      : `${brandText}25`
  const headerBorder = isDark ? `${primaryC}20`                      : `${brandText}15`

  const fieldStyle = {
    width:        "100%",
    background:   inputBg,
    border:       `1px solid ${inputBorder}`,
    borderRadius: 10,
    padding:      "8px 12px",
    fontSize:     14,
    color:        inputText,
    outline:      "none",
    transition:   "border-color 0.2s, box-shadow 0.2s",
    boxSizing:    "border-box",
  }

  const onFocus = e => {
    e.target.style.borderColor = brandFocus
    e.target.style.boxShadow   = `0 0 0 3px ${primaryC}20`
  }
  const onBlur = e => {
    e.target.style.borderColor = inputBorder
    e.target.style.boxShadow   = "none"
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: cardBg,
        border:     `1px solid ${cardBorder}`,
        boxShadow:  isDark
          ? `0 8px 24px ${primaryC}14`
          : `0 2px 12px rgba(0,0,0,0.06)`,
        transition: "background 0.25s ease, border-color 0.25s ease",
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center gap-2.5 px-6 py-4"
        style={{ borderBottom: `1px solid ${headerBorder}` }}
      >
        <span
          className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0"
          style={{
            background: isDark ? `${primaryC}18` : `${brandText}12`,
            border:     `1px solid ${isDark ? `${primaryC}35` : `${brandText}25`}`,
          }}
        >
          <Building2 className="w-4 h-4" style={{ color: isDark ? primaryC : brandText }} />
        </span>
        <h3 className="text-base font-semibold" style={{ color: isDark ? "#ffffff" : brandText }}>
          About Organization
        </h3>
      </div>

      {/* ── Body ── */}
      <div className="px-6 py-5 space-y-5">
        {isEditing ? (
          <>
            {/* Name */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold" style={{ color: brandLabel }}>
                  Organization Name <span style={{ color: isDark ? "#f87171" : "#dc2626" }}>*</span>
                </label>
                <CharCount value={formData.name || ""} max={LIMITS.name} accentColor={primaryC} />
              </div>
              <input
                name="name"
                value={formData.name || ""}
                onChange={onChange}
                maxLength={LIMITS.name}
                placeholder="Your Organization"
                style={fieldStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold" style={{ color: brandLabel }}>
                  Description <span style={{ color: isDark ? "#f87171" : "#dc2626" }}>*</span>
                </label>
                <CharCount value={formData.description || ""} max={LIMITS.description} accentColor={primaryC} />
              </div>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={onChange}
                maxLength={LIMITS.description}
                placeholder="Describe your organization…"
                rows={5}
                style={{ ...fieldStyle, resize: "none", lineHeight: 1.6 }}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            {/* Contact person */}
            <div className="space-y-3">
              <label className="text-xs font-semibold block" style={{ color: brandLabel }}>
                Contact Person <span style={{ color: isDark ? "#f87171" : "#dc2626" }}>*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px]" style={{ color: brandMuted }}>First Name</label>
                    <CharCount value={formData.author_first_name || ""} max={LIMITS.author_name / 2} accentColor={primaryC} />
                  </div>
                  <input
                    name="author_first_name"
                    value={formData.author_first_name || ""}
                    onChange={onChange}
                    maxLength={LIMITS.author_name / 2}
                    placeholder="Jane"
                    style={fieldStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px]" style={{ color: brandMuted }}>Last Name</label>
                    <CharCount value={formData.author_last_name || ""} max={LIMITS.author_name / 2} accentColor={primaryC} />
                  </div>
                  <input
                    name="author_last_name"
                    value={formData.author_last_name || ""}
                    onChange={onChange}
                    maxLength={LIMITS.author_name / 2}
                    placeholder="Smith"
                    style={fieldStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold" style={{ color: brandLabel }}>
                    Contact Email <span style={{ color: isDark ? "#f87171" : "#dc2626" }}>*</span>
                  </label>
                  <CharCount value={formData.contact_email || ""} max={LIMITS.contact_email} accentColor={primaryC} />
                </div>
                <input
                  name="contact_email"
                  type="email"
                  value={formData.contact_email || ""}
                  onChange={onChange}
                  maxLength={LIMITS.contact_email}
                  placeholder="admin@example.com"
                  style={fieldStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
            </div>

            {/* Active toggle */}
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: rowBg, border: `1px solid ${rowBorder}` }}
            >
              <input
                id="active"
                name="active"
                type="checkbox"
                checked={formData.active}
                onChange={onChange}
                className="h-4 w-4 rounded cursor-pointer"
                style={{ accentColor: brandSecond }}
              />
              <label htmlFor="active" className="cursor-pointer text-sm flex-1" style={{ color: brandText }}>
                Organization is Active
              </label>
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  background: formData.active ? `${brandSecond}20` : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"),
                  color:      formData.active ? brandSecond         : brandMuted,
                  border:     `1px solid ${formData.active ? `${brandSecond}40` : rowBorder}`,
                }}
              >
                {formData.active ? "● Active" : "○ Inactive"}
              </span>
            </div>
          </>
        ) : (
          /* ── View mode ── */
          <div className="space-y-2">
            {[
              { label: "Organization Name", value: formData.name        || "No name provided"        },
              { label: "Description",       value: formData.description || "No description provided", multiline: true },
              {
                label: "Contact Person",
                value: formData.author_first_name || formData.author_last_name
                  ? `${formData.author_first_name || ""} ${formData.author_last_name || ""}`.trim()
                  : formData.author_name || "Not specified",
              },
              { label: "Contact Email", value: formData.contact_email || "Not specified" },
            ].map(({ label, value, multiline }) => (
              <div
                key={label}
                className="px-4 py-3 rounded-xl"
                style={{
                  background: rowBg,
                  border:     `1px solid ${rowBorder}`,
                }}
              >
                <p className="text-[10px] uppercase tracking-widest mb-1 font-semibold" style={{ color: brandMuted }}>
                  {label}
                </p>
                <p
                  className={`text-sm leading-relaxed ${multiline ? "whitespace-pre-wrap" : ""}`}
                  style={{ color: brandText }}
                >
                  {value}
                </p>
              </div>
            ))}

            {/* Status */}
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: rowBg, border: `1px solid ${rowBorder}` }}
            >
              <p className="text-[10px] uppercase tracking-widest font-semibold flex-1" style={{ color: brandMuted }}>
                Status
              </p>
              <span
                className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{
                  background: formData.active ? `${brandSecond}20` : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"),
                  color:      formData.active ? brandSecond         : brandMuted,
                  border:     `1px solid ${formData.active ? `${brandSecond}40` : rowBorder}`,
                }}
              >
                {formData.active ? "● Active" : "○ Inactive"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}