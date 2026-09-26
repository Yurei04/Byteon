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
      <Card className="w-full max-w-md relative overflow-hidden bg-surface-raised border border-brand-400/40 backdrop-blur-xl text-text-primary shadow-2xl transition-all duration-500 hover:border-brand-400/70 hover:shadow-brand-500/20 group">

        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgb(var(--brand-500) / 0.15), transparent 60%)",
          }}
        />

        <CardHeader className="text-center space-y-2 relative z-10 pr-10">
          <div className="flex flex-row gap-5 justify-between items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors group/back cursor-pointer"
            >
              <ArrowLeft className="size-3 group-hover/back:-translate-x-0.5 transition-transform" />
              Back to home
            </Link>
            <button
              onClick={onClose}
              aria-label="Close"
              className="cursor-pointer size-7 rounded-full text-text-faint hover:text-text-primary hover:bg-brand-500/20 transition-all duration-200"
            >
              <X className="size-4" />
            </button>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
            Login required
          </h2>
          <p className="text-sm text-text-secondary">
            Sign in or create an account to continue
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 relative z-10">
          <Link href="/log-in">
            <Button className="w-full cursor-pointer bg-brand-600 hover:bg-brand-500 dark:text-brand-100 text-fg-on-brand shadow-md hover:shadow-brand-500/30 transition-all">
              Login
            </Button>
          </Link>

          <Link href="/sign-up">
            <Button
              variant="outline"
              className="w-full cursor-pointer border-brand-400/60 text-text-secondary hover:bg-brand-900/40 hover:text-text-primary transition-all"
            >
              Create account
            </Button>
          </Link>
        </CardContent>

        <CardFooter className="text-xs text-center text-text-faint relative z-10 justify-center">
          It only takes a minute ✨
        </CardFooter>
      </Card>
    </motion.div>
  )
}