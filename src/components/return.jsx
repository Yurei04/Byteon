import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ReturnButton() {
  return (
    <Link href="/" className="group inline-flex items-center">
      <button className="
        relative flex items-center gap-2 px-4 py-2.5
        bg-fuchsia-950/80 hover:bg-fuchsia-900/90
        border border-fuchsia-700/50 hover:border-fuchsia-500/80
        rounded-xl
        text-fuchsia-300 hover:text-fuchsia-100
        text-sm font-medium tracking-wide
        shadow-[0_0_16px_rgba(192,38,211,0.15)] hover:shadow-[0_0_28px_rgba(192,38,211,0.4)]
        transition-all duration-300 ease-out
        overflow-hidden
        cursor-pointer
        before:absolute before:inset-0
        before:bg-gradient-to-r before:from-fuchsia-600/0 before:via-fuchsia-400/10 before:to-fuchsia-600/0
        before:translate-x-[-200%] hover:before:translate-x-[200%]
        before:transition-transform before:duration-700 before:ease-in-out
      ">
        <ArrowLeft
          size={16}
          className="transition-transform duration-300 group-hover:-translate-x-0.5"
          strokeWidth={2.5}
        />
        <span className="
          max-w-0 overflow-hidden whitespace-nowrap
          group-hover:max-w-[3rem]
          transition-all duration-300 ease-out
          opacity-0 group-hover:opacity-100
        ">
          Back
        </span>
      </button>
    </Link>
  );
}