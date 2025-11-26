"use client";

import { ExternalLink, Trash2, BookOpen, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export default function ResourcePublicCard({ item }) {
  return (
    <Card className="group relative bg-gradient-to-br from-fuchsia-950/40 via-purple-950/40 to-slate-950/40 backdrop-blur-xl border border-fuchsia-500/20 hover:border-fuchsia-400/60 transition-all duration-300 overflow-hidden hover:shadow-2xl hover:shadow-fuchsia-500/20">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/0 via-purple-600/5 to-fuchsia-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Decorative floating orb */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <CardContent className="relative p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            {/* Header with icon */}
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-400/30 rounded-lg shadow-lg shadow-fuchsia-500/10 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-5 h-5 text-fuchsia-300" />
              </div>
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
                <h3 className="text-xl font-bold bg-gradient-to-r from-fuchsia-300 via-purple-300 to-pink-300 bg-clip-text text-transparent group-hover:from-fuchsia-200 group-hover:via-purple-200 group-hover:to-pink-200 transition-all duration-300">
                  {item.title}
                </h3>
              </div>
            </div>
            
            {/* Description */}
            {item.des && (
              <p className="text-gray-300 text-sm leading-relaxed line-clamp-2 mb-4">
                {item.des}
              </p>
            )}
            
            {/* Category Badge */}
            {item.category && (
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-400/30 text-emerald-300 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-emerald-500/10">
                  <Sparkles className="w-3 h-3" />
                  {item.category}
                </span>
              </div>
            )}
            
            {/* Action Button */}
            {item.link && (
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-fuchsia-500/30 transition-all cursor-pointer  duration-300 group/btn"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-2 group-hover/btn:rotate-12 transition-transform duration-300" />
                  Visit Resource
                </Button>
              </a>
            )}
          </div>
        </div>
        
        {/* Hover indicator line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </CardContent>
    </Card>
  );
}