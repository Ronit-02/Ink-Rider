import { useState, useEffect } from 'react'

/**
 * useTheme – manages dark/light mode via .dark on <html>
 * Persists preference to localStorage.
 */
export function useTheme() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('ink-theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('ink-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('ink-theme', 'light')
    }
  }, [dark])

  const toggle = () => setDark((v) => !v)
  return { dark, toggle }
}
