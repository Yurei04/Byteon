"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Ghost, Menu, X } from "lucide-react"
import AudioManager from "./audioManager"
import audioService from "@/lib/audioService"

export default function GameNav() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isAudioDialogOpen, setIsAudioDialogOpen] = React.useState(false)

  const handleAudioClick = () => {
    setIsAudioDialogOpen(true)
    setIsOpen(false) // Close the menu when opening audio settings
  }

  return (
    <>
      <div className="fixed z-50 w-full flex justify-start mt-6 px-4 py-2 sm:px-6">
        <nav className="max-w-6xl bg-fuchsia-950/80 shadow-lg backdrop-blur-lg border border-fuchsia-400/30 text-fuchsia-100 rounded-2xl sm:px-8 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="text-fuchsia-300 hover:bg-fuchsia-800/40 cursor-pointer"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {isOpen && (
            <div className="p-2 flex flex-col items-start gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAudioClick}
                className="w-full cursor-pointer justify-start text-sm border border-transparent text-fuchsia-200 hover:border-fuchsia-400 hover:bg-fuchsia-950/40 transition-colors"
              >
                Audio Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full cursor-pointer justify-start text-sm border border-transparent text-fuchsia-200 hover:border-fuchsia-400 hover:bg-fuchsia-950/40 transition-colors"
              >
                Load Game
              </Button>

              <Link href="/">
                <Button
                  className="w-full cursor-pointer justify-start text-sm border border-transparent text-fuchsia-200 hover:border-fuchsia-400 hover:bg-fuchsia-950/40 transition-colors"
                  variant="ghost"
                  size="sm"
                    onClick={() => {
                      audioService.stopBackgroundMusic()
                    }}
                  >
                  Return Home
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Audio Manager Dialog */}
      <AudioManager 
        isOpen={isAudioDialogOpen} 
        onClose={() => setIsAudioDialogOpen(false)} 
      />
    </>
  )
}