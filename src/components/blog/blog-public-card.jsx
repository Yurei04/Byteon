"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, Tag, Link2 } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog"
import { ScrollArea } from "../ui/scroll-area"

export default function BlogPublicCard({ item, theme }) {
  return (
    <Dialog>
      <DialogTrigger className="justify-start text-start w-full h-full">
        <Card
          className="group relative backdrop-blur-xl overflow-hidden transition-all duration-300"
          style={{
            background: theme.cardBg,
            border: theme.borderColor,
            boxShadow: "none",
            ...theme.cssVars,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = theme.cardShadow
            e.currentTarget.style.border = theme.borderColorStrong
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none"
            e.currentTarget.style.border = theme.borderColor
          }}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: theme.overlayGradient }}
          />

          {/* Corner Accent */}
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: theme.cornerGradient }}
          />

          <CardContent className="relative p-6">
            {/* ORG */}
            {item.organization && (
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: theme.primaryText }}
              >
                {item.organization}
              </span>
            )}

            {/* TITLE */}
            <h3
              className="text-2xl font-bold mb-3 line-clamp-2"
              style={{
                backgroundImage: theme.textGradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {item.title}
            </h3>

            {/* DESCRIPTION */}
            {item.des && (
              <p className="text-gray-300 text-sm line-clamp-3 mb-4">
                {item.des}
              </p>
            )}

            {/* BADGES */}
            <div className="flex flex-wrap gap-2 mb-4">
              {item.theme && (
                <span
                  className="px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5"
                  style={{
                    background: theme.badgeBgPrimary,
                    border: theme.borderColor,
                    color: theme.labelText,
                  }}
                >
                  <Tag className="w-3 h-3" />
                  {item.theme}
                </span>
              )}

              {item.place && (
                <span
                  className="px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5"
                  style={{
                    background: theme.badgeBgSecondary,
                    border: `1px solid ${theme.secondary30}`,
                    color: theme.secondaryText,
                  }}
                >
                  <MapPin className="w-3 h-3" />
                  {item.place}
                </span>
              )}
            </div>

            {/* META */}
            <div
              className="rounded-lg p-3 space-y-2"
              style={{
                background: "rgba(0,0,0,0.2)",
                border: `1px solid ${theme.primary30}`,
              }}
            >
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  <span style={{ color: theme.primaryText }}>By:</span>{" "}
                  {item.author}
                </span>

                <span className="text-gray-400 flex items-center gap-1">
                  <Calendar
                    className="w-3.5 h-3.5"
                    style={{ color: theme.secondaryText }}
                  />
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>

              {item.hackathon?.length > 0 && (
                <div
                  className="pt-2"
                  style={{ borderTop: `1px solid ${theme.primary30}` }}
                >
                  <p className="text-xs text-gray-400 flex gap-2">
                    <Link2
                      className="w-3.5 h-3.5"
                      style={{ color: theme.primaryText }}
                    />
                    {item.hackathon.join(", ")}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom bar */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
              style={{ background: theme.bottomBarGradient }}
            />
          </CardContent>
        </Card>
      </DialogTrigger>

      {/* ── MODAL ───────────────────────────────────────── */}
      <DialogContent>
        <Card
          className="relative backdrop-blur-xl overflow-hidden"
          style={{
            background: theme.cardBg,
            border: theme.borderColor,
            ...theme.cssVars,
          }}
        >
          <CardContent className="p-6">
            {/* TITLE */}
            <h3
              className="text-2xl font-bold mb-3"
              style={{
                backgroundImage: theme.textGradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {item.title}
            </h3>

            {/* DESCRIPTION */}
            {item.des && (
              <p className="text-gray-300 mb-4">{item.des}</p>
            )}

            {/* META */}
            <div
              className="rounded-lg p-3 space-y-2"
              style={{
                background: "rgba(0,0,0,0.2)",
                border: `1px solid ${theme.primary30}`,
              }}
            >
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  <span style={{ color: theme.primaryText }}>By:</span>{" "}
                  {item.author}
                </span>

                <span className="text-gray-400 flex items-center gap-1">
                  <Calendar
                    className="w-3.5 h-3.5"
                    style={{ color: theme.secondaryText }}
                  />
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>

              {item.hackathon?.length > 0 && (
                <div
                  className="pt-2"
                  style={{ borderTop: `1px solid ${theme.primary30}` }}
                >
                  <p className="text-xs text-gray-400 flex gap-2">
                    <Link2
                      className="w-3.5 h-3.5"
                      style={{ color: theme.primaryText }}
                    />
                    {item.hackathon.join(", ")}
                  </p>
                </div>
              )}
            </div>

            {/* CONTENT */}
            <ScrollArea className="h-72">
              <p className="text-gray-300 text-sm text-justify p-2">
                {item.content}
              </p>
            </ScrollArea>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}