import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink, MapPin } from "lucide-react";

const colorThemes = {
    red: {
        card: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-500/20",
        cardHover: "hover:border-red-400 hover:shadow-red-200/50 dark:hover:border-red-400/50 dark:hover:shadow-red-500/10",
        header: "bg-red-100/70 border-red-200 dark:bg-red-950/50 dark:border-red-500/20",
        badge: "bg-red-100 border-red-300 text-red-800 dark:bg-red-950/60 dark:border-red-500/30 dark:text-red-200",
        button: "bg-red-100 hover:bg-red-200 border-red-300 text-red-800 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:border-red-500/30 dark:text-red-200",
        separator: "bg-gradient-to-r from-transparent via-red-300 to-transparent dark:via-red-500/30",
        accent: "text-red-600 dark:text-red-300",
        shimmer: "via-red-300/20 dark:via-fuchsia-400/30",
        glow: "hover:shadow-red-200/50 dark:hover:shadow-red-500/10"
    },
    purple: {
        card: "bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-500/20",
        cardHover: "hover:border-purple-400 hover:shadow-purple-200/50 dark:hover:border-purple-400/50 dark:hover:shadow-purple-500/10",
        header: "bg-purple-100/70 border-purple-200 dark:bg-purple-950/50 dark:border-purple-500/20",
        badge: "bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-950/60 dark:border-purple-500/30 dark:text-purple-200",
        button: "bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-800 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 dark:border-purple-500/30 dark:text-purple-200",
        separator: "bg-gradient-to-r from-transparent via-purple-300 to-transparent dark:via-purple-500/30",
        accent: "text-purple-600 dark:text-purple-300",
        shimmer: "via-purple-300/20 dark:via-fuchsia-400/30",
        glow: "hover:shadow-purple-200/50 dark:hover:shadow-purple-500/10"
    },
    blue: {
        card: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-500/20",
        cardHover: "hover:border-blue-400 hover:shadow-blue-200/50 dark:hover:border-blue-400/50 dark:hover:shadow-blue-500/10",
        header: "bg-blue-100/70 border-blue-200 dark:bg-blue-950/50 dark:border-blue-500/20",
        badge: "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-950/60 dark:border-blue-500/30 dark:text-blue-200",
        button: "bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-800 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:border-blue-500/30 dark:text-blue-200",
        separator: "bg-gradient-to-r from-transparent via-blue-300 to-transparent dark:via-blue-500/30",
        accent: "text-blue-600 dark:text-blue-300",
        shimmer: "via-blue-300/20 dark:via-fuchsia-400/30",
        glow: "hover:shadow-blue-200/50 dark:hover:shadow-blue-500/10"
    },
    pink: {
        card: "bg-pink-50 border-pink-200 dark:bg-pink-950/30 dark:border-pink-500/20",
        cardHover: "hover:border-pink-400 hover:shadow-pink-200/50 dark:hover:border-pink-400/50 dark:hover:shadow-pink-500/10",
        header: "bg-pink-100/70 border-pink-200 dark:bg-pink-950/50 dark:border-pink-500/20",
        badge: "bg-pink-100 border-pink-300 text-pink-800 dark:bg-pink-950/60 dark:border-pink-500/30 dark:text-pink-200",
        button: "bg-pink-100 hover:bg-pink-200 border-pink-300 text-pink-800 dark:bg-pink-500/10 dark:hover:bg-pink-500/20 dark:border-pink-500/30 dark:text-pink-200",
        separator: "bg-gradient-to-r from-transparent via-pink-300 to-transparent dark:via-pink-500/30",
        accent: "text-pink-600 dark:text-pink-300",
        shimmer: "via-pink-300/20 dark:via-fuchsia-400/30",
        glow: "hover:shadow-pink-200/50 dark:hover:shadow-pink-500/10"
    },
    cyan: {
        card: "bg-cyan-50 border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-500/20",
        cardHover: "hover:border-cyan-400 hover:shadow-cyan-200/50 dark:hover:border-cyan-400/50 dark:hover:shadow-cyan-500/10",
        header: "bg-cyan-100/70 border-cyan-200 dark:bg-cyan-950/50 dark:border-cyan-500/20",
        badge: "bg-cyan-100 border-cyan-300 text-cyan-800 dark:bg-cyan-950/60 dark:border-cyan-500/30 dark:text-cyan-200",
        button: "bg-cyan-100 hover:bg-cyan-200 border-cyan-300 text-cyan-800 dark:bg-cyan-500/10 dark:hover:bg-cyan-500/20 dark:border-cyan-500/30 dark:text-cyan-200",
        separator: "bg-gradient-to-r from-transparent via-cyan-300 to-transparent dark:via-cyan-500/30",
        accent: "text-cyan-600 dark:text-cyan-300",
        shimmer: "via-cyan-300/20 dark:via-fuchsia-400/30",
        glow: "hover:shadow-cyan-200/50 dark:hover:shadow-cyan-500/10"
    },
    lightgray: {
        card: "bg-slate-100 border-slate-300 dark:bg-slate-700/20 dark:border-slate-400/25",
        cardHover: "hover:border-slate-400 hover:shadow-slate-200/50 dark:hover:border-slate-300/60 dark:hover:shadow-slate-300/10",
        header: "bg-slate-200/60 border-slate-300 dark:bg-slate-600/20 dark:border-slate-400/25",
        badge: "bg-slate-200 border-slate-300 text-slate-700 dark:bg-slate-600/30 dark:border-slate-400/35 dark:text-slate-100",
        button: "bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-700 dark:bg-slate-300/10 dark:hover:bg-slate-300/20 dark:border-slate-300/40 dark:text-slate-100",
        separator: "bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-400/40",
        accent: "text-slate-600 dark:text-slate-300",
        shimmer: "via-slate-300/30 dark:via-slate-400/30",
        glow: "hover:shadow-slate-200/50 dark:hover:shadow-slate-300/10"
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
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${theme.shimmer} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

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
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-1.5">
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
                    <p className="text-sm sm:text-base leading-relaxed font-light text-gray-700 dark:text-white/80 line-clamp-3 sm:line-clamp-none">
                        {des}
                    </p>
                </CardContent>

                {/* CTA */}
                <CardFooter className="w-full lg:w-auto flex items-center lg:items-end justify-start lg:justify-center p-0 mt-2 lg:mt-0 relative z-10 lg:self-center">
                    {websiteLink ? (
                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                            <a
                                href={websiteLink}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
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
                            </a>
                        </motion.div>
                    ) : (
                        <span className="text-xs text-gray-400 dark:text-white/25 font-medium tracking-widest uppercase border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5">
                            Coming Soon
                        </span>
                    )}
                </CardFooter>
            </Card>
        </motion.div>
    );
}