/**
 * blog-colors.js
 * Derives a full set of themed style tokens from an org's primary/secondary hex colors.
 * Falls back to fuchsia/purple when colors are absent or malformed.
 */

const DEFAULT_PRIMARY   = "#d946ef"   // fuchsia-500
const DEFAULT_SECONDARY = "#a855f7"   // purple-500

/** Parse "#rrggbb" → { r, g, b } or null */
function parseHex(hex) {
  if (!hex || typeof hex !== "string") return null
  const clean = hex.trim().replace(/^#/, "")
  if (clean.length !== 6) return null
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null
  return { r, g, b }
}

/** rgba helper — accepts a parsed { r, g, b } object */
function rgba({ r, g, b }, a = 1) {
  return `rgba(${r},${g},${b},${a})`
}

/**
 * buildTheme(primaryHex, secondaryHex)
 * Returns an object with ready-to-use style values and a `cssVars` object
 * intended to be spread onto a container's `style` prop.
 *
 * Usage:
 *   const theme = buildTheme(org.primary_color, org.secondary_color)
 *   <div style={theme.cssVars}>…</div>
 *   <span style={{ color: theme.primaryText }}>…</span>
 */
export function buildTheme(primaryHex, secondaryHex) {
  const p = parseHex(primaryHex)   ?? parseHex(DEFAULT_PRIMARY)
  const s = parseHex(secondaryHex) ?? parseHex(DEFAULT_SECONDARY)

  // ── raw rgba shorthands ──────────────────────────────────────────────────
  const primary5  = rgba(p, 0.05)
  const primary10 = rgba(p, 0.10)
  const primary20 = rgba(p, 0.20)
  const primary30 = rgba(p, 0.30)
  const primary60 = rgba(p, 0.60)
  const primaryFull = rgba(p, 1)

  const secondary5  = rgba(s, 0.05)
  const secondary10 = rgba(s, 0.10)
  const secondary20 = rgba(s, 0.20)
  const secondary30 = rgba(s, 0.30)
  const secondaryFull = rgba(s, 1)

  // ── CSS custom properties (spread onto a container's style) ──────────────
  const cssVars = {
    "--p":    primaryFull,
    "--s":    secondaryFull,
    "--p05":  primary5,
    "--p10":  primary10,
    "--p20":  primary20,
    "--p30":  primary30,
    "--p60":  primary60,
    "--s05":  secondary5,
    "--s10":  secondary10,
    "--s20":  secondary20,
    "--s30":  secondary30,
  }

  return {
    cssVars,

    // ── gradients ────────────────────────────────────────────────────────
    cardBg: `linear-gradient(135deg, ${primary10} 0%, ${secondary10} 50%, rgba(2,6,23,0.2) 100%)`,
    headerGradient: `linear-gradient(135deg, ${primary20} 0%, ${secondary20} 100%)`,
    buttonGradient: `linear-gradient(to right, ${primaryFull}, ${secondaryFull})`,
    buttonHoverGradient: `linear-gradient(to right, ${rgba(p,0.85)}, ${rgba(s,0.85)})`,
    textGradient: `linear-gradient(to right, ${rgba(p,0.9)}, ${rgba(s,0.9)})`,
    bottomBarGradient: `linear-gradient(to right, ${primaryFull}, ${secondaryFull}, ${primaryFull})`,
    overlayGradient: `linear-gradient(to right, ${primary5}, ${secondary10}, ${primary5})`,
    cornerGradient: `linear-gradient(to bottom-right, ${primary10}, transparent)`,

    // ── borders ──────────────────────────────────────────────────────────
    borderColor:       `1px solid ${primary30}`,
    borderColorLight:  `1px solid ${primary20}`,
    borderColorFaint:  `1px solid ${primary10}`,
    borderColorStrong: `1px solid ${rgba(p,0.6)}`,

    // ── backgrounds ──────────────────────────────────────────────────────
    badgeBgPrimary:   primary20,
    badgeBgSecondary: secondary20,
    noticeBg:         rgba({ r:245, g:158, b:11 }, 0.10),  // amber — always warn
    inputBg:          primary5,
    sectionBg:        secondary10,

    // ── text ─────────────────────────────────────────────────────────────
    primaryText:    rgba(p, 0.95),
    secondaryText:  rgba(s, 0.95),
    mutedText:      rgba(p, 0.60),
    labelText:      rgba(p, 0.85),

    // ── shadows ──────────────────────────────────────────────────────────
    buttonShadow: `0 8px 32px ${primary30}`,
    cardShadow:   `0 20px 60px ${primary20}`,
    glowShadow:   `0 0 20px ${primary20}`,

    // ── raw values (for when you need them directly) ──────────────────────
    primaryFull,
    secondaryFull,
    primary30,
    secondary30,
  }
}