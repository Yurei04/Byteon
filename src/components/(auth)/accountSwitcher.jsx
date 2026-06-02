"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/components/(auth)/authContext"
import { getAccounts } from "@/lib/accountManager"
import { switchAccount, logoutAccount, persistCurrentSession } from "@/lib/restoreSession"
import { ChevronDown, LogOut, Plus, ExternalLink, Loader2 } from "lucide-react"

const ROLE_CONFIG = {
  super_admin: { label: "Super Admin",  accent: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.28)" },
  org_admin:   { label: "Organization", accent: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.28)" },
  user:        { label: "Participant",  accent: "rgb(var(--brand-500))", bg: "rgb(var(--brand-500) / 0.1)", border: "rgb(var(--brand-500) / 0.25)" },
}

const ROLE_DASHBOARDS = {
  super_admin: "/super-admin-dashboard",
  org_admin:   "/org-dashboard",
  user:        "/user-dashboard",
}

function Avatar({ account, size = 36 }) {
  if (account?.avatarUrl) {
    return (
      <Image
        src={account.avatarUrl} alt={account.displayName ?? "avatar"}
        width={size} height={size}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size, border: "1.5px solid rgb(var(--brand-500) / 0.3)" }}
      />
    )
  }
  const letter = (account?.displayName ?? account?.role ?? "?")[0].toUpperCase()
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
      style={{
        width: size, height: size, fontSize: size * 0.38,
        background: `linear-gradient(135deg, rgb(var(--brand-500) / 0.3), rgb(var(--accent-500) / 0.2))`,
        border: "1.5px solid rgb(var(--brand-500) / 0.35)",
        color: "rgb(var(--fg-on-brand, 255 255 255))",
      }}
    >
      {letter}
    </div>
  )
}

function RoleBadge({ role }) {
  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.user
  return (
    <span
      className="inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider mt-0.5"
      style={{ background: cfg.bg, color: cfg.accent, border: `1px solid ${cfg.border}` }}
    >
      {cfg.label}
    </span>
  )
}

function Spinner({ size = "sm" }) {
  return (
    <Loader2
      className={`${size === "sm" ? "w-3 h-3" : "w-4 h-4"} animate-spin flex-shrink-0`}
      style={{ color: "rgb(var(--brand-500))" }}
    />
  )
}

export default function AccountSwitcher({ isCollapsed = false }) {
  const { profile, role, session, refreshProfile, logout } = useAuth()
  const router  = useRouter()
  const [open, setOpen]           = useState(false)
  const [switching, setSwitching] = useState(null)
  const [removing, setRemoving]   = useState(null)
  const dropdownRef               = useRef(null)

  const accounts = getAccounts()
  const activeId = session?.user?.id

  useEffect(() => {
    if (!session || !profile || !role) return
    const exists = getAccounts().find(a => a.userId === session.user.id)
    if (!exists) persistCurrentSession(profile, role)
  }, [session, profile, role])

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const handleSwitch = async (targetUserId) => {
    if (targetUserId === activeId || switching) return
    setSwitching(targetUserId)
    setOpen(false)
    const { success, error } = await switchAccount(targetUserId, refreshProfile)
    if (success) {
      const target = accounts.find(a => a.userId === targetUserId)
      router.push(target ? (ROLE_DASHBOARDS[target.role] ?? "/") : "/")
    } else {
      alert(error || "Could not switch account. Please sign in again.")
    }
    setSwitching(null)
  }

  const handleAddAccount = () => {
    if (session && profile && role) persistCurrentSession(profile, role)
    window.location.href = "/log-in?add=true"
  }

  const handleRemove = async (e, userId) => {
    e.stopPropagation()
    if (removing) return
    setRemoving(userId)
    setOpen(false)
    await logoutAccount(userId, activeId, refreshProfile, logout)
    const remaining = getAccounts()
    if (remaining.length === 0) { window.location.href = "/log-in" }
    else { router.refresh() }
    setRemoving(null)
  }

  if (!session) return null

  const activeAccountFromStorage = accounts.find(a => a.userId === activeId)
  const activeAccount = activeAccountFromStorage ?? (profile ? {
    userId:      activeId,
    displayName: profile?.name ?? profile?.author_name ?? session.user.email ?? "Account",
    avatarUrl:   profile?.profile_photo_url ?? null,
    role:        role ?? "user",
  } : null)

  const otherAccounts = accounts.filter(a => a.userId !== activeId)

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* ── Trigger ── */}
      <button
        onClick={() => setOpen(prev => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
        className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-all duration-200 cursor-pointer"
        style={{
          background: open ? "rgb(var(--brand-500) / 0.1)" : "rgb(var(--surface-raised))",
          border: `1px solid ${open ? "rgb(var(--brand-500) / 0.5)" : "rgb(var(--surface-border) / 0.3)"}`,
        }}
        onMouseEnter={e => {
          if (open) return
          e.currentTarget.style.background = "rgb(var(--brand-500) / 0.06)"
          e.currentTarget.style.borderColor = "rgb(var(--brand-500) / 0.25)"
        }}
        onMouseLeave={e => {
          if (open) return
          e.currentTarget.style.background = "rgb(var(--surface-raised))"
          e.currentTarget.style.borderColor = "rgb(var(--surface-border) / 0.3)"
        }}
      >
        <Avatar account={activeAccount} size={28} />

        <div className="flex flex-col min-w-0 text-left">
          <span
            className="text-xs font-semibold truncate leading-tight"
            style={{ color: "rgb(var(--text-primary))" }}
          >
            {activeAccount?.displayName ?? session.user.email ?? "Account"}
          </span>
          {!isCollapsed && (
            <span
              className="text-[10px] leading-none mt-0.5"
              style={{ color: "rgb(var(--text-faint))" }}
            >
              {ROLE_CONFIG?.[activeAccount?.role]?.label ?? "User"}
            </span>
          )}
        </div>

        <ChevronDown
          className={`${isCollapsed ? "hidden" : "block"} w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200`}
          style={{ color: "rgb(var(--text-faint))" }}
        />
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div
          className="absolute bottom-full left-0 mb-2 w-72 z-50 rounded-2xl overflow-hidden"
          style={{
            background: "rgb(var(--surface-raised))",
            border: "1px solid rgb(var(--brand-500) / 0.2)",
            backdropFilter: "blur(24px)",
            boxShadow: `0 -8px 40px rgb(0 0 0 / 0.15), 0 0 0 1px rgb(var(--brand-500) / 0.06)`,
          }}
        >
          {/* Top gradient accent */}
          <div
            className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, rgb(var(--brand-500) / 0.08), transparent)" }}
          />

          {/* ── Active account ── */}
          {activeAccount && (
            <div style={{ borderBottom: "1px solid rgb(var(--surface-border) / 0.25)" }}>
              <button
                onClick={() => { setOpen(false); router.push(ROLE_DASHBOARDS[activeAccount.role] ?? ROLE_DASHBOARDS[role] ?? "/") }}
                className="relative w-full px-4 py-3.5 flex items-center gap-3 text-left transition-all duration-150"
                onMouseEnter={e => (e.currentTarget.style.background = "rgb(var(--brand-500) / 0.06)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <Avatar account={activeAccount} size={40} />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold truncate leading-tight"
                    style={{ color: "rgb(var(--text-primary))" }}
                  >
                    {activeAccount.displayName}
                  </p>
                  <RoleBadge role={activeAccount.role} />
                  <p
                    className="text-[10px] mt-1.5 flex items-center gap-1"
                    style={{ color: "rgb(var(--brand-500) / 0.7)" }}
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    Go to dashboard
                  </p>
                </div>
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }}
                />
              </button>

              {/* Sign out this account */}
              <div className="px-4 pb-3 flex justify-end">
                <button
                  onClick={(e) => handleRemove(e, activeAccount.userId)}
                  disabled={removing === activeAccount.userId}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all duration-200 disabled:opacity-50"
                  style={{ color: "rgb(var(--text-faint))", border: "1px solid transparent" }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = "#f87171"
                    e.currentTarget.style.background = "rgba(239,68,68,0.1)"
                    e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)"
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = "rgb(var(--text-faint))"
                    e.currentTarget.style.background = "transparent"
                    e.currentTarget.style.borderColor = "transparent"
                  }}
                >
                  {removing === activeAccount.userId ? <Spinner size="sm" /> : <LogOut className="w-3 h-3" />}
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}

          {/* ── Other accounts ── */}
          {otherAccounts.length > 0 && (
            <div className="py-2" style={{ borderBottom: "1px solid rgb(var(--surface-border) / 0.2)" }}>
              <p
                className="px-4 pb-1.5 pt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: "rgb(var(--text-faint))" }}
              >
                Other accounts
              </p>
              {otherAccounts.map(account => (
                <button
                  key={account.userId}
                  onClick={() => handleSwitch(account.userId)}
                  disabled={!!switching}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left group disabled:opacity-60 transition-all duration-150"
                  onMouseEnter={e => (e.currentTarget.style.background = "rgb(var(--brand-500) / 0.05)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <Avatar account={account} size={34} />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm truncate font-medium leading-tight"
                      style={{ color: "rgb(var(--text-secondary))" }}
                    >
                      {account.displayName}
                    </p>
                    <RoleBadge role={account.role} />
                  </div>
                  {switching === account.userId ? (
                    <Spinner />
                  ) : (
                    <button
                      onClick={(e) => handleRemove(e, account.userId)}
                      disabled={removing === account.userId}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all duration-200 flex-shrink-0 disabled:opacity-50"
                      style={{ color: "rgb(var(--text-faint))" }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = "#f87171"
                        e.currentTarget.style.background = "rgba(239,68,68,0.12)"
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = "rgb(var(--text-faint))"
                        e.currentTarget.style.background = "transparent"
                      }}
                    >
                      {removing === account.userId ? <Spinner size="sm" /> : <LogOut className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* ── Add account ── */}
          <div className="p-2">
            <button
              onClick={handleAddAccount}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group"
              style={{ border: "1px dashed rgb(var(--brand-500) / 0.25)" }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgb(var(--brand-500) / 0.06)"
                e.currentTarget.style.borderColor = "rgb(var(--brand-500) / 0.5)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "transparent"
                e.currentTarget.style.borderColor = "rgb(var(--brand-500) / 0.25)"
              }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-105"
                style={{
                  background: "rgb(var(--brand-500) / 0.1)",
                  border: "1px solid rgb(var(--brand-500) / 0.3)",
                }}
              >
                <Plus className="w-4 h-4" style={{ color: "rgb(var(--brand-500))" }} />
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: "rgb(var(--text-faint))" }}
              >
                Add another account
              </span>
            </button>
          </div>

          {/* Bottom gradient accent */}
          <div
            className="h-px w-full"
            style={{
              background: `linear-gradient(to right, transparent, rgb(var(--brand-500) / 0.35), rgb(var(--accent-500) / 0.25), transparent)`,
            }}
          />
        </div>
      )}
    </div>
  )
}