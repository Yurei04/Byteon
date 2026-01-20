"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SignLogInDialog() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex justify-center"
    >
      <Card className="w-full max-w-md relative overflow-hidden bg-fuchsia-950/40 border border-fuchsia-400/40 backdrop-blur-xl text-fuchsia-100 shadow-2xl transition-all duration-500 hover:border-fuchsia-400/70 hover:shadow-fuchsia-500/20 group">
        
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(217, 70, 239, 0.15), transparent 60%)",
          }}
        />

        <CardHeader className="text-center space-y-2 relative z-10">
          <h2 className="text-2xl font-semibold tracking-tight">
            Login required
          </h2>
          <p className="text-sm text-fuchsia-300">
            Sign in or create an account to continue
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 relative z-10">
          <Link href="/log-in">
            <Button className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-md hover:shadow-fuchsia-500/30 transition-all">
              Login
            </Button>
          </Link>

          <Link href="/sign-up">
            <Button
              variant="outline"
              className="w-full border-fuchsia-400/60 text-fuchsia-200 hover:bg-fuchsia-900/40 hover:text-white transition-all"
            >
              Create account
            </Button>
          </Link>
        </CardContent>

        <CardFooter className="text-xs text-center text-fuchsia-400 relative z-10">
          It only takes a minute ✨
        </CardFooter>
      </Card>
    </motion.div>
  )
}
