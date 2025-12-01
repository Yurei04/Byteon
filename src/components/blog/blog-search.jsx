"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export default function BlogSearchBar({ onSearch, onFilterChange }) {
    return (
        <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 p-4 mt-4">

            <div className="relative w-full sm:w-1/2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 border border-fuchsia-800/30 text-muted-foreground w-4 h-4" />
                <Input
                type="text"
                placeholder="Search blog posts..."
                className=" pl-10 bg-fuchsia-950/20 
                        border border-fuchsia-800/40
                        text-fuchsia-100 placeholder-fuchsia-300/50
                        rounded-xl backdrop-blur-md
                        focus-visible:ring-fuchsia-500/40"
                onChange={(e) => onSearch && onSearch(e.target.value)}
                />
            </div>

            <Select 
                onValueChange={(value) => onFilterChange && onFilterChange(value)}
                className=" w-full sm:w-48 bg-fuchsia-950/20
                        text-fuchsia-100 
                        border border-fuchsia-800/40 
                        rounded-md backdrop-blur-md
                        focus:ring-fuchsia-500/40"
                >
                    <SelectTrigger className="w-full sm:w-48 border border-fuchsia-800/40 rounded-md backdrop-blur-md focus:ring-fuchsia-500/40">
                    <SelectValue placeholder="Filter by theme" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="AI">AI</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    </SelectContent>
            </Select>
        </div>
    )
}
