// lib/announcement-config.js
// Shared rules + helpers for the announcement form and the public card.

// ─── Schedule rules ───────────────────────────────────────────────────────────
export const APPROVAL_BUFFER_DAYS = 3 // super-admin review window
export const MIN_PROMO_DAYS = 3       // min time between promo start and hackathon start
export const MIN_EVENT_DAYS = 1       // min hackathon length
export const DAY_MS = 24 * 60 * 60 * 1000

export const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

// { h: "01".."12", m: "00".."55", p: "AM" | "PM" } + a Date -> local Date
export function toDateTime(dateObj, { h, m, p }) {
  let hour = parseInt(h, 10)
  if (p === "PM" && hour !== 12) hour += 12
  if (p === "AM" && hour === 12) hour = 0
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), hour, parseInt(m, 10), 0)
}

// Returns an error message, or null when the timeline is valid.
export function validateTimeline(promoAt, startAt, endAt, now = new Date()) {
  if (promoAt.getTime() < now.getTime() + APPROVAL_BUFFER_DAYS * DAY_MS)
    return `Promotion must begin at least ${APPROVAL_BUFFER_DAYS} days from now to leave time for super admin approval.`
  if (startAt.getTime() < promoAt.getTime() + MIN_PROMO_DAYS * DAY_MS)
    return `Leave at least ${MIN_PROMO_DAYS} days of promotion before the hackathon starts.`
  if (endAt.getTime() < startAt.getTime() + MIN_EVENT_DAYS * DAY_MS)
    return `The hackathon must run for at least ${MIN_EVENT_DAYS} day${MIN_EVENT_DAYS > 1 ? "s" : ""}.`
  return null
}

export function formatDuration(ms) {
  const hours = Math.round(ms / (60 * 60 * 1000))
  if (hours < 48) return `${hours} hour${hours === 1 ? "" : "s"}`
  const days = Math.round(ms / DAY_MS)
  return `${days} day${days === 1 ? "" : "s"}`
}

export const daysUntil = (iso) => {
  if (!iso) return 0
  const diff = new Date(iso) - new Date()
  return diff <= 0 ? 0 : Math.ceil(diff / DAY_MS)
}

// "upcoming" = approved but promotion hasn't started, "open" = promoting / registration,
// "live" = hackathon running, "ended". Rows without promo_begin (legacy) skip "upcoming".
export function getPhase(item, now = new Date()) {
  if (new Date(item.date_end) <= now) return "ended"
  if (new Date(item.date_begin) <= now) return "live"
  if (item.promo_begin && new Date(item.promo_begin) > now) return "upcoming"
  return "open"
}

// ─── Currency ─────────────────────────────────────────────────────────────────
export const CURRENCIES = [
  { code: "USD", symbol: "$",   label: "US Dollar" },
  { code: "EUR", symbol: "€",   label: "Euro" },
  { code: "GBP", symbol: "£",   label: "British Pound" },
  { code: "PHP", symbol: "₱",   label: "Philippine Peso" },
  { code: "INR", symbol: "₹",   label: "Indian Rupee" },
  { code: "JPY", symbol: "¥",   label: "Japanese Yen", decimals: 0 },
  { code: "CNY", symbol: "CN¥", label: "Chinese Yuan" },
  { code: "KRW", symbol: "₩",   label: "South Korean Won", decimals: 0 },
  { code: "SGD", symbol: "S$",  label: "Singapore Dollar" },
  { code: "AUD", symbol: "A$",  label: "Australian Dollar" },
  { code: "CAD", symbol: "C$",  label: "Canadian Dollar" },
  { code: "NZD", symbol: "NZ$", label: "New Zealand Dollar" },
  { code: "CHF", symbol: "CHF", label: "Swiss Franc" },
  { code: "AED", symbol: "AED", label: "UAE Dirham" },
  { code: "SAR", symbol: "SAR", label: "Saudi Riyal" },
  { code: "IDR", symbol: "Rp",  label: "Indonesian Rupiah", decimals: 0 },
  { code: "MYR", symbol: "RM",  label: "Malaysian Ringgit" },
  { code: "THB", symbol: "฿",   label: "Thai Baht" },
  { code: "VND", symbol: "₫",   label: "Vietnamese Dong", decimals: 0 },
  { code: "BRL", symbol: "R$",  label: "Brazilian Real" },
  { code: "MXN", symbol: "MX$", label: "Mexican Peso" },
  { code: "ZAR", symbol: "R",   label: "South African Rand" },
  { code: "NGN", symbol: "₦",   label: "Nigerian Naira" },
  { code: "KES", symbol: "KSh", label: "Kenyan Shilling" },
  { code: "TRY", symbol: "₺",   label: "Turkish Lira" },
]

export const getCurrency = (code) => CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0]

export function parseAmount(raw) {
  const n = parseFloat(String(raw ?? "").replace(/[^0-9.]/g, ""))
  return Number.isFinite(n) ? n : null
}

export function formatMoney(amount, code = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: getCurrency(code).decimals ?? 2,
    }).format(amount)
  } catch {
    return `${code} ${Number(amount).toLocaleString()}`
  }
}

// ─── Prizes ───────────────────────────────────────────────────────────────────
export const PRIZE_TYPES = {
  cash:     { label: "Cash" },
  non_cash: { label: "Item / voucher" },
}

export const CASH_TEMPLATES = [
  { name: "1st Place" }, { name: "2nd Place" }, { name: "3rd Place" },
  { name: "Best Design" }, { name: "Most Innovative" },
  { name: "Best Technical" }, { name: "People's Choice" },
]

export const ITEM_TEMPLATES = [
  { name: "Participation",  value: "Certificate" },
  { name: "Grand Prize",    value: "Laptop" },
  { name: "Gift Voucher",   value: "Gift voucher" },
  { name: "Swag Kit",       value: "Swag kit" },
  { name: "Cloud Credits",  value: "Cloud credits" },
  { name: "Mentorship",     value: "1:1 mentorship" },
]

// ─── Invite codes ─────────────────────────────────────────────────────────────
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789" // no 0/O/1/I/L

export const normalizeInviteCode = (s) => String(s ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "")
export const isValidInviteCode = (s) => {
  const n = normalizeInviteCode(s)
  return n.length >= 6 && n.length <= 16
}

export function generateInviteCode() {
  const bytes = new Uint32Array(8)
  crypto.getRandomValues(bytes)
  const s = Array.from(bytes, (n) => CODE_ALPHABET[n % CODE_ALPHABET.length]).join("")
  return `${s.slice(0, 4)}-${s.slice(4)}`
}