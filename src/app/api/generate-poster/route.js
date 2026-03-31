// app/api/generate-poster/route.js
import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// ── Dimension map ──────────────────────────────────────────────────────────────
const DIMENSIONS = {
  "1:1":  { width: 1024, height: 1024 },
  "2:3":  { width: 832,  height: 1216 },
  "3:4":  { width: 896,  height: 1152 },
  "4:5":  { width: 896,  height: 1120 },
  "16:9": { width: 1344, height: 768  },
  "9:16": { width: 768,  height: 1344 },
}

// ── Prompt builder ─────────────────────────────────────────────────────────────
function buildPrompt({
  title, subtitle, description, style, mood,
  colorScheme, titlePlacement, backgroundType, fontStyle, extraDetails,
}) {
  const placementMap = {
    "top-left":      "text at the top-left corner",
    "top-center":    "text at the top center",
    "top-right":     "text at the top-right corner",
    "middle-left":   "text on the left side",
    "center":        "text centered in the middle",
    "middle-right":  "text on the right side",
    "bottom-left":   "text at the bottom-left corner",
    "bottom-center": "text at the bottom center",
    "bottom-right":  "text at the bottom-right corner",
  }

  return [
    `A professional high-quality ${style} poster design`,
    title        ? `with the main title "${title}" in large prominent ${fontStyle} typography` : "",
    subtitle     ? `and subtitle "${subtitle}" in smaller text below` : "",
    placementMap[titlePlacement] ?? "",
    `${mood} atmosphere and mood`,
    `${colorScheme} color palette`,
    `${backgroundType} background`,
    description  ? `Concept: ${description}` : "",
    extraDetails ?? "",
    "print-ready poster, professional graphic design, highly detailed, sharp, cinematic composition, visually striking",
  ].filter(Boolean).join(", ")
}

// ─────────────────────────────────────────────────────────────────────────────
// Google Gemini (Imagen 3)
// Free tier: 1,500 req/day — get key at https://aistudio.google.com
// No credit card required. Set GEMINI_API_KEY in .env.local to enable.
// Supported aspect ratios: 1:1, 3:4, 4:3, 9:16, 16:9
// ─────────────────────────────────────────────────────────────────────────────
const GEMINI_ASPECT_MAP = {
  "1:1":  "1:1",
  "2:3":  "9:16",
  "3:4":  "3:4",
  "4:5":  "9:16",
  "16:9": "16:9",
  "9:16": "9:16",
}

async function generateImage(prompt, aspectRatio) {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set")

  const ratio = GEMINI_ASPECT_MAP[aspectRatio] ?? "1:1"
  const url   = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${process.env.GEMINI_API_KEY}`

  const res = await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances:  [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio: ratio },
    }),
    signal: AbortSignal.timeout(60_000),
  })

  if (!res.ok) throw new Error(`Gemini Imagen ${res.status}: ${await res.text()}`)

  const json = await res.json()
  const b64  = json.predictions?.[0]?.bytesBase64Encoded
  if (!b64) throw new Error("Gemini returned no image data")

  const mime = json.predictions?.[0]?.mimeType ?? "image/png"
  return { dataUrl: `data:${mime};base64,${b64}`, provider: "Google Gemini" }
}

// ─────────────────────────────────────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll()             { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          } catch {}
        },
      },
    }
  )

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body            = await req.json()
    const { aspectRatio } = body
    const prompt          = buildPrompt(body)

    const { data: org } = await supabase
      .from("organizations")
      .select("id, name")
      .eq("user_id", session.user.id)
      .single()

    const { dataUrl, provider } = await generateImage(prompt, aspectRatio)

    if (org) {
      const { error: insertError } = await supabase
        .from("generated_posters")
        .insert({
          org_id:          org.id,
          user_id:         session.user.id,
          title:           body.title           || null,
          subtitle:        body.subtitle        || null,
          description:     body.description     || null,
          image_url:       dataUrl,
          prompt,
          style:           body.style,
          mood:            body.mood,
          color_scheme:    body.colorScheme,
          background_type: body.backgroundType,
          aspect_ratio:    aspectRatio,
          font_style:      body.fontStyle,
          title_placement: body.titlePlacement,
          extra_details:   body.extraDetails    || null,
          form_data:       body,
        })

      if (insertError) console.error("[generate-poster] DB insert error:", insertError)
    }

    return NextResponse.json({ image: dataUrl, prompt, provider })

  } catch (err) {
    console.error("[generate-poster] Fatal error:", err)

    if (err.name === "TimeoutError") {
      return NextResponse.json(
        { error: "Generation timed out — try again in 30 seconds." },
        { status: 504 }
      )
    }

    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}