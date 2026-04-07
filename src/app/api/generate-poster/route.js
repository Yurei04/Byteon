// app/api/generate-poster/route.js

export const maxDuration = 60
export const dynamic = "force-dynamic"
import fs from "fs"
import path from "path"
import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { GoogleAuth } from "google-auth-library"

const ASPECT_RATIO_MAP = {
  "1:1":  "1:1",
  "2:3":  "3:4", 
  "3:4":  "3:4",
  "4:5":  "4:5",
  "16:9": "16:9",
  "9:16": "9:16",
}

const THEME_MAP = {
  "Space & Galaxy":    "theme is space",
  "Neon Cyberpunk":    "theme is cyberpunk",
  "Nature & Earth":    "theme is nature",
  "Ocean & Water":     "theme is ocean",
  "Fire & Energy":     "theme is energy and fire",
  "Dark & Mysterious": "theme is dark and mysterious",
  "Light & Clean":     "theme is light and clean",
  "Retro Sunset":      "theme is retro sunset",
  "Urban City":        "theme is urban city",
}

const STYLE_MAP = {
  "minimalist":    "design is minimalistic",
  "modern bold":   "design is modern",
  "vintage retro": "design is vintage",
  "cinematic":     "design is cinematic",
  "abstract":      "design is abstract",
  "brutalist":     "design is brutalist",
  "illustrated":   "design looks hand drawn",
}

function buildPrompt({ eventName, description, prize, date, venue, style, theme, ratio }) {
  const themeDesc = THEME_MAP[theme] ?? theme
  const styleDesc = STYLE_MAP[style] ?? style

  const aspectHint = {
    "2:3":  "vertical portrait poster",
    "1:1":  "square poster",
    "9:16": "vertical story format",
    "16:9": "wide horizontal banner",
    "4:5":  "vertical feed poster",
    "3:4":  "vertical portrait poster",
  }[ratio] ?? "poster"

  const lines = []
  lines.push(`Generate a professional hackathon event poster. ${styleDesc}. ${themeDesc}.`)
  lines.push(`Title: "${eventName}" in large bold typography.`)
  if (description) lines.push(`Tagline below the title: "${description}".`)
  if (prize)        lines.push(`Prominently display total cash prize: ${prize}.`)
  if (date)         lines.push(`Event date on the poster: ${date}.`)
  if (venue)        lines.push(`Venue on the poster: ${venue}.`)
  lines.push(`Format: ${aspectHint}. High quality graphic design, sharp render, no people or faces.`)

  return lines.join(" ")
}

// ── Vertex AI Image Generation (Uses your $300 Credits) ────────
async function generateWithVertex(prompt, aspectRatio) {
  const PROJECT_ID = process.env.GCP_PROJECT_ID;
  const mappedRatio = ASPECT_RATIO_MAP[aspectRatio] ?? "3:4";

  const credentials = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "poster-bot-byteon-a7d69d4b470b.json"), "utf8")
  );

  const auth = new GoogleAuth({
    credentials,
    scopes: "https://www.googleapis.com/auth/cloud-platform",
  });

  const token = await auth.getAccessToken();

  const URL = `https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/imagen-3.0-generate-001:predict`;

  const res = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: mappedRatio,
        outputMimeType: "image/png",
      },
    }),
    signal: AbortSignal.timeout(50_000),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Vertex request failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error("No image data in response");

  return `data:image/png;base64,${b64}`;
}

// ── Route handler ─────────────────────────────────────────────
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
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { eventName, ratio } = body

    if (!eventName?.trim()) {
      return NextResponse.json({ error: "Event name is required" }, { status: 400 })
    }

    const prompt = buildPrompt(body)
    
    // SWITCHED: Now calling the Vertex AI function
    const dataUrl = await generateWithVertex(prompt, ratio ?? "2:3")

    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("user_id", session.user.id)
      .single()

    if (org) {
      await supabase.from("generated_posters").insert({
        org_id:       org.id,
        user_id:      session.user.id,
        title:        eventName,
        subtitle:     body.description || null,
        image_url:    dataUrl,
        prompt,
        style:        body.style,
        color_scheme: body.theme,
        aspect_ratio: ratio,
        form_data:    body,
      })
    }

    return NextResponse.json({ image: dataUrl, prompt })

  } catch (err) {
    console.error("DETAILED_ERROR_LOG:", err); 

    return NextResponse.json({ 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    }, { status: 500 });
  }
}