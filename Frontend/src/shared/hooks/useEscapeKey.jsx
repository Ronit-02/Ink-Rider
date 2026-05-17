import { useEffect } from 'react'

export function useEscapeKey(callback) {
  useEffect(() => {
    function handleEsc(event) {
      if (event.key === 'Escape') {
        callback()
      }
    }

    document.addEventListener('keydown', handleEsc)

    return () => {
      document.removeEventListener('keydown', handleEsc)
    }
  }, [callback])
}