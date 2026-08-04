// app/api/poster-history/route.js
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function getAuthedUser(req) {
  const authHeader = req.headers.get("authorization") || ""
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null
  if (!token) return null

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  return error ? null : user
}

export async function GET(req) {
  try {
    const user = await getAuthedUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: org } = await supabaseAdmin
      .from("organizations")
      .select("id")
      .eq("user_id", user.id)
      .single()

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

export async function DELETE(req) {
  try {
    const user = await getAuthedUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: "Poster ID is required" }, { status: 400 })

    const { data: org } = await supabaseAdmin
      .from("organizations")
      .select("id")
      .eq("user_id", user.id)
      .single()

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