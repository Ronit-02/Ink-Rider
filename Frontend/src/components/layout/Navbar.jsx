/* Navbar — fixed top bar with search suggestions + theme toggle */
import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useEscapeKey } from '@/hooks/useEscapeKey'
import { LogoIcon, PenIcon, SearchIcon, ChevronDown } from '@/components/icons'
import Button from '@/components/ui/Button'
import { articles, authors } from '@/data'

// ─── Icon helpers ──────────────────────────────────────────────────────────────
const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
)
const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

// ─── Search Suggestions dropdown ───────────────────────────────────────────────
const SEARCH_FILTERS = ['All', 'Articles', 'Authors']

function SearchSuggestions({ query, filter, onSelect }) {
  const allItems = [
    ...articles.map(a => ({ type: 'article', label: a.title, sub: a.author.name, id: a.id, image: a.image, avatar: a.author.avatar })),
    ...authors.map(a  => ({ type: 'author',  label: a.name,  sub: 'Author',       id: a.id, image: a.avatar })),
  ]

  const results = query.length >= 1
    ? allItems
        .filter(i => {
          const matchesQuery = i.label.toLowerCase().includes(query.toLowerCase())
          if (filter === 'Articles') return matchesQuery && i.type === 'article'
          if (filter === 'Authors')  return matchesQuery && i.type === 'author'
          return matchesQuery
        })
        .slice(0, 6)
    : []

  if (!results.length) return null

  return (
    <div className="absolute top-full left-0 right-0 mt-[6px] bg-[var(--color-surface)] border border-[var(--color-border)]
      rounded-[14px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden z-[200]">
      {results.map((item, i) => (
        <button
          key={i}
          onClick={() => onSelect(item)}
          className="flex items-center gap-3 w-full px-[14px] py-[10px] border-none bg-transparent cursor-pointer text-left
            hover:bg-[var(--color-bg-alt)] transition-colors duration-100"
        >
          {/* Cover or avatar thumbnail */}
          <img
            src={item.type === 'article' ? item.image : item.image}
            alt=""
            className="w-8 h-8 rounded-md object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-[var(--color-text)] font-medium truncate">{item.label}</p>
            <p className="text-[11px] text-[var(--color-text-muted)]">{item.sub}</p>
          </div>
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-[0.05em] flex-shrink-0">{item.type}</span>
        </button>
      ))}
    </div>
  )
}

// ─── Navbar component ──────────────────────────────────────────────────────────
export default function Navbar() {
  const { signIn, signUp, signOut, signOutAllDevices, loggedIn } = useAuth()
  const { dark, toggle: toggleTheme }         = useTheme()
  const navigate   = useNavigate()
  const location   = useLocation()

  const [openMenu,        setOpenMenu]        = useState(false)
  const [searchValue,     setSearchValue]     = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchFilter,    setSearchFilter]    = useState('All')

  const menuRef   = useRef()
  const searchRef = useRef()

  useClickOutside(menuRef,   () => setOpenMenu(false))
  useClickOutside(searchRef, () => setShowSuggestions(false))
  useEscapeKey(() => { setOpenMenu(false); setShowSuggestions(false) })

  // Sync search box with URL
  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q') || ''
    setSearchValue(q)
  }, [location.pathname])

  const runSearch = () => {
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`)
      setShowSuggestions(false)
    }
  }

  const handleSuggestionSelect = item => {
    if (item.type === 'article') navigate(`/post/${item.id}`)
    else navigate('/author')
    setShowSuggestions(false)
    setSearchValue('')
  }

  return (
    <nav className="fixed top-0 w-full z-[100] h-14 flex items-center gap-4 px-8
      border-b border-[var(--color-border)] bg-[var(--color-bg)]"
      style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
    >
      {/* ── Logo ── */}
      <Link to="/" className="flex items-center gap-2 flex-shrink-0">
        <h1 className="text-[18px] font-bold text-[var(--color-text)] m-0">Ink Rider</h1>
        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-[var(--color-accent)]">
          <LogoIcon />
        </div>
      </Link>

      {/* ── Search bar — hidden on mobile ── */}
      <div ref={searchRef} className="flex-1 max-w-[560px] relative hidden md:block">
        <div className="flex items-center gap-[10px] bg-[var(--color-surface)] border border-[var(--color-border)]
          rounded-full px-[14px] h-[38px]">
          <SearchIcon />
          <input
            value={searchValue}
            onChange={e => { setSearchValue(e.target.value); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={e => e.key === 'Enter' && runSearch()}
            placeholder="Search for posts, authors…"
            className="flex-1 border-none bg-transparent text-[13px] text-[var(--color-text)] outline-none"
          />
          {/* Filter chips */}
          <div className="flex gap-1">
            {SEARCH_FILTERS.map(f => (
              <button key={f} onClick={() => setSearchFilter(f)}
                className={`px-2 py-[3px] rounded-full text-[10px] font-medium border transition-all duration-150
                  ${searchFilter === f
                    ? 'bg-[var(--color-accent)] text-[var(--color-text-inverted)] border-[var(--color-accent)]'
                    : 'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)]'
                  }`}
              >{f}</button>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        {showSuggestions && (
          <SearchSuggestions query={searchValue} filter={searchFilter} onSelect={handleSuggestionSelect} />
        )}
      </div>

      <div className="flex-1" />

      {/* ── Right actions ── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Mobile search icon */}
        <button
          onClick={() => navigate('/search')}
          className="md:hidden w-8 h-8 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-alt)]
            text-[var(--color-text-secondary)] flex items-center justify-center cursor-pointer transition-all duration-150"
        >
          <SearchIcon />
        </button>

        {/* Theme toggle */}
        <button onClick={toggleTheme}
          className="w-8 h-8 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-alt)]
            text-[var(--color-text-secondary)] flex items-center justify-center cursor-pointer transition-all duration-150"
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>

        {loggedIn ? (
          <div ref={menuRef} className="relative">
            <button onClick={() => setOpenMenu(v => !v)}
              className="w-8 h-8 rounded-full overflow-hidden border-2 border-[var(--color-border)] cursor-pointer bg-none p-0">
              <img src="https://i.pravatar.cc/32?img=47" alt="me" className="w-full h-full object-cover" />
            </button>

            {/* ── Profile dropdown — keep simple: profile, settings, sign out ── */}
            {openMenu && (
              <div className="absolute top-[calc(100%+6px)] right-0 bg-[var(--color-surface)] border border-[var(--color-border)]
                rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-1 flex flex-col gap-0.5 min-w-[160px] z-[200]">
                {[
                  { label: 'View Profile', path: '/profile' },
                  { label: 'Settings',     path: '/settings' },
                ].map(item => (
                  <button key={item.label}
                    onClick={() => { navigate(item.path); setOpenMenu(false) }}
                    className="px-3 py-2 text-[13px] text-[var(--color-text-secondary)] bg-transparent border-none
                      cursor-pointer text-left rounded-[6px] transition-colors hover:bg-[var(--color-bg-alt)]"
                  >{item.label}</button>
                ))}
                <div className="h-px bg-[var(--color-border)] my-1" />
                <button onClick={signOut}
                  className="px-3 py-2 text-[13px] text-[var(--color-text-secondary)] bg-transparent border-none
                    cursor-pointer text-left rounded-[6px] transition-colors hover:bg-[var(--color-bg-alt)]">
                  Sign Out
                </button>
                <button onClick={signOutAllDevices}
                  className="px-3 py-2 text-[13px] text-[var(--color-text-secondary)] bg-transparent border-none
                    cursor-pointer text-left rounded-[6px] transition-colors hover:bg-[var(--color-bg-alt)]">
                  Sign Out all Devices
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Button variant="secondary" onClick={signIn}>Sign In</Button>
            <Button variant="primary"   onClick={signUp}>Sign Up</Button>
          </>
        )}
      </div>
    </nav>
  )
}
