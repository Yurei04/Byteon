"use client";

import { LoginForm } from "@/components/(auth)/login/loginForm"
import { GalleryVerticalEnd } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-1 items-center justify-center  bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px]">
      <div className="flex flex-col gap-4 p-6 md:p-10 ">
        <div className="flex justify-center gap-2 md:justify-center">
          <a href="." className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Byteon
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
