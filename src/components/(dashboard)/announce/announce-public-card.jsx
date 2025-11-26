"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, ExternalLink, Award, Trash2 } from "lucide-react"
import { Button } from "../../ui/button"

export default function AnnouncementCard({ item, onDelete }) {
  const isExpired = new Date(item.date_end) < new Date()
  
  return (
    <Card className="group relative bg-gradient-to-br from-fuchsia-950/40 via-purple-950/40 to-slate-950/40 backdrop-blur-xl border border-fuchsia-500/20 hover:border-fuchsia-400/60 transition-all duration-300 overflow-hidden hover:shadow-2xl hover:shadow-fuchsia-500/20">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/0 via-purple-600/5 to-fuchsia-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
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
            <h3 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-3 group-hover:from-fuchsia-200 group-hover:via-purple-200 group-hover:to-pink-200 transition-all duration-300">
              {item.title}
            </h3>
            
            {/* Description */}
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">{item.des}</p>
            
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {item.prizes && (
                <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-400/30 text-emerald-300 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-emerald-500/10">
                  <Award className="w-3.5 h-3.5" />
                  ${item.prizes.toLocaleString()}
                </span>
              )}
              {isExpired ? (
                <span className="px-3 py-1.5 bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-400/30 text-red-300 rounded-full text-xs font-medium shadow-lg shadow-red-500/10">
                  Expired
                </span>
              ) : (
                <span className="px-3 py-1.5 bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-400/30 text-fuchsia-300 rounded-full text-xs font-medium shadow-lg shadow-fuchsia-500/10 animate-pulse">
                  Active
                </span>
              )}
            </div>
            
            {/* Info Section */}
            <div className="text-sm text-gray-400 space-y-2 bg-black/20 rounded-lg p-3 border border-purple-500/10">
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-fuchsia-400" />
                <span className="text-gray-300">
                  {new Date(item.date_begin).toLocaleDateString()} - {new Date(item.date_end).toLocaleDateString()}
                </span>
              </p>
              {item.open_to && (
                <p className="text-gray-400">
                  <span className="text-fuchsia-400 font-medium">Open to:</span> {item.open_to}
                </p>
              )}
              {item.countries && (
                <p className="text-gray-400">
                  <span className="text-purple-400 font-medium">Location:</span> {item.countries}
                </p>
              )}
              <p className="text-gray-400">
                <span className="text-pink-400 font-medium">By:</span> {item.author}
              </p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        {(item.website_link || item.dev_link) && (
          <div className="flex gap-3 mt-5 pt-4 border-t border-purple-500/10">
            {item.website_link && (
              <a href={item.website_link} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button 
                  size="sm" 
                  className="w-full cursor-pointer bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-fuchsia-500/30 transition-all duration-300"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-2" />
                  Website
                </Button>
              </a>
            )}
            {item.dev_link && (
              <a href={item.dev_link} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button 
                  size="sm" 
                  className="w-full cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 shadow-lg shadow-purple-500/30 transition-all duration-300"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-2" />
                  DevPost
                </Button>
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}