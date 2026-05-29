"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import ChatBubbleButton from "./chat-bubble-btn"
import ChatPopup from "./chat-popup"

let _id = 0
const uid = () => `m${++_id}`
const ts = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

// Clamps a value between min and max
const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

// Draggable bubble hook — constrains to viewport, works on mouse + touch
function useDraggableBubble() {
  const BUBBLE_SIZE = 56   // px — match your button's width/height
  const EDGE_PAD   = 12   // minimum gap from viewport edge

  // Start at bottom-right
  const getInitialPos = () => {
    if (typeof window === "undefined") return { x: 0, y: 0 }
    return {
      x: window.innerWidth  - BUBBLE_SIZE - EDGE_PAD,
      y: window.innerHeight - BUBBLE_SIZE - EDGE_PAD,
    }
  }

  const [pos, setPos] = useState({ x: 0, y: 0 })
  const posRef  = useRef(pos)
  const isDragging = useRef(false)
  const hasMoved   = useRef(false)
  const startPtr   = useRef({ x: 0, y: 0 })
  const startPos   = useRef({ x: 0, y: 0 })

  // Set real initial position after mount (avoids SSR mismatch)
  useEffect(() => {
    const p = getInitialPos()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPos(p)
    posRef.current = p
  }, [])

  // Constrain on window resize
  useEffect(() => {
    const onResize = () => {
      setPos(prev => {
        const next = {
          x: clamp(prev.x, EDGE_PAD, window.innerWidth  - BUBBLE_SIZE - EDGE_PAD),
          y: clamp(prev.y, EDGE_PAD, window.innerHeight - BUBBLE_SIZE - EDGE_PAD),
        }
        posRef.current = next
        return next
      })
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  const beginDrag = (clientX, clientY) => {
    isDragging.current = true
    hasMoved.current   = false
    startPtr.current   = { x: clientX, y: clientY }
    startPos.current   = { ...posRef.current }
  }

  const moveDrag = (clientX, clientY) => {
    if (!isDragging.current) return
    const dx = clientX - startPtr.current.x
    const dy = clientY - startPtr.current.y
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved.current = true
    const next = {
      x: clamp(startPos.current.x + dx, EDGE_PAD, window.innerWidth  - BUBBLE_SIZE - EDGE_PAD),
      y: clamp(startPos.current.y + dy, EDGE_PAD, window.innerHeight - BUBBLE_SIZE - EDGE_PAD),
    }
    posRef.current = next
    setPos(next)
  }

  const endDrag = () => { isDragging.current = false }

  // Mouse events
  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return
    e.preventDefault()
    beginDrag(e.clientX, e.clientY)

    const onMove = (e) => moveDrag(e.clientX, e.clientY)
    const onUp   = () => {
      endDrag()
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup",   onUp)
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup",   onUp)
  }, [])

  // Touch events
  const onTouchStart = useCallback((e) => {
    const t = e.touches[0]
    beginDrag(t.clientX, t.clientY)

    const onMove = (e) => {
      const t = e.touches[0]
      moveDrag(t.clientX, t.clientY)
    }
    const onEnd = () => {
      endDrag()
      window.removeEventListener("touchmove", onMove)
      window.removeEventListener("touchend",  onEnd)
    }
    window.addEventListener("touchmove", onMove, { passive: true })
    window.addEventListener("touchend",  onEnd)
  }, [])

  // Returns true if the pointer barely moved — treat as a click, not a drag
  const wasClick = () => !hasMoved.current

  return { pos, onMouseDown, onTouchStart, wasClick }
}

export default function ChatWidget() {
  const [isOpen,    setIsOpen]    = useState(false)
  const [messages,  setMessages]  = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [model,     setModel]     = useState("llama-3.3-70b")
  const [hasUnread, setHasUnread] = useState(false)

  const { pos, onMouseDown, onTouchStart, wasClick } = useDraggableBubble()

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

      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "ai", content: data.reply, time: ts() },
      ])
      if (!isOpen) setHasUnread(true)
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "ai", content: `⚠ ${err.message}`, time: ts(), isError: true },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [messages, model, isOpen])

  // Handle bubble click — only toggle if the pointer didn't drag
  const handleMouseUp  = () => { if (wasClick()) { setIsOpen(v => !v); setHasUnread(false) } }
  const handleTouchEnd = () => { if (wasClick()) { setIsOpen(v => !v); setHasUnread(false) } }

  return (
    <>
      {/* ── Chat popup — always fixed to bottom-right, never moves ── */}
      <div
        style={{
          position: "fixed",
          bottom: "80px",
          right: "24px",
          zIndex: 9998,
          pointerEvents: isOpen ? "auto" : "none",
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "scale(1) translateY(0)" : "scale(0.95) translateY(8px)",
          transformOrigin: "bottom right",
          transition: "opacity 0.18s ease, transform 0.18s ease",
        }}
      >
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
      </div>

      {/* ── Draggable bubble button — positioned absolutely via JS ── */}
      <div
        onMouseDown={onMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={onTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: "fixed",
          left: pos.x,
          top:  pos.y,
          zIndex: 9999,
          cursor: "grab",
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        <ChatBubbleButton
          isOpen={isOpen}
          hasUnread={hasUnread}
          // onClick intentionally omitted — handled by onMouseUp/onTouchEnd above
        />
      </div>
    </>
  )
}