import { useState, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { colors, fontSizes, radius, transitions } from '@/styles/tokens'
import { LogoIcon, HomeIcon, PenIcon, SearchIcon, ChevronDown, ExploreArrow } from '@/components/icons'

const SIDEBAR_LINKS = [
  { to: '/', label: 'Home', icon: <HomeIcon /> },
  { 
    to: '/explore', 
    label: 'Explore', 
    icon: <ExploreArrow />,
    children: [
        { id: 'trending', label: 'Trending', path: '/explore/trending' },
        { id: 'questions', label: 'Questions', path: '/explore/questions' },
        { id: 'competitions', label: 'Competitions', path: '/explore/competitions' }
    ] 
  },
  { to: '/write', label: 'Write', icon: <PenIcon /> },
]

const isActivePath = (pathname, currentPath) => {
    return pathname === currentPath;
}

function SidebarLink({ to, label, icon, active, rightIcon, onClick }) {
  return (
    <Link
        to={to}
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            padding: '10px 24px',
            textDecoration: 'none',
            fontSize: fontSizes.base,
            transition: transitions.default,
            cursor: 'pointer',
            margin: '2px 0',
            fontWeight: active ? 600 : 400,
            color: active ? colors.textPrimary : colors.textSecondary,
            background: active ? colors.bgAlt : 'transparent',
            borderLeft: active ? `2px solid ${colors.accent}` : '2px solid transparent',
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {icon && icon}
            <span>{label}</span>
        </div>
        {rightIcon && (
            <div
                style={{
                    marginLeft: 'auto',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
>
                {rightIcon}
            </div>
        )}
    </Link>
)}

function CollapsibleSection({ item, pathname}) {
    const isActive = isActivePath(pathname, item.to)
    const [ open, setOpen ] = useState(isActive)

    // keep open in sync with route
    useMemo(() => {
        if (isActive) setOpen(true)
    }, [isActive])

    return (
        <div>
            <SidebarLink
                to={item.children ? item.children[0].path : item.to}
                label={item.label}
                icon={item.icon}
                active={isActive}
                onClick={(e) => {
                    if (item.children) {
                        e.preventDefault()
                        setOpen((prev) => !prev)
                    }
                }}
                rightIcon={
                    item.children ? (
                        <motion.div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transformOrigin: 'center',
                            }}
                            animate={{ rotate: open ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            >
                            <ChevronDown />
                        </motion.div>
                    ) : null
                }
            />
            <AnimatePresence initial={false}>
            {open && item.children && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            marginTop: 4,
                            gap: 2,
                        }}
                    >
                    {item.children.map((child) => {
                        const childActive = pathname === child.path
                        return (
                        <SidebarLink
                            key={child.id}
                            to={child.path}
                            label={child.label}
                            active={childActive}
                            icon={<div style={{ width: 12 }}></div>}
                        />
                        )
                    })}
                    </div>
                </motion.div>
            )}
      </AnimatePresence>
        </div>
    )
}

export default function Sidebar() {

  const location = useLocation();
  const pathname = location.pathname;

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 56,
        bottom: 0,
        width: 180,
        background: colors.bg,
        borderRight: `1px solid ${colors.border}`,
        zIndex: 90,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: '32px 0',
        boxShadow: '2px 0 8px rgba(0,0,0,0.03)'
      }}
    >

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {SIDEBAR_LINKS.map((item) => {
            if (item.children) {
                return (
                    <CollapsibleSection 
                        key={item.to} 
                        item={item} 
                        pathname={pathname} 
                    />
                )
            }
            else {
                return (
                    <SidebarLink
                        key={item.to}
                        to={item.to}
                        label={item.label}
                        icon={item.icon}
                        active ={isActivePath(pathname, item.to)}
                    />
                )
            }
        })}
      </nav>

    </aside>
  );
}