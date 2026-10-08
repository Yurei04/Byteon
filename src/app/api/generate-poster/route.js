export const maxDuration = 60
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import OpenAI, { toFile } from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// "medium" is much faster than "high". Switch to "high" if you can afford the wait.
const QUALITY = "medium"

const SIZE_MAP = {
  "1:1": "1024x1024", "2:3": "1024x1536", "3:4": "1024x1536",
  "4:5": "1024x1536", "16:9": "1536x1024", "9:16": "1024x1536",
}

const LOGO_POS = {
  "top-left": "top-left corner", "top-right": "top-right corner",
  "bottom-left": "bottom-left corner", "bottom-right": "bottom-right corner",
  "bottom-center": "bottom center",
}

const STRICT =
  "STRICT RULE: Only include text and details explicitly listed. Do NOT invent or add any names, dates, logos, sponsors, prizes, or other information not provided."

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// "2026-10-12" -> "Oct 12, 2026". Parsed manually to avoid timezone shifts from new Date().
function formatDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "")
  if (!m) return iso
  return `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`
}

function buildPrompt(b) {
  const l = [`Generate a professional hackathon event poster.`, `Title: "${b.eventName}" in large bold typography.`]
  if (b.description) l.push(`Tagline: "${b.description}".`)
  if (b.prize) l.push(`Prize: ${b.prize}.`)
  if (b.startDate && b.endDate) l.push(`Date: ${formatDate(b.startDate)} to ${formatDate(b.endDate)}.`)
  else if (b.startDate) l.push(`Date: ${formatDate(b.startDate)}.`)
  if (b.venue) l.push(`Venue: ${b.venue}.`)
  if (b.style) l.push(`Visual style: ${b.style}.`)
  if (b.mood) l.push(`Mood: ${b.mood}.`)
  if (b.theme) l.push(`Color scheme: ${b.theme}.`)
  if (b.backgroundType) l.push(`Background: ${b.backgroundType}.`)
  if (b.fontStyle) l.push(`Typography: ${b.fontStyle}.`)
  if (b.titlePlacement) l.push(`Place the title at the ${b.titlePlacement.replace("-", " ")} of the poster.`)
  if (b.extraDetails) l.push(`Additional direction: ${b.extraDetails}.`)
  if (b.logo) {
    l.push(
      `The attached image is the organizer's logo. Place it in the ${LOGO_POS[b.logoPosition] ?? "top-left corner"} at a modest size. Reproduce it exactly: do not redraw, recolor, crop, or alter it.`
    )
  }
  l.push(`High quality graphic design, no faces.`, STRICT)
  return l.join(" ")
}

const buildModifyPrompt = (instruction, hasLogo) =>
  [
    `Edit the attached poster with ONLY this minor change: ${instruction}.`,
    `Keep everything else identical: layout, all text, spelling, colors, and composition.`,
    hasLogo ? `The second attached image is the logo; keep it exactly as is.` : "",
    STRICT,
  ].filter(Boolean).join(" ")

async function dataUrlToFile(dataUrl, name) {
  const m = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(dataUrl || "")
  if (!m) throw new Error("Invalid image data")
  return toFile(Buffer.from(m[2], "base64"), name, { type: m[1] })
}

async function urlToFile(src, name) {
  if (src.startsWith("data:")) return dataUrlToFile(src, name)
  const res = await fetch(src)
  if (!res.ok) throw new Error("Could not load base poster")
  return toFile(Buffer.from(await res.arrayBuffer()), name, {
    type: res.headers.get("content-type") || "image/png",
  })
}

function toDataUrls(response) {
  const images = (response.data ?? [])
    .map((d) => d.b64_json)
    .filter(Boolean)
    .map((b64) => `data:image/png;base64,${b64}`)
  if (!images.length) throw new Error("No image data returned from OpenAI")
  return images
}

// Generates only. Nothing is saved here: the client bookmarks via /api/poster-history.
export async function POST(req) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  try {
    const authHeader = req.headers.get("authorization") || ""
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { logo, baseImage, instruction } = body

    let prompt, response

    if (baseImage) {
      // ---- Tweak: edit a poster the client already has ----
      if (!instruction?.trim()) return NextResponse.json({ error: "Describe the change you want" }, { status: 400 })

      const files = [await urlToFile(baseImage, "poster.png")]
      if (logo) files.push(await dataUrlToFile(logo, "logo.png"))

      prompt = buildModifyPrompt(instruction.trim(), !!logo)
      response = await openai.images.edit({
        model: "gpt-image-1", image: files, prompt,
        size: SIZE_MAP[body.ratio] ?? "1024x1536",
        quality: QUALITY, input_fidelity: "high", n: 1,
      })
    } else {
      // ---- Generate new posters (count 1 = regenerate a single one) ----
      if (!body.eventName?.trim()) return NextResponse.json({ error: "Event name is required" }, { status: 400 })

      const n = Math.min(3, Math.max(1, Number(body.count) || 3))
      prompt = buildPrompt(body)
      const size = SIZE_MAP[body.ratio] ?? "1024x1536"
      response = logo
        ? await openai.images.edit({
            model: "gpt-image-1", image: [await dataUrlToFile(logo, "logo.png")],
            prompt, size, quality: QUALITY, input_fidelity: "high", n,
          })
        : await openai.images.generate({ model: "gpt-image-1", prompt, size, quality: QUALITY, n })
    }

    return NextResponse.json({ images: toDataUrls(response), prompt })
  } catch (err) {
    console.error("DETAILED_ERROR_LOG:", err)
    return NextResponse.json({ error: err?.message || "Failed to generate poster" }, { status: 500 })
  }
}