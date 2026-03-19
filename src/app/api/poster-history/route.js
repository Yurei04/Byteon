// app/api/poster-history/route.js
import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
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
}

export async function GET() {
  const supabase = await getSupabase()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("user_id", session.user.id)
    .single()

  if (!org) return NextResponse.json({ posters: [] })

  const { data: posters, error } = await supabase
    .from("generated_posters")
    .select("id, title, subtitle, image_url, style, aspect_ratio, color_scheme, created_at, prompt")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ posters })
}

export async function DELETE(req) {
  const supabase = await getSupabase()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await req.json()

  const { error } = await supabase
    .from("generated_posters")
    .delete()
    .eq("id", id)
    .eq("user_id", session.user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}