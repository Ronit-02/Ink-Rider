import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import BottomBar from './BottomBar'

export default function AppLayout() {
  const location = useLocation()
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
        <div id="main-content" tabIndex={-1} data-app-scroll="true" className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden focus:outline-none max-md:pb-[72px]">
          <Outlet />
        </div>
      </div>

      {/* Mobile bottom bar */}
      <BottomBar />
    </div>
  )
}
