export const maxDuration = 60
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function buildPrompt(body) {
  const { eventName, description, prize, startDate, endDate, venue } = body
  const lines = []
  lines.push(`Generate a professional hackathon event poster.`)
  lines.push(`Title: "${eventName}" in large bold typography.`)

  if (description) lines.push(`Tagline: "${description}".`)
  if (prize) lines.push(`Prize: ${prize}.`)

  if (startDate && endDate) {
    lines.push(`Date: ${startDate} to ${endDate}.`)
  } else if (startDate) {
    lines.push(`Date: ${startDate}.`)
  }

  if (venue) lines.push(`Venue: ${venue}.`)

  lines.push(`High quality graphic design, no faces.`)
  lines.push(
    `STRICT RULE: Only include text and details explicitly listed above. Do NOT invent, add, or assume any names, dates, logos, sponsors, prizes, or other information not provided.`
  )

  return lines.join(" ")
}

async function generateWithOpenAI(prompt, aspectRatio) {
  const sizeMap = {
    "1:1": "1024x1024",
    "2:3": "1024x1536",
    "3:4": "1024x1536",
    "4:5": "1024x1536",
    "16:9": "1536x1024",
    "9:16": "1024x1536",
  }

  const size = sizeMap[aspectRatio] ?? "1024x1536"

  const response = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    size,
    quality: "high",
    n: 3,
  })

  const images = (response.data ?? [])
    .map((d) => d.b64_json)
    .filter(Boolean)
    .map((b64) => `data:image/png;base64,${b64}`)

  if (!images.length) {
    throw new Error("No image data returned from OpenAI")
  }

  return images
}

export async function POST(req) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Expected when called from a Server Component; middleware
            // refreshing the session handles this case instead.
          }
        },
      },
    }
  )

  try {
    // getUser() revalidates the JWT against the Supabase Auth server.
    // getSession() only reads cookies and can be spoofed if tampered with.
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // TEMP DEBUG — remove once auth issue is resolved
    console.log("AUTH_DEBUG:", {
      userId: user?.id,
      authError: authError?.message,
      cookieNames: cookieStore.getAll().map((c) => c.name),
    })

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { eventName, ratio } = body

    if (!eventName?.trim()) {
      return NextResponse.json(
        { error: "Event name is required" },
        { status: 400 }
      )
    }

    const prompt = buildPrompt(body)
    const images = await generateWithOpenAI(prompt, ratio ?? "2:3")

    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (org) {
      const insertResults = await Promise.all(
        images.map((image) =>
          supabase.from("generated_posters").insert({
            org_id: org.id,
            user_id: user.id,
            title: eventName,
            subtitle: body.description || null,
            image_url: image,
            prompt,
            style: body.style,
            color_scheme: body.theme,
            aspect_ratio: ratio,
            form_data: body,
          })
        )
      )

      insertResults.forEach(({ error }) => {
        if (error) console.error("Failed to save generated poster:", error)
      })
    }

    return NextResponse.json({ images, prompt })
  } catch (err) {
    console.error("DETAILED_ERROR_LOG:", err)
    return NextResponse.json(
      { error: err?.message || "Failed to generate poster" },
      { status: 500 }
    )
  }
}