"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, X } from "lucide-react"

export default function SignLogInDialog({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full h-screen flex justify-center items-center"
    >
      <Card className="w-full max-w-md relative overflow-hidden bg-fuchsia-950/40 border border-fuchsia-400/40 backdrop-blur-xl text-fuchsia-100 shadow-2xl transition-all duration-500 hover:border-fuchsia-400/70 hover:shadow-fuchsia-500/20 group">

        {/* Hover glow */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(217, 70, 239, 0.15), transparent 60%)",
          }}
        />

        <CardHeader className="text-center space-y-2 relative z-10 pr-10">
          <div className="flex flex-row gap-5 justify-between items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-purple-400/80 hover:text-purple-200 transition-colors group/back cursor-pointer"
            >
              <ArrowLeft className="size-3 group-hover/back:-translate-x-0.5 transition-transform" />
              Back to home
            </Link>
            <button
              onClick={onClose}
              aria-label="Close"
              className="cursor-pointer size-7 rounded-full text-fuchsia-400 hover:text-white hover:bg-fuchsia-500/20 transition-all duration-200"
            >
              <X className="size-4" />
            </button>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Login required
          </h2>
          <p className="text-sm text-fuchsia-300">
            Sign in or create an account to continue
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 relative z-10">
          <Link href="/log-in">
            <Button className="w-full cursor-pointer bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-md hover:shadow-fuchsia-500/30 transition-all">
              Login
            </Button>
          </Link>

          <Link href="/sign-up">
            <Button
              variant="outline"
              className="w-full cursor-pointer border-fuchsia-400/60 text-fuchsia-200 hover:bg-fuchsia-900/40 hover:text-white transition-all"
            >
              Create account
            </Button>
          </Link>
        </CardContent>

        <CardFooter className="text-xs text-center text-fuchsia-400 relative z-10 justify-center">
          It only takes a minute ✨
        </CardFooter>
      </Card>
    </motion.div>
  )
}