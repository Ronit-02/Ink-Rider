import { useEffect } from 'react'

export function useClickOutside(ref, callback, additionalRef) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target) && !additionalRef?.current?.contains(event.target)) {
        callback()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, callback, additionalRef])
}
