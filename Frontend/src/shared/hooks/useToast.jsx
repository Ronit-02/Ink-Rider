import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback(id => {
    setToasts(current => current.filter(toast => toast.id !== id))
  }, [])

  const notify = useCallback((message, options = {}) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const toast = {
      id,
      message,
      tone: options.tone || 'success',
      duration: options.duration || 3200,
    }

    setToasts(current => [...current.slice(-3), toast])
    if (toast.duration > 0) window.setTimeout(() => dismiss(id), toast.duration)
    return id
  }, [dismiss])

  const value = useMemo(() => ({ toasts, notify, dismiss }), [toasts, notify, dismiss])

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export default function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
