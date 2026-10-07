import { useEffect, useRef } from 'react'
import { matchPath, Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import BottomBar from './BottomBar'
import ServerUnavailable from './ServerUnavailable'
import BackButton from '@/shared/components/ui/BackButton'
import { useTheme } from '@/shared/hooks/useTheme'
import { useServerUnavailable } from '@/app/serverAvailability'

// Back belongs to detail and drill-down pages, never primary destinations.
const BACK_ROUTES = [
  '/post/:id', '/author/:handle', '/explore/questions/:id',
  '/explore/competitions/:id', '/collections/:id', '/shorts/series/:id',
  '/search', '/membership', '/history', '/settings', '/help',
]

export default function AppLayout() {
  const location = useLocation()
  const { dark, toggle: toggleTheme } = useTheme()
  const isServerUnavailable = useServerUnavailable()
  const previousPathname = useRef(location.pathname)

  useEffect(() => {
    if (previousPathname.current === location.pathname) return
    previousPathname.current = location.pathname

    const frame = requestAnimationFrame(() => {
      const mainContent = document.getElementById('main-content')
      mainContent?.focus({ preventScroll: true })
      mainContent?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })

    return () => cancelAnimationFrame(frame)
  }, [location.pathname])

  const handleSkipToContent = event => {
    event.preventDefault()
    document.getElementById('main-content')?.focus()
  }

  if (isServerUnavailable) return <ServerUnavailable />

  return (
    <div className="flex h-[100dvh] min-h-[100dvh] flex-col overflow-hidden bg-[var(--color-bg)]">
      <a
        href="#main-content"
        onClick={handleSkipToContent}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-[8px] focus:bg-[var(--color-surface)] focus:px-4 focus:py-3 focus:text-[13px] focus:font-semibold focus:text-[var(--color-text)] focus:shadow-[var(--shadow-menu)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
      >
        Skip to content
      </a>
      {/* Fixed-height navbar */}
      <Navbar />

      {/* Content area fills remaining height, both sidebar and main inside */}
      <div className="flex flex-1 overflow-hidden mt-14">

        {/* Sidebar — stays fixed height, doesn't scroll with page */}
        <Sidebar />

        {/* Main — scrolls independently */}
        <div id="main-content" tabIndex={-1} data-app-scroll="true" className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden focus:outline-none max-md:pb-[calc(72px_+_env(safe-area-inset-bottom))]">
          {BACK_ROUTES.some(path => matchPath({ path, end: true }, location.pathname)) && <div data-page-back="true" className="mx-auto w-full max-w-[1120px] px-4 pt-4 sm:px-5 md:px-8">
            <BackButton />
          </div>}
          <Outlet context={{ dark, toggleTheme }} />
        </div>
      </div>

      {/* Mobile bottom bar */}
      <BottomBar />
    </div>
  )
}
