"use client"

import Link from "next/link"
import { ShieldX } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-purple-950 to-fuchsia-950 flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="p-5 rounded-full bg-red-500/10 border border-red-500/30">
            <ShieldX className="w-16 h-16 text-red-400" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-rose-300 mb-3">
            Access Denied
          </h1>
          <p className="text-white/50">
            You don&apos;t have permission to view this page.
          </p>
        </div>
        <Link href="/">
          <Button className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white border-0">
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  )
}