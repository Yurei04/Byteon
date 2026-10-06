export const maxDuration = 30
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Optional: create a PUBLIC storage bucket with this name to store files instead
// of base64 in the table. If the upload fails, the data URL is saved as before.
const BUCKET = "posters"

async function getAuthedUser(req) {
  const authHeader = req.headers.get("authorization") || ""
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null
  if (!token) return null

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  return error ? null : user
}

async function getOrg(userId) {
  const { data } = await supabaseAdmin
    .from("organizations").select("id").eq("user_id", userId).single()
  return data
}

async function toStoredUrl(image, orgId) {
  const m = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(image || "")
  if (!m) return image // already a normal URL
  try {
    const path = `${orgId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`
    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, Buffer.from(m[2], "base64"), { contentType: m[1] })
    if (error) throw error
    return supabaseAdmin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  } catch (e) {
    console.warn("Storage upload failed, saving data URL instead:", e?.message)
    return image
  }
}

export async function GET(req) {
  try {
    const user = await getAuthedUser(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const org = await getOrg(user.id)
    if (!org) return NextResponse.json({ posters: [] })

    const { data: posters, error } = await supabaseAdmin
      .from("generated_posters")
      .select(`
        id, title, subtitle, image_url, style,
        aspect_ratio, color_scheme, created_at, prompt
      `)
      .eq("org_id", org.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ posters: posters || [] })
  } catch (error) {
    console.error("GET poster-history error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Bookmark: save one generated poster to history.
export async function POST(req) {
  try {
    const user = await getAuthedUser(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { image, prompt, form } = await req.json()
    if (!image) return NextResponse.json({ error: "Image is required" }, { status: 400 })

    const org = await getOrg(user.id)
    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 })

    const f = form || {}
    const imageUrl = await toStoredUrl(image, org.id)

    const { data, error } = await supabaseAdmin
      .from("generated_posters")
      .insert({
        org_id: org.id,
        user_id: user.id,
        title: f.eventName || null,
        subtitle: f.description || null,
        description: f.description || null,
        image_url: imageUrl,
        prompt: prompt || null,
        style: f.style || null,
        mood: f.mood || null,
        color_scheme: f.theme || null,
        background_type: f.backgroundType || null,
        aspect_ratio: f.ratio || null,
        font_style: f.fontStyle || null,
        title_placement: f.titlePlacement || null,
        extra_details: f.extraDetails || null,
        form_data: f,
      })
      .select("id")
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ id: data.id })
  } catch (error) {
    console.error("POST poster-history error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const user = await getAuthedUser(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: "Poster ID is required" }, { status: 400 })

    const org = await getOrg(user.id)
    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 })

    const { error } = await supabaseAdmin
      .from("generated_posters")
      .delete()
      .eq("id", id)
      .eq("org_id", org.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE poster-history error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}