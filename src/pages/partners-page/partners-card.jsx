import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export function PartnersCard({
    name, image, location, des, websiteLink, tags
}) {
    return (
        <Card className="lg:w-1/2 md:w-full h-1/4 flex flex-row items-center justify-between p-4 gap-6">
            <CardHeader className="flex items-center justify-center p-0 w-40 h-40 overflow-hidden rounded-xl">
                <Image
                    src={image}
                    alt={name}
                    width={160}
                    height={160}
                    className="object-cover w-full h-full"
                />
            </CardHeader>

            <CardContent className="flex flex-col flex-1 gap-3 p-0">
                <div className="flex flex-col justify-start mb-4">
                    <h1 className="text-xl font-semibold">{name}</h1>
                    <div className="flex flex-wrap gap-2">
                        <Badge>{tags}</Badge>
                        <Badge>{tags}</Badge>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {des}
                </p>
            </CardContent>

            <CardFooter className="flex flex-col justify-between items-end h-40 p-0 min-w-40">
                <div className="flex justify-start">
                    <h2 className="text-sm text-muted-foreground">{location}</h2>
                </div>

                <Button size="sm" className="cursor-pointer">
                    <Link href={websiteLink} target="_blank" rel="noopener noreferrer">
                        Website
                    </Link>
                </Button>
            </CardFooter>

        </Card>
    );
}
