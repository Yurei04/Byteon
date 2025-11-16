"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect } from "react";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import { useRouter } from "next/navigation";

export default function AdminPageWrapper() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      // Not an admin — redirect or show message
      router.push("/"); // or show a "forbidden" page
    }
  }, [loading, isAdmin, router]);

  if (loading) return <div className="p-6">Checking permissions...</div>;
  if (!isAdmin) return <div className="p-6">You do not have access.</div>;

  return <AdminDashboard />;
}
