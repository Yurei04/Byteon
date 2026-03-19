// app/api/generate-poster/route.js
import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Pollinations.ai — completely free image gen, no key required
function buildPollinationsUrl(prompt, width, height) {
  const encoded = encodeURIComponent(prompt)
  const seed = Math.floor(Math.random() * 999999)
  return `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`
}

const DIMENSIONS = {
  "1:1":  { width: 1024, height: 1024 },
  "2:3":  { width: 832,  height: 1248 },
  "3:4":  { width: 960,  height: 1280 },
  "4:5":  { width: 896,  height: 1120 },
  "16:9": { width: 1280, height: 720  },
  "9:16": { width: 720,  height: 1280 },
}

export async function POST(req) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Auth check
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      title, subtitle, description,
      style, mood, colorScheme,
      titlePlacement, backgroundType,
      aspectRatio, fontStyle, extraDetails,
    } = await req.json()

    // Get the org linked to this user
    const { data: org } = await supabase
      .from("organizations")
      .select("id, name")
      .eq("user_id", session.user.id)
      .single()

    // Build rich prompt
    const placementMap = {
      "top-left":      "text at the top-left corner",
      "top-center":    "text at the top center",
      "top-right":     "text at the top right corner",
      "middle-left":   "text on the left side",
      "center":        "text centered in the middle",
      "middle-right":  "text on the right side",
      "bottom-left":   "text at the bottom-left corner",
      "bottom-center": "text at the bottom center",
      "bottom-right":  "text at the bottom-right corner",
    }

    const prompt = [
      `A professional high-quality ${style} poster design`,
      title        ? `with the main title "${title}" in large ${fontStyle} typography` : "",
      subtitle     ? `and subtitle "${subtitle}" below it` : "",
      placementMap[titlePlacement] ? placementMap[titlePlacement] : "",
      `${mood} atmosphere and mood`,
      `${colorScheme} color palette`,
      `${backgroundType} background`,
      description  ? `Concept: ${description}` : "",
      extraDetails ? extraDetails : "",
      "professional graphic design, print-ready poster, high detail, sharp, cinematic composition",
    ].filter(Boolean).join(". ")

    const { width, height } = DIMENSIONS[aspectRatio] ?? DIMENSIONS["2:3"]
    const imageUrl = buildPollinationsUrl(prompt, width, height)

    // Verify the image actually generates (Pollinations sometimes needs a warm-up)
    const checkRes = await fetch(imageUrl, { method: "HEAD" })
    if (!checkRes.ok) {
      throw new Error("Image generation service unavailable. Try again.")
    }

    // Save to Supabase if org exists
    if (org) {
      const { error: insertError } = await supabase
        .from("generated_posters")
        .insert({
          org_id:          org.id,
          user_id:         session.user.id,
          title:           title || null,
          subtitle:        subtitle || null,
          description:     description || null,
          image_url:       imageUrl,
          prompt,
          style,
          mood,
          color_scheme:    colorScheme,
          background_type: backgroundType,
          aspect_ratio:    aspectRatio,
          font_style:      fontStyle,
          title_placement: titlePlacement,
          extra_details:   extraDetails || null,
          form_data: {
            title, subtitle, description, style, mood,
            colorScheme, titlePlacement, backgroundType,
            aspectRatio, fontStyle, extraDetails,
          },
        })

      if (insertError) console.error("DB insert error:", insertError)
    }

    return NextResponse.json({ image: imageUrl, prompt })
  } catch (err) {
    console.error("Generate poster error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}