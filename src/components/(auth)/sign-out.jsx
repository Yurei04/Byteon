"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";

export default function SignOut() {
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();

  async function handleSignOut() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      await refreshUser();
    } catch (err) {
      console.error("Sign out error", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleSignOut} className="bg-fuchsia-600 hover:bg-fuchsia-500" disabled={loading}>
      {loading ? "Signing out..." : "Sign Out"}
    </Button>
  );
}
