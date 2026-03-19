// app/api/generate-poster/route.js
import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// HuggingFace new router endpoint (api-inference.huggingface.co was deprecated)
const HF_API_URL = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell"
// Map aspect ratios to pixel dimensions (FLUX.1-schnell works best with multiples of 64)

const DIMENSIONS = {
  "1:1":  { width: 1024, height: 1024 },
  "2:3":  { width: 832,  height: 1216 },
  "3:4":  { width: 896,  height: 1152 },
  "4:5":  { width: 896,  height: 1120 },
  "16:9": { width: 1344, height: 768  },
  "9:16": { width: 768,  height: 1344 },
}

function buildPrompt({ title, subtitle, description, style, mood, colorScheme, titlePlacement, backgroundType, fontStyle, extraDetails }) {
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

export async function POST(req) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
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
    if (!process.env.HUGGINGFACE_API_KEY) {
      return NextResponse.json(
        { error: "HUGGINGFACE_API_KEY missing — add it to .env.local (free at huggingface.co/settings/tokens)" },
        { status: 500 }
      )
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { aspectRatio } = body

    const { data: org } = await supabase
      .from("organizations")
      .select("id, name")
      .eq("user_id", session.user.id)
      .single()

    const prompt = buildPrompt(body)
    const { width, height } = DIMENSIONS[aspectRatio] ?? DIMENSIONS["2:3"]

    // Call HuggingFace Inference API
    let imgRes
    let attempts = 0
    const maxAttempts = 3

    while (attempts < maxAttempts) {
      attempts++
      imgRes = await fetch(HF_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            width,
            height,
            num_inference_steps: 4,   // schnell is optimized for 1-4 steps
            guidance_scale: 0.0,      // schnell uses 0 guidance
          },
        }),
        signal: AbortSignal.timeout(120000), // 2 min timeout
      })

      // Model loading (503) — common on free tier cold start, retry
      if (imgRes.status === 503) {
        const errBody = await imgRes.json().catch(() => ({}))
        const waitTime = errBody?.estimated_time
          ? Math.ceil(errBody.estimated_time) * 1000
          : 20000

        console.log(`Model loading, attempt ${attempts}/${maxAttempts}, waiting ${waitTime}ms...`)

        if (attempts < maxAttempts) {
          await new Promise((r) => setTimeout(r, Math.min(waitTime, 30000)))
          continue
        }

        return NextResponse.json(
          { error: "Model is warming up. Wait 20–30 seconds and try again." },
          { status: 503 }
        )
      }

      if (imgRes.ok) break

      // Other errors
      const errText = await imgRes.text()
      console.error(`HuggingFace error (attempt ${attempts}):`, errText)

      if (attempts >= maxAttempts) {
        throw new Error(`HuggingFace API error ${imgRes.status}: ${errText}`)
      }

      await new Promise((r) => setTimeout(r, 5000))
    }

    if (!imgRes.ok) {
      throw new Error("Image generation failed after retries")
    }

    // Response is raw binary image
    const contentType = imgRes.headers.get("content-type") || "image/jpeg"
    const arrayBuffer = await imgRes.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    const dataUrl = `data:${contentType};base64,${base64}`

    // Save to Supabase
    if (org) {
      const { error: insertError } = await supabase
        .from("generated_posters")
        .insert({
          org_id:          org.id,
          user_id:         session.user.id,
          title:           body.title || null,
          subtitle:        body.subtitle || null,
          description:     body.description || null,
          image_url:       dataUrl,
          prompt,
          style:           body.style,
          mood:            body.mood,
          color_scheme:    body.colorScheme,
          background_type: body.backgroundType,
          aspect_ratio:    aspectRatio,
          font_style:      body.fontStyle,
          title_placement: body.titlePlacement,
          extra_details:   body.extraDetails || null,
          form_data:       body,
        })

      if (insertError) console.error("DB insert error:", insertError)
    }

    return NextResponse.json({ image: dataUrl, prompt })

  } catch (err) {
    console.error("Generate poster error:", err)

    if (err.name === "TimeoutError") {
      return NextResponse.json(
        { error: "Generation timed out. The free tier is busy — try again in 30 seconds." },
        { status: 504 }
      )
    }

    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}