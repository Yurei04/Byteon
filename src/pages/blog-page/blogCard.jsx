"use client"

import Image from "next/image"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function BlogCard({ title, des, image, author, hackathon, place, theme }) {
    return (
        <Card className="w-full max-w-sm h-full overflow-hidden">
            <CardHeader className="p-4">
                <Image 
                    src={image} 
                    alt={title} 
                    width={200} 
                    height={150} 
                    className="object-cover w-full h-48 bg-white rounded-2xl"
                />
                <div className="flex flex-row justify-between">
                    <div className="flex flex-col justify-start">
                        <CardTitle className="text-2xl">{title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{author}</p>
                    </div>
                    <div className="text-md text-xl justify-end">{place}</div>
                </div>

                

                <div className="flex gap-2">
                    <Badge>{theme}</Badge>
                    <Badge variant="secondary">{theme}</Badge>
                </div>

                <CardDescription>{des}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                
            </CardContent>

            <CardFooter className="flex justify-between items-center">
                <p className="text-sm font-medium">{hackathon}</p>
                <div className="flex gap-2">
                    <Button className={"cursor-pointer"} onClick={() => {}}>Action 1</Button>
                    <Button className={"cursor-pointer"} onClick={() => {}}>Action 2</Button>
                </div>
            </CardFooter>
        </Card>
    )
}
