import { useState, useEffect, useCallback, useRef } from "react"

export function useToast() {
  const [toasts, setToasts] = useState([])
  const timerRefs = useRef({})

  const addToast = useCallback((type, message, duration = 4500) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, type, message, duration }])
    timerRefs.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
      delete timerRefs.current[id]
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    if (timerRefs.current[id]) {
      clearTimeout(timerRefs.current[id])
      delete timerRefs.current[id]
    }
  }, [])

  useEffect(() => {
    return () => Object.values(timerRefs.current).forEach(clearTimeout)
  }, [])

  return { toasts, addToast, removeToast }
}