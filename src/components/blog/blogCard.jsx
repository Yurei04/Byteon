"use client"

import Image from "next/image"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const badgeStyle = "bg-fuchsia-900/30 shadow border border-fuchsia-600/30 text-fuchsia-100 text-xs px-2 py-1"

export default function BlogCard({ id, title, des, image, author, hackathon, place, theme }) {
  return (
    <Card className="w-full sm:w-[90%] md:w-[85%] lg:w-[75%] h-auto overflow-hidden bg-gradient-to-br from-purple-900/20 to-fuchsia-950/10 shadow-2xl backdrop-blur-sm border border-fuchsia-700/20 text-fuchsia-100 rounded-2xl transition-transform duration-200 hover:scale-102">

      <CardHeader className="p-3">
        {image ? (
          <div className="w-full h-36 sm:h-40 relative rounded-xl overflow-hidden border border-fuchsia-600/20">
            <Image src={image} alt={title || "blog image"} fill className="object-cover" />
          </div>
        ) : (
          <div className="w-full h-36 sm:h-40 rounded-xl flex items-center justify-center bg-fuchsia-900/20 border border-fuchsia-600/10">
            <span className="text-fuchsia-200 text-sm">No image</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between mt-3 items-start sm:items-center">
          <div className="flex flex-col">
            <CardTitle className="text-base sm:text-lg font-bold text-fuchsia-100 leading-snug">{title}</CardTitle>
            <p className="text-xs sm:text-sm text-fuchsia-300 mt-1">by {author || "Byteon"}</p>
          </div>

          <div className="text-xs sm:text-sm text-fuchsia-300 mt-2 sm:mt-0">{place}</div>
        </div>

        <div className="flex gap-2 mt-2 flex-wrap">
          {theme && (Array.isArray(theme) ? theme : [theme]).map((t, i) => (
            <Badge key={i} className={badgeStyle}>{t}</Badge>
          ))}
        </div>

        <CardDescription className="mt-2 text-sm text-fuchsia-200 leading-snug line-clamp-3">{des}</CardDescription>
      </CardHeader>

      <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 gap-2 sm:gap-0">
        <p className="text-xs sm:text-sm font-medium text-fuchsia-300">{hackathon}</p>
        <div className="flex gap-2 flex-wrap">
          <Button className="cursor-pointer bg-fuchsia-700 hover:bg-fuchsia-600 text-white border border-fuchsia-600 text-xs px-2 py-1">Read</Button>
          <Button className="cursor-pointer bg-transparent hover:bg-fuchsia-800 text-fuchsia-200 border border-fuchsia-600 text-xs px-2 py-1">Share</Button>
        </div>
      </CardFooter>

    </Card>
  )
}