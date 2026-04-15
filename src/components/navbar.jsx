"use client"

import {
  Zap, Home, Handshake, BookOpen,
  Library, Terminal, GraduationCap,
} from "lucide-react"
import { useAuth } from "@/components/(auth)/authContext"
import SignLogInDialog from "@/app/(auth)/loginSigninDialog"
import AccountSwitcher from "./(auth)/accountSwitcher"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { useState } from "react"

// ── Tokens ───────────────────────────────────────────────
const P = "#c026d3"
const S = "#a855f7"
const BG = "#05010a"

const navLinks = [
  { title: "Home", tab: "home", icon: Home },
  { title: "Partners", tab: "partners", icon: Handshake },
  { title: "Blog", tab: "blog", icon: BookOpen },
  { title: "Resource", tab: "resource", icon: Library },
  { title: "Hacks", tab: "hacks", icon: Terminal },
  { title: "HowToHack", tab: "howto", icon: GraduationCap },
]

// ── Nav Item ───────────────────────────────────
function SidebarNavItem({
  value,
  icon: Icon,
  label,
  isActive,
  isCollapsed,
  onClick,
}) {
  return (
    <button
      onClick={() => onClick(value)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium relative transition-all duration-150"
      style={
        isActive
          ? {
              background: "rgba(192,38,211,0.12)",
              color: "#fff",
              border: "1px solid rgba(192,38,211,0.35)",
            }
          : {
              background: "transparent",
              color: "rgba(255,255,255,0.45)",
              border: "1px solid transparent",
            }
      }
    >
      {isActive && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r-full"
          style={{ background: `linear-gradient(${P}, ${S})` }}
        />
      )}

      <Icon className="w-[18px] h-[18px]" />

      <span
        className="text-left text-xs whitespace-nowrap overflow-hidden transition-all"
        style={{
          width: isCollapsed ? 0 : "auto",
          opacity: isCollapsed ? 0 : 1,
        }}
      >
        {label}
      </span>
    </button>
  )
}

// ── Sidebar ───────────────────────────────────
export default function Sidebar({
  activeTab,
  onTabChange = () => {},
  isCollapsed = false,
  onToggle = () => {},
}) {
  const { loading, isLoggedIn } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // ── LOGO IS NOW THE ONLY CONTROLLER ──
  const handleLogoClick = () => {
    onTabChange("home")

    // toggle collapse state (single control UX)
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
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        />
      )
    }

    if (isLoggedIn) return <AccountSwitcher />

    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <button
            className={`flex items-center gap-2 rounded-lg text-sm font-medium text-white transition-all
              ${isCollapsed ? "justify-center px-2 py-2" : "w-full px-3 py-2.5 justify-start"}`}
            style={{
              background: `linear-gradient(135deg, ${P}, ${S})`,
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
      <aside
        className="hidden md:flex fixed left-0 top-0 h-screen z-50 flex-col py-5"
        style={{
          width: isCollapsed ? "4.5rem" : "16rem",
          background: BG,
          borderRight: "1px solid rgba(255,255,255,0.06)",
          transition: "width 0.25s ease",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, ${P}10, transparent)`,
          }}
        />

        {/* ── LOGO = PRIMARY CONTROL ── */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 mb-6 px-3"
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${P}, ${S})`,
            }}
          >
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-white">
                Byteon
              </span>
              <span className="text-[9px] text-white/40">
                Platform
              </span>
            </div>
          )}
        </button>

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

        <div className="my-3 h-px bg-white/20 mx-2" />

        <div className="px-2">
          {renderAuthSlot()}
        </div>
      </aside>

      {/* MOBILE unchanged */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-1 py-1.5"
        style={{
          background: BG,
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {navLinks.map(({ title, tab, icon: Icon }) => {
          const active = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className="flex flex-col items-center gap-0.5 px-2.5 py-1.5"
              style={{
                color: active ? P : "rgba(255,255,255,0.4)",
              }}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span className="text-[9px]">{title}</span>
            </button>
          )
        })}

        <div className="flex items-center px-1">
          {renderAuthSlot(true)}
        </div>
      </div>
    </>
  )
}