// app/api/count/[announcementId]/route.js

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use public Supabase key for read-only data fetch
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
);

async function countCSVRows(csvUrl) {
  // This logic is copied from your existing /api/sync
  try {
    const response = await fetch(csvUrl, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      // Return a status code from the Google Sheet fetch error
      throw new Error(`HTTP ${response.status}: ${response.statusText}`); 
    }

    const csvText = await response.text();
    
    // Split and filter lines
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);

    if (lines.length <= 1) {
      return 0;
    }

    // Count data rows (excluding header and purely empty lines)
    const dataRows = lines.slice(1).filter(line => {
      const hasData = line.replace(/,/g, '').trim().length > 0;
      return hasData;
    });

    return dataRows.length;

  } catch (error) {
    // Propagate the specific error for better server logging
    console.error('❌ Error fetching CSV:', error.message);
    throw error;
  }
}

export async function GET(request, { params }) {
  const { announcementId } = params;
  
  if (!announcementId) {
    return NextResponse.json({ error: "Missing announcement ID" }, { status: 400 });
  }

  try {
    // 1. Fetch the single CSV URL from Supabase (READ-ONLY)
    const { data: announcement, error: fetchError } = await supabase
      .from("announcements")
      .select("google_sheet_csv_url")
      .eq("id", announcementId)
      .single();

    if (fetchError || !announcement || !announcement.google_sheet_csv_url) {
      // This will handle cases where the ID is invalid or the URL is missing
      return NextResponse.json({ error: "CSV URL not found or database error." }, { status: 404 });
    }

    // 2. Fetch the count directly from the CSV URL (FAST)
    const count = await countCSVRows(announcement.google_sheet_csv_url);
    
    // 3. Return the count immediately
    return NextResponse.json({ count: count });

  } catch (error) {
    // Catch errors from countCSVRows (e.g., Google Sheet 404/403)
    return NextResponse.json({ error: error.message || "Could not retrieve registrant count." }, { status: 500 });
  }
}