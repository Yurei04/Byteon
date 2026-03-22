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
// PROVIDER 1 — Pollinations.ai
// 100% free, no API key, no signup ever.
// https://pollinations.ai
// ─────────────────────────────────────────────────────────────────────────────
async function generateWithPollinations(prompt, width, height) {
  const seed    = Math.floor(Math.random() * 999_999)
  const encoded = encodeURIComponent(prompt)
  const url     = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&model=flux&nologo=true&seed=${seed}`

  const res = await fetch(url, { signal: AbortSignal.timeout(120_000) })
  if (!res.ok) throw new Error(`Pollinations HTTP ${res.status}`)

  const contentType = res.headers.get("content-type") || "image/jpeg"
  const base64      = Buffer.from(await res.arrayBuffer()).toString("base64")
  return { dataUrl: `data:${contentType};base64,${base64}`, provider: "Pollinations.ai" }
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER 2 — Stable Horde
// Community-powered, completely free. Uses anonymous key "0000000000" by
// default so no signup is required. Can be slow on busy days (~1–3 min).
// Optional: set STABLE_HORDE_API_KEY in .env.local for priority queue.
//   Free key signup: https://stablehorde.net/register
// https://stablehorde.net/api/
// ─────────────────────────────────────────────────────────────────────────────
async function generateWithStableHorde(prompt, width, height) {
  // Clamp dimensions to Horde's 1024 max and snap to multiples of 64
  const snap = (n) => Math.min(Math.round(n / 64) * 64, 1024)
  const w    = snap(width)
  const h    = snap(height)

  const apiKey = process.env.STABLE_HORDE_API_KEY || "0000000000"

  // Step 1 — submit async job
  const submitRes = await fetch("https://stablehorde.net/api/v2/generate/async", {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey":       apiKey,
      "Client-Agent": "poster-maker:1.0",
    },
    body: JSON.stringify({
      prompt,
      params: {
        width,
        height:       h,
        steps:        25,
        cfg_scale:    7,
        sampler_name: "k_euler_a",
        n:            1,
      },
      models: ["Deliberate"],
      r2:     true,
    }),
    signal: AbortSignal.timeout(30_000),
  })

  if (!submitRes.ok) {
    throw new Error(`Stable Horde submit ${submitRes.status}: ${await submitRes.text()}`)
  }

  const { id } = await submitRes.json()
  if (!id) throw new Error("Stable Horde returned no job ID")

  // Step 2 — poll until done (max 3 min)
  const deadline = Date.now() + 180_000

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 5_000))

    const checkRes = await fetch(
      `https://stablehorde.net/api/v2/generate/check/${id}`,
      { headers: { "Client-Agent": "poster-maker:1.0" }, signal: AbortSignal.timeout(15_000) }
    )

    if (!checkRes.ok) continue
    const status = await checkRes.json()

    if (status.faulted) throw new Error("Stable Horde job faulted")
    if (!status.done)   continue

    // Step 3 — fetch completed result
    const resultRes = await fetch(
      `https://stablehorde.net/api/v2/generate/status/${id}`,
      { headers: { "Client-Agent": "poster-maker:1.0" }, signal: AbortSignal.timeout(15_000) }
    )

    if (!resultRes.ok) throw new Error(`Stable Horde result ${resultRes.status}`)

    const result   = await resultRes.json()
    const imageUrl = result.generations?.[0]?.img
    if (!imageUrl)  throw new Error("Stable Horde returned no image URL")

    const imgRes      = await fetch(imageUrl, { signal: AbortSignal.timeout(30_000) })
    const contentType = imgRes.headers.get("content-type") || "image/webp"
    const base64      = Buffer.from(await imgRes.arrayBuffer()).toString("base64")
    return { dataUrl: `data:${contentType};base64,${base64}`, provider: "Stable Horde" }
  }

  throw new Error("Stable Horde timed out after 3 minutes")
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER 3 — HuggingFace Inference API
// Free API key — create at https://huggingface.co/settings/tokens
// No credit card required, ever.
// Set HUGGINGFACE_API_KEY in .env.local to enable.
// ─────────────────────────────────────────────────────────────────────────────
const HF_API_URL =
  "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell"

async function generateWithHuggingFace(prompt, width, height) {
  if (!process.env.HUGGINGFACE_API_KEY) throw new Error("HUGGINGFACE_API_KEY not set")

  let imgRes
  const maxAttempts = 3

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    imgRes = await fetch(HF_API_URL, {
      method:  "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        inputs:     prompt,
        parameters: { width, height, num_inference_steps: 4, guidance_scale: 0.0 },
      }),
      signal: AbortSignal.timeout(120_000),
    })

    if (imgRes.status === 503) {
      const errBody = await imgRes.json().catch(() => ({}))
      const waitMs  = errBody?.estimated_time
        ? Math.ceil(errBody.estimated_time) * 1000
        : 20_000
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, Math.min(waitMs, 30_000)))
        continue
      }
      throw new Error("HuggingFace model still warming up — try again in 30 s")
    }

    if (imgRes.ok) break

    const errText = await imgRes.text()
    if (attempt >= maxAttempts) throw new Error(`HuggingFace ${imgRes.status}: ${errText}`)
    await new Promise((r) => setTimeout(r, 5_000))
  }

  if (!imgRes?.ok) throw new Error("HuggingFace failed after retries")

  const contentType = imgRes.headers.get("content-type") || "image/jpeg"
  const base64      = Buffer.from(await imgRes.arrayBuffer()).toString("base64")
  return { dataUrl: `data:${contentType};base64,${base64}`, provider: "HuggingFace" }
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback chain — tries each free provider in order
// ─────────────────────────────────────────────────────────────────────────────
async function generateImage(prompt, width, height) {
  const providers = [
    { name: "Pollinations.ai", fn: () => generateWithPollinations(prompt, width, height) },
    { name: "Stable Horde",    fn: () => generateWithStableHorde(prompt, width, height)  },
    { name: "HuggingFace",     fn: () => generateWithHuggingFace(prompt, width, height)  },
  ]

  const errors = []

  for (const { name, fn } of providers) {
    try {
      console.log(`[generate-poster] Trying: ${name}`)
      const result = await fn()
      console.log(`[generate-poster] Success via ${name}`)
      return result
    } catch (err) {
      console.warn(`[generate-poster] ${name} failed:`, err.message)
      errors.push(`${name}: ${err.message}`)
    }
  }

  throw new Error(`All providers failed.\n${errors.join("\n")}`)
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

    const body              = await req.json()
    const { aspectRatio }   = body
    const { width, height } = DIMENSIONS[aspectRatio] ?? DIMENSIONS["2:3"]
    const prompt            = buildPrompt(body)

    const { data: org } = await supabase
      .from("organizations")
      .select("id, name")
      .eq("user_id", session.user.id)
      .single()

    const { dataUrl, provider } = await generateImage(prompt, width, height)

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
        { error: "Generation timed out — the service is busy, try again in 30 seconds." },
        { status: 504 }
      )
    }

    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}