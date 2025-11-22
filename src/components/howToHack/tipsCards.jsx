import { Card, CardContent, CardHeader } from "../ui/card";

export default function TipsCard({ tip, author, title }) {
    return (
        <Card
            className="
                w-80 h-72 rounded-2xl p-4
                bg-gradient-to-b from-fuchsia-900/40 to-purple-900/30
                backdrop-blur-xl 
                border border-fuchsia-500/30
                shadow-[0_0_25px_rgba(255,0,255,0.35)]
                hover:shadow-[0_0_40px_rgba(255,0,255,0.6)]
                transition-all duration-300
                text-white
            "
        >
            <CardHeader>
                <h1 className="text-xl font-bold text-fuchsia-300 drop-shadow-md">
                    {author}
                </h1>
                <h2 className="text-sm text-purple-200 tracking-widest opacity-90">
                    {title}
                </h2>
            </CardHeader>

            <CardContent>
                <p className="text-sm leading-relaxed text-gray-200">
                    {tip}
                </p>
            </CardContent>
        </Card>
    );
}
