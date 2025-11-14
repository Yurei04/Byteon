"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

const navLinks = [
    { title: "Home", href: "/" },
    { title: "About", href: "/" },
    { title: "Partners", href: "/partners" },
    { title: "Blog", href: "/blog" },
]

export default function NavBar() {
    const [isOpen, setIsOpen] = React.useState(false)

return (
    <div className="fixed z-50 w-full flex justify-center mt-4 px-4 sm:px-6">
        <nav className="w-full max-w-6xl bg-fuchsia-900/20 shadow-lg backdrop-blur-lg border border-fuchsia-400/30 text-fuchsia-100 rounded-2xl px-5 sm:px-8 py-5 transition-all duration-300">
            <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-fuchsia-300 tracking-wide">
                Byteon
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-2 flex-wrap">
                {navLinks.map((link) => (
                <Button
                    key={link.title}
                    variant="ghost"
                    size="sm"
                    className="text-xs border border-transparent text-fuchsia-200 hover:border-fuchsia-400 hover:bg-fuchsia-950/50 hover:text-fuchsia-100 transition-colors"
                    asChild
                >
                    <Link href={link.href}>{link.title}</Link>
                </Button>
                ))}
                <Button
                variant="ghost"
                size="sm"
                className="text-sm border border-fuchsia-500 hover:border-purple-400 hover:bg-purple-900/50 transition-colors"
                >
                <Link href="/how-to-hackathon">HowToHack</Link>
                </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
                <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="text-fuchsia-300 hover:bg-fuchsia-800/40"
                >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
            </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
            <div className="md:hidden mt-4 flex flex-col items-start gap-2">
                {navLinks.map((link) => (
                <Button
                    key={link.title}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sm border border-transparent text-fuchsia-200 hover:border-fuchsia-400 hover:bg-fuchsia-950/40 transition-colors"
                    asChild
                    onClick={() => setIsOpen(false)}
                >
                    <Link href={link.href}>{link.title}</Link>
                </Button>
                ))}
                <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm border border-fuchsia-500 hover:border-purple-300 hover:bg-purple-900/40 transition-colors"
                >
                <Link href="/how-to-hackathon">HowToHack</Link>
                </Button>
            </div>
            )}
        </nav>
        </div>
    )
}
