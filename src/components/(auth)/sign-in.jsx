"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("password"); // "password" or "magic"
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { refreshUser } = useAuth();

  async function handlePasswordSignIn(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setMessage("Signed in.");
      await refreshUser();
    } catch (err) {
      setMessage(err.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const { data, error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setMessage("Magic link sent to your email.");
    } catch (err) {
      setMessage(err.message || "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-gradient-to-b from-purple-950/30 to-fuchsia-950/20 border border-fuchsia-700/10 rounded-2xl">
      <h2 className="text-xl font-bold text-fuchsia-100 mb-4">Sign In</h2>

      <div className="flex gap-2 mb-4">
        <Button variant={mode === "password" ? undefined : "outline"} onClick={() => setMode("password")}>Password</Button>
        <Button variant={mode === "magic" ? undefined : "outline"} onClick={() => setMode("magic")}>Magic Link</Button>
      </div>

      <form onSubmit={mode === "password" ? handlePasswordSignIn : handleMagicLink} className="space-y-3">
        <label className="block text-sm text-fuchsia-300">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 rounded bg-transparent border border-fuchsia-700/20 text-fuchsia-100" type="email" required />

        {mode === "password" && (
          <>
            <label className="block text-sm text-fuchsia-300">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 rounded bg-transparent border border-fuchsia-700/20 text-fuchsia-100" type="password" required />
          </>
        )}

        <div className="flex items-center justify-between">
          <Button type="submit" className="bg-fuchsia-600 hover:bg-fuchsia-500" disabled={loading}>
            {loading ? "Signing in..." : mode === "password" ? "Sign in" : "Send magic link"}
          </Button>
        </div>

        {message && <p className="text-sm text-fuchsia-200 mt-2">{message}</p>}
      </form>
    </div>
  );
}
