"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Calendar, MapPin, Trophy, ExternalLink, Users } from "lucide-react"
import { useState } from "react"

export default function AnnounceCard({ 
  announcement, 
  onCheckClick,
  colorScheme = "blue" // blue, purple, green, red, orange, pink
}) {
  const [isChecking, setIsChecking] = useState(false)
  
  const isExpired = new Date(announcement.date_end) < new Date()
  const isActive = new Date(announcement.date_begin) <= new Date() && !isExpired
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const handleCheckHackathon = async () => {
    setIsChecking(true)
    try {
      if (onCheckClick) {
        await onCheckClick(announcement.id, isExpired)
      }
    } finally {
      setIsChecking(false)
    }
  }

  // Color scheme configurations
  const colorSchemes = {
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      badge: 'bg-blue-100 text-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700',
      accent: 'text-blue-600',
      border: 'border-blue-200',
      icon: 'text-blue-500'
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      badge: 'bg-purple-100 text-purple-700',
      button: 'bg-purple-600 hover:bg-purple-700',
      accent: 'text-purple-600',
      border: 'border-purple-200',
      icon: 'text-purple-500'
    },
    green: {
      gradient: 'from-green-500 to-green-600',
      badge: 'bg-green-100 text-green-700',
      button: 'bg-green-600 hover:bg-green-700',
      accent: 'text-green-600',
      border: 'border-green-200',
      icon: 'text-green-500'
    },
    red: {
      gradient: 'from-red-500 to-red-600',
      badge: 'bg-red-100 text-red-700',
      button: 'bg-red-600 hover:bg-red-700',
      accent: 'text-red-600',
      border: 'border-red-200',
      icon: 'text-red-500'
    },
    orange: {
      gradient: 'from-orange-500 to-orange-600',
      badge: 'bg-orange-100 text-orange-700',
      button: 'bg-orange-600 hover:bg-orange-700',
      accent: 'text-orange-600',
      border: 'border-orange-200',
      icon: 'text-orange-500'
    },
    pink: {
      gradient: 'from-pink-500 to-pink-600',
      badge: 'bg-pink-100 text-pink-700',
      button: 'bg-pink-600 hover:bg-pink-700',
      accent: 'text-pink-600',
      border: 'border-pink-200',
      icon: 'text-pink-500'
    }
  }

  const colors = isExpired 
    ? {
        gradient: 'from-gray-400 to-gray-500',
        badge: 'bg-gray-200 text-gray-600',
        button: 'bg-gray-400',
        accent: 'text-gray-500',
        border: 'border-gray-200',
        icon: 'text-gray-400'
      }
    : colorSchemes[colorScheme] || colorSchemes.blue

  return (
    <Card className={`overflow-hidden transition-all duration-300 ${isExpired ? 'opacity-60' : 'hover:shadow-xl'}`}>
      {/* Header with gradient */}
      <CardHeader className={`bg-gradient-to-r ${colors.gradient} text-white p-6`}>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2">
              {announcement.title}
            </h3>
            <p className="text-white/90 text-sm">
              by {announcement.author}
            </p>
          </div>
          
          {isExpired && (
            <span className="px-3 py-1 text-xs font-semibold bg-white/20 backdrop-blur-sm text-white rounded-full">
              Ended
            </span>
          )}
          {isActive && (
            <span className="px-3 py-1 text-xs font-semibold bg-white/20 backdrop-blur-sm text-white rounded-full animate-pulse">
              Live Now
            </span>
          )}
        </div>
      </CardHeader>

      {/* Main Content */}
      <CardContent className="p-6 space-y-4">
        {/* Description */}
        <p className="text-gray-700 leading-relaxed">
          {announcement.des}
        </p>

        {/* Info Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className={`w-5 h-5 ${colors.icon}`} />
            <span className="text-sm text-gray-700">
              {formatDate(announcement.date_begin)} - {formatDate(announcement.date_end)}
            </span>
          </div>

          {announcement.countries && (
            <div className="flex items-center gap-3">
              <MapPin className={`w-5 h-5 ${colors.icon}`} />
              <span className="text-sm text-gray-700">
                {announcement.countries}
              </span>
            </div>
          )}

          {announcement.prizes && (
            <div className="flex items-center gap-3">
              <Trophy className={`w-5 h-5 ${colors.icon}`} />
              <span className="text-sm text-gray-700">
                ${announcement.prizes.toLocaleString()} in prizes
              </span>
            </div>
          )}

          {announcement.open_to && (
            <div className="flex items-center gap-3">
              <Users className={`w-5 h-5 ${colors.icon}`} />
              <span className="text-sm text-gray-700">
                Open to {announcement.open_to}
              </span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className={`flex gap-4 pt-4 border-t ${colors.border}`}>
          <div className={`${colors.badge} px-4 py-2 rounded-lg`}>
            <span className="font-bold text-lg">{announcement.record || 0}</span>
            <span className="text-xs ml-2">checked before</span>
          </div>
          {isExpired && (
            <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg">
              <span className="font-bold text-lg">{announcement.record_after || 0}</span>
              <span className="text-xs ml-2">checked after</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Actions */}
      <CardContent className="px-6 pb-6 pt-0">
        <div className="flex gap-3">
          <button
            onClick={handleCheckHackathon}
            disabled={isChecking || isExpired}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-all ${colors.button} ${
              isChecking ? 'opacity-50 cursor-wait' : ''
            } ${isExpired ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'}`}
          >
            {isChecking ? 'Recording...' : isExpired ? 'Hackathon Ended' : 'Check Hackathon'}
          </button>
          
          {announcement.website_link && (
            <a
              href={announcement.website_link}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-all border-2 ${colors.border} ${colors.accent} hover:bg-gray-50`}
            >
              <ExternalLink className="w-4 h-4" />
              Site
            </a>
          )}
          
          {announcement.dev_link && (
            <a
              href={announcement.dev_link}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-all border-2 ${colors.border} ${colors.accent} hover:bg-gray-50`}
            >
              <ExternalLink className="w-4 h-4" />
              DevPost
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}