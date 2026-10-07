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
  const { user, avatarUrl, signIn, signUp, signOut, signOutAllDevices, loggedIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [openMenu, setOpenMenu] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileSearchOrigin, setMobileSearchOrigin] = useState(null)
  const [searchType, setSearchType] = useState('all')
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)
  const notifications = useQuery({ queryKey: ['notifications'], queryFn: fetchNotifications, enabled: loggedIn, staleTime: 30000, refetchInterval: 60000, retry: false })
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
    queryKey: ['search-suggestions', searchValue.trim(), searchType],
    queryFn: () => searchDiscovery({ query: searchValue.trim(), type: searchType, suggestions: true, limit: 6 }),
    enabled: searchOpen && searchValue.trim().length >= 1,
    staleTime: 30_000,
  })

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

  const suggestionItems = searchType === 'writers'
    ? (searchSuggestions.data?.data?.writers || []).map(writer => ({ kind: 'writer', item: writer }))
    : searchType === 'posts'
      ? (searchSuggestions.data?.data?.posts || []).map(post => ({ kind: 'post', item: post }))
      : [
          ...(searchSuggestions.data?.data?.posts || []).map(post => ({ kind: 'post', item: post })),
          ...(searchSuggestions.data?.data?.writers || []).map(writer => ({ kind: 'writer', item: writer })),
        ].slice(0, 6)

  const suggestionsVisible = searchOpen && searchValue.trim().length >= 1

  useEffect(() => {
    setActiveSuggestionIndex(current => current < suggestionItems.length ? current : -1)
  }, [suggestionItems.length])

  const openSuggestion = (kind, item) => {
    setSearchOpen(false)
    setActiveSuggestionIndex(-1)
    navigate(kind === 'post' ? `/post/${item.id}` : `/author/${item.handle}`)
  }

  const handleSearchKeyDown = event => {
    if (event.key === 'Escape') {
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

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'posts', label: 'Articles' },
    { id: 'writers', label: 'Authors' },
  ]

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
            role="combobox" aria-label="Search posts and writers" aria-autocomplete="list" aria-expanded={suggestionsVisible} aria-controls="search-suggestions" aria-activedescendant={activeSuggestionIndex >= 0 ? `search-suggestion-${activeSuggestionIndex}` : undefined} className="search-input min-w-0 flex-1 border-none bg-transparent py-[9px] text-[13px] text-[var(--color-text)] outline-none" />
          {searchOpen && <div role="group" className="hidden md:flex shrink-0 items-center gap-1" aria-label="Search result type">
            {filters.map(filter => <button key={filter.id} type="button" onMouseDown={event => event.preventDefault()} onClick={() => { setSearchType(filter.id); setActiveSuggestionIndex(-1) }} aria-pressed={searchType === filter.id}
              className={`rounded-full border px-2 py-1 text-[10px] transition-colors ${searchType === filter.id ? 'border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-text-inverted)]' : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-secondary)]'}`}>{filter.label}</button>)}
          </div>}
        </div>
        {suggestionsVisible && <ViewportPopover ref={suggestionsRef} anchorRef={searchRef} matchAnchorWidth id="search-suggestions" role="listbox" aria-label="Search suggestions" className="absolute left-0 right-0 top-[calc(100%+8px)] z-[200] overflow-hidden rounded-[14px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
          {searchSuggestions.isPending && <p className="px-4 py-5 text-[12px] text-[var(--color-text-muted)]">Searching…</p>}
          {searchSuggestions.isError && <p className="px-4 py-5 text-[12px] text-[var(--color-danger)]">Suggestions are unavailable. Press Enter to search.</p>}
          {!searchSuggestions.isPending && !searchSuggestions.isError && suggestionItems.length === 0 && <p className="px-4 py-5 text-[12px] text-[var(--color-text-muted)]">No matching articles or authors yet.</p>}
          {!searchSuggestions.isPending && !searchSuggestions.isError && suggestionItems.map(({ kind, item }, index) => <button id={`search-suggestion-${index}`} key={`${kind}-${item.id}`} type="button" role="option" tabIndex={-1} aria-selected={activeSuggestionIndex === index} onMouseDown={event => event.preventDefault()} onMouseEnter={() => setActiveSuggestionIndex(index)} onClick={() => openSuggestion(kind, item)} className={`flex w-full items-center gap-3 border-b border-[var(--color-border-light)] px-4 py-3 text-left last:border-b-0 hover:bg-[var(--color-surface-hover)] ${activeSuggestionIndex === index ? 'bg-[var(--color-surface-hover)]' : ''}`}>
            {kind === 'post'
              ? item.image
                ? <img src={item.image} alt="" className="h-10 w-10 shrink-0 rounded-[8px] object-cover bg-[var(--color-bg-alt)]" />
                : <div aria-hidden="true" className="h-10 w-10 shrink-0 rounded-[8px] bg-[var(--color-bg-alt)]" />
              : <Avatar src={item.avatarUrl} name={item.displayName} size={40} />}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-[var(--color-text)]">{kind === 'post' ? item.title : item.displayName}</span>
              <span className="mt-0.5 block truncate text-[11px] text-[var(--color-text-muted)]">{kind === 'post' ? item.author?.username : `@${item.handle}`}</span>
            </span>
            <span className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{kind === 'post' ? 'Article' : 'Author'}</span>
          </button>)}
        </ViewportPopover>}
      </form>

      <div className="hidden md:flex items-center gap-2 shrink-0 ml-auto">
        <Link to="/membership" style={{ color: 'var(--color-text-inverted)' }} className="inline-flex min-h-9 items-center justify-center rounded-full bg-[var(--color-accent)] px-[18px] text-[13px] font-medium whitespace-nowrap">Join</Link>
        {loggedIn && <Link to="/notifications" aria-label={`${notifications.data?.meta.unreadCount || 0} unread notifications`} className="relative w-10 h-10 md:w-8 md:h-8 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)] flex items-center justify-center"><span aria-hidden="true">♢</span>{notifications.data?.meta.unreadCount > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[var(--color-accent)] text-[9px] text-white flex items-center justify-center">{Math.min(99, notifications.data.meta.unreadCount)}</span>}</Link>}
        {loggedIn ? <div ref={menuRef} className="relative">
          <button type="button" ref={accountButtonRef} onClick={() => setOpenMenu(value => !value)} aria-label="Open account menu" aria-haspopup="menu" aria-expanded={openMenu} aria-controls="account-menu"
            className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-transparent p-0 text-[var(--color-text-inverted)] font-semibold text-[12px] uppercase [&>img]:border-0 md:h-8 md:w-8">
            <Avatar src={avatarUrl} name={user} size={28} />
          </button>
          {openMenu && <ViewportPopover ref={accountMenuRef} anchorRef={accountButtonRef} onAnchorHidden={() => setOpenMenu(false)} id="account-menu" role="menu" tabIndex={-1} aria-label="Account" onKeyDown={handleAccountMenuKeyDown} className="absolute top-[calc(100%+6px)] right-0 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-1 flex flex-col gap-0.5 min-w-[170px] z-[200]">
            {[{ label: 'View Profile', path: '/profile' }, { label: 'Saved', path: '/saved' }].map(item =>
              <Link key={item.label} role="menuitem" to={item.path} onClick={() => setOpenMenu(false)} className="px-3 py-2 text-[13px] text-[var(--color-text-secondary)] text-left rounded-[6px] hover:bg-[var(--color-bg-alt)] focus:bg-[var(--color-bg-alt)] focus:outline-none">{item.label}</Link>)}
            <div className="h-px bg-[var(--color-border)] my-1" />
            <button type="button" role="menuitem" onClick={() => { setOpenMenu(false); signOut() }} className="px-3 py-2 text-[13px] text-[var(--color-text-secondary)] text-left rounded-[6px] hover:bg-[var(--color-bg-alt)] focus:bg-[var(--color-bg-alt)] focus:outline-none">Sign Out</button>
            <button type="button" role="menuitem" onClick={() => { setOpenMenu(false); signOutAllDevices() }} className="px-3 py-2 text-[13px] text-[var(--color-text-secondary)] text-left rounded-[6px] hover:bg-[var(--color-bg-alt)] focus:bg-[var(--color-bg-alt)] focus:outline-none">Sign Out all Devices</button>
          </ViewportPopover>}
        </div> : <><Button className="navbar-auth-action" variant="secondary" onClick={signIn}>Sign In</Button><Button className="navbar-auth-action" variant="primary" onClick={signUp}>Sign Up</Button></>}
      </div>
      {mobileSearchOrigin && <MobileSearchDialog initialQuery={searchValue} origin={mobileSearchOrigin} onClose={closeMobileSearch} />}
    </nav>
  )
}
