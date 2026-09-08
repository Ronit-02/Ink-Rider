import { useSyncExternalStore } from 'react'

let isServerUnavailable = false
const listeners = new Set()

function notifyListeners() {
  listeners.forEach(listener => listener())
}

export function markServerUnavailable() {
  if (isServerUnavailable) return
  isServerUnavailable = true
  notifyListeners()
}

export function useServerUnavailable() {
  return useSyncExternalStore(
    listener => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => isServerUnavailable,
    () => false,
  )
}
