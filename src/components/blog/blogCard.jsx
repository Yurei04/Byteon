"use client"

import Image from "next/image"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"

const badgeStyle =
  "bg-fuchsia-800/30 text-fuchsia-200 border border-fuchsia-600/40 backdrop-blur-sm px-2 py-0.5 text-[10px] rounded-md"

export default function BlogCard({ item, onDelete }) {
  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:border-blue-400 transition-all">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
            {item.des && <p className="text-gray-300 text-sm mb-3">{item.des}</p>}
            <div className="flex flex-wrap gap-2 mb-3">
              {item.theme && (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">{item.theme}</span>
              )}
              {item.place && (
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">{item.place}</span>
              )}
            </div>
            <div className="text-sm text-gray-400 space-y-1">
              <p>By: {item.author}</p>
              <p>{new Date(item.created_at).toLocaleDateString()}</p>
              {item.hackathon?.length > 0 && (
                <p>Related: {item.hackathon.join(', ')}</p>
              )}
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(item.id)}
            className="ml-2"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}