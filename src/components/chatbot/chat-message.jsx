"use client"

import { useState } from "react"

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function md(text) {
  return text
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<div class="nova-code-block"><span class="nova-code-lang">${lang || "code"}</span><pre><code>${esc(code.trim())}</code></pre></div>`
    )
    .replace(/`([^`\n]+)`/g, (_, c) => `<code class="nova-inline-code">${esc(c)}</code>`)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, '<p class="nova-h3">$1</p>')
    .replace(/^## (.+)$/gm, '<p class="nova-h2">$1</p>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]+?<\/li>)/g, "<ul>$1</ul>")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br/>")
}

export default function ChatMessage({ role, content, time, isError }) {
  const [copied, setCopied] = useState(false)
  const isUser = role === "user"

  const copy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex gap-2 items-end ${isUser ? "flex-row-reverse" : "flex-row"}`}>

      {/* AI avatar */}
      {!isUser && (
        <div
          className="w-6 h-6 rounded-lg flex-shrink-0 mb-0.5 flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgb(var(--brand-700)), rgb(var(--accent-600)))",
            border: "1px solid rgb(var(--brand-500) / 0.4)",
            boxShadow: "0 0 8px rgb(var(--accent-500) / 0.3)",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 1L9 3.25V6.75L5 9L1 6.75V3.25L5 1Z" fill="url(#cmG)" />
            <defs>
              <linearGradient id="cmG" x1="1" y1="1" x2="9" y2="9" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f0abfc" /><stop offset="1" stopColor="#c026d3" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      <div className={`group max-w-[82%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className="px-3 py-2.5 rounded-2xl text-sm leading-relaxed"
          style={
            isUser
              ? {
                  background: "linear-gradient(135deg, rgb(var(--brand-700)), rgb(var(--accent-600)))",
                  color: "rgb(var(--brand-100))",
                  border: "1px solid rgb(var(--brand-600) / 0.3)",
                  borderRadius: "1rem 1rem 0.25rem 1rem",
                }
              : isError
                ? {
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    color: "#fca5a5",
                    borderRadius: "1rem 1rem 1rem 0.25rem",
                  }
                : {
                    background: "rgb(var(--surface))",
                    border: "1px solid rgb(var(--surface-border) / 0.5)",
                    color: "rgb(var(--text-primary))",
                    borderRadius: "1rem 1rem 1rem 0.25rem",
                  }
          }
        >
          {isUser
            ? <p className="whitespace-pre-wrap">{content}</p>
            : <div className="nova-rich-text" dangerouslySetInnerHTML={{ __html: `<p>${md(content)}</p>` }} />
          }
        </div>

        <div className={`flex items-center gap-2 px-1 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          {time && (
            <span
              className="text-[10px]"
              style={{ color: "rgb(var(--text-faint))" }}
            >
              {time}
            </span>
          )}
          {!isUser && !isError && (
            <button
              onClick={copy}
              className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded"
              style={{ color: "rgb(var(--text-faint))" }}
              onMouseEnter={e => {
                e.currentTarget.style.color = "rgb(var(--accent-500))"
                e.currentTarget.style.background = "rgb(var(--brand-500) / 0.08)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = "rgb(var(--text-faint))"
                e.currentTarget.style.background = "transparent"
              }}
            >
              {copied
                ? <>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1 5l3 3 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Copied
                  </>
                : <>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <rect x="3" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M1 7V2.5A1.5 1.5 0 012.5 1H7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    Copy
                  </>
              }
            </button>
          )}
        </div>
      </div>

      {/* User avatar */}
      {isUser && (
        <div
          className="w-6 h-6 rounded-lg flex-shrink-0 mb-0.5 flex items-center justify-center text-[10px] font-semibold"
          style={{
            background: "rgb(var(--surface-raised))",
            border: "1px solid rgb(var(--surface-border) / 0.5)",
            color: "rgb(var(--text-muted))",
          }}
        >
          U
        </div>
      )}
    </div>
  )
}