    import Link from "next/link"
    import { Github, Mail, Twitter, Linkedin } from "lucide-react"

export default function Footer() {
    return (
        <footer className="bg-linear-to-b from-purple-950 via-fuchsia-950 to-black border-t border-fuchsia-900 text-fuchsia-200 px-6 py-12 z-10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
                
                {/* Left Section */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-fuchsia-400 to-purple-400">
                        Byteon
                    </h2>
                    <p className="text-sm text-fuchsia-300/80 leading-relaxed">
                        Empowering students and beginners through technology, <br />
                        creativity, and meaningful innovation.
                    </p>
                    <div className="flex justify-center md:justify-start gap-4 mt-2">
                        <a href="" target="_blank" rel="noopener noreferrer">
                        <Mail className="h-5 w-5 hover:text-fuchsia-400 transition-colors" />
                        </a>
                        <a href="" target="_blank" rel="noopener noreferrer">
                        <Github className="h-5 w-5 hover:text-fuchsia-400 transition-colors" />
                        </a>
                        <a href="" target="_blank" rel="noopener noreferrer">
                        <Twitter className="h-5 w-5 hover:text-fuchsia-400 transition-colors" />
                        </a>
                        <a href="" target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-5 w-5 hover:text-fuchsia-400 transition-colors" />
                        </a>
                    </div>
                </div>

                {/* Middle Links */}
                <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                    <Link href="/" className="hover:text-fuchsia-400 transition-colors">Home</Link>
                    <Link href="/" className="hover:text-fuchsia-400 transition-colors">About</Link>
                    <Link href="/" className="hover:text-fuchsia-400 transition-colors">Partners</Link>
                    <Link href="/" className="hover:text-fuchsia-400 transition-colors">Blog</Link>
                    <Link href="/" className="hover:text-fuchsia-400 transition-colors">HowToHack</Link>
                </div>

                {/* Right Section */}
                <div className="space-y-4 text-center md:text-right flex flex-col items-center md:items-end">
                    <div>
                        <p className="text-sm text-fuchsia-300/80">Have thoughts to share?</p>
                        <form className="mt-2 flex flex-col sm:flex-row gap-2 items-center justify-center md:justify-end w-full">
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="w-full sm:w-auto px-3 py-2 rounded-lg bg-black/40 border border-fuchsia-700 text-sm text-fuchsia-100 placeholder-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-fuchsia-700 hover:bg-fuchsia-600 text-white text-sm rounded-lg transition-colors"
                            >
                                Message Us
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="mt-10 text-center text-xs text-fuchsia-500/80">
                © {new Date().getFullYear()} Byteon. All rights reserved.
            </div>
        </footer>
    )
}
