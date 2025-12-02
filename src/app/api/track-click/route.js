// app/api/sync/route.js
// COPY THIS EXACTLY - IT WILL WORK!

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function countCSVRows(csvUrl) {
  console.log('🔍 Fetching CSV from:', csvUrl);
  
  try {
    const response = await fetch(csvUrl, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const csvText = await response.text();
    console.log('📄 CSV Length:', csvText.length, 'bytes');
    console.log('📄 First 200 chars:', csvText.substring(0, 200));

    // Split into lines
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    console.log('📊 Total lines:', lines.length);

    // First line is header, rest are data
    if (lines.length <= 1) {
      console.log('⚠️ Only header row found, no responses yet');
      return 0;
    }

    // Count data rows (excluding header)
    const dataRows = lines.slice(1).filter(line => {
      // Check if row has actual data (not just commas)
      const hasData = line.replace(/,/g, '').trim().length > 0;
      return hasData;
    });

    console.log('✅ Data rows found:', dataRows.length);
    return dataRows.length;

  } catch (error) {
    console.error('❌ Error fetching CSV:', error);
    throw error;
  }
}

export async function GET(request) {
  console.log('\n🚀 === SYNC API CALLED ===');
  
  try {
    const { searchParams } = new URL(request.url);
    const announcementId = searchParams.get("id");
    console.log('📌 Announcement ID:', announcementId || 'ALL');

    // Build query
    let query = supabase
      .from("announcements")
      .select("id, title, google_sheet_csv_url")
      .not("google_sheet_csv_url", "is", null);

    if (announcementId) {
      query = query.eq("id", announcementId);
    }

    const { data: announcements, error: fetchError } = await query;

    if (fetchError) {
      console.error('❌ Database error:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    console.log('📋 Found announcements:', announcements?.length || 0);

    if (!announcements || announcements.length === 0) {
      return NextResponse.json({ 
        message: "No announcements with CSV URL found", 
        results: [] 
      });
    }

    const results = [];

    for (const announcement of announcements) {
      console.log(`\n📝 Processing: ${announcement.title} (ID: ${announcement.id})`);
      console.log('🔗 CSV URL:', announcement.google_sheet_csv_url);

      try {
        const count = await countCSVRows(announcement.google_sheet_csv_url);
        console.log(`✨ Final count: ${count}`);

        // Update database
        const { error: updateError } = await supabase
          .from("announcements")
          .update({ 
            registrants_count: count,
            last_synced_at: new Date().toISOString(),
            sync_error: null
          })
          .eq("id", announcement.id);

        if (updateError) {
          console.error('❌ Update error:', updateError);
          throw updateError;
        }

        console.log('✅ Database updated successfully');

        results.push({
          id: announcement.id,
          title: announcement.title,
          success: true,
          hasError: false,
          registrantsCount: count,
        });

      } catch (err) {
        console.error(`❌ Error for announcement ${announcement.id}:`, err.message);

        // Save error to database
        await supabase
          .from("announcements")
          .update({ 
            sync_error: err.message,
            last_synced_at: new Date().toISOString()
          })
          .eq("id", announcement.id);

        results.push({
          id: announcement.id,
          title: announcement.title,
          success: false,
          hasError: true,
          error: err.message,
        });
      }
    }

    console.log('\n✅ === SYNC COMPLETE ===\n');

    return NextResponse.json({
      message: "Sync completed",
      results,
      timestamp: new Date().toISOString(),
    });

  } catch (err) {
    console.error('❌ Fatal error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// For cron jobs
export async function POST(request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return GET(request);
}