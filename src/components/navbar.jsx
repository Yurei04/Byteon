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
      return <div className="w-8 h-8 rounded-full bg-fuchsia-400/20 animate-pulse ring-1 ring-fuchsia-400/30" />
    }
    if (isLoggedIn) return <AccountSwitcher />

    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <button
            className={`relative group flex items-center gap-2 rounded-xl text-sm font-semibold overflow-hidden
              transition-all duration-300 bg-gradient-to-r from-fuchsia-600 to-pink-600
              hover:from-fuchsia-500 hover:to-pink-500 text-white hover:scale-[1.03] active:scale-95
              shadow-lg shadow-fuchsia-900/40 hover:shadow-fuchsia-600/40
              ${mobile
                ? "px-4 py-2"
                : "w-full px-3 py-2.5 justify-center xl:justify-start"
              }`}
          >
            <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <span className="absolute inset-0 bg-white/8 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
            <Zap className="relative w-3.5 h-3.5 fill-white shrink-0" />
            <span className={`relative text-xs font-semibold ${mobile ? "" : "hidden xl:inline"}`}>Login</span>
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
      {/* ── Desktop / Tablet sidebar ── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen z-50 flex-col
        w-16 xl:w-56
        bg-black/70 border-r border-white/[0.06]
        backdrop-blur-2xl
        px-2 xl:px-3 py-5">

        {/* Subtle ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-32 h-48
          bg-fuchsia-700/10 blur-3xl pointer-events-none rounded-full" />

        {/* Logo — acts as Home tab trigger */}
        <button
          onClick={() => onTabChange("home")}
          className="flex items-center gap-2.5 group mb-7 px-2 xl:px-1 w-full"
        >
          <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-fuchsia-500 to-pink-600
            flex items-center justify-center
            shadow-md shadow-fuchsia-800/40
            group-hover:shadow-fuchsia-500/50 group-hover:scale-105 transition-all duration-300">
            <Zap className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <span className="hidden xl:block text-sm font-bold
            bg-gradient-to-r from-fuchsia-300 to-pink-300
            bg-clip-text text-transparent tracking-tight">
            Byteon
          </span>
        </button>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 flex-1">
          {navLinks.map(({ title, tab, icon: Icon }) => {
            const active = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`relative group flex items-center gap-3 w-full rounded-lg
                  px-2 xl:px-3 py-2.5 text-left
                  transition-all duration-150
                  ${active
                    ? "text-fuchsia-100 bg-fuchsia-500/12 ring-1 ring-fuchsia-400/20"
                    : "text-fuchsia-300/50 hover:text-fuchsia-100 hover:bg-white/[0.04]"
                  }`}
              >
                {/* Hover shimmer */}
                <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100
                  bg-gradient-to-r from-fuchsia-500/5 to-pink-500/5 transition-opacity duration-200" />

                <Icon className={`relative shrink-0 w-[18px] h-[18px]
                  transition-transform duration-200 group-hover:scale-110
                  ${active ? "text-fuchsia-300" : ""}`} />

                <span className="relative hidden xl:block text-xs font-medium tracking-wide">
                  {title}
                </span>

                {/* Active pip — icon-only mode */}
                {active && (
                  <span className="xl:hidden absolute left-0 top-1/2 -translate-y-1/2
                    w-0.5 h-5 rounded-full bg-fuchsia-400" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="my-3 h-px bg-white/[0.06]" />

        {/* Auth */}
        <div className="flex justify-center xl:justify-stretch">
          {renderAuthSlot()}
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50
        bg-black/85 border-t border-white/[0.07] backdrop-blur-2xl
        flex items-center justify-around px-1 py-1.5">

        {navLinks.map(({ title, tab, icon: Icon }) => {
          const active = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`relative flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl
                transition-all duration-150 min-w-[44px]
                ${active ? "text-fuchsia-200" : "text-fuchsia-400/50 hover:text-fuchsia-200"}`}
            >
              {active && (
                <span className="absolute inset-0 rounded-xl bg-fuchsia-500/12 ring-1 ring-fuchsia-400/20" />
              )}
              <Icon className="relative w-[18px] h-[18px]" />
              <span className="relative text-[9px] font-medium leading-none tracking-wide">
                {title}
              </span>
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