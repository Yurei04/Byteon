"use client"

import Link from "next/link"
import { Menu, X, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/(auth)/authContext"
import SignLogInDialog from "@/app/(auth)/loginSigninDialog"
import AccountSwitcher from "./(auth)/accountSwitcher"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"

const navLinks = [
  { title: "Home",      href: "/"                  },
  { title: "Partners",  href: "/partners"           },
  { title: "Blog",      href: "/blog"               },
  { title: "Resource",  href: "/resource-hub"       },
  { title: "Hacks",     href: "/announce"           },
  { title: "HowToHack", href: "/how-to-hackathon"  },
]

export default function NavBar() {
  const { loading, isLoggedIn } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen]             = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [scrolled, setScrolled]         = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false) }, [pathname])

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href)

  const renderAuthSlot = () => {
    if (loading) {
      return <div className="w-8 h-8 rounded-full bg-fuchsia-400/20 animate-pulse ring-1 ring-fuchsia-400/30" />
    }
    if (isLoggedIn) return <AccountSwitcher />

    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <button className="relative group px-4 py-1.5 rounded-full text-sm font-medium text-fuchsia-200 overflow-hidden transition-all duration-300 border border-fuchsia-400/40 hover:border-fuchsia-300/70 hover:text-white">
            <span className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/0 via-fuchsia-500/20 to-fuchsia-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <span className="relative flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
              Sign In
            </span>
          </button>
        </DialogTrigger>
        <DialogContent className="bg-transparent border-none shadow-none">
          <SignLogInDialog />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      {/* Ambient top glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-20 bg-fuchsia-600/10 blur-3xl pointer-events-none z-40 rounded-full" />

      <div className={`fixed z-50 w-full flex justify-center px-4 sm:px-6 transition-all duration-500 ${scrolled ? "mt-2" : "mt-5"}`}>
        <nav className={`w-full max-w-5xl rounded-2xl px-4 sm:px-6 transition-all duration-500 ${
          scrolled
            ? "py-3 bg-black/65 border border-fuchsia-400/20 shadow-xl shadow-fuchsia-900/25 backdrop-blur-2xl"
            : "py-4 bg-fuchsia-950/35 border border-fuchsia-400/20 shadow-lg backdrop-blur-xl"
        }`}>

          <div className="flex items-center justify-between gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/30 group-hover:shadow-fuchsia-400/50 group-hover:scale-105 transition-all duration-300">
                <Zap className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <span className="text-base font-bold bg-gradient-to-r from-fuchsia-300 to-purple-300 bg-clip-text text-transparent tracking-tight">
                Byteon
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
              {navLinks.map((link) => {
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.title}
                    href={link.href}
                    className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 group ${
                      active ? "text-fuchsia-100" : "text-fuchsia-300/65 hover:text-fuchsia-100"
                    }`}
                  >
                    {active && (
                      <span className="absolute inset-0 rounded-lg bg-fuchsia-500/15 ring-1 ring-fuchsia-400/30" />
                    )}
                    <span className="absolute inset-0 rounded-lg bg-fuchsia-500/0 group-hover:bg-fuchsia-500/8 transition-colors duration-200" />
                    <span className="relative">{link.title}</span>
                    {active && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-fuchsia-400" />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              <div className="h-5 w-px bg-fuchsia-400/20" />
              {renderAuthSlot()}
            </div>

            {/* Mobile: auth + burger */}
            <div className="md:hidden flex items-center gap-2">
              {renderAuthSlot()}
              <button
                onClick={() => setIsOpen(prev => !prev)}
                className="w-8 h-8 rounded-lg bg-fuchsia-900/40 border border-fuchsia-400/20 flex items-center justify-center text-fuchsia-300 hover:bg-fuchsia-800/50 hover:text-fuchsia-100 transition-all duration-200"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mobile menu — smooth expand */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0 mt-0"
          }`}>
            <div className="border-t border-fuchsia-400/15 pt-3 flex flex-col gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.title}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-fuchsia-500/15 text-fuchsia-100 ring-1 ring-fuchsia-400/25"
                        : "text-fuchsia-300/75 hover:bg-fuchsia-800/30 hover:text-fuchsia-100"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? "bg-fuchsia-400" : "bg-fuchsia-600/40"}`} />
                    {link.title}
                  </Link>
                )
              })}
            </div>
          </div>

        </nav>
      </div>
    </>
  )
}