"use client"

// components/(auth)/AccountSwitcher.jsx
// Renders a dropdown of all saved accounts in localStorage.
// Drop it anywhere in your nav/header — it reads from accountsManager
// and calls switchAccount() / logoutAccount() from restoreSession.
//
// Usage:
//   import AccountSwitcher from "@/components/(auth)/AccountSwitcher"
//   <AccountSwitcher />

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/components/(auth)/authContext"
import { getAccounts } from "@/lib/accountManager" 
import { switchAccount, logoutAccount } from "@/lib/restoreSession"

const ROLE_STYLES = {
  super_admin: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  org_admin:   "bg-blue-500/20  text-blue-300  border border-blue-500/30",
  user:        "bg-purple-500/20 text-purple-300 border border-purple-500/30",
}

const ROLE_LABELS = {
  super_admin: "Super Admin",
  org_admin:   "Organization",
  user:        "User",
}

const ROLE_DASHBOARDS = {
  super_admin: "/super-admin-dashboard",
  org_admin:   "/org-dashboard",
  user:        "/user-dashboard",
}

export default function AccountSwitcher() {
  const { profile, role, session, refreshProfile, logout } = useAuth()
  const router  = useRouter()
  const [open, setOpen]           = useState(false)
  const [switching, setSwitching] = useState(null)
  const [removing, setRemoving]   = useState(null)
  const dropdownRef               = useRef(null)

  // getAccounts() is a synchronous localStorage read — no need to store in state.
  // The component re-renders whenever open/switching/removing/session changes,
  // so this always reflects the latest saved accounts without a useEffect.
  const accounts = getAccounts()

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const activeId = session?.user?.id

  const handleSwitch = async (targetUserId) => {
    if (targetUserId === activeId || switching) return
    setSwitching(targetUserId)
    setOpen(false)

    const { success, error } = await switchAccount(targetUserId, refreshProfile)

    if (success) {
      const target = accounts.find(a => a.userId === targetUserId)
      const dest   = target ? (ROLE_DASHBOARDS[target.role] ?? "/") : "/"
      router.push(dest)
    } else {
      alert(error || "Could not switch account. Please sign in again.")
    }

    setSwitching(null)
  }

  const handleRemove = async (e, userId) => {
    e.stopPropagation()
    if (removing) return
    setRemoving(userId)
    setOpen(false)

    await logoutAccount(userId, activeId, refreshProfile, logout)

    const remaining = getAccounts()
    if (remaining.length === 0) {
      router.push("/log-in")
    } else {
      router.refresh()
    }

    setRemoving(null)
  }

  if (!session) return null

  const activeAccount = accounts.find(a => a.userId === activeId)
  const otherAccounts = accounts.filter(a => a.userId !== activeId)

  return (
    <div className="relative" ref={dropdownRef}>

      {/* Trigger */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-purple-900/40 transition-colors border border-transparent hover:border-purple-400/30 focus:outline-none"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Avatar account={activeAccount} size={32} />
        <span className="text-sm text-purple-100 max-w-[120px] truncate cursor-pointer ">
          {activeAccount?.displayName ?? profile?.name ?? "Account"}
        </span>
        <ChevronIcon open={open} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 z-50 rounded-xl bg-purple-950/90 border border-purple-400/30 backdrop-blur-xl shadow-2xl shadow-purple-900/50 overflow-hidden">

          {/* Active account */}
          {activeAccount && (
            <div className="border-b border-purple-400/20">
              {/* Dashboard link — clicking the account info navigates to dashboard */}
              <button
                onClick={() => {
                  setOpen(false)
                  const dest = ROLE_DASHBOARDS[activeAccount.role] ?? "/"
                  router.push(dest)
                }}
                className="cursor-pointer w-full px-4 py-3 flex items-center gap-3 hover:bg-purple-800/30 transition-colors text-left"
              >
                <Avatar account={activeAccount} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-purple-50 truncate">
                    {activeAccount.displayName}
                  </p>
                  <RoleBadge role={activeAccount.role} />
                  <p className="text-[10px] text-purple-400 mt-0.5">Go to dashboard →</p>
                </div>
              </button>

              {/* Sign out button — separate row so it doesn't conflict with dashboard click */}
              <div className="px-4 pb-2 flex justify-end">
                <button
                  onClick={(e) => handleRemove(e, activeAccount.userId)}
                  title="Sign out of this account"
                  disabled={removing === activeAccount.userId}
                  className="cursor-pointer  flex items-center gap-1.5 text-xs text-purple-400 hover:text-red-400 transition-colors disabled:opacity-50 px-2 py-1 rounded hover:bg-red-500/10"
                >
                  {removing === activeAccount.userId ? <Spinner small /> : <SignOutIcon />}
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}

          {/* Other accounts */}
          {otherAccounts.length > 0 && (
            <div className="py-1">
              <p className="px-4 py-1.5 text-xs text-purple-400 uppercase tracking-wider">
                Other accounts
              </p>
              {otherAccounts.map(account => (
                <button
                  key={account.userId}
                  onClick={() => handleSwitch(account.userId)}
                  disabled={!!switching}
                  className="cursor-pointer  w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple-800/40 transition-colors text-left group disabled:opacity-60"
                >
                  <Avatar account={account} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-purple-100 truncate">
                      {account.displayName}
                    </p>
                    <RoleBadge role={account.role} />
                  </div>

                  {switching === account.userId ? (
                    <Spinner />
                  ) : (
                    <button
                      onClick={(e) => handleRemove(e, account.userId)}
                      title="Remove this account"
                      disabled={removing === account.userId}
                      className=" cursor-pointer opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-500/20 text-purple-400 hover:text-red-400 transition-all disabled:opacity-50"
                    >
                      {removing === account.userId ? <Spinner small /> : <SignOutIcon />}
                    </button>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Add account */}
          <div className="border-t border-purple-400/20 py-1.5">
            <button
              onClick={() => { setOpen(false); router.push("/log-in") }}
              className="cursor-pointer  w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple-800/40 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-full bg-purple-700/40 border border-purple-400/30 flex items-center justify-center text-purple-300 text-xl leading-none">
                +
              </div>
              <span className="text-sm text-purple-300">Add another account</span>
            </button>
          </div>

        </div>
      )}
    </div>
  )
}

// ─── Tiny sub-components ──────────────────────────────────────────────────────

function Avatar({ account, size = 36 }) {
  if (account?.avatarUrl) {
    return (
      <Image
        src={account.avatarUrl}
        alt={account.displayName ?? "avatar"}
        width={size}
        height={size}
        className="rounded-full object-cover border border-purple-400/30 flex-shrink-0"
        style={{ width: size, height: size }}
      />
    )
  }
  const letter = (account?.displayName ?? "?")[0].toUpperCase()
  return (
    <div
      className="rounded-full bg-purple-700/60 border border-purple-400/30 flex items-center justify-center text-purple-200 font-semibold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {letter}
    </div>
  )
}

function RoleBadge({ role }) {
  return (
    <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-0.5 ${ROLE_STYLES[role] ?? ROLE_STYLES.user}`}>
      {ROLE_LABELS[role] ?? role}
    </span>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`text-purple-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function SignOutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}

function Spinner({ small = false }) {
  const size = small ? "w-3 h-3" : "w-4 h-4"
  return <div className={`${size} border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin flex-shrink-0`} />
}