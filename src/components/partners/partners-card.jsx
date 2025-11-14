import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

const badgeStyle = "bg-fuchsia-900/20 shadow-lg backdrop-blur-lg border border-fuchsia-400/30 text-fuchsia-100"

export function PartnersCard({
    name, image, location, des, websiteLink, tags
}) {
    return (
        <Card className="w-full sm:w-[90%] lg:w-full flex flex-col sm:flex-row items-center sm:items-start justify-between p-4 gap-4 bg-fuchsia-900/20 shadow-lg backdrop-blur-lg border border-fuchsia-400/30 text-fuchsia-100 transition-all duration-300">
            
            <CardHeader className="flex-shrink-0 w-full sm:w-40 h-40 overflow-hidden rounded-xl flex items-center justify-center">
                <Image
                    src={image}
                    alt={name}
                    width={160}
                    height={160}
                    className="object-cover w-full h-full"
                />
            </CardHeader>

            <CardContent className="flex flex-col flex-1 gap-3 p-0">
                <div className="flex flex-col justify-start mb-2 sm:mb-4">
                    <h1 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{name}</h1>
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag, idx) => (
                            <Badge key={idx} className={badgeStyle}>{tag}</Badge>
                        ))}
                    </div>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {des}
                </p>
            </CardContent>

            <CardFooter className="w-full sm:w-auto flex flex-col sm:items-end items-start gap-2 mt-4 sm:mt-0">
                <h2 className="text-sm text-muted-foreground">{location}</h2>
                <Button size="sm" className="cursor-pointer bg-fuchsia-700 hover:bg-fuchsia-600 text-white border border-fuchsia-600 transition-colors">
                    <Link href={websiteLink} target="_blank" rel="noopener noreferrer">
                        Website
                    </Link>
                </Button>
            </CardFooter>

        </Card>
    );
}
