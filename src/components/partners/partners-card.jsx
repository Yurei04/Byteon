import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { SelectSeparator } from "../ui/select";

const colorThemes = {
    red: {
        card: "bg-red-900/20 border-red-400/30",
        cardHover: "hover:border-red-400/50",
        header: "bg-red-500/40 border-red-300",
        badge: "bg-red-900/20 border-red-400/30 text-red-100",
        button: "bg-red-900/20 hover:bg-red-700 border-red-400/30 text-red-100",
        separator: "bg-red-700/70",
        text: "text-red-100"
    },
    purple: {
        card: "bg-purple-900/20 border-purple-400/30",
        cardHover: "hover:border-purple-400/50",
        header: "bg-purple-500/40 border-purple-300",
        badge: "bg-purple-900/20 border-purple-400/30 text-purple-100",
        button: "bg-purple-900/20 hover:bg-purple-700 border-purple-400/30 text-purple-100",
        separator: "bg-purple-700/70",
        text: "text-purple-100"
    },
    blue: {
        card: "bg-blue-900/20 border-blue-400/30",
        cardHover: "hover:border-blue-400/50",
        header: "bg-blue-500/40 border-blue-300",
        badge: "bg-blue-900/20 border-blue-400/30 text-blue-100",
        button: "bg-blue-900/20 hover:bg-blue-700 border-blue-400/30 text-blue-100",
        separator: "bg-blue-700/70",
        text: "text-blue-100"
    },
    pink: {
        card: "bg-pink-900/20 border-pink-400/30",
        cardHover: "hover:border-pink-400/50",
        header: "bg-pink-500/40 border-pink-300",
        badge: "bg-pink-900/20 border-pink-400/30 text-pink-100",
        button: "bg-pink-900/20 hover:bg-pink-700 border-pink-400/30 text-pink-100",
        separator: "bg-pink-700/70",
        text: "text-pink-100"
    }
}

export function PartnersCard({
    name, image, location, des, websiteLink, tags, colorTheme = "purple"
}) {
    const theme = colorThemes[colorTheme]
    
    return (
        <Card className={`w-full sm:w-[90%] lg:w-full flex flex-col sm:flex-row items-center sm:items-start justify-between p-4 gap-4 ${theme.card} ${theme.cardHover} shadow-lg backdrop-blur-lg border ${theme.text} transition-all duration-300`}>
            
            <CardHeader className={`shrink-0 w-full sm:w-50 h-40 overflow-hidden rounded-xl flex items-center justify-center ${theme.header} border p-4`}>
                <Image
                    src={image}
                    alt={name}
                    width={260}
                    height={260}
                    className="object-contain w-auto h-full"
                />
            </CardHeader>


            <CardContent className="flex flex-col flex-1 gap-4 p-0">
                <div className="flex flex-col justify-start sm:mb-2">
                    <h1 className="lg:text-2xl sm:text-xl font-bold mb-1 sm:mb-2">{name}</h1>
                    <div className="flex flex-wrap gap-2 mb-1 justify-start">
                        {tags.map((tag, idx) => (
                            <Badge key={idx} className={theme.badge}>{tag}</Badge>
                        ))}
                    </div>
                    <h2 className="text-sm text-muted-foreground"><b>Location: </b>{location}</h2>
                    
                </div>
                <SelectSeparator className={theme.separator} />
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {des}
                </p>
            </CardContent>

            <CardFooter className="w-full sm:w-auto flex flex-col items-end mt-4 sm:mt-0">
                <Button size="sm" className={`w-24 py-4 ${theme.button} shadow-lg backdrop-blur-lg border cursor-pointer transition-all duration-300`}>
                    <Link href={websiteLink} target="_blank" rel="noopener noreferrer">
                        Website
                    </Link>
                </Button>
            </CardFooter>

        </Card>
    );
}