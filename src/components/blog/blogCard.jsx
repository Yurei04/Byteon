"use client"

import Image from "next/image"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const badgeStyle =
  "bg-fuchsia-800/30 text-fuchsia-200 border border-fuchsia-600/40 backdrop-blur-sm px-2 py-0.5 text-[10px] rounded-md"

export default function BlogCard({ id, title, des, image, author, hackathon, place, theme }) {
  return (
    <Card
      className="
        group w-full h-auto overflow-hidden rounded-2xl
        bg-linear-to-br from-purple-950/40 to-fuchsia-950/20
        shadow-[0_0_20px_rgba(255,0,255,0.15)] border border-fuchsia-800/30
        transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,0,255,0.25)]
        backdrop-blur-xl
      "
    >
      <CardHeader className="p-4 pb-2">
        <div className="w-full h-40 relative rounded-xl overflow-hidden border border-fuchsia-700/20 shadow-lg">
          {image ? (
            <Image
              src={image}
              alt={title || "blog image"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-fuchsia-900/20">
              <span className="text-fuchsia-200 text-sm">No image</span>
            </div>
          )}
        </div>

        <div className="flex flex-col mt-3">
          <CardTitle className="text-lg font-semibold text-fuchsia-100 leading-tight">
            {title}
          </CardTitle>
          <p className="text-xs text-fuchsia-300 mt-1">by {author || "Byteon"}</p>
        </div>
        
        <div className="flex gap-2 mt-3 flex-wrap">
          {(Array.isArray(theme) ? theme : [theme]).map((t, i) => (
            <Badge key={i} className={badgeStyle}>
              {t}
            </Badge>
          ))}
        </div>

        <CardDescription className="mt-3 text-sm text-fuchsia-200/90 line-clamp-3">
          {des}
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex justify-between items-center p-4 pt-2">
        <div className="flex gap-2">
          <Button
            className="
              bg-fuchsia-700 hover:bg-fuchsia-600 text-white w-full
              text-xs px-3 py-1 rounded-lg border border-fuchsia-600 cursor-pointer
            "
          >
            Read
          </Button>

          <Button
            className="
              bg-transparent text-fuchsia-200 w-full
              hover:bg-fuchsia-900/40 cursor-pointer
              text-xs px-3 py-1 border border-fuchsia-600 rounded-lg
            "
          >
            Share
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
