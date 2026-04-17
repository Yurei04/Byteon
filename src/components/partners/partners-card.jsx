import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, MapPin } from "lucide-react";

const colorThemes = {
    red: {
        card: "bg-red-950/30 border-red-500/20",
        cardHover: "hover:border-red-400/50 hover:shadow-red-500/10",
        header: "bg-red-950/50 border-red-500/20",
        badge: "bg-red-950/60 border-red-500/30 text-red-200",
        button: "bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-200",
        separator: "bg-gradient-to-r from-transparent via-red-500/30 to-transparent",
        text: "text-white",
        accent: "text-red-300",
        glow: "hover:shadow-red-500/10"
    },
    purple: {
        card: "bg-purple-950/30 border-purple-500/20",
        cardHover: "hover:border-purple-400/50 hover:shadow-purple-500/10",
        header: "bg-purple-950/50 border-purple-500/20",
        badge: "bg-purple-950/60 border-purple-500/30 text-purple-200",
        button: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 text-purple-200",
        separator: "bg-gradient-to-r from-transparent via-purple-500/30 to-transparent",
        text: "text-white",
        accent: "text-purple-300",
        glow: "hover:shadow-purple-500/10"
    },
    blue: {
        card: "bg-blue-950/30 border-blue-500/20",
        cardHover: "hover:border-blue-400/50 hover:shadow-blue-500/10",
        header: "bg-blue-950/50 border-blue-500/20",
        badge: "bg-blue-950/60 border-blue-500/30 text-blue-200",
        button: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-200",
        separator: "bg-gradient-to-r from-transparent via-blue-500/30 to-transparent",
        text: "text-white",
        accent: "text-blue-300",
        glow: "hover:shadow-blue-500/10"
    },
    pink: {
        card: "bg-pink-950/30 border-pink-500/20",
        cardHover: "hover:border-pink-400/50 hover:shadow-pink-500/10",
        header: "bg-pink-950/50 border-pink-500/20",
        badge: "bg-pink-950/60 border-pink-500/30 text-pink-200",
        button: "bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/30 text-pink-200",
        separator: "bg-gradient-to-r from-transparent via-pink-500/30 to-transparent",
        text: "text-white",
        accent: "text-pink-300",
        glow: "hover:shadow-pink-500/10"
    },
    cyan: {
        card: "bg-cyan-950/30 border-cyan-500/20",
        cardHover: "hover:border-cyan-400/50 hover:shadow-cyan-500/10",
        header: "bg-cyan-950/50 border-cyan-500/20",
        badge: "bg-cyan-950/60 border-cyan-500/30 text-cyan-200",
        button: "bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30 text-cyan-200",
        separator: "bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent",
        text: "text-white",
        accent: "text-cyan-300",
        glow: "hover:shadow-cyan-500/10"
    }
};

export function PartnersCard({
    name,
    image,
    location,
    des,
    websiteLink,
    tags,
    colorTheme = "purple"
}) {
    const theme = colorThemes[colorTheme];

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ y: -3 }}
            className="w-full"
        >
            <Card
                className={`
                    w-full max-w-4xl mx-auto flex flex-col lg:flex-row items-start
                    p-5 gap-5
                    ${theme.card} ${theme.cardHover}
                    border backdrop-blur-xl
                    transition-all duration-500
                    hover:shadow-xl ${theme.glow}
                    relative overflow-hidden group
                    rounded-2xl
                `}
            >
                {/* Subtle inner top shimmer on hover */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Logo block */}
                <motion.div
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="w-full lg:w-auto flex-shrink-0"
                >
                    <CardHeader
                        className={`
                            w-full lg:w-44 h-36 sm:h-40
                            flex items-center justify-center
                            ${theme.header} border rounded-xl
                            p-4 relative overflow-hidden
                        `}
                    >
                        <Image
                            src={image}
                            alt={name}
                            width={180}
                            height={180}
                            className="object-contain w-auto h-full max-h-full transition-transform duration-500 group-hover:scale-105"
                        />
                    </CardHeader>
                </motion.div>

                {/* Main content */}
                <CardContent className="flex flex-col flex-1 gap-3 p-0 relative z-10 w-full">

                    {/* Name + location */}
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1.5">
                            {name}
                        </h2>
                        <div className="flex items-center gap-1.5">
                            <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${theme.accent}`} />
                            <span className={`text-xs font-medium tracking-wide uppercase ${theme.accent}`}>
                                {location}
                            </span>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag, idx) => (
                            <Badge
                                key={idx}
                                className={`${theme.badge} border text-xs font-medium px-2.5 py-0.5 rounded-full backdrop-blur-sm`}
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>

                    {/* Separator */}
                    <div className={`h-px w-full ${theme.separator}`} />

                    {/* Description */}
                    <p className="text-sm sm:text-base leading-relaxed font-light text-white/80 line-clamp-3 sm:line-clamp-none">
                        {des}
                    </p>
                </CardContent>

                {/* CTA */}
                <CardFooter className="w-full lg:w-auto flex items-center lg:items-end justify-start lg:justify-center p-0 mt-2 lg:mt-0 relative z-10 lg:self-center">
                    {websiteLink ? (
                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                            <Link href={websiteLink} target="_blank" rel="noopener noreferrer">
                                <Button
                                    size="lg"
                                    className={`
                                        px-5 py-2.5 h-auto
                                        ${theme.button}
                                        border rounded-xl
                                        font-semibold text-sm
                                        backdrop-blur-lg
                                        transition-all duration-300
                                        flex items-center gap-2
                                        cursor-pointer
                                    `}
                                >
                                    Visit Site
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </Button>
                            </Link>
                        </motion.div>
                    ) : (
                        <span className="text-xs text-white/25 font-medium tracking-widest uppercase border border-white/10 rounded-xl px-4 py-2.5">
                            Coming Soon
                        </span>
                    )}
                </CardFooter>
            </Card>
        </motion.div>
    );
}