import { SignupForm } from "@/components/(auth)/signup/signupForm"
import { GalleryVerticalEnd } from "lucide-react"

export default function SignupPage() {
  return (
    <div className="relative bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px] flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col items-center gap-2">

        {/* Brand header */}
        <div className="flex flex-col items-center gap-1.5 text-center select-none">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-purple-600 shadow-md shadow-purple-900/60">
              <GalleryVerticalEnd className="size-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Byte<span className="text-purple-400">on</span>
            </span>
          </div>
          <span className="text-xs text-purple-300/50 tracking-widest uppercase font-medium">
            Join the network
          </span>
        </div>

        {/* Form */}
        <div className="w-full">
          <SignupForm />
        </div>

      </div>
    </div>
  )
}