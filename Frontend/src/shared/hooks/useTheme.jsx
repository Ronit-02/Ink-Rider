import { useState, useEffect } from 'react'

/**
 * useTheme – manages dark/light mode via .dark on <html>
 * Follows the system until the user explicitly saves a theme choice.
 */
export function useTheme() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('ink-theme')
    if (saved === 'dark' || saved === 'light') return saved === 'dark'
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    const followSystem = event => {
      const saved = localStorage.getItem('ink-theme')
      if (saved !== 'dark' && saved !== 'light') setDark(event.matches)
    }
    media?.addEventListener('change', followSystem)
    return () => media?.removeEventListener('change', followSystem)
  }, [])

  const toggle = () => {
    const nextDark = !dark
    localStorage.setItem('ink-theme', nextDark ? 'dark' : 'light')
    setDark(nextDark)
  }
  return { dark, toggle }
}
