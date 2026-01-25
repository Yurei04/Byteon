"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import SignLogInDialog from "@/app/(auth)/loginSigninDialog"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"

const navLinks = [
    { title: "Home", href: "/" },
    { title: "Partners", href: "/partners" },
    { title: "Blog", href: "/blog" },
    { title: "Resource", href: "/resource-hub" },
    { title: "Hacks", href: "/announce" },
];

export default function NavBar() {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [session, setSession] = useState(null)
    const [userProfile, setUserProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const fetchProfileData = async (userId) => {
        try {
            console.log('Fetching profile for:', userId)
            
            // Try to fetch user profile
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("name, profile_photo_url")
                .eq("user_id", userId)
                .maybeSingle()

            if (userError && userError.code !== 'PGRST116') {
                console.error('User fetch error:', userError)
            }

            if (userData) {
                console.log('User profile found:', userData.name)
                setUserProfile({
                    name: userData.name,
                    photoUrl: userData.profile_photo_url,
                    dashboardUrl: "/user-dashboard"
                })
                setLoading(false)
                return
            }

            // Try to fetch org profile - using user_id not org_id
            const { data: orgData, error: orgError } = await supabase
                .from("organizations")
                .select("name, profile_photo_url")
                .eq("user_id", userId)
                .maybeSingle()

            if (orgError && orgError.code !== 'PGRST116') {
                console.error('Org fetch error:', orgError)
            }

            if (orgData) {
                console.log('Org profile found:', orgData.name)
                setUserProfile({
                    name: orgData.name,
                    photoUrl: orgData.profile_photo_url,
                    dashboardUrl: "/org-dashboard"
                })
                setLoading(false)
                return
            }

            // No profile found but user is authenticated
            console.log('No profile found, using fallback')
            setUserProfile({
                name: "User",
                photoUrl: null,
                dashboardUrl: "/user-dashboard"
            })
            setLoading(false)

        } catch (err) {
            console.error("Error fetching profile:", err)
            setUserProfile(null)
            setLoading(false)
        }
    }

    const checkSession = async () => {
        try {
            setLoading(true)
            const { data: { session }, error } = await supabase.auth.getSession()
            
            console.log('Initial session check:', !!session, error)
            
            if (error) {
                console.error('Session error:', error)
                setSession(null)
                setUserProfile(null)
                setLoading(false)
                return
            }

            setSession(session)
            
            if (session?.user) {
                await fetchProfileData(session.user.id)
            } else {
                setUserProfile(null)
                setLoading(false)
            }
        } catch (err) {
            console.error('Session check failed:', err)
            setSession(null)
            setUserProfile(null)
            setLoading(false)
        }
    }
    
    useEffect(() => {
        // Check initial session
        checkSession()

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth event:', event, 'Session:', !!session)
            setSession(session)
            
            if (session?.user) {
                await fetchProfileData(session.user.id)
            } else {
                setUserProfile(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleProfileClick = () => {
        if (userProfile?.dashboardUrl) {
            router.push(userProfile.dashboardUrl)
        }
    }

    // Render login button
    const renderAuthButton = () => {
        if (loading) {
            return (
                <div className="w-10 h-10 rounded-full bg-fuchsia-500/20 animate-pulse" />
            )
        }

        if (session && userProfile) {
            return (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleProfileClick}
                    className="rounded-full p-0 hover:opacity-80 transition-opacity"
                    title={`Go to ${userProfile.name}'s dashboard`}
                >
                    {userProfile.photoUrl ? (
                        <Image
                            src={userProfile.photoUrl}
                            alt={userProfile.name || "Profile"}
                            width={40}
                            height={40}
                            className="rounded-full border-2 border-fuchsia-500 object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full border-2 border-fuchsia-500 bg-fuchsia-700 flex items-center justify-center text-sm font-semibold">
                            {userProfile.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                    )}
                </Button>
            )
        }

        // Not logged in - show login button
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

    // Mobile auth button
    const renderMobileAuthButton = () => {
        if (loading) {
            return (
                <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 animate-pulse" />
            )
        }

        if (session && userProfile) {
            return (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleProfileClick}
                    className="rounded-full p-0 hover:opacity-80 transition-opacity"
                >
                    {userProfile.photoUrl ? (
                        <Image
                            src={userProfile.photoUrl}
                            alt={userProfile.name || "Profile"}
                            width={32}
                            height={32}
                            className="rounded-full border-2 border-fuchsia-500 object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full border-2 border-fuchsia-500 bg-fuchsia-700 flex items-center justify-center text-xs font-semibold">
                            {userProfile.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                    )}
                </Button>
            )
        }

        return (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs border border-fuchsia-500 hover:bg-fuchsia-900/50"
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
                    <div className="text-lg font-semibold text-fuchsia-300 tracking-wide">
                        Byteon
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex gap-4 flex-wrap justify-center items-center">
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
                            asChild
                        >
                            <Link href="/how-to-hackathon">HowToHack</Link>
                        </Button>

                        {/* Desktop Auth Button */}
                        {renderAuthButton()}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-2">
                        {/* Mobile Auth */}
                        {renderMobileAuthButton()}

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
                            asChild
                            onClick={() => setIsOpen(false)}
                        >
                            <Link href="/how-to-hackathon">HowToHack</Link>
                        </Button>
                    </div>
                )}
            </nav>
        </div>
    )
}