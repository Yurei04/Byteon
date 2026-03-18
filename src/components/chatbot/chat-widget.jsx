"use client"

import { useState, useCallback } from "react"
import ChatBubbleButton from "./chat-bubble-btn"
import ChatPopup from "./chat-popup"

let _id = 0
const uid = () => `m${++_id}`
const ts = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [model, setModel] = useState("llama-3.3-70b")
  const [hasUnread, setHasUnread] = useState(false)

  const send = useCallback(async (text) => {
    const userMsg = { id: uid(), role: "user", content: text, time: ts() }
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    try {
      const history = [...messages, userMsg].map(({ role, content }) => ({
        role: role === "ai" ? "assistant" : role,
        content,
      }))

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, model }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Request failed")

      setMessages((prev) => [...prev, { id: uid(), role: "ai", content: data.reply, time: ts() }])
      if (!isOpen) setHasUnread(true)
    } catch (err) {
      setMessages((prev) => [...prev, { id: uid(), role: "ai", content: `⚠ ${err.message}`, time: ts(), isError: true }])
    } finally {
      setIsLoading(false)
    }
  }, [messages, model, isOpen])

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      <ChatPopup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        isLoading={isLoading}
        onSend={send}
        onClear={() => setMessages([])}
        model={model}
        onModelChange={setModel}
      />
      <ChatBubbleButton isOpen={isOpen} onClick={() => { setIsOpen(v => !v); setHasUnread(false) }} hasUnread={hasUnread} />
    </div>
  )
}