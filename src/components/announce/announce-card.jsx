"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Calendar, MapPin, Trophy, ExternalLink, Users, Award, Trash2 } from "lucide-react"
import { useState } from "react"
import { Button } from "../ui/button"

export default function AnnouncementCard({ item, onDelete }) {
  const isExpired = new Date(item.date_end) < new Date()
  
  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:border-purple-400 transition-all">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
            <p className="text-gray-300 text-sm mb-3">{item.des}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {item.prizes && (
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  ${item.prizes.toLocaleString()}
                </span>
              )}
              {isExpired ? (
                <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs">Expired</span>
              ) : (
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">Active</span>
              )}
            </div>
            <div className="text-sm text-gray-400 space-y-1">
              <p><Calendar className="w-3 h-3 inline mr-1" />
                {new Date(item.date_begin).toLocaleDateString()} - {new Date(item.date_end).toLocaleDateString()}
              </p>
              {item.open_to && <p>Open to: {item.open_to}</p>}
              {item.countries && <p>Location: {item.countries}</p>}
              <p>By: {item.author}</p>
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
        
        {(item.website_link || item.dev_link) && (
          <div className="flex gap-2 mt-4">
            {item.website_link && (
              <a href={item.website_link} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="text-xs">
                  <ExternalLink className="w-3 h-3 mr-1" />Website
                </Button>
              </a>
            )}
            {item.dev_link && (
              <a href={item.dev_link} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="text-xs">
                  <ExternalLink className="w-3 h-3 mr-1" />DevPost
                </Button>
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}