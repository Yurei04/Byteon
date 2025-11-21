"use client";

import { Card } from "../ui/card";
import Link from "next/link";

export default function ResourceHubCard({ title, des, link, category }) {
  return (
    <Link href={link} className="block w-full" target="_blank">
      <Card
        className="
          group w-full h-auto p-8 cursor-pointer
          rounded-2xl text-center
          bg-gradient-to-br from-purple-900/40 to-fuchsia-900/20
          shadow-[0_0_25px_rgba(255,0,255,0.2)]
          border border-fuchsia-700/40
          transition-all duration-300
          hover:scale-[1.03] 
          hover:shadow-[0_0_35px_rgba(255,0,255,0.3)]
          hover:border-fuchsia-400/40
          backdrop-blur-xl
        "
      >
        <h2
          className="
            text-3xl font-extrabold 
            text-fuchsia-300 tracking-wide
            drop-shadow-[0_0_10px_rgba(255,0,255,0.4)]
            group-hover:text-fuchsia-200
            transition-colors
          "
        >
          {title}
        </h2>

        {des && (
          <p className="mt-4 text-fuchsia-200/70 text-sm leading-relaxed">
            {des}
          </p>
        )}

        {category && (
          <p className="mt-4 text-xs text-fuchsia-300/60 uppercase tracking-wide">
            {category}
          </p>
        )}
      </Card>
    </Link>
  );
}
