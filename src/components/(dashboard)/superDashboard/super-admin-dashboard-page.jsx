"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/(auth)/authContext"
// import { withAuth } from "@/components/(auth)/withAuth"   // ⛔ AUTH DISABLED FOR UI TESTING
import { ReturnButton } from "@/components/return"
import {
  ShieldCheck, Users, Building2, FileText, Megaphone,
  BookOpen, TrendingUp, Clock, Plus, Eye, CheckSquare,
  AlertCircle, Loader2,
} from "lucide-react"

// Section Components
import SuperProfile from "./super-profile,"
import AccountManageSection from "./accounts-manage-section"
import ApprovalSection      from "./approval-section"
import ViewableSection      from "./viewable-section"

// Create Forms (super admin posts go DIRECTLY to main DB — no pending table)
import AnnounceForm from "../announce/announce-form"
import BlogOrgForm  from "@/components/blog/blog-edit-user"
import ResourceForm from "@/components/resourceHub/resource-form"

// ── MOCK DATA FOR UI TESTING ─────────────────────────────────────────────────
// Remove this block and restore useAuth() when auth is re-enabled
const MOCK_PROFILE = {
  id: 1,
  user_id: "mock-super-admin-uuid",
  name: "Super Admin",
  organization_id: 1,
  created_at: new Date().toISOString(),
  role: "super_admin",
  table: "super_admins",
  linkedOrg: {
    id: 1,
    name: "Byteon Team",
    author_name: "byteon",
    active: true,
    profile_completed: true,
    total_announcements: 0,
    total_blogs: 0,
    total_resources: 0,
  },
}
const MOCK_SESSION = {
  user: { email: "superadmin@byteon.com", id: "mock-super-admin-uuid" },
}
// ─────────────────────────────────────────────────────────────────────────────

function SuperAdminDashboardPage() {
  // ⛔ AUTH DISABLED — using mock data for UI testing
  // const { profile, session } = useAuth()
  const profile    = MOCK_PROFILE
  const session    = MOCK_SESSION
  const platformOrg = profile?.linkedOrg

  const [activeTab, setActiveTab]             = useState("profile")
  const [activeCreateTab, setActiveCreateTab] = useState("createAnnouncement")
  const [pendingCount, setPendingCount]       = useState(3)   // mock value
  const [stats, setStats]                     = useState({
    totalUsers:          24,
    totalOrgs:           8,
    totalAnnouncements:  12,
    totalBlogs:          31,
    totalResources:      17,
    activeAnnouncements: 4,
  })
  const [statsLoading, setStatsLoading] = useState(false)

  // ── Restore this when re-enabling auth ──────────────────────────────────────
  // const fetchStats = useCallback(async () => {
  //   setStatsLoading(true)
  //   try {
  //     const now = new Date().toISOString()
  //     const [
  //       { count: uCount },
  //       { count: oCount },
  //       { count: annCount },
  //       { count: blogCount },
  //       { count: resCount },
  //       { count: activeAnn },
  //       { count: pAnn },
  //       { count: pBlog },
  //       { count: pRes },
  //     ] = await Promise.all([
  //       supabase.from("users").select("id", { count: "exact", head: true }),
  //       supabase.from("organizations").select("id", { count: "exact", head: true }),
  //       supabase.from("announcements").select("id", { count: "exact", head: true }),
  //       supabase.from("blogs").select("id", { count: "exact", head: true }),
  //       supabase.from("resource_hub").select("id", { count: "exact", head: true }),
  //       supabase.from("announcements").select("id", { count: "exact", head: true }).gte("date_end", now),
  //       supabase.from("pending_announcements").select("id", { count: "exact", head: true }).eq("status", "pending"),
  //       supabase.from("pending_blogs").select("id", { count: "exact", head: true }).eq("status", "pending"),
  //       supabase.from("pending_resources").select("id", { count: "exact", head: true }).eq("status", "pending"),
  //     ])
  //     setStats({
  //       totalUsers:          uCount    || 0,
  //       totalOrgs:           oCount    || 0,
  //       totalAnnouncements:  annCount  || 0,
  //       totalBlogs:          blogCount || 0,
  //       totalResources:      resCount  || 0,
  //       activeAnnouncements: activeAnn || 0,
  //     })
  //     setPendingCount((pAnn || 0) + (pBlog || 0) + (pRes || 0))
  //   } catch {}
  //   finally { setStatsLoading(false) }
  // }, [])
  // useEffect(() => { fetchStats() }, [fetchStats])
  // ────────────────────────────────────────────────────────────────────────────

  const statCards = [
    { label: "Users",         value: stats.totalUsers,          Icon: Users,      color: "blue"    },
    { label: "Organizations", value: stats.totalOrgs,           Icon: Building2,  color: "fuchsia" },
    { label: "Pending",       value: pendingCount,              Icon: Clock,      color: "amber"   },
    { label: "Announcements", value: stats.totalAnnouncements,  Icon: Megaphone,  color: "purple"  },
    { label: "Blogs",         value: stats.totalBlogs,          Icon: FileText,   color: "pink"    },
    { label: "Resources",     value: stats.totalResources,      Icon: BookOpen,   color: "emerald" },
    { label: "Active Events", value: stats.activeAnnouncements, Icon: TrendingUp, color: "orange"  },
  ]

  const colorBorder = {
    blue:    "border-blue-500/30 from-blue-900/40",
    fuchsia: "border-fuchsia-500/30 from-fuchsia-900/40",
    amber:   "border-amber-500/30 from-amber-900/40",
    purple:  "border-purple-500/30 from-purple-900/40",
    pink:    "border-pink-500/30 from-pink-900/40",
    emerald: "border-emerald-500/30 from-emerald-900/40",
    orange:  "border-orange-500/30 from-orange-900/40",
  }
  const colorText = {
    blue:    "text-blue-300",
    fuchsia: "text-fuchsia-300",
    amber:   "text-amber-300",
    purple:  "text-purple-300",
    pink:    "text-pink-300",
    emerald: "text-emerald-300",
    orange:  "text-orange-300",
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-fuchsia-950 p-4 sm:p-6">

      {/* Top bar */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full flex justify-between items-center max-w-7xl mx-auto mb-6 gap-4">
        <ReturnButton />
        <div className="flex-1 bg-gradient-to-r from-fuchsia-900/40 to-purple-900/40 backdrop-blur-lg border border-fuchsia-500/30 py-2.5 px-4 rounded-lg shadow-lg shadow-fuchsia-500/10">
          <p className="text-fuchsia-200 text-sm text-center flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-fuchsia-400" />
            Super Admin Control Panel
            <span className="text-amber-400 text-xs ml-2">[UI TEST MODE]</span>
          </p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-purple-300 to-pink-300">
              Admin Dashboard
            </span>
          </h1>
          <p className="text-fuchsia-200/60 text-lg max-w-xl mx-auto">
            Full platform control — manage accounts, approve content, and publish directly.
          </p>
        </motion.div>

        {/* Stat Cards */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {statCards.map(({ label, value, Icon, color }) => (
            <Card key={label}
              className={`bg-gradient-to-br ${colorBorder[color]} to-slate-950/40 backdrop-blur-xl border ${colorBorder[color].split(" ")[0]} hover:scale-105 transition-transform duration-200`}>
              <CardContent className="p-3 flex flex-col items-center text-center gap-1">
                <Icon className={`w-5 h-5 ${colorText[color]}`} />
                <span className={`text-2xl font-bold ${colorText[color]}`}>
                  {statsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : value}
                </span>
                <span className="text-white/40 text-xs leading-tight">{label}</span>
                {label === "Pending" && pendingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Main Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-fuchsia-950/40 via-purple-950/40 to-slate-950/40 backdrop-blur-xl border border-fuchsia-500/20">
            <CardContent className="p-4 sm:p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>

                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 mb-6 bg-black/20 border border-fuchsia-500/20 p-1 gap-1 h-auto">
                  {[
                    { value: "profile",  icon: <ShieldCheck  className="w-4 h-4" />, label: "Profile"  },
                    { value: "accounts", icon: <Users        className="w-4 h-4" />, label: "Accounts" },
                    {
                      value: "approval",
                      icon: <CheckSquare className="w-4 h-4" />,
                      label: (
                        <span className="flex items-center gap-1">
                          Approval
                          {pendingCount > 0 && (
                            <Badge className="ml-1 text-xs px-1.5 py-0 bg-amber-500/30 text-amber-200 border-amber-500/40">
                              {pendingCount}
                            </Badge>
                          )}
                        </span>
                      ),
                    },
                    { value: "view",   icon: <Eye  className="w-4 h-4" />, label: "View All" },
                    { value: "create", icon: <Plus className="w-4 h-4" />, label: "Create"   },
                  ].map(({ value, icon, label }) => (
                    <TabsTrigger key={value} value={value}
                      className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all py-2">
                      {icon}{label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* ── Profile ── */}
                <TabsContent value="profile">
                  <SuperProfile
                    profile={profile}
                    session={session}
                    stats={{ ...stats, totalPending: pendingCount }}
                  />
                </TabsContent>

                {/* ── Accounts ── */}
                <TabsContent value="accounts">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
                      Account Management
                    </h2>
                    <p className="text-white/40 text-sm mt-1">Suspend or delete user and organization accounts.</p>
                  </div>
                  <AccountManageSection />
                </TabsContent>

                {/* ── Approval ── */}
                <TabsContent value="approval">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">
                      Content Approval Queue
                    </h2>
                    <p className="text-white/40 text-sm mt-1">
                      Review submissions from organizations before they go live.
                    </p>
                  </div>
                  <ApprovalSection onApprovalChange={(count) => setPendingCount(count)} />
                </TabsContent>

                {/* ── View All ── */}
                <TabsContent value="view">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-300">
                      All Live Content
                    </h2>
                    <p className="text-white/40 text-sm mt-1">View and delete any published content across the platform.</p>
                  </div>
                  <ViewableSection />
                </TabsContent>

                {/* ── Create ── */}
                <TabsContent value="create">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-300">
                      Publish Content
                    </h2>
                    <p className="text-white/40 text-sm mt-1">
                      Super admin posts go directly to the platform — no approval needed.
                    </p>
                  </div>

                  {!platformOrg ? (
                    <Alert className="bg-amber-900/20 border-amber-500/30">
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      <AlertDescription className="text-amber-200">
                        No platform organization linked. Add an{" "}
                        <code className="bg-black/30 px-1 rounded">organization_id</code> to your{" "}
                        <code className="bg-black/30 px-1 rounded">super_admins</code> row to enable posting.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Card className="bg-black/20 backdrop-blur-lg border border-fuchsia-500/10">
                      <CardContent className="p-6">
                        <Tabs value={activeCreateTab} onValueChange={setActiveCreateTab}>
                          <TabsList className="grid w-full grid-cols-3 mb-6 bg-black/20 border border-purple-500/20 p-1">
                            <TabsTrigger value="createAnnouncement"
                              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                              <Megaphone className="w-4 h-4" />Announcement
                            </TabsTrigger>
                            <TabsTrigger value="createBlogs"
                              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                              <FileText className="w-4 h-4" />Blog
                            </TabsTrigger>
                            <TabsTrigger value="createResources"
                              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white">
                              <BookOpen className="w-4 h-4" />Resource
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="createAnnouncement">
                            <AnnounceForm
                              onSuccess={() => {}}
                              currentOrg={platformOrg}
                              authUserId={profile?.user_id}
                            />
                          </TabsContent>
                          <TabsContent value="createBlogs">
                            <BlogOrgForm
                              onSuccess={() => {}}
                              currentOrg={platformOrg}
                              authUserId={profile?.user_id}
                            />
                          </TabsContent>
                          <TabsContent value="createResources">
                            <ResourceForm
                              onSuccess={() => {}}
                              currentOrg={platformOrg}
                              authUserId={profile?.user_id}
                            />
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

// ⛔ AUTH DISABLED FOR UI TESTING — restore when done:
// export default withAuth(SuperAdminDashboardPage, ["super_admin"])
export default SuperAdminDashboardPage