"use client"

import Image from "next/image"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const badgeStyle = "bg-fuchsia-900/20 shadow-lg backdrop-blur-lg border border-fuchsia-400/30 text-fuchsia-100 text-xs px-2 py-1"

export default function BlogCard({ title, des, image, author, hackathon, place, theme }) {
    return (
        <Card className="w-full max-w-xs h-auto overflow-hidden bg-fuchsia-900/20 shadow-lg backdrop-blur-lg border border-fuchsia-400/30 text-fuchsia-100 rounded-xl transition-all duration-300 hover:scale-105">
            
            <CardHeader className="p-3">
                <Image 
                    src={image} 
                    alt={title} 
                    width={200} 
                    height={120} 
                    className="object-cover w-full h-32 rounded-xl border border-fuchsia-500"
                />
                <div className="flex flex-row justify-between mt-2">
                    <div className="flex flex-col justify-start">
                        <CardTitle className="text-lg font-semibold text-fuchsia-200 leading-snug">{title}</CardTitle>
                        <p className="text-xs text-fuchsia-300">{author}</p>
                    </div>
                    <div className="text-sm text-fuchsia-400 justify-end">{place}</div>
                </div>
                <div className="flex gap-1 mt-1 flex-wrap">
                    <Badge className={badgeStyle}>{theme}</Badge>
                    <Badge className={badgeStyle}>{theme}</Badge>
                </div>

                <CardDescription className="mt-1 text-xs text-fuchsia-100 leading-snug line-clamp-3">
                    {des}
                </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between items-center p-3">
                <p className="text-xs font-medium text-fuchsia-300">{hackathon}</p>
                <div className="flex gap-1">
                    <Button className="cursor-pointer bg-fuchsia-700 hover:bg-fuchsia-600 text-white border border-fuchsia-600 text-xs px-2 py-1">
                        Action 1
                    </Button>
                    <Button className="cursor-pointer bg-fuchsia-700 hover:bg-fuchsia-600 text-white border border-fuchsia-600 text-xs px-2 py-1">
                        Action 2
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}
