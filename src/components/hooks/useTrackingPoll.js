// hooks/useTrackingPoll.js
"use client";

import { useEffect, useRef, useState } from "react";

export default function useTrackingPoll({ intervalMs = 2000 } = {}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null); 
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);
  const abortRef = useRef(null);

  const fetchOnce = async () => {
    setLoading(true);
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      // Convert your published Google Sheet into CSV format
      const sheetCsvUrl =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vScTAVgc9rKn7WYLhBCgVoPb09GKZJ_oW4l03m61uvbXjFipUHX6QOEGP6NFOoUfN69oT8vAXdFCFYY/pub?output=csv";

      const res = await fetch("/api/tracking", { cache: "no-store" });
      const { count } = await res.json();
      console.log("Live responses count:", count);


      if (!res.ok) throw new Error("Failed to fetch Google Sheet");

      const text = await res.text();

      // Split rows
      const rows = text.trim().split("\n");

      // Exclude header row
      const responseCount = Math.max(rows.length - 1, 0);

      // Return a simple object
      setData({
        responses: responseCount,
        hasError: false,
      });

      setLastUpdated(new Date().toISOString());
    } catch (err) {
      setData({ hasError: true, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnce();
    intervalRef.current = setInterval(fetchOnce, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [intervalMs]);

  return { loading, data, lastUpdated, refresh: fetchOnce };
}
