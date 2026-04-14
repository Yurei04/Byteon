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

// ── Design tokens (match all dashboards) ─────────────────────────────────────
const P = "#c026d3"
const S = "#a855f7"

const navLinks = [
  { title: "Home",      tab: "home",     icon: Home          },
  { title: "Partners",  tab: "partners", icon: Handshake     },
  { title: "Blog",      tab: "blog",     icon: BookOpen      },
  { title: "Resource",  tab: "resource", icon: Library       },
  { title: "Hacks",     tab: "hacks",    icon: Terminal      },
  { title: "HowToHack", tab: "howto",    icon: GraduationCap },
]

export default function Sidebar({ activeTab, onTabChange = () => {} }) {
  const { loading, isLoggedIn } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const renderAuthSlot = (mobile = false) => {
    if (loading) {
      return (
        <div
          className="rounded-xl animate-pulse"
          style={{
            width: mobile ? 80 : "100%",
            height: 38,
            background: `${P}18`,
            border: `1px solid ${P}25`,
          }}
        />
      )
    }

    if (isLoggedIn) return <AccountSwitcher />

    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <button
            className={`relative group flex items-center gap-2 rounded-xl text-sm font-semibold overflow-hidden
              transition-all duration-300 text-white active:scale-95
              ${mobile ? "px-4 py-2" : "w-full px-3 py-2.5 justify-center xl:justify-start"}`}
            style={{
              background: `linear-gradient(135deg, ${P}, ${S})`,
              boxShadow: `0 4px 14px ${P}45`,
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 20px ${P}65`; e.currentTarget.style.transform = "translateY(-1px)" }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 4px 14px ${P}45`; e.currentTarget.style.transform = "translateY(0)" }}
          >
            {/* Shimmer sweep */}
            <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" }} />
            {/* Top sheen */}
            <span className="absolute inset-x-0 top-0 h-px"
              style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent)" }} />
            <Zap className="relative w-3.5 h-3.5 fill-white shrink-0" />
            <span className={`relative text-xs font-semibold ${mobile ? "" : "hidden xl:inline"}`}>
              Login
            </span>
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
      {/* ════════════════════ DESKTOP SIDEBAR ════════════════════ */}
      <aside
        className="hidden md:flex fixed left-0 top-0 h-screen z-50 flex-col w-16 xl:w-56 px-2 xl:px-3 py-5"
        style={{
          background: "rgba(3, 0, 14, 0.88)",
          borderRight: `1px solid ${P}15`,
          backdropFilter: "blur(24px)",
        }}
      >
        {/* Top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, ${P}14, transparent)` }} />

        {/* Ambient glow blob */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-28 h-48 rounded-full pointer-events-none"
          style={{ background: `${P}0d`, filter: "blur(40px)" }} />

        {/* ── Logo / Brand ── */}
        <button
          onClick={() => onTabChange("home")}
          className="relative flex items-center gap-2.5 group mb-7 px-2 xl:px-1 w-full"
        >
          <div
            className="w-8 h-8 shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${P}, ${S})`,
              boxShadow: `0 4px 14px ${P}50`,
            }}
          >
            <Zap className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <div className="hidden xl:flex flex-col leading-tight">
            <span className="text-sm font-bold text-transparent bg-clip-text"
              style={{ backgroundImage: `linear-gradient(135deg, ${P}, ${S})` }}>
              Byteon
            </span>
            <span className="text-[9px] font-medium" style={{ color: `${P}80` }}>
              Platform
            </span>
          </div>
        </button>

        {/* ── Nav section label ── */}
        <p className="hidden xl:block text-[9px] font-semibold uppercase tracking-[0.18em] px-3 mb-2"
          style={{ color: `${P}70` }}>
          Navigation
        </p>

        {/* ── Nav items ── */}
        <nav className="flex flex-col gap-0.5 flex-1">
          {navLinks.map(({ title, tab, icon: Icon }) => {
            const active = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className="relative group flex items-center gap-3 w-full rounded-xl px-2 xl:px-3 py-2.5 text-left transition-all duration-150"
                style={active ? {
                  background: `linear-gradient(135deg, ${P}22, ${S}14)`,
                  color: "#ffffff",
                  border: `1px solid ${P}40`,
                  boxShadow: `0 0 18px ${P}15, inset 0 1px 0 ${P}20`,
                } : {
                  background: "transparent",
                  color: "rgba(255,255,255,0.4)",
                  border: "1px solid transparent",
                }}
                onMouseEnter={e => {
                  if (active) return
                  e.currentTarget.style.background = `${P}10`
                  e.currentTarget.style.color = "rgba(255,255,255,0.85)"
                  e.currentTarget.style.borderColor = `${P}20`
                }}
                onMouseLeave={e => {
                  if (active) return
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.color = "rgba(255,255,255,0.4)"
                  e.currentTarget.style.borderColor = "transparent"
                }}
              >
                {/* Active left bar */}
                {active && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                    style={{ background: `linear-gradient(to bottom, ${P}, ${S})`, boxShadow: `0 0 8px ${P}` }}
                  />
                )}

                {/* Icon */}
                <Icon
                  className="relative shrink-0 w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110"
                  style={{ color: active ? P : "inherit" }}
                />

                {/* Label — desktop only */}
                <span className="relative hidden xl:block text-xs font-medium tracking-wide">
                  {title}
                </span>

                {/* Active pip — icon-only mode (< xl) */}
                {active && (
                  <span className="xl:hidden absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                    style={{ background: `linear-gradient(to bottom, ${P}, ${S})` }} />
                )}
              </button>
            )
          })}
        </nav>

        {/* ── Divider ── */}
        <div className="my-3 h-px" style={{ background: `linear-gradient(to right, transparent, ${P}30, transparent)` }} />

        {/* ── Auth slot ── */}
        <div className="flex justify-center xl:justify-stretch">
          {renderAuthSlot()}
        </div>
      </aside>

      {/* ════════════════════ MOBILE BOTTOM BAR ════════════════════ */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-1 py-1.5"
        style={{
          background: "rgba(3, 0, 14, 0.92)",
          borderTop: `1px solid ${P}20`,
          backdropFilter: "blur(24px)",
          boxShadow: `0 -8px 32px rgba(0,0,0,0.4), 0 -1px 0 ${P}15`,
        }}
      >
        {navLinks.map(({ title, tab, icon: Icon }) => {
          const active = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className="relative flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl min-w-[44px] transition-all duration-150"
              style={{
                color: active ? "#ffffff" : "rgba(255,255,255,0.35)",
              }}
            >
              {/* Active background pill */}
              {active && (
                <span
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${P}22, ${S}14)`,
                    border: `1px solid ${P}40`,
                    boxShadow: `0 0 12px ${P}15`,
                  }}
                />
              )}

              {/* Active dot indicator at top */}
              {active && (
                <span
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                  style={{ background: `linear-gradient(to right, ${P}, ${S})`, boxShadow: `0 0 6px ${P}` }}
                />
              )}

              <Icon
                className="relative w-[18px] h-[18px]"
                style={{ color: active ? P : "inherit" }}
              />
              <span className="relative text-[9px] font-medium leading-none tracking-wide">
                {title}
              </span>
            </button>
          )
        })}

        {/* Auth slot */}
        <div className="flex items-center px-1">
          {renderAuthSlot(true)}
        </div>
      </div>
    </>
  )
}