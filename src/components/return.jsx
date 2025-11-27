import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowBigLeft } from "lucide-react";

export function ReturnButton(

) {
    return (
        <Link href={"/"}>
            <Button 
            size="lg"
            className="cursor-pointer bg-fuchsia-700 hover:bg-fuchsia-600 text-white border border-fuchsia-600 transition-colors">
                <ArrowBigLeft />
            </Button>
        </Link>
    )
}