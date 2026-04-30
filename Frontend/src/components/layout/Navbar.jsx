import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { colors, fontSizes, radius, transitions } from '@/styles/tokens'
import useAuth from '@/hooks/useAuth'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useEscapeKey } from '@/hooks/useEscapeKey'
import { LogoIcon, PenIcon, SearchIcon, ChevronDown, ExploreArrow } from '@/components/icons'
import Button from '@/components/ui/Button'
import { useSelector } from 'react-redux'

export default function Navbar() {
  const { user, signIn, signUp, signOut, loggedIn } = useAuth()
  const navigate = useNavigate()
  const [openProfileMenu, setOpenProfileMenu] = useState(false)

  const profileMenuRef = useRef()

  // Close profile menu on outside click
  useClickOutside(profileMenuRef, () => setOpenProfileMenu(false))

  // Close profile menu on Escape key
  useEscapeKey(() => setOpenProfileMenu(false))

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 100,
        background: 'rgba(250,250,248,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${colors.border}`,
        padding: '0 32px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          border: 'none',
          background: 'transparent'
        }}>
        <h1
          style={{
            fontSize: fontSizes.xl,
            fontWeight: 'bold',
            color: colors.text,
            margin: 0,
          }}
        >
          Ink Rider
        </h1>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            background: colors.accent,
          }}>
            <LogoIcon />
        </div>
      </Link>

      {/* Search bar */}
      <div
        style={{
          flex: 1,
          maxWidth: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.full,
          padding: '0 14px',
          height: 38,
        }}
      >
        <SearchIcon />
        <input
          placeholder="Search for blogs, authors…"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              navigate('/search?q=' + encodeURIComponent(e.target.value))
            }
          }}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            fontSize: fontSizes.base,
            color: colors.text,
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 10px',
            borderRadius: radius.full,
            background: colors.bgAlt,
            border: `1px solid ${colors.border}`,
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: 500 }}>
            Blogs
          </span>
          <ChevronDown />
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

        {loggedIn ? (
          <div ref={profileMenuRef}>
            <button
              onClick={() => setOpenProfileMenu(!openProfileMenu)}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                overflow: 'hidden',
                border: `2px solid ${colors.border}`,
                cursor: 'pointer',
                background: 'none',
                padding: 0,
              }}
            >
              <img
                src="https://i.pravatar.cc/32?img=47"
                alt="profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </button>
            {openProfileMenu && (
            <div
              style={{
                position: 'absolute',
                top: 56 + 4,
                right: 32,
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: radius.md,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <Button variant="ghost" onClick={() => navigate('/artist')}>
                View Profile
              </Button>
              <Button variant="ghost" onClick={() => navigate('/settings')}>
                Settings
              </Button>
              <Button variant="ghost" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          )}
          </div>
        ) : (
          <>
            <Button variant="secondary" onClick={signIn}>
              Sign In
            </Button>
            <Button variant="primary" onClick={signUp}>
              Sign Up
            </Button>
          </>
        )}
      </div>
    </nav>
  )
}
