import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { SelectSeparator } from "../ui/select";

const badgeStyle = "bg-fuchsia-900/20 shadow-lg backdrop-blur-lg border border-fuchsia-400/30 text-fuchsia-100"
const styling = ["w-24 py-4 bg-fuchsia-900/20 hover:bg-fuchsia-700 shadow-lg backdrop-blur-lg border border-fuchsia-400/30 text-fuchsia-100 cursor-pointer transition-all duration-300"]


export function PartnersCard({
    name, image, location, des, websiteLink, tags
}) {
    return (
        <Card className="w-full sm:w-[90%] lg:w-full flex flex-col sm:flex-row items-center sm:items-start justify-between p-4 gap-4 bg-fuchsia-900/20 shadow-lg backdrop-blur-lg border border-fuchsia-400/30 text-fuchsia-100 transition-all duration-300">
            
            <CardHeader className="shrink-0 w-full sm:w-50 h-40 overflow-hidden rounded-xl flex items-center justify-center bg-fuchsia-500/40 border border-fuchsia-300 p-4">
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
                            <Badge key={idx} className={badgeStyle}>{tag}</Badge>
                        ))}
                    </div>
                    <h2 className="text-sm text-muted-foreground"><b>Location: </b>{location}</h2>
                    
                </div>
                <SelectSeparator  className="bg-fuchsia-700/70"/>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {des}
                </p>
            </CardContent>

            <CardFooter className="w-full sm:w-auto flex flex-col items-end mt-4 sm:mt-0">
                <Button size="sm" className={styling}>
                    <Link href={websiteLink} target="_blank" rel="noopener noreferrer">
                        Website
                    </Link>
                </Button>
            </CardFooter>

        </Card>
    );
}
