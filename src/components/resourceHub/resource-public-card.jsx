"use client"

import { ExternalLink, BookOpen } from "lucide-react"
import { buildTheme } from "@/lib/blog-color"

const FALLBACK_THEME = buildTheme("#d946ef", "#f472b6")

function initials(name) {
  return (name || "??")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

export default function ResourcePublicCard({ item, theme }) {
  const t = theme || FALLBACK_THEME

  return (
    <>
      {/* Scoped hover styles — avoids any JS event handlers on anchor */}
      <style>{`
        .resource-card {
          border-radius: 20px;
          overflow: hidden;
          border: 1.5px solid rgb(var(--surface-border) / 0.35);
          background: rgb(var(--surface-raised));
          transition: transform 0.25s cubic-bezier(0.22,1,0.36,1),
                      box-shadow 0.25s cubic-bezier(0.22,1,0.36,1),
                      border-color 0.25s;
          display: flex;
          flex-direction: column;
          height: 100%;
          position: relative;
        }
        .resource-card:hover {
          transform: translateY(-5px);
          border-color: rgb(var(--brand-400) / 0.45);
        }
        .resource-card .bottom-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .resource-card:hover .bottom-bar {
          transform: scaleX(1);
        }
        .resource-card .icon-box {
          transition: transform 0.3s ease;
        }
        .resource-card:hover .icon-box {
          transform: scale(1.1);
        }
        .resource-visit-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
          transition: opacity 0.18s ease, transform 0.18s ease;
          text-decoration: none;
        }
        .resource-visit-btn:hover {
          opacity: 0.85;
          transform: translateY(-1px);
        }
      `}</style>

      <div
        className="resource-card"
        style={{ ...t.cssVars }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow =
            `0 20px 52px rgb(var(--brand-700) / 0.15), 0 4px 14px rgb(var(--brand-700) / 0.08)`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "none"
        }}
      >
        {/* Top gradient bar */}
        <div
          className="h-[3px] w-full flex-shrink-0"
          style={{ background: t.bottomBarGradient }}
        />

        <div className="flex flex-col flex-1 p-5">
          {/* Header: icon + org + title */}
          <div className="flex items-start gap-3 mb-3">
            <div
              className="icon-box flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "rgb(var(--bg-muted))",
                border: `1px solid ${t.primary30}`,
              }}
            >
              <BookOpen
                className="w-4 h-4"
                style={{ color: t.primaryText }}
              />
            </div>

            <div className="flex-1 min-w-0">
              {item.organization && (
                <span
                  className="inline-flex items-center gap-1.5 mb-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full"
                  style={{
                    background: "rgb(var(--bg-muted))",
                    color: t.primaryText,
                    border: `1px solid ${t.primary30}`,
                  }}
                >
                  <span
                    className="w-[4px] h-[4px] rounded-full flex-shrink-0"
                    style={{ background: t.primaryText }}
                  />
                  {item.organization}
                </span>
              )}

              <h3
                className="text-[15px] font-bold leading-snug tracking-tight line-clamp-2"
                style={{ color: "rgb(var(--text-primary))" }}
              >
                {item.title}
              </h3>
            </div>
          </div>

          {/* Description */}
          {item.des && (
            <p
              className="text-[12px] leading-relaxed line-clamp-3 flex-1 mb-4"
              style={{ color: "rgb(var(--text-secondary))" }}
            >
              {item.des}
            </p>
          )}

          {/* Category tag */}
          {item.category && (
            <span
              className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-[11px] font-semibold mb-4"
              style={{
                background: "rgb(var(--bg-muted))",
                color: t.secondaryText,
                border: `1px solid ${t.secondary30}`,
              }}
            >
              <span style={{ fontSize: 10, opacity: 0.8 }}>◈</span>
              {item.category}
            </span>
          )}

          {/* Divider */}
          <div
            className="h-px mb-4"
            style={{ background: "rgb(var(--surface-border) / 0.3)" }}
          />

          {/* Footer */}
          <div className="flex items-center justify-between gap-2">
            {item.organization ? (
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black text-white flex-shrink-0"
                  style={{ background: t.bottomBarGradient }}
                >
                  {initials(item.organization)}
                </div>
                <p
                  className="text-[11px] font-semibold truncate"
                  style={{ color: "rgb(var(--text-primary))" }}
                >
                  {item.organization}
                </p>
              </div>
            ) : (
              <div />
            )}

            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="resource-visit-btn"
                style={{ background: t.bottomBarGradient }}
              >
                <ExternalLink className="w-3 h-3" />
                Visit
              </a>
            )}
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          className="bottom-bar"
          style={{ background: t.bottomBarGradient }}
        />
      </div>
    </>
  )
}