"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Calendar, MapPin, Tag, Link2 } from "lucide-react"

export default function BlogPublicCard({ item, }) {
  return (
    <Card className="group relative bg-gradient-to-br from-fuchsia-950/40 via-purple-950/40 to-slate-950/40 backdrop-blur-xl border border-fuchsia-500/20 hover:border-fuchsia-400/60 transition-all duration-300 overflow-hidden hover:shadow-2xl hover:shadow-fuchsia-500/20">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/0 via-purple-600/5 to-fuchsia-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-fuchsia-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardContent className="relative p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            {/* Organization Name */}
            {item.organization && (
              <div className="mb-2">
                <span className="text-xs font-semibold text-fuchsia-400 uppercase tracking-wider">
                  {item.organization}
                </span>
              </div>
            )}
            
            {/* Title */}
            <h3 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-3 group-hover:from-fuchsia-200 group-hover:via-purple-200 group-hover:to-pink-200 transition-all duration-300 line-clamp-2">
              {item.title}
            </h3>
            
            {/* Description */}
            {item.des && (
              <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 mb-4">
                {item.des}
              </p>
            )}
            
            {/* Badges Section */}
            <div className="flex flex-wrap gap-2 mb-4">
              {item.theme && (
                <span className="px-3 py-1.5 bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-400/30 text-fuchsia-300 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-fuchsia-500/10">
                  <Tag className="w-3 h-3" />
                  {item.theme}
                </span>
              )}
              {item.place && (
                <span className="px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-purple-300 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-purple-500/10">
                  <MapPin className="w-3 h-3" />
                  {item.place}
                </span>
              )}
            </div>
            
            {/* Info Section */}
            <div className="bg-black/20 rounded-lg p-3 border border-purple-500/10 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  <span className="text-fuchsia-400 font-medium">By:</span> {item.author}
                </span>
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
              
              {item.hackathon?.length > 0 && (
                <div className="pt-2 border-t border-purple-500/10">
                  <p className="text-xs text-gray-400 flex items-start gap-2">
                    <Link2 className="w-3.5 h-3.5 text-pink-400 mt-0.5 flex-shrink-0" />
                    <span>
                      <span className="text-pink-400 font-medium">Related:</span>{' '}
                      <span className="text-gray-300">{item.hackathon.join(', ')}</span>
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Hover indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </CardContent>
    </Card>
  )
}