/* Sidebar — full-height column with drag-to-resize and collapsible Explore */
import { useState, useRef, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HomeIcon, PenIcon, ChevronDown, ExploreArrow, CollectionIcon } from '@/components/icons'

const LINKS = [
  { to: '/',                 label: 'Home',        icon: <HomeIcon /> },
  { 
    to: '/explore/trending', label: 'Explore',     icon: <ExploreArrow />, 
    children: [
      { id: 'trending',     label: 'Trending',     path: '/explore/trending' },
      { id: 'questions',    label: 'Questions',    path: '/explore/questions' },
      { id: 'competitions', label: 'Competitions', path: '/explore/competitions' },
  ]},
  { to: '/write',            label: 'Write',       icon: <PenIcon /> },
  { to: '/collections',      label: 'Collections', icon: <CollectionIcon /> },
]

function NavLink({ to, label, icon, active, indent = false }) {
  return (
    <Link to={to}
      className={`flex items-center gap-2.5 py-2.5 text-[13px] transition-all duration-150 no-underline
        ${indent ? 'pl-13 pr-4' : 'px-5'}
        ${active
          ? 'font-semibold text-(--color-text) bg-(--color-bg-alt) border-l-2 border-(--color-accent)'
          : 'font-normal text-(--color-text-secondary) border-l-2 border-transparent hover:text-(--color-text) hover:bg-(--color-bg-alt)'
        }`}
    >
      {!indent && icon && <span className="flex items-center flex-shrink-0 w-4">{icon}</span>}
      <span className="flex-1 truncate">{label}</span>
    </Link>
  )
}

function ExploreSection({ item, pathname }) {
  const isActive = pathname.startsWith('/explore')
  const [open, setOpen] = useState(isActive)

  return (
    <div>
      <button onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-[13px] bg-transparent border-none cursor-pointer text-left transition-all duration-150
          ${isActive
            ? 'font-semibold text-(--color-text) bg-(--color-bg-alt) border-l-2 border-(--color-accent)'
            : 'font-normal text-(--color-text-secondary) border-l-2 border-transparent hover:text-(--color-text) hover:bg-(--color-bg-alt)'
          }`}
      >
        <span className="flex items-center shrink-0 w-4">{item.icon}</span>
        <span className="flex-1 truncate">{item.label}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}
          className="flex items-center">
          <ChevronDown />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} style={{ overflow: 'hidden' }}>
            {item.children.map(child => (
              <NavLink key={child.id} to={child.path} label={child.label}
                active={pathname.startsWith(child.path)} indent />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const MIN_W = 140, MAX_W = 300, DEF_W = 200

export default function Sidebar() {
  const { pathname } = useLocation()
  const [width, setWidth] = useState(DEF_W)
  const startX = useRef(0) 
  const startW = useRef(DEF_W)

  const onMouseDown = useCallback(e => {
    startX.current = e.clientX; startW.current = width
    document.body.style.userSelect = 'none'; document.body.style.cursor = 'col-resize'
    
    const onMove = e => setWidth(Math.min(MAX_W, Math.max(MIN_W, startW.current + e.clientX - startX.current)))
    const onUp   = () => { 
      document.body.style.userSelect = ''; 
      document.body.style.cursor = ''; 
      window.removeEventListener('mousemove', onMove); 
      window.removeEventListener('mouseup', onUp) 
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [width])

  return (
    <aside
      className="sidebar-desktop shrink-0 h-full overflow-y-auto bg-(--color-bg) border-r border-(--color-border) py-6 relative"
      style={{ width }}
    >
      <nav className="flex flex-col">
        {LINKS.map(item =>
          item.children ? (
            <ExploreSection key={item.to} item={item} pathname={pathname} />
          ) : (
            <NavLink key={item.to} to={item.to} label={item.label} icon={item.icon}active={pathname === item.to} />
          )
        )}
      </nav>

      {/* Drag handle */}
      <div onMouseDown={onMouseDown}
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-(--color-border) transition-colors" />
    </aside>
  )
}
