import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ---------- NEW: LIVE COUNT FETCH (Google Sheet) ----------
export async function GET() {
  try {
    const sheetCsvUrl =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vScTAVgc9rKn7WYLhBCgVoPb09GKZJ_oW4l03m61uvbXjFipUHX6QOEGP6NFOoUfN69oT8vAXdFCFYY/pub?output=csv";

    const res = await fetch(sheetCsvUrl, { cache: "no-store" });

    if (!res.ok) {
      throw new Error("Failed to fetch Google Sheet CSV");
    }

    const text = await res.text();
    const rows = text.trim().split("\n");

    const count = Math.max(rows.length - 1, 0); // exclude header

    return NextResponse.json({ count });
  } catch (err) {
    console.error("Live count error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ---------- EXISTING: CLICK TRACKING (unchanged) ----------
export async function POST(request) {
  try {
    const { announcementId } = await request.json();

    if (!announcementId) {
      return NextResponse.json(
        { error: "Missing announcementId" },
        { status: 400 }
      );
    }

    // Try RPC increment first
    const { error } = await supabase.rpc("increment_website_clicks", {
      announcement_id: announcementId,
    });

    if (error) {
      // Fallback: manual update
      const { data: current } = await supabase
        .from("announcements")
        .select("website_clicks")
        .eq("id", announcementId)
        .single();

      const newCount = (current?.website_clicks || 0) + 1;

      const { error: updateError } = await supabase
        .from("announcements")
        .update({ website_clicks: newCount })
        .eq("id", announcementId)
        .eq("tracking_method", "manual");

      if (updateError) throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Click tracking error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
