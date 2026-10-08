import ReportForm from '@/shared/components/ui/ReportForm'
import ReportModal, { reportTitle } from '@/shared/components/ui/ReportModal'
import ShareMenu from '@/shared/components/ui/ShareMenu'
import ViewportPopover from '@/shared/components/ui/ViewportPopover'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AuthorMeta from '@/shared/components/ui/AuthorMeta'
import ImageBox from '@/shared/components/ui/ImageBox'
import Tag from '@/shared/components/ui/Tag'
import useAuth from '@/features/auth/hooks/useAuth'
import useBookmarkPost from '@/features/post/hooks/useBookmarkPost'
import useReportPost from '@/features/post/hooks/useReportPost'
import useToast from '@/shared/hooks/useToast'
import PostEngagementControls from './PostEngagementControls'
import BookmarkIcon from '@/shared/icons/BookmarkIcon'
import LinkIcon from '@/shared/icons/LinkIcon'

const TopicIcon = () => <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="12" rx="1.5" /><path d="M8 21h8M12 17v4" /></svg>
const InfoIcon = () => <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7v1" /></svg>
const HideIcon = () => <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M6 6l12 12" /></svg>
const FlagIcon = () => <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M5 21V3h14l-3 5 3 5H5" /></svg>

export default function DiscoveryPostCard({ post, onHide, onOpen, comfortable = false, variant = 'list' }) {
  const { loggedIn, signIn } = useAuth()
  const { notify } = useToast()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showWhy, setShowWhy] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const menuRef = useRef(null)
  const triggerRef = useRef(null)
  const actionMenuRef = useRef(null)
  const bookmarkMutation = useBookmarkPost(post.id)
  const reportMutation = useReportPost(post.id)
  const reportSubject = variant === 'short' || post.format === 'short' ? 'short' : 'post'
  const menuId = `story-menu-${post.id}`
  const authorHandle = post.author?.handle || post.author?.username?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  const closeMenu = ({ restoreFocus = false } = {}) => {
    setMenuOpen(false)
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus())
  }

  useEffect(() => {
    if (!menuOpen) return undefined
    actionMenuRef.current?.querySelector('[role="menuitem"]')?.focus()
    const closeMenu = event => {
      if (!menuRef.current?.contains(event.target) && !actionMenuRef.current?.contains(event.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', closeMenu)
    return () => document.removeEventListener('mousedown', closeMenu)
  }, [menuOpen])

  const handleMenuKeyDown = event => {
    if (event.key === 'Escape') {
      event.preventDefault()
      closeMenu({ restoreFocus: true })
      return
    }
    if (!event.target.closest('[role="menuitem"]')) return
    const items = [...actionMenuRef.current?.querySelectorAll('[role="menuitem"]') || []]
    const index = items.indexOf(document.activeElement)
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const offset = event.key === 'ArrowDown' ? 1 : -1
      items[(index + offset + items.length) % items.length]?.focus()
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      items[event.key === 'Home' ? 0 : items.length - 1]?.focus()
    }
  }

  const handleOpen = event => {
    if (!onOpen) return
    event.preventDefault()
    onOpen(post)
  }

  const requireAuth = action => {
    if (!loggedIn) return signIn()
    action()
  }

  const handleNotInterested = () => {
    if (onHide) onHide(post)
    else setIsHidden(true)
    setMenuOpen(false)
    notify('Story hidden from this list.', { tone: 'info' })
  }

  if (isHidden) return null

  return (
    <article
      className={`group relative border-b border-[var(--color-border)] ${variant === 'grid' ? 'flex flex-col overflow-visible rounded-[16px] border bg-[var(--color-surface)]' : variant === 'short' ? 'flex self-start flex-col rounded-[16px] border p-5' : comfortable ? 'max-md:flex max-md:flex-col py-10 first:pt-10' : 'max-md:flex max-md:flex-col py-6 first:pt-0'}
        ${post.image && variant !== 'short' && variant !== 'grid' ? 'md:grid md:grid-cols-[minmax(0,1fr)_240px] md:gap-8' : ''}`}
    >
      <div className={`min-w-0 flex flex-col ${variant === 'grid' ? 'order-last p-4' : variant === 'short' ? '' : 'max-md:contents'}`}>
        <div className={`${variant === 'list' ? 'max-md:order-[-2]' : ''} flex items-start justify-between gap-4 [&>div:first-child]:relative [&>div:first-child]:z-10 [&>div:first-child]:gap-2 [&>div:first-child]:max-md:flex-col [&>div:first-child]:max-md:items-start [&>div:first-child>span]:max-md:hidden [&>div:first-child>div]:flex-wrap [&>div:first-child>a]:after:absolute [&>div:first-child>a]:after:inset-0 [&>div:first-child>a]:after:content-[''] [&>div:first-child>a]:min-w-0 [&>div:first-child>a]:max-w-full [&>div:first-child>a>span]:min-w-0 [&>div:first-child>a>span]:break-words`}>
          {variant === 'grid' ? <p className="relative z-10 min-w-0 truncate text-[11px] text-[var(--color-text-muted)]">{authorHandle ? <Link to={`/author/${encodeURIComponent(authorHandle)}`} aria-label={`View ${post.author.username}'s profile`} className="text-inherit rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">{post.readTime || 'Article'} · {post.author.username}</Link> : <>{post.readTime || 'Article'} · {post.author?.username || 'Ink Rider writer'}</>}</p> : <AuthorMeta author={post.author} readTime={post.readTime} date={post.createdAt} size="sm" stacked />}
          <div ref={menuRef} className={`${variant === 'grid' ? 'absolute right-3 top-3 z-20' : 'relative z-20 shrink-0'}`}>
            <button
              ref={triggerRef}
              type="button"
              aria-label={`More options for ${post.title}`}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls={menuOpen ? menuId : undefined}
              onClick={event => { event.stopPropagation(); setMenuOpen(value => !value) }}
              className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"
            >
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></svg>
            </button>
            {menuOpen && <ViewportPopover ref={actionMenuRef} anchorRef={triggerRef} onAnchorHidden={() => closeMenu()} id={menuId} role="menu" tabIndex={-1} aria-label={`Options for ${post.title}`} onKeyDown={handleMenuKeyDown} className="absolute right-0 top-10 z-[80] w-64 max-w-[calc(100vw-32px)] overflow-hidden rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-[var(--shadow-menu)]">
              <button type="button" role="menuitem" disabled={bookmarkMutation.isPending} aria-busy={bookmarkMutation.isPending} onClick={event => { event.stopPropagation(); requireAuth(() => bookmarkMutation.mutate(!post.isBookmarked, { onSuccess: () => closeMenu({ restoreFocus: true }) })) }} className="min-h-10 sm:min-h-0 flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2 text-left text-[12px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"><span aria-hidden="true" className="shrink-0"><BookmarkIcon filled={post.isBookmarked} /></span>{post.isBookmarked ? 'Remove from saved' : 'Save story'}</button>
              <button type="button" role="menuitem" onClick={event => { event.stopPropagation(); closeMenu(); setShareOpen(true) }} className="min-h-10 sm:min-h-0 flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2 text-left text-[12px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"><span aria-hidden="true" className="shrink-0"><LinkIcon /></span>Share link</button>
              <div className="my-1 h-px bg-[var(--color-border)]" />
              <button type="button" role="menuitem" aria-expanded={showWhy} onClick={event => { event.stopPropagation(); setShowWhy(value => !value) }} className="min-h-10 sm:min-h-0 flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-left text-[12px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"><span className="flex items-center gap-2.5"><InfoIcon />Why you’re seeing this</span><span aria-hidden="true">{showWhy ? '−' : '+'}</span></button>
              {showWhy && <p className="px-3 pb-2 text-[11px] leading-5 text-[var(--color-text-muted)]">{post.recommendationReason || 'This story is part of the current discovery feed.'}</p>}
              <button type="button" role="menuitem" onClick={event => { event.stopPropagation(); handleNotInterested() }} className="min-h-10 sm:min-h-0 flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2 text-left text-[12px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"><HideIcon />Not interested</button>
              <button type="button" role="menuitem" aria-haspopup="dialog" onClick={event => { event.stopPropagation(); requireAuth(() => { reportMutation.reset(); closeMenu(); setReportOpen(true) }) }} className="min-h-10 sm:min-h-0 flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2 text-left text-[12px] text-[var(--color-danger)] hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"><FlagIcon />{reportTitle(reportSubject)}</button>

            </ViewportPopover>}
          </div>
        </div>
        <h2 className={`${variant === 'grid' ? 'mt-3 line-clamp-3 text-[16px] leading-[1.3]' : variant === 'short' ? 'mt-5 break-words text-[24px] leading-[1.08]' : 'max-md:order-[-2] mt-5 text-[20px] leading-[1.12]'} break-words font-bold tracking-[-0.045em] text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors`}
          style={{ fontFamily: 'var(--font-display)' }}>
          <Link to={`/post/${post.id}`} onClick={handleOpen} className="rounded-[4px] after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2">{post.title}</Link>
        </h2>
        {post.excerpt && <p className={`${variant === 'short' ? 'mt-3 text-[13px] leading-[1.6]' : `${variant === 'list' ? 'max-md:order-[-2]' : ''} mt-3 text-[13px] leading-[1.65]`} break-words line-clamp-3 text-[var(--color-text-secondary)]`}>{post.excerpt}</p>}
        <div className={`${variant === 'short' ? 'mt-5 border-t border-[var(--color-border)] pt-5' : variant === 'list' ? 'mt-auto pt-3 md:pt-5 max-md:grid max-md:grid-cols-[minmax(0,1fr)_auto] max-md:items-start max-md:gap-x-3' : 'mt-auto pt-5'} flex flex-wrap items-center gap-x-2 gap-y-2`}>
          {variant !== 'grid' && <div className={`${variant === 'list' ? 'max-md:py-[7px]' : ''} flex min-w-0 flex-wrap gap-2 [&>a]:relative [&>a]:z-10 [&>a]:max-w-full [&>a]:whitespace-normal [&>a]:break-words [&>span]:max-w-full [&>span]:break-words`}>
            {variant === 'short' ? (post.tags?.[0] ? <Link to={`/search?q=${encodeURIComponent(post.tags[0])}&type=shorts`} className="flex min-w-0 items-center gap-2 rounded-[14px] bg-[var(--color-accent)]/10 px-3 py-2 text-[12px] font-semibold text-[var(--color-accent)]"><TopicIcon />{post.tags[0]}</Link> : <span className="flex min-w-0 items-center gap-2 rounded-[14px] bg-[var(--color-accent)]/10 px-3 py-2 text-[12px] font-semibold text-[var(--color-accent)]"><TopicIcon />Short read</span>) : post.tags?.slice(0, 3).map(tag => <Tag key={tag} label={tag} clickable />)}
          </div>}
          <PostEngagementControls post={post} divider={variant === 'short'} />
        </div>
      </div>
      {reportOpen && <ReportModal title={reportTitle(reportSubject)} onClose={() => setReportOpen(false)} returnFocusRef={triggerRef}>
        <ReportForm subject={reportSubject} mutation={reportMutation} onClose={() => setReportOpen(false)} />
      </ReportModal>}
      {shareOpen && <ShareMenu anchorRef={triggerRef} id={`story-share-${post.id}`} label="Share article" contentName="Story" url={`${window.location.origin}/post/${post.id}`} onClose={({ restoreFocus = false } = {}) => { setShareOpen(false); if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus()) }} />}
      {post.image && <Link to={`/post/${post.id}`} onClick={handleOpen} aria-label={`Read ${post.title}`} className={`relative z-10 ${variant === 'grid' ? 'order-first overflow-hidden rounded-t-[16px]' : variant === 'short' ? 'order-first mb-4' : 'max-md:order-[-1] mt-4 md:mt-0 md:order-last md:self-center'}`}><ImageBox src={post.image} alt="" height={variant === 'grid' ? 150 : variant === 'short' ? 150 : 140} radius={variant === 'grid' ? '0' : '6px'} /></Link>}
    </article>
  )
}
