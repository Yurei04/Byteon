"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/(auth)/authContext"
import SignLogInDialog from "@/app/(auth)/loginSigninDialog"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"

const navLinks = [
    { title: "Home", href: "/" },
    { title: "Partners", href: "/partners" },
    { title: "Blog", href: "/blog" },
    { title: "Resource", href: "/resource-hub" },
    { title: "Hacks", href: "/announce" },
]

export default function NavBar() {
    const router = useRouter()
    const { profile, role, loading, isLoggedIn } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const dashboardUrl =
        role === "super_admin" ? "/super-admin-dashboard"
        : role === "org_admin"  ? "/org-dashboard"
        : "/user-dashboard"

    const handleProfileClick = () => router.push(dashboardUrl)

    const renderAvatar = (size = 40) => {
        const sizeCls = size === 40 ? "w-10 h-10" : "w-8 h-8"
        const textCls = size === 40 ? "text-sm" : "text-xs"

        if (loading) return <div className={`${sizeCls} rounded-full bg-fuchsia-500/20 animate-pulse`} />

        if (isLoggedIn && profile) {
            return (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleProfileClick}
                    className="rounded-full p-0 hover:opacity-80 transition-opacity"
                    title={`Go to ${profile.name}'s dashboard`}
                >
                    {profile.profile_photo_url ? (
                        <Image
                            src={profile.profile_photo_url}
                            alt={profile.name || "Profile"}
                            width={size}
                            height={size}
                            className="rounded-full border-2 border-fuchsia-500 object-cover"
                        />
                    ) : (
                        <div className={`${sizeCls} rounded-full border-2 border-fuchsia-500 bg-fuchsia-700 flex items-center justify-center ${textCls} font-semibold`}>
                            {profile.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                    )}
                </Button>
            )
        }

        return (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-fuchsia-500 text-fuchsia-200 hover:bg-fuchsia-900/50 hover:text-white transition-colors"
                    >
                        Login
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-transparent border-none shadow-none">
                    <SignLogInDialog />
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <div className="fixed z-50 w-full flex justify-center mt-4 px-4 sm:px-6">
            <nav className="w-full max-w-6xl bg-fuchsia-900/20 shadow-lg backdrop-blur-lg border border-fuchsia-400/30 text-fuchsia-100 rounded-2xl px-5 sm:px-8 py-5 transition-all duration-300">
                <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-fuchsia-300 tracking-wide">Byteon</div>

                    {/* Desktop */}
                    <div className="hidden md:flex gap-4 flex-wrap justify-center items-center">
                        {navLinks.map((link) => (
                            <Button key={link.title} variant="ghost" size="sm"
                                className="text-xs border border-transparent text-fuchsia-200 hover:border-fuchsia-400 hover:bg-fuchsia-950/50 hover:text-fuchsia-100 transition-colors"
                                asChild>
                                <Link href={link.href}>{link.title}</Link>
                            </Button>
                        ))}
                        <Button variant="ghost" size="sm"
                            className="text-sm border border-fuchsia-500 hover:border-purple-400 hover:bg-purple-900/50 transition-colors"
                            asChild>
                            <Link href="/how-to-hackathon">HowToHack</Link>
                        </Button>
                        {renderAvatar(40)}
                    </div>

                    {/* Mobile */}
                    <div className="md:hidden flex items-center gap-2">
                        {renderAvatar(32)}
                        <Button variant="ghost" size="icon"
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-fuchsia-300 hover:bg-fuchsia-800/40">
                            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>

                {isOpen && (
                    <div className="md:hidden mt-4 flex flex-col items-start gap-2">
                        {navLinks.map((link) => (
                            <Button key={link.title} variant="ghost" size="sm"
                                className="w-full justify-start text-sm border border-transparent text-fuchsia-200 hover:border-fuchsia-400 hover:bg-fuchsia-950/40 transition-colors"
                                asChild onClick={() => setIsOpen(false)}>
                                <Link href={link.href}>{link.title}</Link>
                            </Button>
                        ))}
                        <Button variant="ghost" size="sm"
                            className="w-full justify-start text-sm border border-fuchsia-500 hover:border-purple-300 hover:bg-purple-900/40 transition-colors"
                            asChild onClick={() => setIsOpen(false)}>
                            <Link href="/how-to-hackathon">HowToHack</Link>
                        </Button>
                    </div>
                )}
            </nav>
        </div>
    )
}