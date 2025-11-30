import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { SelectSeparator } from "../ui/select";
import { motion } from "framer-motion";
import { ExternalLink, MapPin } from "lucide-react";

const colorThemes = {
    red: {
        card: "bg-red-950/40 border-red-400/40",
        cardHover: "hover:border-red-400/70 hover:shadow-red-500/20",
        header: "bg-gradient-to-br from-red-500/50 to-red-600/50 border-red-300/50",
        badge: "bg-red-950/60 border-red-400/50 text-red-50",
        button: "bg-red-600/80 hover:bg-red-500 border-red-400/50 text-white",
        separator: "bg-gradient-to-r from-transparent via-red-500/70 to-transparent",
        text: "text-red-50",
        accent: "text-red-300",
        glow: "shadow-red-500/30"
    },
    purple: {
        card: "bg-purple-950/40 border-purple-400/40",
        cardHover: "hover:border-purple-400/70 hover:shadow-purple-500/20",
        header: "bg-gradient-to-br from-purple-500/50 to-purple-600/50 border-purple-300/50",
        badge: "bg-purple-950/60 border-purple-400/50 text-purple-50",
        button: "bg-purple-600/80 hover:bg-purple-500 border-purple-400/50 text-white",
        separator: "bg-gradient-to-r from-transparent via-purple-500/70 to-transparent",
        text: "text-purple-50",
        accent: "text-purple-300",
        glow: "shadow-purple-500/30"
    },
    blue: {
        card: "bg-blue-950/40 border-blue-400/40",
        cardHover: "hover:border-blue-400/70 hover:shadow-blue-500/20",
        header: "bg-gradient-to-br from-blue-500/50 to-blue-600/50 border-blue-300/50",
        badge: "bg-blue-950/60 border-blue-400/50 text-blue-50",
        button: "bg-blue-600/80 hover:bg-blue-500 border-blue-400/50 text-white",
        separator: "bg-gradient-to-r from-transparent via-blue-500/70 to-transparent",
        text: "text-blue-50",
        accent: "text-blue-300",
        glow: "shadow-blue-500/30"
    },
    pink: {
        card: "bg-pink-950/40 border-pink-400/40",
        cardHover: "hover:border-pink-400/70 hover:shadow-pink-500/20",
        header: "bg-gradient-to-br from-pink-500/50 to-pink-600/50 border-pink-300/50",
        badge: "bg-pink-950/60 border-pink-400/50 text-pink-50",
        button: "bg-pink-600/80 hover:bg-pink-500 border-pink-400/50 text-white",
        separator: "bg-gradient-to-r from-transparent via-pink-500/70 to-transparent",
        text: "text-pink-50",
        accent: "text-pink-300",
        glow: "shadow-pink-500/30"
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -5 }}
            className="w-full"
        >
            <Card className={`w-full max-w-4xl mx-auto flex flex-col lg:flex-row items-start justify-between p-4 sm:p-5 gap-4 sm:gap-5 ${theme.card} ${theme.cardHover} shadow-2xl backdrop-blur-xl border-2 ${theme.text} transition-all duration-500 hover:shadow-2xl ${theme.glow} relative overflow-hidden group`}>
                
                {/* Animated gradient overlay */}
                <motion.div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                        background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${colorTheme === 'red' ? 'rgba(239, 68, 68, 0.15)' : colorTheme === 'purple' ? 'rgba(168, 85, 247, 0.15)' : colorTheme === 'blue' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(236, 72, 153, 0.15)'}, transparent 50%)`
                    }}
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="w-full lg:w-auto"
                >
                    <CardHeader className={`shrink-0 w-full lg:w-44 h-36 sm:h-40 overflow-hidden rounded-xl flex items-center justify-center ${theme.header} border-2 p-3 sm:p-4 relative group/image shadow-lg`}>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full flex items-center justify-center"
                        >
                            <Image
                                src={image}
                                alt={name}
                                width={200}
                                height={200}
                                className="object-contain w-auto h-full max-h-full transition-transform duration-300"
                            />
                        </motion.div>
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
                    </CardHeader>
                </motion.div>

                <CardContent className="flex flex-col flex-1 gap-3 sm:gap-4 p-0 relative z-10 w-full">
                    <motion.div 
                        className="flex flex-col justify-start"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <h1 className="text-xl sm:text-2xl font-bold mb-2 tracking-tight drop-shadow-lg">
                            {name}
                        </h1>
                        
                        <motion.div 
                            className="flex items-center gap-2 mb-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <MapPin className={`w-3 h-3 sm:w-4 sm:h-4 ${theme.accent} flex-shrink-0`} />
                            <h2 className={`text-xs sm:text-sm font-medium ${theme.accent}`}>
                                {location}
                            </h2>
                        </motion.div>

                        <motion.div 
                            className="flex flex-wrap gap-1.5 sm:gap-2 mb-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            {tags.map((tag, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.6 + idx * 0.1 }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <Badge className={`${theme.badge} border font-medium px-2 py-0.5 text-xs shadow-md backdrop-blur-sm`}>
                                        {tag}
                                    </Badge>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>

                    <SelectSeparator className={`${theme.separator} h-[2px] my-1`} />
                    
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="space-y-2"
                    >
                        <p 
                            className="text-sm sm:text-base leading-relaxed font-light line-clamp-3 sm:line-clamp-none mb-2"
                            style={{ color: 'rgba(255, 255, 255, 0.95)' }}
                        >
                            {des}
                        </p>
                    </motion.div>
                </CardContent>

                <CardFooter className="w-full sm:w-auto flex flex-col items-end justify-center mt-4 sm:mt-0 relative z-10">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <Link 
                            href={websiteLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                        >
                            <Button 
                                size="lg" 
                                className={`w-32 py-5 ${theme.button} shadow-xl backdrop-blur-lg border-2 cursor-pointer transition-all duration-300 font-semibold text-base hover:shadow-2xl ${theme.glow} flex items-center gap-2`}
                            >
                            
                                Website
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        </Link>
                    </motion.div>
                </CardFooter>
            </Card>
        </motion.div>
    );
}