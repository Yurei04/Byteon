// app/api/generate-poster/route.js

export const maxDuration = 60
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// ── Dimension map ─────────────────────────────────────────────
// All values are within Leonardo's 512–1536 px supported range
const DIMENSIONS = {
  "1:1":  { width: 1024, height: 1024 },
  "2:3":  { width: 832,  height: 1216 },
  "3:4":  { width: 896,  height: 1152 },
  "4:5":  { width: 896,  height: 1120 },
  "16:9": { width: 1344, height: 768  },
  "9:16": { width: 768,  height: 1344 },
}

// ── Negative prompt (applied to ALL generations) ──────────────
const NEGATIVE_PROMPT = [
  "blurry", "low quality", "noise", "grain", "artifact", "jpeg compression",
  "overexposed", "underexposed", "distorted",
  "face", "person", "human", "crowd", "portrait",
].join(", ")

// ── Prompt builder ─────────────────────────────────────────────
function buildPrompt({
  // ── Visual / style fields ──
  style,
  mood,
  colorScheme,
  backgroundType,
  fontStyle,
  extraDetails,
  titlePlacement,
  aspectRatio,

  // ── Text / content fields (shown on poster) ──
  title,          // eventName
  subtitle,       // tagline
  description,    // assembled compact line (date · venue · prize · organizer)
  eventDate,
  venue,
  prizePool,
  organizer,
  showDate,
  showVenue,
  showPrize,
}) {
  // ─── Style → description ──────────────────────────────────────
  const styleMap = {
    "minimalist":      "clean minimalist poster background with generous whitespace and subtle composition",
    "vintage retro":   "vintage retro poster background with aged paper textures and warm distressed tones",
    "modern bold":     "modern bold graphic design background with strong geometric shapes and high contrast",
    "illustrated":     "hand-illustrated editorial art background with detailed linework",
    "photorealistic":  "photorealistic high-detail environmental background",
    "abstract":        "abstract graphic background with flowing organic shapes and color fields",
    "art nouveau":     "art nouveau decorative background with organic flowing botanical lines and ornate borders",
    "brutalist":       "brutalist raw graphic background with stark geometric slabs and raw concrete tones",
    "cinematic":       "cinematic wide-angle environmental background with dramatic volumetric lighting",
  }

  const moodMap = {
    "energetic and exciting": "high-energy, vibrant, dynamic atmosphere with bold contrast",
    "calm and peaceful":      "calm, serene, soft light atmosphere with gentle transitions",
    "dramatic and intense":   "dramatic, intense, high-contrast atmosphere with deep shadows",
    "playful and fun":        "playful, fun, lighthearted atmosphere with bright cheerful tones",
    "elegant and luxurious":  "elegant, luxurious, refined atmosphere with rich textures",
    "mysterious and dark":    "mysterious, moody, atmospheric darkness with subtle depth",
  }

  const bgMap = {
    "gradient":     "smooth multi-stop color gradient background",
    "solid color":  "flat solid color background with subtle vignette",
    "textured":     "subtle tactile textured surface — linen, paper, or concrete",
    "bokeh":        "soft out-of-focus bokeh light orbs on dark background",
    "geometric":    "repeating geometric shapes and angular pattern background",
    "nature photo": "natural landscape environmental photo background",
    "urban":        "urban architecture and cityscape background",
    "abstract art": "abstract painted art background with brushstroke texture",
    "space galaxy": "deep space galaxy with nebula, stars, and cosmic dust",
  }

  const fontAtmosphereMap = {
    "serif elegant":      "refined and classical atmosphere",
    "sans-serif modern":  "clean contemporary atmosphere",
    "display bold":       "bold impactful atmosphere",
    "handwritten script": "organic hand-crafted atmosphere",
    "monospace":          "technical digital atmosphere",
    "condensed tall":     "tall structured atmospheric composition",
  }

  const placementMap = {
    "top-left":      "text elements anchored to the upper-left",
    "top-center":    "text elements centered at the top",
    "top-right":     "text elements anchored to the upper-right",
    "middle-left":   "text elements aligned to the left middle",
    "center":        "text elements centered on the poster",
    "middle-right":  "text elements aligned to the right middle",
    "bottom-left":   "text elements anchored to the lower-left",
    "bottom-center": "text elements centered at the bottom",
    "bottom-right":  "text elements anchored to the lower-right",
  }

  // ── Section 1: TEXT ──────────────────────────────────────────────
  // Kept intentionally terse — every char here eats into the 1,400 limit.
  const textLines = []
  if (title)                  textLines.push(`Title: "${title}"`)
  if (subtitle)               textLines.push(`Tagline: "${subtitle}"`)
  if (showDate  && eventDate) textLines.push(`Date: "${eventDate}"`)
  if (showVenue && venue)     textLines.push(`Venue: "${venue}"`)
  if (showPrize && prizePool) textLines.push(`Prize: "${prizePool}"`)
  if (organizer)              textLines.push(`By: "${organizer}"`)

  const textSection = textLines.length > 0
    ? `[TEXT — TOP PRIORITY]\nEvent poster. Render verbatim, no changes:\n${textLines.join("\n")}\nZone: ${placementMap[titlePlacement] ?? titlePlacement}.`
    : description
      ? `[TEXT — TOP PRIORITY]\nEvent poster. Render verbatim:\n"${description}"\nZone: ${placementMap[titlePlacement] ?? titlePlacement}.`
      : ""

  // ── Section 2: DESIGN ────────────────────────────────────────────
  const designLines = [
    `Style: ${styleMap[style] ?? style}.`,
    `Mood: ${moodMap[mood] ?? mood}.`,
    `Colors: ${colorScheme}.`,
    `BG: ${bgMap[backgroundType] ?? backgroundType}.`,
    fontStyle    ? `Font feel: ${fontAtmosphereMap[fontStyle] ?? fontStyle}.` : "",
    aspectRatio  ? `Ratio: ${aspectRatio}.`                                   : "",
    extraDetails ? `Extra: ${extraDetails}.`                                   : "",
  ].filter(Boolean)

  const designSection = `[DESIGN]\n${designLines.join(" ")}`

  // ── Section 3: CONSTRAINTS ───────────────────────────────────────
  const constraintSection = [
    "[RULES]",
    "1. Text verbatim — no invented, rephrased, or missing words.",
    "2. No extra text beyond what is listed above.",
    "3. All text legible — high contrast, unobstructed.",
    "4. Clear space in the text zone — no busy visuals behind text.",
    "5. No people or faces.",
    "6. Sharp, clean render — no blur or noise.",
  ].join("\n")

  // ── Assemble & enforce the 1,400-char hard cap ───────────────────
  const full = [textSection, designSection, constraintSection]
    .filter(Boolean)
    .join("\n\n")

  // Truncate from the DESIGN section tail if over limit — never cut TEXT or RULES
  if (full.length <= 1400) return full

  const textAndRules = [textSection, constraintSection].filter(Boolean).join("\n\n")
  const designBudget = 1400 - textAndRules.length - 2 // -2 for the joining "\n\n"
  const trimmedDesign = designSection.slice(0, Math.max(0, designBudget))
  return [textSection, trimmedDesign, constraintSection].filter(Boolean).join("\n\n")
}

// ─────────────────────────────────────────────────────────────
// LEONARDO AI
// ─────────────────────────────────────────────────────────────

const LEONARDO_API_URL = "https://cloud.leonardo.ai/api/rest/v1/generations"

const LEONARDO_MODEL_ID = "ac614f96-1082-45bf-be9d-757f2d31c174"

async function generateWithLeonardo(prompt, width, height) {
  if (!process.env.LEONARDO_API_KEY) {
    throw new Error("LEONARDO_API_KEY is not set in environment variables")
  }

  const clamp = (v) => Math.min(1536, Math.max(512, Math.round(v / 8) * 8))
  const w = clamp(width)
  const h = clamp(height)

  let lastError

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`[Leonardo] Attempt ${attempt}: ${w}×${h}`)

      const res = await fetch(LEONARDO_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.LEONARDO_API_KEY}`,
        },
        body: JSON.stringify({
          prompt,
          negative_prompt: NEGATIVE_PROMPT,
          width:  w,
          height: h,
          num_images: 1,
          modelId: LEONARDO_MODEL_ID,
          guidance_scale: 7,
          num_inference_steps: 30,
          presetStyle: "DYNAMIC",
          public: false,
        }),
        signal: AbortSignal.timeout(30_000),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Leonardo submission failed (${res.status}): ${errText}`)
      }

      const data = await res.json()
      const generationId = data?.sdGenerationJob?.generationId

      if (!generationId) {
        throw new Error("Leonardo did not return a generationId")
      }

      console.log(`[Leonardo] Generation ID: ${generationId}`)

      for (let poll = 0; poll < 30; poll++) {
        await new Promise((r) => setTimeout(r, 3000))

        const pollRes = await fetch(
          `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
          {
            headers: { Authorization: `Bearer ${process.env.LEONARDO_API_KEY}` },
            signal: AbortSignal.timeout(10_000),
          }
        )

        if (!pollRes.ok) continue

        const pollData = await pollRes.json()
        const status   = pollData?.generations_by_pk?.status
        const images   = pollData?.generations_by_pk?.generated_images

        console.log(`[Leonardo] Poll ${poll + 1}: status=${status}, images=${images?.length ?? 0}`)

        if (images && images.length > 0) {
          const imageUrl = images[0].url

          const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(20_000) })
          if (!imgRes.ok) throw new Error(`Failed to fetch generated image: ${imgRes.status}`)

          const buffer = await imgRes.arrayBuffer()
          const base64 = Buffer.from(buffer).toString("base64")

          return {
            dataUrl:  `data:image/jpeg;base64,${base64}`,
            provider: "Leonardo AI",
          }
        }

        if (status === "FAILED") {
          throw new Error("Leonardo generation job FAILED")
        }
      }

      throw new Error("Leonardo generation timed out after 90 s of polling")

    } catch (err) {
      lastError = err
      console.warn(`[Leonardo] Attempt ${attempt} failed: ${err.message}`)
      if (attempt < 3) await new Promise((r) => setTimeout(r, 5000))
    }
  }

  throw new Error(`Leonardo AI failed after 3 attempts: ${lastError?.message ?? "unknown error"}`)
}

// ─────────────────────────────────────────────────────────────
// ROUTE HANDLER
// ─────────────────────────────────────────────────────────────

export async function POST(req) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll()                { return cookieStore.getAll() },
        setAll(cookiesToSet)    {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
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

    const body = await req.json()
    const { aspectRatio } = body

    const { width, height } = DIMENSIONS[aspectRatio] ?? DIMENSIONS["2:3"]

    // Pass the full body — buildPrompt now uses all fields
    const prompt = buildPrompt(body)

    console.log("[generate-poster] Prompt:", prompt)

    const { data: org } = await supabase
      .from("organizations")
      .select("id, name")
      .eq("user_id", session.user.id)
      .single()

    const { dataUrl, provider } = await generateWithLeonardo(prompt, width, height)

    if (org) {
      await supabase.from("generated_posters").insert({
        org_id:           org.id,
        user_id:          session.user.id,
        title:            body.title            || null,
        subtitle:         body.subtitle         || null,
        description:      body.description      || null,
        image_url:        dataUrl,
        prompt,
        negative_prompt:  NEGATIVE_PROMPT,
        style:            body.style,
        mood:             body.mood,
        color_scheme:     body.colorScheme,
        background_type:  body.backgroundType,
        aspect_ratio:     aspectRatio,
        font_style:       body.fontStyle,
        title_placement:  body.titlePlacement,
        extra_details:    body.extraDetails     || null,
        form_data:        body,
      })
    }

    return NextResponse.json({ image: dataUrl, prompt, provider })

  } catch (err) {
    console.error("[generate-poster] Error:", err)

    if (err.name === "TimeoutError" || err.name === "AbortError") {
      return NextResponse.json(
        { error: "Image generation timed out. Please try again." },
        { status: 504 }
      )
    }

    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}