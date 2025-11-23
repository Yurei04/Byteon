"use client"

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Volume2, VolumeX } from "lucide-react";

export default function AudioPermissionDialog({ isOpen, onAccept, onDecline }) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDecline()}>
      <DialogContent className="bg-gray-950 border-2 border-fuchsia-500/50 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-fuchsia-300 flex items-center gap-3">
            <Volume2 className="w-7 h-7" />
            Enable Audio?
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-base pt-2">
            This visual novel includes background music and sound effects to enhance your experience.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="bg-fuchsia-900/20 border border-fuchsia-400/30 rounded-lg p-4">
            <p className="text-sm text-gray-200">
              <strong className="text-fuchsia-300">Included:</strong>
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-300 ml-4">
              <li>• Background music (looped)</li>
              <li>• Typing sound effects</li>
              <li>• Click sound effects</li>
            </ul>
          </div>
          
          <p className="text-xs text-gray-400 text-center">
            You can adjust or disable audio anytime from the menu
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            onClick={onDecline}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <VolumeX className="w-4 h-4 mr-2" />
            No Audio
          </Button>
          <Button
            onClick={onAccept}
            className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Enable Audio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}