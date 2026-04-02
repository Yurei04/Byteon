"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, Tag, Link2 } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog"
import { useState } from "react"

export default function BlogPublicCard({
  item,
  primaryColor,
  secondaryColor,
}) {
  const [isLoading, setIsLoading] = useState(false)

  const resolvedPrimary =
    primaryColor || item?.primary_color || item?.accent_color || "#8b5cf6"

  const resolvedSecondary =
    secondaryColor || item?.secondary_color || "#6366f1"

  return (
    <Dialog>
      <DialogTrigger className="flex justify-start items-start text-start w-full">
        <Card
          className="group relative w-full backdrop-blur-xl border transition-all duration-300 overflow-hidden"
          style={{
            background: `linear-gradient(135deg,
              ${resolvedPrimary}20,
              ${resolvedSecondary}10,
              rgba(2,6,23,0.6))`,
            borderColor: `${resolvedPrimary}40`,
          }}
        >
          {/* Top bar */}
          <div
            className="h-1 w-full"
            style={{
              background: `linear-gradient(to right, ${resolvedPrimary}, ${resolvedSecondary})`,
            }}
          />

          {/* Hover glow */}
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle at top right, ${resolvedPrimary}20, transparent 70%)`,
            }}
          />

          <CardContent className="relative p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">

                {(item.organization || item.user_name) && (
                  <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: resolvedPrimary }}
                  >
                    {item.organization || item.user_name}
                  </span>
                )}

                <h3
                  className="text-2xl font-bold mb-3 line-clamp-2"
                  style={{
                    background: `linear-gradient(to right, ${resolvedPrimary}, ${resolvedSecondary})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {item.title}
                </h3>

                {item.des && (
                  <p className="text-gray-300 text-sm line-clamp-3 mb-4">
                    {item.des}
                  </p>
                )}

                {/* Badge */}
                {item.theme && (
                  <span
                    className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md mb-4"
                    style={{
                      background: `${resolvedPrimary}20`,
                      color: resolvedPrimary,
                      border: `1px solid ${resolvedPrimary}40`,
                    }}
                  >
                    <Tag className="w-3 h-3" />
                    {item.theme}
                  </span>
                )}

                {/* Info */}
                <div
                  className="rounded-lg p-3 space-y-2"
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    border: `1px solid ${resolvedPrimary}30`,
                  }}
                >
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>
                      <span style={{ color: resolvedPrimary }}>By:</span>{" "}
                      {item.author}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Calendar
                        className="w-3.5 h-3.5"
                        style={{ color: resolvedSecondary }}
                      />
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {item.hackathon?.length > 0 && (
                    <div
                      className="pt-2"
                      style={{
                        borderTop: `1px solid ${resolvedPrimary}30`,
                      }}
                    >
                      <p className="text-xs text-gray-400 flex gap-2">
                        <Link2
                          className="w-3.5 h-3.5"
                          style={{ color: resolvedSecondary }}
                        />
                        <span>
                          <span style={{ color: resolvedSecondary }}>
                            Related:
                          </span>{" "}
                          {item.hackathon.join(", ")}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
              style={{
                background: `linear-gradient(to right, ${resolvedPrimary}, ${resolvedSecondary})`,
              }}
            />
          </CardContent>
        </Card>
      </DialogTrigger>

      {/* FULL VIEW */}
      <DialogContent className="w-screen h-screen max-w-none p-0 rounded-none flex">
        <DialogTitle />

        <Card
          className="w-full h-full backdrop-blur-xl border"
          style={{
            background: `linear-gradient(135deg,
              ${resolvedPrimary}20,
              ${resolvedSecondary}10,
              rgba(2,6,23,0.9))`,
            borderColor: `${resolvedPrimary}40`,
          }}
        >
          <div
            className="h-1 w-full"
            style={{
              background: `linear-gradient(to right, ${resolvedPrimary}, ${resolvedSecondary})`,
            }}
          />

          <CardContent className="p-6 overflow-y-auto max-w-3xl mx-auto">
            <h2
              className="text-3xl font-bold mb-4"
              style={{
                background: `linear-gradient(to right, ${resolvedPrimary}, ${resolvedSecondary})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {item.title}
            </h2>

            {item.content && (
              <div className="space-y-4 text-gray-300 text-sm">
                {item.content.split("\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}