export const maxDuration = 30
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Server-only client. The service role key bypasses RLS, so storage uploads and
// inserts work regardless of policies. Never expose it with a NEXT_PUBLIC_ prefix.
// Ownership is enforced below by always filtering on the caller's org_id.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
)

const BUCKET = "generated-posters"

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

// "https://xxx.supabase.co/storage/v1/object/public/generated-posters/12/abc.png" -> "12/abc.png"
function pathFromUrl(url) {
  const marker = `/${BUCKET}/`
  const i = (url || "").indexOf(marker)
  return i === -1 ? null : url.slice(i + marker.length)
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

// Bookmark: upload the image to the bucket, then save a row pointing at it.
export async function POST(req) {
  let uploadedPath = null
  try {
    const user = await getAuthedUser(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { image, prompt, form } = await req.json()
    const m = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(image || "")
    if (!m) return NextResponse.json({ error: "A base64 image is required" }, { status: 400 })

    const org = await getOrg(user.id)
    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 })

    // 1. Upload to the bucket
    uploadedPath = `${org.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`
    const { error: upErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(uploadedPath, Buffer.from(m[2], "base64"), { contentType: m[1] })
    if (upErr) {
      console.error("Storage upload error:", upErr)
      uploadedPath = null
      return NextResponse.json({ error: `Upload failed: ${upErr.message}` }, { status: 500 })
    }
    const imageUrl = supabaseAdmin.storage.from(BUCKET).getPublicUrl(uploadedPath).data.publicUrl

    // 2. Save the row
    const f = form || {}
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

    if (error) {
      console.error("Insert error:", error)
      await supabaseAdmin.storage.from(BUCKET).remove([uploadedPath]) // don't leave orphan files
      return NextResponse.json({ error: `Save failed: ${error.message}` }, { status: 500 })
    }
    return NextResponse.json({ id: data.id })
  } catch (error) {
    console.error("POST poster-history error:", error)
    if (uploadedPath) await supabaseAdmin.storage.from(BUCKET).remove([uploadedPath]).catch(() => {})
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 })
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

    const { data: row } = await supabaseAdmin
      .from("generated_posters").select("image_url")
      .eq("id", id).eq("org_id", org.id).single()

    const { error } = await supabaseAdmin
      .from("generated_posters")
      .delete()
      .eq("id", id)
      .eq("org_id", org.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Remove the file too (rows saved before the bucket existed have no file to remove)
    const path = pathFromUrl(row?.image_url)
    if (path) await supabaseAdmin.storage.from(BUCKET).remove([path])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE poster-history error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}