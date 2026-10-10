import ViewportPopover from '@/shared/components/ui/ViewportPopover'
/* eslint-disable react-hooks/set-state-in-effect -- URL navigation and changing suggestions intentionally synchronize transient search state. */
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '@/features/auth/hooks/useAuth'
import Button from '@/shared/components/ui/Button'
import Avatar from '@/shared/components/ui/Avatar'
import { LogoIcon, SearchIcon } from '@/shared/icons'
import { useEscapeKey } from '../../hooks/useEscapeKey'
import { useClickOutside } from '../../hooks/useClickOutside'
import { useQuery } from '@tanstack/react-query'
import { fetchNotifications } from '@/features/notification/api/notifications'
import { searchDiscovery } from '@/features/discovery/api/search'
import MobileSearchDialog from '@/features/discovery/components/MobileSearchDialog'


export default function Navbar() {
  const { user, avatarUrl, signOut, signOutAllDevices, isSigningOut, loggedIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [openMenu, setOpenMenu] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileSearchOrigin, setMobileSearchOrigin] = useState(null)
  const [suggestionQuery, setSuggestionQuery] = useState('')
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)
  const notifications = useQuery({ queryKey: ['notifications'], queryFn: () => fetchNotifications(), enabled: loggedIn, staleTime: 30000, refetchInterval: 60000, retry: false })
  const menuRef = useRef()
  const accountButtonRef = useRef()
  const accountMenuRef = useRef()
  const suggestionsRef = useRef()
  const searchRef = useRef()
  const searchInputRef = useRef()
  const closingMobileSearchRef = useRef(false)
  const closeMobileSearch = useCallback(() => {
    closingMobileSearchRef.current = true
    setMobileSearchOrigin(null)
    setSearchOpen(false)
    requestAnimationFrame(() => searchInputRef.current?.focus({ preventScroll: true }))
  }, [])
  const searchSuggestions = useQuery({
    queryKey: ['search-suggestions', 'content-v1', suggestionQuery],
    queryFn: () => searchDiscovery({ query: suggestionQuery, type: 'all', suggestions: true, limit: 5 }),
    enabled: searchOpen && suggestionQuery.length >= 1 && suggestionQuery === searchValue.trim(),
    staleTime: 30_000,
    retry: false,
  })
  useEffect(() => {
    const timer = window.setTimeout(() => setSuggestionQuery(searchValue.trim()), 250)
    return () => window.clearTimeout(timer)
  }, [searchValue])

  useClickOutside(menuRef, () => setOpenMenu(false), accountMenuRef)
  useClickOutside(searchRef, () => { setSearchOpen(false); setActiveSuggestionIndex(-1) }, suggestionsRef)
  useEscapeKey(() => {
    if (openMenu) accountButtonRef.current?.focus()
    setOpenMenu(false)
    setSearchOpen(false)
    setActiveSuggestionIndex(-1)
  })
  useEffect(() => {
    setSearchValue(new URLSearchParams(location.search).get('q') || '')
  }, [location.pathname, location.search])
  useEffect(() => {
    if (!openMenu) return undefined
    const frame = requestAnimationFrame(() => accountMenuRef.current?.querySelector('[role="menuitem"]')?.focus())
    return () => cancelAnimationFrame(frame)
  }, [openMenu])

  const runSearch = event => {
    event?.preventDefault()
    const activeSuggestion = suggestionItems[activeSuggestionIndex]
    if (activeSuggestion) {
      openSuggestion(activeSuggestion.kind, activeSuggestion.item)
      return
    }
    const query = searchValue.trim()
    if (query.length >= 1) {
      setSearchOpen(false)
      setActiveSuggestionIndex(-1)
      navigate(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  const waiting = suggestionQuery !== searchValue.trim()
  const searchItems = waiting || searchSuggestions.isError ? [] : (searchSuggestions.data?.data?.suggestions || []).slice(0, 5).map(item => ({ kind: 'search', item }))
  const writerItems = waiting || searchSuggestions.isError ? [] : (searchSuggestions.data?.data?.writers || []).slice(0, 5).map(item => ({ kind: 'writer', item }))
  const suggestionItems = [...searchItems, ...writerItems]

  const suggestionsVisible = searchOpen && searchValue.trim().length >= 1

  useEffect(() => {
    setActiveSuggestionIndex(current => current < suggestionItems.length ? current : -1)
  }, [suggestionItems.length])

  useEffect(() => {
    const panel = suggestionsRef.current
    const option = panel?.querySelector('[role="option"][aria-selected="true"]')
    if (!option) return
    const bounds = panel.getBoundingClientRect()
    const row = option.getBoundingClientRect()
    if (row.top < bounds.top) panel.scrollTop += row.top - bounds.top
    else if (row.bottom > bounds.bottom) panel.scrollTop += row.bottom - bounds.bottom
  }, [activeSuggestionIndex])

  const openSuggestion = (kind, item) => {
    setSearchOpen(false)
    setActiveSuggestionIndex(-1)
    navigate(kind === 'search' ? `/search?q=${encodeURIComponent(item.text)}` : `/author/${item.handle}`)
  }

  const handleSearchKeyDown = event => {
    if (event.key === 'Escape') {
      setSearchOpen(false)
      setActiveSuggestionIndex(-1)
      return
    }
    if (event.key === 'Tab') {
      setSearchOpen(false)
      setActiveSuggestionIndex(-1)
      return
    }
    if (!suggestionsVisible || !suggestionItems.length || !['ArrowDown', 'ArrowUp'].includes(event.key)) return

    event.preventDefault()
    setActiveSuggestionIndex(current => {
      if (current < 0) return event.key === 'ArrowDown' ? 0 : suggestionItems.length - 1
      return (current + (event.key === 'ArrowDown' ? 1 : -1) + suggestionItems.length) % suggestionItems.length
    })
  }

  const handleAccountMenuKeyDown = event => {
    const items = [...(accountMenuRef.current?.querySelectorAll('[role="menuitem"]') || [])]
    if (!items.length) return

    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      setOpenMenu(false)
      accountButtonRef.current?.focus()
      return
    }
    if (event.key === 'Tab') {
      setOpenMenu(false)
      return
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return

    event.preventDefault()
    const currentIndex = items.indexOf(document.activeElement)
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? items.length - 1
        : (Math.max(currentIndex, 0) + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
    items[nextIndex].focus()
  }

  return (
    <nav aria-label="Global navigation" className="navbar-shell fixed top-0 w-full z-[100] h-14 flex items-center gap-4 px-4 md:px-8 border-b border-[var(--color-border)] bg-[var(--color-bg)]"
      style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
      <Link to="/" aria-label="Ink Rider home" className="flex items-center gap-2 shrink-0">
        <span className="hidden md:inline text-[18px] font-bold text-[var(--color-text)]">Ink Rider</span>
        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center border border-[var(--color-border)] bg-[var(--color-bg-alt)] text-[var(--color-accent)]"><LogoIcon /></div>
      </Link>

      <form ref={searchRef} role="search" onSubmit={runSearch} className="min-w-0 flex-1 md:max-w-[660px] relative">
        <div className={`flex flex-wrap md:flex-nowrap items-center gap-[10px] bg-[var(--color-surface)] border rounded-full px-[14px] min-h-[38px] focus-within:border-[var(--color-accent)] ${searchOpen ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)]'}`}>
          <SearchIcon />
          <input ref={searchInputRef} value={searchValue} onFocus={() => {
            if (closingMobileSearchRef.current) return
            if (window.matchMedia('(max-width: 767px)').matches) {
              const bounds = searchRef.current.getBoundingClientRect()
              setMobileSearchOrigin({ left: bounds.left, width: bounds.width })
            } else setSearchOpen(true)
          }} onClick={() => {
            if (window.matchMedia('(max-width: 767px)').matches && !mobileSearchOrigin) {
              closingMobileSearchRef.current = false
              const bounds = searchRef.current.getBoundingClientRect()
              setMobileSearchOrigin({ left: bounds.left, width: bounds.width })
            }
          }} onBlur={() => { closingMobileSearchRef.current = false }} onChange={event => { setSearchValue(event.target.value); setSearchOpen(true); setActiveSuggestionIndex(-1) }} onKeyDown={handleSearchKeyDown} placeholder="Search posts and writers…"
            maxLength={100} autoComplete="off" role="combobox" aria-label="Search posts and writers" aria-autocomplete="list" aria-expanded={suggestionsVisible} aria-controls="search-suggestions" aria-activedescendant={activeSuggestionIndex >= 0 && suggestionItems[activeSuggestionIndex] ? `search-suggestion-${activeSuggestionIndex}` : undefined} className="search-input min-w-0 flex-1 border-none bg-transparent py-[9px] text-[13px] text-[var(--color-text)] outline-none" />
        </div>
        {suggestionsVisible && <ViewportPopover ref={suggestionsRef} anchorRef={searchRef} matchAnchorWidth id="search-suggestions" role="listbox" aria-label="Search suggestions" className="absolute left-0 right-0 top-[calc(100%+8px)] z-[200] overflow-hidden rounded-[14px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
          <div role="status" aria-live="polite">
            {waiting || searchSuggestions.isPending ? <p className="px-4 py-5 text-[12px] text-[var(--color-text-muted)]">Searching…</p>
              : searchSuggestions.isError ? <p className="px-4 py-5 text-[12px] text-[var(--color-danger)]">Suggestions are unavailable. Press Enter to search.</p>
                : suggestionItems.length === 0 ? <p className="px-4 py-5 text-[12px] text-[var(--color-text-muted)]">No matching searches or authors yet.</p>
                  : <span className="sr-only">{suggestionItems.length} suggestions available</span>}
          </div>
          {[{ label: 'Search suggestions', items: searchItems, offset: 0 }, { label: 'Authors', items: writerItems, offset: searchItems.length }].filter(group => group.items.length).map(group => <div key={group.label} role="group" aria-label={group.label}>
            <h2 className="px-4 py-3 text-[12px] font-semibold text-[var(--color-text-secondary)]">{group.label}</h2>
            {group.items.map(({ kind, item }, itemIndex) => { const index = group.offset + itemIndex; return <button id={`search-suggestion-${index}`} key={kind === 'search' ? item.text : item.id} type="button" role="option" tabIndex={-1} aria-selected={activeSuggestionIndex === index} onMouseDown={event => event.preventDefault()} onMouseEnter={() => setActiveSuggestionIndex(index)} onClick={() => openSuggestion(kind, item)} className={`flex min-h-11 w-full items-center gap-3 border-b border-[var(--color-border-light)] px-4 py-3 text-left last:border-b-0 hover:bg-[var(--color-surface-hover)] ${activeSuggestionIndex === index ? 'bg-[var(--color-surface-hover)]' : ''}`}>
            {kind === 'search' ? <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[var(--color-bg-alt)]"><SearchIcon /></span> : <Avatar src={item.avatarUrl} name={item.displayName} size={40} />}
            <span className="min-w-0 flex-1">
              <span className="block break-words text-[13px] font-semibold text-[var(--color-text)]">{kind === 'search' ? item.text : item.displayName}</span>
              {kind === 'writer' && <span className="mt-0.5 block break-words text-[11px] text-[var(--color-text-muted)]">@{item.handle}</span>}
            </span>
          </button> })}</div>)}
        </ViewportPopover>}
      </form>

      <div className="hidden md:flex items-center gap-2 shrink-0 ml-auto">
        <Link to="/membership" style={{ color: 'var(--color-text-inverted)' }} className="inline-flex min-h-9 items-center justify-center rounded-full bg-[var(--color-accent)] px-[18px] text-[13px] font-medium whitespace-nowrap">Join</Link>
        {loggedIn && <Link id="notification-trigger" to="/notifications" state={{ notificationBackground: location }} aria-haspopup="dialog" aria-label={`${notifications.data?.meta.unreadCount || 0} unread notifications`} className="relative w-10 h-10 md:w-8 md:h-8 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)] flex items-center justify-center"><span aria-hidden="true">♢</span>{notifications.data?.meta.unreadCount > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[var(--color-accent)] text-[9px] text-white flex items-center justify-center">{Math.min(99, notifications.data.meta.unreadCount)}</span>}</Link>}
        {loggedIn ? <div ref={menuRef} className="relative">
          <button type="button" ref={accountButtonRef} onClick={() => setOpenMenu(value => !value)} aria-label="Open account menu" aria-haspopup="menu" aria-expanded={openMenu} aria-controls="account-menu"
            className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-transparent p-0 text-[var(--color-text-inverted)] font-semibold text-[12px] uppercase [&>img]:border-0 md:h-8 md:w-8">
            <Avatar src={avatarUrl} name={user} size={28} />
          </button>
          {openMenu && <ViewportPopover ref={accountMenuRef} anchorRef={accountButtonRef} onAnchorHidden={() => setOpenMenu(false)} id="account-menu" role="menu" tabIndex={-1} aria-label="Account" onKeyDown={handleAccountMenuKeyDown} className="absolute top-[calc(100%+6px)] right-0 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-1 flex flex-col gap-0.5 min-w-[170px] z-[200]">
            {[{ label: 'View Profile', path: '/profile' }, { label: 'Saved', path: '/saved' }].map(item =>
              <Link key={item.label} role="menuitem" to={item.path} onClick={() => setOpenMenu(false)} className="px-3 py-2 text-[13px] text-[var(--color-text-secondary)] text-left rounded-[6px] hover:bg-[var(--color-bg-alt)] focus:bg-[var(--color-bg-alt)] focus:outline-none">{item.label}</Link>)}
            <div className="h-px bg-[var(--color-border)] my-1" />
            <button type="button" role="menuitem" disabled={isSigningOut} aria-busy={isSigningOut} onClick={signOut} className="px-3 py-2 text-[13px] text-[var(--color-text-secondary)] text-left rounded-[6px] hover:bg-[var(--color-bg-alt)] focus:bg-[var(--color-bg-alt)] focus:outline-none">Sign Out</button>
            <button type="button" role="menuitem" disabled={isSigningOut} aria-busy={isSigningOut} onClick={signOutAllDevices} className="px-3 py-2 text-[13px] text-[var(--color-text-secondary)] text-left rounded-[6px] hover:bg-[var(--color-bg-alt)] focus:bg-[var(--color-bg-alt)] focus:outline-none">Sign Out all Devices</button>
          </ViewportPopover>}
        </div> : <Button className="navbar-auth-action" variant="secondary" onClick={() => navigate('/login', { state: { returnTo: `${location.pathname}${location.search}${location.hash}` } })}>Sign In</Button>}
      </div>
      {mobileSearchOrigin && <MobileSearchDialog initialQuery={searchValue} origin={mobileSearchOrigin} onClose={closeMobileSearch} />}
    </nav>
  )
}
