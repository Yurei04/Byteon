"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export default function BlogSearchBar({ onSearch, onFilterChange }) {
    return (
        <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 p-4">

            <div className="relative w-full sm:w-1/2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                type="text"
                placeholder="Search blog posts..."
                className="pl-9"
                onChange={(e) => onSearch && onSearch(e.target.value)}
                />
            </div>

            <Select onValueChange={(value) => onFilterChange && onFilterChange(value)}>
                <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by theme" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="ai">AI</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="environment">Environment</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}
