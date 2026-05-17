import { Link, useLocation } from 'react-router-dom'
import { HomeIcon, SearchIcon, PenIcon, ExploreArrow } from '@/shared/icons'

const NAV = [
  { to: '/',                 label: 'Home',    icon: <HomeIcon /> },
  { to: '/search',           label: 'Search',  icon: <SearchIcon /> },
  { to: '/explore/trending', label: 'Explore', icon: <ExploreArrow /> },
  { to: '/write',            label: 'Write',   icon: <PenIcon /> },
]

export default function BottomBar() {
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[var(--color-bg)] border-t border-[var(--color-border)]
      flex items-center justify-around z-[100] md:hidden pb-[env(safe-area-inset-bottom)]">
      {NAV.map(item => {
        const active = pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to))
        return (
          <Link key={item.to} to={item.to}
            className={`flex flex-col items-center gap-1 px-3 py-[6px] no-underline transition-all duration-150
              text-[10px] font-medium
              ${active ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}
          >
            <span className="flex">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
