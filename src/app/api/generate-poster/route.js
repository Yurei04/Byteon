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
  // quality
  "blurry", "low quality", "noise", "grain", "artifact", "jpeg compression",
  "overexposed", "underexposed", "distorted",
  // people
  "face", "person", "human", "crowd", "portrait",
  // text killers — backgrounds that compete with or obscure text
  "busy background", "cluttered background", "complex pattern behind text",
  "text obscured", "illegible text", "missing text", "wrong text",
  "extra text", "invented text", "placeholder text", "lorem ipsum",
  "text cut off", "text overlapping", "low contrast text",
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
  // NOTE: All style descriptions now explicitly frame the design as a BACKGROUND
  // that supports and frames the text — never as the main subject.
  const styleMap = {
    "minimalist":      "clean minimalist background with generous whitespace, subtle composition, and a dedicated open zone for text to breathe",
    "vintage retro":   "vintage retro background with aged paper textures and warm distressed tones — pushed to the edges so center text is clear",
    "modern bold":     "modern bold graphic background with strong geometric shapes at the margins, keeping the text zone uncluttered",
    "illustrated":     "hand-illustrated editorial art background with detailed linework along the borders, leaving the text area clean",
    "photorealistic":  "photorealistic environmental background blurred and darkened behind the text zone for maximum legibility",
    "abstract":        "abstract graphic background with flowing shapes and color fields fading behind where the text sits",
    "art nouveau":     "art nouveau decorative border-frame background with botanical lines and ornate edges framing clear inner text space",
    "brutalist":       "brutalist raw graphic background with geometric slabs at periphery, open zone reserved for the text block",
    "cinematic":       "cinematic wide-angle environmental background with dramatic lighting, vignette darkening the text zone for contrast",
  }

  const moodMap = {
    "energetic and exciting": "high-energy, vibrant, dynamic atmosphere with bold contrast — background only",
    "calm and peaceful":      "calm, serene, soft-light atmosphere with gentle transitions — background only",
    "dramatic and intense":   "dramatic, high-contrast atmosphere with deep shadows framing text — background only",
    "playful and fun":        "playful, lighthearted atmosphere with bright tones around the text zone — background only",
    "elegant and luxurious":  "elegant, luxurious atmosphere with rich textures receding behind text — background only",
    "mysterious and dark":    "mysterious, moody darkness with subtle depth pushed to the edges — background only",
  }

  const bgMap = {
    "gradient":     "smooth multi-stop color gradient, lighter or more neutral where text sits",
    "solid color":  "flat solid color background with subtle vignette at edges",
    "textured":     "subtle tactile texture — linen, paper, or concrete — fading behind the text area",
    "bokeh":        "soft out-of-focus bokeh light orbs, darkened or subdued behind text for contrast",
    "geometric":    "repeating geometric pattern pushed to borders, clear zone where text lives",
    "nature photo": "natural landscape photo, blurred and exposure-adjusted behind text for legibility",
    "urban":        "urban cityscape background, treated so text reads cleanly over it",
    "abstract art": "abstract painted brushstroke background, muted behind the text zone",
    "space galaxy": "deep space nebula background, darkened in the text area so text stands out",
  }

  const fontAtmosphereMap = {
    "serif elegant":      "classical typography feel",
    "sans-serif modern":  "clean contemporary type feel",
    "display bold":       "bold impactful type feel",
    "handwritten script": "organic hand-crafted type feel",
    "monospace":          "technical digital type feel",
    "condensed tall":     "tall structured type feel",
  }

  const placementMap = {
    "top-left":      "upper-left quadrant — keep that area uncluttered with high contrast",
    "top-center":    "upper-center — keep that horizontal band clear with strong contrast",
    "top-right":     "upper-right quadrant — keep that area uncluttered with high contrast",
    "middle-left":   "left-center — keep that vertical band clear with strong contrast",
    "center":        "dead center — keep the central area open, uncluttered, and high-contrast",
    "middle-right":  "right-center — keep that vertical band clear with strong contrast",
    "bottom-left":   "lower-left quadrant — keep that area uncluttered with high contrast",
    "bottom-center": "lower-center — keep that horizontal band clear with strong contrast",
    "bottom-right":  "lower-right quadrant — keep that area uncluttered with high contrast",
  }

  // ── Collect text lines ────────────────────────────────────────
  const textLines = []
  if (title)                  textLines.push(`TITLE: "${title}"`)
  if (subtitle)               textLines.push(`TAGLINE: "${subtitle}"`)
  if (showDate  && eventDate) textLines.push(`DATE: "${eventDate}"`)
  if (showVenue && venue)     textLines.push(`VENUE: "${venue}"`)
  if (showPrize && prizePool) textLines.push(`PRIZE: "${prizePool}"`)
  if (organizer)              textLines.push(`ORGANIZER: "${organizer}"`)

  const textZone = placementMap[titlePlacement] ?? titlePlacement

  // ── Section 1: ROLE + TEXT (primary, always first, emphatic) ─────
  // Leonardo reads left-to-right, top-to-bottom — the opening lines
  // carry the most weight. We declare the role of the image immediately
  // so the model understands the text IS the poster, not decoration.
  const textSection = textLines.length > 0
    ? [
        "TYPOGRAPHY-FIRST EVENT POSTER. The sole purpose of this image is to prominently display the following text. The text is the hero — the most important visual element. Everything else exists only to support and frame these words.",
        "",
        "TEXT TO DISPLAY (render every word exactly as written, verbatim, no changes, no additions, no omissions):",
        textLines.join("\n"),
        "",
        `Text placement zone: ${textZone}.`,
        "The text must be large, bold, and fully legible against the background. Prioritize text visibility above all design choices.",
      ].join("\n")
    : description
      ? [
          "TYPOGRAPHY-FIRST EVENT POSTER. The sole purpose of this image is to prominently display the following text. The text is the hero — the most important visual element.",
          "",
          `TEXT TO DISPLAY (verbatim): "${description}"`,
          "",
          `Text placement zone: ${textZone}.`,
        ].join("\n")
      : ""

  // ── Section 2: BACKGROUND DESIGN (secondary, explicitly subservient) ─
  const designLines = [
    `BACKGROUND THEME (secondary — exists only to set the atmosphere behind the text):`,
    `Style: ${styleMap[style] ?? style}.`,
    `Mood: ${moodMap[mood] ?? mood}.`,
    `Color palette: ${colorScheme}.`,
    `Background type: ${bgMap[backgroundType] ?? backgroundType}.`,
    fontStyle    ? `Type atmosphere: ${fontAtmosphereMap[fontStyle] ?? fontStyle}.` : "",
    extraDetails ? `Additional background detail: ${extraDetails}.` : "",
  ].filter(Boolean)

  const designSection = designLines.join(" ")

  // ── Section 3: CONSTRAINTS ───────────────────────────────────────
  const constraintSection = [
    "ABSOLUTE RULES:",
    "1. Text is the foreground subject. Background design must not compete with, overlap, or obscure any text.",
    "2. Render every text element exactly as written — no rephrasing, no inventing, no skipping.",
    "3. No text beyond what is listed above.",
    "4. The text zone must have sufficient contrast (light text on dark bg, or dark text on light bg) to be fully legible.",
    "5. Keep the text zone visually clean — no busy patterns, textures, or imagery directly behind the text.",
    "6. No people, faces, or human figures.",
    "7. Sharp, clean final render.",
  ].join("\n")

  // ── Assemble & enforce the 1,400-char hard cap ───────────────────
  // Priority order if truncation needed: TEXT > CONSTRAINTS > DESIGN (trim from tail of design)
  const full = [textSection, designSection, constraintSection]
    .filter(Boolean)
    .join("\n\n")

  if (full.length <= 1400) return full

  const textAndRules = [textSection, constraintSection].filter(Boolean).join("\n\n")
  const designBudget = 1400 - textAndRules.length - 2
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