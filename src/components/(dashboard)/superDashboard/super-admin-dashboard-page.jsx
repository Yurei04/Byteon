"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/(auth)/authContext"
import { ReturnButton } from "@/components/return"
import {
  ShieldCheck, Users, Building2, FileText, Megaphone,
  BookOpen, TrendingUp, Clock, Eye, CheckSquare,
  AlertCircle, Loader2, LogOut, History, Bell,
} from "lucide-react"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

import SuperProfile       from "./super-profile,"
import AccountManageSection from "./accounts-manage-section"
import ApprovalSection    from "./approval-section"
import ViewableSection    from "./viewable-section"
import AnnounceForm       from "../announce/announce-form"
import BlogOrgForm        from "@/components/blog/blog-edit-user"
import ResourceForm       from "@/components/resourceHub/resource-form"
import HistorySection     from "./historyRecordsSection"

// ── Notifications ──────────────────────────────────────────────────────────────
import NotificationsTab from "@/components/notifications/notification-tab"
import { useNotifications } from "@/components/notifications/use-notification" 

function SuperAdminDashboardPage() {
  const { profile, session, logout } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab]         = useState("profile")
  const [pendingCount, setPendingCount]   = useState(0)
  const [showSignOutDialog, setShowSignOutDialog] = useState(false)
  const [signingOut, setSigningOut]       = useState(false)
  const [stats, setStats]                 = useState({
    totalUsers: 0, totalOrgs: 0, totalAnnouncements: 0,
    totalBlogs: 0, totalResources: 0, activeAnnouncements: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)

  const userId     = session?.user?.id
  const platformOrg = profile?.linkedOrg

  // ── Notifications ────────────────────────────────────────────────────────────
  const { unreadCount } = useNotifications({ userId, role: "super_admin" })

  const handleSignOut = async () => {
    setSigningOut(true)
    try { await logout(); router.push("/") }
    catch (err) { console.error("Sign out error:", err); setSigningOut(false); setShowSignOutDialog(false) }
  }

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const now = new Date().toISOString()
      const [
        { count: uCount }, { count: oCount }, { count: annCount },
        { count: blogCount }, { count: resCount }, { count: activeAnn },
        { count: pAnn }, { count: pBlog }, { count: pRes },
      ] = await Promise.all([
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase.from("organizations").select("id", { count: "exact", head: true }),
        supabase.from("announcements").select("id", { count: "exact", head: true }),
        supabase.from("blogs").select("id", { count: "exact", head: true }),
        supabase.from("resource_hub").select("id", { count: "exact", head: true }),
        supabase.from("announcements").select("id", { count: "exact", head: true }).gte("date_end", now),
        supabase.from("pending_announcements").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("pending_blogs").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("pending_resources").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ])
      setStats({
        totalUsers: uCount || 0, totalOrgs: oCount || 0,
        totalAnnouncements: annCount || 0, totalBlogs: blogCount || 0,
        totalResources: resCount || 0, activeAnnouncements: activeAnn || 0,
      })
      setPendingCount((pAnn || 0) + (pBlog || 0) + (pRes || 0))
    } catch {}
    finally { setStatsLoading(false) }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

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
    blue: "border-blue-500/30 from-blue-900/40", fuchsia: "border-fuchsia-500/30 from-fuchsia-900/40",
    amber: "border-amber-500/30 from-amber-900/40", purple: "border-purple-500/30 from-purple-900/40",
    pink: "border-pink-500/30 from-pink-900/40", emerald: "border-emerald-500/30 from-emerald-900/40",
    orange: "border-orange-500/30 from-orange-900/40",
  }
  const colorText = {
    blue: "text-blue-300", fuchsia: "text-fuchsia-300", amber: "text-amber-300",
    purple: "text-purple-300", pink: "text-pink-300", emerald: "text-emerald-300", orange: "text-orange-300",
  }

  const tabs = [
    { value: "profile",       icon: <ShieldCheck  className="w-4 h-4" />, label: "Profile"   },
    { value: "accounts",      icon: <Users        className="w-4 h-4" />, label: "Accounts"  },
    {
      value: "approval",
      icon:  <CheckSquare className="w-4 h-4" />,
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
    { value: "view",          icon: <Eye          className="w-4 h-4" />, label: "View All"  },
    { value: "history",       icon: <History      className="w-4 h-4" />, label: "Records"   },
    {
      value: "notifications",
      icon:  <Bell className="w-4 h-4" />,
      label: (
        <span className="flex items-center gap-1">
          Alerts
          {unreadCount > 0 && (
            <span className="min-w-[17px] h-[17px] flex items-center justify-center rounded-full
              bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white text-[10px] font-bold px-1
              shadow-sm shadow-fuchsia-500/40">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </span>
      ),
    },
  ]

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
          </p>
        </div>
        <Button onClick={() => setShowSignOutDialog(true)} variant="outline" size="sm"
          className="shrink-0 border-red-500/40 text-red-300 hover:bg-red-500/20 hover:border-red-400 hover:text-red-200 transition-all gap-2">
          <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Sign Out</span>
        </Button>
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

        {/* Main Content */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-fuchsia-950/40 via-purple-950/40 to-slate-950/40 backdrop-blur-xl border border-fuchsia-500/20">
            <CardContent className="p-4 sm:p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>

                <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 mb-6 bg-black/20 border border-fuchsia-500/20 p-1 gap-1 h-auto">
                  {tabs.map(({ value, icon, label }) => (
                    <TabsTrigger key={value} value={value}
                      className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all py-2">
                      {icon}{label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="profile">
                  <SuperProfile profile={profile} session={session} stats={{ ...stats, totalPending: pendingCount }} />
                </TabsContent>

                <TabsContent value="accounts">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Account Management</h2>
                    <p className="text-white/40 text-sm mt-1">Suspend or delete user and organization accounts.</p>
                  </div>
                  <AccountManageSection />
                </TabsContent>

                <TabsContent value="approval">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">Content Approval Queue</h2>
                    <p className="text-white/40 text-sm mt-1">Review submissions from organizations before they go live.</p>
                  </div>
                  <ApprovalSection onApprovalChange={(count) => setPendingCount(count)} />
                </TabsContent>

                <TabsContent value="view">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-300">All Live Content</h2>
                    <p className="text-white/40 text-sm mt-1">View and delete any published content across the platform.</p>
                  </div>
                  <ViewableSection />
                </TabsContent>

                <TabsContent value="history">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-300">Publish Content</h2>
                    <p className="text-white/40 text-sm mt-1">Super admin posts go directly to the platform — no approval needed.</p>
                  </div>
                  {!platformOrg ? (
                    <Alert className="bg-amber-900/20 border-amber-500/30">
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      <AlertDescription className="text-amber-200">
                        No platform organization linked. Add an <code className="bg-black/30 px-1 rounded">organization_id</code> to your <code className="bg-black/30 px-1 rounded">super_admins</code> row to enable posting.
                      </AlertDescription>
                    </Alert>
                  ) : <HistorySection />}
                </TabsContent>

                {/* ── Notifications Tab ── */}
                <TabsContent value="notifications">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-pink-300">
                      Notifications
                    </h2>
                    <p className="text-white/40 text-sm mt-1">
                      Platform activity alerts — org deletions, user actions, and system events.
                    </p>
                  </div>
                  <NotificationsTab userId={userId} role="super_admin" />
                </TabsContent>

              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Sign Out Dialog */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-900 via-red-900/30 to-slate-900 border-red-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-200 flex items-center gap-2">
              <LogOut className="w-5 h-5" />Sign Out
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to sign out of the Super Admin panel?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={signingOut} className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut} disabled={signingOut}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white">
              {signingOut
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Signing out...</>
                : <><LogOut className="w-4 h-4 mr-2" />Sign Out</>}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default SuperAdminDashboardPage