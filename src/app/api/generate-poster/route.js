export const maxDuration = 60
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { GoogleAuth } from "google-auth-library"

const ASPECT_RATIO_MAP = {
  "1:1": "1:1",
  "2:3": "3:4",
  "3:4": "3:4",
  "4:5": "4:5",
  "16:9": "16:9",
  "9:16": "9:16",
}

function buildPrompt(body) {
  const { eventName, description, prize, date, venue } = body

  const lines = []
  lines.push(`Generate a professional hackathon event poster.`)
  lines.push(`Title: \"${eventName}\" in large bold typography.`)
  if (description) lines.push(`Tagline: \"${description}\".`)
  if (prize) lines.push(`Prize: ${prize}.`)
  if (date) lines.push(`Date: ${date}.`)
  if (venue) lines.push(`Venue: ${venue}.`)
  lines.push(`High quality graphic design, no faces.`)

  return lines.join(" ")
}

async function generateWithVertex(prompt, aspectRatio) {
  const PROJECT_ID = process.env.GCP_PROJECT_ID
  const mappedRatio = ASPECT_RATIO_MAP[aspectRatio] ?? "3:4"

  const credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY)
  credentials.private_key = credentials.private_key.replace(/\\n/g, "\n")

  const auth = new GoogleAuth({
    credentials,
    scopes: "https://www.googleapis.com/auth/cloud-platform",
  })

  const token = await auth.getAccessToken()

  const URL = `https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/imagen-3.0-generate-001:predict`

  const res = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 3,
        aspectRatio: mappedRatio,
        outputMimeType: "image/png",
      },
    }),
    signal: AbortSignal.timeout(50_000),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Vertex request failed (${res.status}): ${errText}`)
  }

  const data = await res.json()

  const images = (data?.predictions || [])
    .map((item) => item?.bytesBase64Encoded)
    .filter(Boolean)
    .map((b64) => `data:image/png;base64,${b64}`)

  if (!images.length) throw new Error("No image data in response")

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
    const { eventName, ratio } = body

    if (!eventName?.trim()) {
      return NextResponse.json({ error: "Event name is required" }, { status: 400 })
    }

    const prompt = buildPrompt(body)
    const images = await generateWithVertex(prompt, ratio ?? "2:3")

    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("user_id", session.user.id)
      .single()

    if (org) {
      await Promise.all(
        images.map((image) =>
          supabase.from("generated_posters").insert({
            org_id: org.id,
            user_id: session.user.id,
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
    }

    return NextResponse.json({ images, prompt })
  } catch (err) {
    console.error("DETAILED_ERROR_LOG:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
