"use client"

import {
  Zap, Home, Handshake, BookOpen,
  Library, Terminal, GraduationCap, Sun, Moon,
} from "lucide-react"
import { useAuth } from "@/components/(auth)/authContext"
import SignLogInDialog from "@/app/(auth)/loginSigninDialog"
import AccountSwitcher from "./(auth)/accountSwitcher"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { useTheme } from "next-themes"
import { useState } from "react"

const navLinks = [
  { title: "Home",      tab: "home",     icon: Home },
  { title: "Partners",  tab: "partners", icon: Handshake },
  { title: "Blog",      tab: "blog",     icon: BookOpen },
  { title: "Resource",  tab: "resource", icon: Library },
  { title: "Hacks",     tab: "hacks",    icon: Terminal },
  { title: "HowToHack", tab: "howto",    icon: GraduationCap },
]

// ── Nav Item ──────────────────────────────────────────────
function SidebarNavItem({ value, icon: Icon, label, isActive, isCollapsed, onClick }) {
  return (
    <button
      onClick={() => onClick(value)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium relative transition-all duration-150"
      style={
        isActive
          ? {
              background: "rgb(var(--brand-500) / 0.12)",
              color: "rgb(var(--text-primary))",
              border: "1px solid rgb(var(--brand-500) / 0.35)",
            }
          : {
              background: "transparent",
              color: "rgb(var(--text-faint))",
              border: "1px solid transparent",
            }
      }
    >
      {isActive && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r-full"
          style={{ background: "linear-gradient(to bottom, rgb(var(--accent-500)), rgb(var(--brand-500)))" }}
        />
      )}

      <Icon className="w-[18px] h-[18px] shrink-0" />

      <span
        className="text-left text-xs whitespace-nowrap overflow-hidden transition-all"
        style={{ width: isCollapsed ? 0 : "auto", opacity: isCollapsed ? 0 : 1 }}
      >
        {label}
      </span>
    </button>
  )
}

// ── Sidebar ───────────────────────────────────────────────
export default function Sidebar({
  activeTab,
  onTabChange = () => {},
  isCollapsed = false,
  onToggle = () => {},
}) {
  const { loading, isLoggedIn } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleLogoClick = () => {
    onTabChange("home")
    onToggle?.()
  }

  const renderAuthSlot = (mobile = false) => {
    if (loading) {
      return (
        <div
          className="rounded-lg animate-pulse"
          style={{
            width: mobile ? 80 : "100%",
            height: 36,
            background: "rgb(var(--surface-raised))",
            border: "1px solid rgb(var(--surface-border) / 0.3)",
          }}
        />
      )
    }

    if (isLoggedIn) return <AccountSwitcher />

    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <button
            className={`flex items-center gap-2 rounded-lg text-sm font-medium transition-all
              ${isCollapsed ? "justify-center px-2 py-2" : "w-full px-3 py-2.5 justify-start"}`}
            style={{
              background: "linear-gradient(135deg, rgb(var(--accent-500)), rgb(var(--brand-500)))",
              color: "rgb(var(--fg-on-brand))",
            }}
          >
            <Zap className="w-3.5 h-3.5" />
            {!isCollapsed && <span className="text-xs">Login</span>}
          </button>
        </DialogTrigger>
        <DialogContent className="bg-transparent border-none shadow-none">
          <SignLogInDialog onClose={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden md:flex fixed left-0 top-0 h-screen z-50 flex-col py-5 transition-[width] duration-[250ms] ease-[ease]"
        style={{
          width: isCollapsed ? "4.5rem" : "16rem",
          background: "rgb(var(--bg-base))",
          borderRight: "1px solid rgb(var(--surface-border) / 0.15)",
        }}
      >
        {/* Top glow */}
        <div
          className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgb(var(--accent-500) / 0.06), transparent)" }}
        />

        {/* Logo */}
        <button onClick={handleLogoClick} className="flex items-center gap-2.5 mb-6 px-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, rgb(var(--accent-500)), rgb(var(--brand-500)))" }}
          >
            <Zap className="w-3.5 h-3.5" style={{ color: "rgb(var(--fg-on-brand))" }} />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
                Byteon
              </span>
              <span className="text-[9px]" style={{ color: "rgb(var(--text-faint))" }}>
                Platform
              </span>
            </div>
          )}
        </button>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 flex-1 px-2">
          {navLinks.map(({ title, tab, icon }) => (
            <SidebarNavItem
              key={tab}
              value={tab}
              icon={icon}
              label={title}
              isActive={activeTab === tab}
              isCollapsed={isCollapsed}
              onClick={onTabChange}
            />
          ))}
        </nav>

        {/* Divider */}
        <div
          className="my-3 h-px mx-2"
          style={{ background: "rgb(var(--surface-border) / 0.2)" }}
        />

        {/* Theme toggle + auth */}
        <div className="px-2 flex flex-col gap-2">
          <ThemeToggle isCollapsed={isCollapsed} />
          {renderAuthSlot()}
        </div>
      </aside>

      {/* ── Mobile Bottom Bar ── */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-1 py-1.5"
        style={{
          background: "rgb(var(--bg-base))",
          borderTop: "1px solid rgb(var(--surface-border) / 0.15)",
        }}
      >
        {navLinks.map(({ title, tab, icon: Icon }) => {
          const active = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 transition-colors"
              style={{ color: active ? "rgb(var(--accent-500))" : "rgb(var(--text-faint))" }}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span className="text-[9px]">{title}</span>
            </button>
          )
        })}

        {/* Theme toggle icon + auth on mobile */}
        <button
          onClick={() => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { theme, setTheme } = useTheme() 
          }}
          className="flex flex-col items-center gap-0.5 px-2.5 py-1.5"
        >
        </button>

        <div className="flex items-center gap-2 px-1">
          <MobileThemeToggle />
          {renderAuthSlot(true)}
        </div>
      </div>
    </>
  )
}
// ── Theme Toggle ──────────────────────────────────────────
function ThemeToggle({ isCollapsed }) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div
      className={`w-full flex items-center rounded-xl px-3 py-2.5 transition-all duration-150
        ${isCollapsed ? "justify-center px-2" : "gap-3"}`}
      style={{ color: "rgb(var(--text-muted))" }}
    >
      {!isCollapsed && (
        <Sun className="w-[18px] h-[18px] shrink-0" style={{ color: "rgb(var(--text-faint))" }} />
      )}

      {/* Switch track */}
      <button
        role="switch"
        aria-checked={isDark}
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="relative shrink-0 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2"
        style={{
          width: 36,
          height: 20,
          background: isDark
            ? "linear-gradient(135deg, rgb(var(--accent-500)), rgb(var(--brand-500)))"
            : "rgb(var(--surface-border))",
          boxShadow: isDark ? "0 0 8px rgb(var(--brand-500) / 0.4)" : "none",
          focusVisibleRing: "rgb(var(--brand-500))",
        }}
      >
        {/* Thumb */}
        <span
          className="absolute top-[2px] flex items-center justify-center rounded-full bg-white transition-all duration-300"
          style={{
            width: 16,
            height: 16,
            left: isDark ? "calc(100% - 18px)" : "2px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}
        >
          {isDark
            ? <Moon className="w-2.5 h-2.5" style={{ color: "rgb(var(--brand-600))" }} />
            : <Sun  className="w-2.5 h-2.5" style={{ color: "#f59e0b" }} />
          }
        </span>
      </button>

      {!isCollapsed && (
        <Moon className="w-[18px] h-[18px] shrink-0" style={{ color: "rgb(var(--text-faint))" }} />
      )}
    </div>
  )
}

// ── Mobile-specific minimal toggle ───────────────────────
function MobileThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <button
      role="switch"
      aria-checked={isDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative shrink-0 rounded-full transition-all duration-300"
      style={{
        width: 36,
        height: 20,
        background: isDark
          ? "linear-gradient(135deg, rgb(var(--accent-500)), rgb(var(--brand-500)))"
          : "rgb(var(--surface-border))",
        boxShadow: isDark ? "0 0 8px rgb(var(--brand-500) / 0.4)" : "none",
      }}
    >
      <span
        className="absolute top-[2px] flex items-center justify-center rounded-full bg-white transition-all duration-300"
        style={{
          width: 16,
          height: 16,
          left: isDark ? "calc(100% - 18px)" : "2px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      >
        {isDark
          ? <Moon className="w-2.5 h-2.5" style={{ color: "rgb(var(--brand-600))" }} />
          : <Sun  className="w-2.5 h-2.5" style={{ color: "#f59e0b" }} />
        }
      </span>
    </button>
  )
}