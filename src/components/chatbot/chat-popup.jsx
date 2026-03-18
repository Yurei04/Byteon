"use client"

import { useEffect, useRef, useState } from "react"
import ChatMessage from "./chat-message"
import TypingDots from "./typing-dots"
import ModelSelector from "./model-selector"
import WelcomeSuggestions from "./welcome-suggestions"

export default function ChatPopup({ isOpen, onClose, messages, isLoading, onSend, onClear, model, onModelChange }) {
  const [input, setInput] = useState("")
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen) setTimeout(() => textareaRef.current?.focus(), 180)
  }, [isOpen])

  const handleInput = (e) => {
    setInput(e.target.value)
    const el = textareaRef.current
    if (el) { el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 120) + "px" }
  }

  const submit = () => {
    const text = input.trim()
    if (!text || isLoading) return
    onSend(text)
    setInput("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
  }

  return (
    <div className={`absolute bottom-[72px] right-0 w-[360px] h-[520px] flex flex-col bg-zinc-950 border border-fuchsia-900/40 rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.8),0_0_0_1px_rgba(217,70,239,0.08)] transition-all duration-300 ease-out origin-bottom-right ${
      isOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-90 translate-y-4 pointer-events-none"
    }`}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-fuchsia-900/25 bg-zinc-950 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-fuchsia-600 to-pink-700 flex items-center justify-center shadow-[0_0_12px_rgba(217,70,239,0.4)]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.5L12 4.25V9.75L7 12.5L2 9.75V4.25L7 1.5Z" fill="white" opacity="0.9"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-100 leading-none">Nova</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[10px] text-zinc-500">AI Assistant</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <ModelSelector selected={model} onChange={onModelChange} />
          {messages.length > 0 && (
            <button onClick={onClear} title="Clear chat" className="p-1.5 rounded-lg text-zinc-600 hover:text-fuchsia-400 hover:bg-fuchsia-950/50 transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 4h10M5 4V3a1 1 0 011-1h2a1 1 0 011 1v1M6 7v3M8 7v3M3 4l.6 7.5A1 1 0 004.6 12h4.8a1 1 0 001-.9L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M10 3L3 10M3 3l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 overscroll-contain [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full">
        {messages.length === 0
          ? <WelcomeSuggestions onSelect={onSend} />
          : <>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} role={msg.role} content={msg.content} time={msg.time} isError={msg.isError} />
              ))}
              {isLoading && <TypingDots />}
              <div ref={bottomRef} />
            </>
        }
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-3 pb-3 pt-2 border-t border-fuchsia-900/20 bg-zinc-950">
        <div className={`flex items-end gap-2 rounded-xl px-3 py-2 bg-zinc-900 border transition-all duration-200 ${
          input ? "border-fuchsia-600/50 shadow-[0_0_14px_rgba(217,70,239,0.15)]" : "border-zinc-700/50 focus-within:border-fuchsia-600/40"
        }`}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit() } }}
            placeholder="Message Nova…"
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-zinc-100 placeholder-zinc-600 caret-fuchsia-400 min-h-[22px] max-h-[120px] py-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={submit}
            disabled={!input.trim() || isLoading}
            className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mb-0.5 transition-all duration-200 ${
              input.trim() && !isLoading
                ? "bg-gradient-to-br from-fuchsia-600 to-pink-700 text-white shadow-[0_0_12px_rgba(217,70,239,0.4)] hover:scale-105 active:scale-95"
                : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
            }`}
          >
            {isLoading
              ? <span className="w-3.5 h-3.5 border-2 border-fuchsia-800 border-t-fuchsia-300 rounded-full animate-spin" />
              : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 11V3M3.5 6.5L7 3l3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            }
          </button>
        </div>
        <p className="text-[10px] text-zinc-700 text-center mt-1.5">Enter to send · Shift+Enter new line</p>
      </div>
    </div>
  )
}