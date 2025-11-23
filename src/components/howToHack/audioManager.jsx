"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, Music, Headphones } from "lucide-react";

export default function AudioManager({ isOpen, onClose }) {
  const [musicVolume, setMusicVolume] = useState(70);
  const [sfxVolume, setSfxVolume] = useState(80);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [isSfxMuted, setIsSfxMuted] = useState(false);

  // Apply volume changes to global audio manager
  useEffect(() => {
    if (typeof window !== 'undefined' && window.audioManager) {
      window.audioManager.setMusicVolume(isMusicMuted ? 0 : musicVolume / 100);
    }
  }, [musicVolume, isMusicMuted]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.audioManager) {
      window.audioManager.setSfxVolume(isSfxMuted ? 0 : sfxVolume / 100);
    }
  }, [sfxVolume, isSfxMuted]);

  const handleMusicVolumeChange = (value) => {
    setMusicVolume(value[0]);
    if (value[0] > 0) setIsMusicMuted(false);
  };

  const handleSfxVolumeChange = (value) => {
    setSfxVolume(value[0]);
    if (value[0] > 0) setIsSfxMuted(false);
  };

  const toggleMusicMute = () => {
    setIsMusicMuted(!isMusicMuted);
  };

  const toggleSfxMute = () => {
    setIsSfxMuted(!isSfxMuted);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-950 border-2 border-fuchsia-500/50 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-fuchsia-300 flex items-center gap-2">
            <Headphones className="w-6 h-6" />
            Audio Settings
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Adjust music and sound effects volume
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Background Music Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-fuchsia-400" />
                <span className="text-sm font-medium">Background Music</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMusicMute}
                className="text-fuchsia-300 hover:bg-fuchsia-800/40"
              >
                {isMusicMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Slider
                value={[musicVolume]}
                onValueChange={handleMusicVolumeChange}
                max={100}
                step={1}
                className="flex-1"
                disabled={isMusicMuted}
              />
              <span className="text-xs text-gray-400 w-10 text-right">
                {isMusicMuted ? 0 : musicVolume}%
              </span>
            </div>
          </div>

          {/* Sound Effects Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-fuchsia-400" />
                <span className="text-sm font-medium">Sound Effects</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSfxMute}
                className="text-fuchsia-300 hover:bg-fuchsia-800/40"
              >
                {isSfxMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Slider
                value={[sfxVolume]}
                onValueChange={handleSfxVolumeChange}
                max={100}
                step={1}
                className="flex-1"
                disabled={isSfxMuted}
              />
              <span className="text-xs text-gray-400 w-10 text-right">
                {isSfxMuted ? 0 : sfxVolume}%
              </span>
            </div>
          </div>

          {/* Test Buttons */}
          <div className="pt-4 border-t border-fuchsia-500/20">
            <p className="text-xs text-gray-400 mb-3">Test Audio</p>
            <div className="flex gap-2">
              <Button
                onClick={() => window.audioManager?.playClick()}
                className="flex-1 bg-fuchsia-900/30 hover:bg-fuchsia-700/40 border border-fuchsia-400/40 text-fuchsia-200"
                size="sm"
              >
                Test Click
              </Button>
              <Button
                onClick={() => window.audioManager?.playTypewriter()}
                className="flex-1 bg-fuchsia-900/30 hover:bg-fuchsia-700/40 border border-fuchsia-400/40 text-fuchsia-200"
                size="sm"
              >
                Test Typing
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-fuchsia-500/20">
          <Button
            onClick={onClose}
            className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}