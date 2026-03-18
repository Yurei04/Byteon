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
      {!isUser && (
        <div className="w-6 h-6 rounded-lg flex-shrink-0 mb-0.5 bg-gradient-to-br from-fuchsia-700 to-pink-800 border border-fuchsia-600/40 flex items-center justify-center shadow-[0_0_8px_rgba(217,70,239,0.3)]">
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
        <div className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-gradient-to-br from-fuchsia-700 to-pink-700 text-fuchsia-50 rounded-br-sm border border-fuchsia-600/30"
            : isError
              ? "bg-red-950/60 border border-red-700/30 text-red-300 rounded-bl-sm"
              : "bg-zinc-800/90 border border-zinc-700/40 text-zinc-100 rounded-bl-sm"
        }`}>
          {isUser
            ? <p className="whitespace-pre-wrap">{content}</p>
            : <div className="nova-rich-text" dangerouslySetInnerHTML={{ __html: `<p>${md(content)}</p>` }} />
          }
        </div>

        <div className={`flex items-center gap-2 px-1 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          {time && <span className="text-[10px] text-zinc-600">{time}</span>}
          {!isUser && !isError && (
            <button
              onClick={copy}
              className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] text-zinc-600 hover:text-fuchsia-400 px-1.5 py-0.5 rounded hover:bg-fuchsia-950/50"
            >
              {copied
                ? <><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 5l3 3 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Copied</>
                : <><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="3" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1 7V2.5A1.5 1.5 0 012.5 1H7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>Copy</>
              }
            </button>
          )}
        </div>
      </div>

      {isUser && (
        <div className="w-6 h-6 rounded-lg flex-shrink-0 mb-0.5 bg-zinc-700 border border-zinc-600/50 flex items-center justify-center text-[10px] font-semibold text-zinc-400">
          U
        </div>
      )}
    </div>
  )
}