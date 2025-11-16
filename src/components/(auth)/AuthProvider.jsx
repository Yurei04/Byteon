"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext({
  user: null,
  isAdmin: false,
  loading: true,
  refreshUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // parse ADMIN emails from env
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  useEffect(() => {
    // load user on mount
    let mounted = true;

    async function load() {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (!mounted) return;

        setUser(currentUser ?? null);
        setIsAdmin(currentUser ? adminEmails.includes((currentUser.email || "").toLowerCase()) : false);
      } catch (err) {
        console.error("Auth load error", err);
        if (mounted) {
          setUser(null);
          setIsAdmin(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    // subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAdmin(currentUser ? adminEmails.includes((currentUser.email || "").toLowerCase()) : false);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, [/* adminEmails stable from env */]);

  async function refreshUser() {
    setLoading(true);
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser ?? null);
      setIsAdmin(currentUser ? adminEmails.includes((currentUser.email || "").toLowerCase()) : false);
    } catch (err) {
      console.error("refreshUser error", err);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
