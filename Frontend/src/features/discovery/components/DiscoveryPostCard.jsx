import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AuthorMeta from '@/shared/components/ui/AuthorMeta'
import ImageBox from '@/shared/components/ui/ImageBox'
import Tag from '@/shared/components/ui/Tag'
import useAuth from '@/features/auth/hooks/useAuth'
import useBookmarkPost from '@/features/post/hooks/useBookmarkPost'
import usePostLike from '@/features/post/hooks/usePostLike'
import useReportPost from '@/features/post/hooks/useReportPost'
import useToast from '@/shared/hooks/useToast'

const HeartIcon = () => <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" /></svg>
const CommentIcon = () => <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 01-9 8.5 9.7 9.7 0 01-4-.8L3 21l1.3-4.1A8.3 8.3 0 013 11.5 8.5 8.5 0 0112 3a8.5 8.5 0 019 8.5z" /></svg>
const TopicIcon = () => <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="12" rx="1.5" /><path d="M8 21h8M12 17v4" /></svg>

export default function DiscoveryPostCard({ post, onHide, onOpen, comfortable = false, variant = 'list' }) {
  const { loggedIn, signIn } = useAuth()
  const { notify } = useToast()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showWhy, setShowWhy] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('other')
  const [shareStatus, setShareStatus] = useState('')
  const [isHidden, setIsHidden] = useState(false)
  const menuRef = useRef(null)
  const triggerRef = useRef(null)
  const actionMenuRef = useRef(null)
  const likeMutation = usePostLike(post.id)
  const bookmarkMutation = useBookmarkPost(post.id)
  const reportMutation = useReportPost(post.id)
  const menuId = `story-menu-${post.id}`
  const closeMenu = ({ restoreFocus = false } = {}) => {
    setMenuOpen(false)
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus())
  }

  useEffect(() => {
    if (!menuOpen) return undefined
    actionMenuRef.current?.querySelector('[role="menuitem"]')?.focus()
    const closeMenu = event => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false)
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

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)
      setShareStatus('Link copied')
      notify('Story link copied.')
      window.setTimeout(() => setShareStatus(''), 1800)
    } catch {
      setShareStatus('Copy unavailable')
      notify('The story link could not be copied.', { tone: 'error' })
    }
  }

  const handleReport = event => {
    event.stopPropagation()
    requireAuth(() => reportMutation.mutate({ reason: reportReason, details: '' }, {
      onSuccess: () => {
        setReportOpen(false)
        closeMenu({ restoreFocus: true })
      },
    }))
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
      className={`group relative border-b border-[var(--color-border)] ${variant === 'grid' ? 'flex flex-col overflow-visible rounded-[16px] border bg-[var(--color-surface)]' : variant === 'short' ? 'flex aspect-[3/4] min-h-[360px] flex-col rounded-[16px] border p-5' : comfortable ? 'py-10 first:pt-10' : 'py-6 first:pt-0'}
        ${post.image && variant !== 'short' && variant !== 'grid' ? 'md:grid md:grid-cols-[minmax(0,1fr)_240px] md:gap-8' : ''}`}
    >
      <div className={`min-w-0 flex flex-col ${variant === 'grid' ? 'order-last p-4' : variant === 'short' ? 'flex-1 justify-between' : ''}`}>
        <div className="flex items-start justify-between gap-4">
          {variant === 'grid' ? <p className="min-w-0 truncate text-[11px] text-[var(--color-text-muted)]">{post.readTime || 'Article'} · {post.author?.username || 'Ink Rider writer'}</p> : <AuthorMeta author={post.author} readTime={post.readTime} date={post.createdAt} size="sm" stacked={variant === 'short'} />}
          <div ref={menuRef} className={`${variant === 'grid' ? 'absolute right-3 top-3 z-20' : 'relative shrink-0'}`}>
            <button
              ref={triggerRef}
              type="button"
              aria-label={`More options for ${post.title}`}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls={menuOpen ? menuId : undefined}
              onClick={event => { event.stopPropagation(); setMenuOpen(value => !value) }}
              className="flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/90 text-[var(--color-text-secondary)] shadow-sm backdrop-blur-sm transition-colors hover:bg-[var(--color-bg-alt)]"
            >
              <span aria-hidden="true" className="-mt-2 text-[20px] leading-none">…</span>
            </button>
            {menuOpen && <div ref={actionMenuRef} id={menuId} role="menu" aria-label={`Options for ${post.title}`} onKeyDown={handleMenuKeyDown} className="absolute right-0 top-10 z-[80] w-64 overflow-hidden rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-[var(--shadow-menu)]">
              <button type="button" role="menuitem" onClick={event => { event.stopPropagation(); requireAuth(() => likeMutation.mutate(!post.isLiked)); closeMenu({ restoreFocus: true }) }} className="min-h-10 sm:min-h-0 block w-full rounded-[8px] px-3 py-2 text-left text-[12px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">{post.isLiked ? 'Remove appreciation' : 'Appreciate story'}</button>
              <button type="button" role="menuitem" onClick={event => { event.stopPropagation(); requireAuth(() => bookmarkMutation.mutate(!post.isBookmarked)); closeMenu({ restoreFocus: true }) }} className="min-h-10 sm:min-h-0 block w-full rounded-[8px] px-3 py-2 text-left text-[12px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">{post.isBookmarked ? 'Remove from saved' : 'Save story'}</button>
              <button type="button" role="menuitem" onClick={event => { event.stopPropagation(); handleShare(); closeMenu({ restoreFocus: true }) }} className="min-h-10 sm:min-h-0 block w-full rounded-[8px] px-3 py-2 text-left text-[12px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">{shareStatus || 'Share link'}</button>
              <div className="my-1 h-px bg-[var(--color-border)]" />
              <button type="button" role="menuitem" aria-expanded={showWhy} onClick={event => { event.stopPropagation(); setShowWhy(value => !value) }} className="min-h-10 sm:min-h-0 flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-left text-[12px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"><span>Why you’re seeing this</span><span aria-hidden="true">{showWhy ? '−' : '+'}</span></button>
              {showWhy && <p className="px-3 pb-2 text-[11px] leading-5 text-[var(--color-text-muted)]">{post.recommendationReason || 'This story is part of the current discovery feed.'}</p>}
              <button type="button" role="menuitem" onClick={event => { event.stopPropagation(); handleNotInterested() }} className="min-h-10 sm:min-h-0 block w-full rounded-[8px] px-3 py-2 text-left text-[12px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">Not interested</button>
              <button type="button" role="menuitem" onClick={event => { event.stopPropagation(); setReportOpen(value => !value) }} className="min-h-10 sm:min-h-0 block w-full rounded-[8px] px-3 py-2 text-left text-[12px] text-[var(--color-danger)] hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">Report story</button>
              {reportOpen && <div className="border-t border-[var(--color-border)] p-2">
                <label htmlFor={`report-${post.id}`} className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Report reason</label>
                <select id={`report-${post.id}`} value={reportReason} onChange={event => setReportReason(event.target.value)} className="w-full rounded-[7px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] px-2 py-1.5 text-[11px] text-[var(--color-text)]">
                  <option value="spam">Spam or deceptive content</option><option value="harassment">Harassment</option><option value="hate">Hateful content</option><option value="toxicity">Toxic or abusive content</option><option value="plagiarism">Plagiarism</option><option value="misinformation">Potential misinformation</option><option value="other">Something else</option>
                </select>
                <button type="button" onClick={handleReport} disabled={reportMutation.isPending} className="mt-2 min-h-10 sm:min-h-0 w-full rounded-[7px] bg-[var(--color-accent)] px-2 py-1.5 text-[11px] font-semibold text-[var(--color-text-inverted)] disabled:opacity-50">{reportMutation.isPending ? 'Reporting…' : 'Submit report'}</button>
                {reportMutation.isError && <p role="alert" className="mt-2 text-[10px] text-[var(--color-danger)]">Could not submit this report.</p>}
              </div>}
            </div>}
          </div>
        </div>
        <h2 className={`${variant === 'grid' ? 'mt-3 line-clamp-3 text-[16px] leading-[1.3]' : variant === 'short' ? 'mt-0 break-words text-[24px] leading-[1.08]' : 'mt-3 text-[20px] leading-[1.12]'} font-bold tracking-[-0.045em] text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors`}
          style={{ fontFamily: 'var(--font-display)' }}>
          <Link to={`/post/${post.id}`} onClick={handleOpen}>{post.title}</Link>
        </h2>
        {post.excerpt && <p className={`${variant === 'short' ? 'mt-0 text-[13px] leading-[1.6]' : 'mt-3 text-[13px] leading-[1.65]'} line-clamp-3 text-[var(--color-text-secondary)]`}>{post.excerpt}</p>}
        <div className={`${variant === 'grid' ? 'hidden' : variant === 'short' ? 'mt-0 border-t border-[var(--color-border)] pt-5' : 'mt-auto pt-5'} flex flex-wrap items-center gap-2`}>
          {variant === 'short' ? <span className="flex items-center gap-2 rounded-[14px] bg-[var(--color-accent)]/10 px-3 py-2 text-[12px] font-semibold text-[var(--color-accent)]"><TopicIcon />{post.tags?.[0] || 'Short read'}</span> : post.tags?.slice(0, 3).map(tag => <Tag key={tag} label={tag} clickable />)}
          <span className={`${variant === 'short' ? 'ml-auto flex items-center gap-3 text-[11px]' : 'ml-auto flex items-center gap-4 text-[11px]'} text-[var(--color-text-muted)]`}><span className="flex items-center gap-1.5"><HeartIcon />{post.likesCount || 0} likes</span>{variant === 'short' && <span className="h-5 w-px bg-[var(--color-border)]" />}<span className="flex items-center gap-1.5"><CommentIcon />{post.commentsCount || 0} comments</span></span>
        </div>
      </div>
      {post.image && <Link to={`/post/${post.id}`} onClick={handleOpen} aria-label={`Read ${post.title}`} className={`${variant === 'grid' ? 'order-first overflow-hidden rounded-t-[16px]' : variant === 'short' ? 'order-first mb-4' : 'mt-6 md:mt-0 md:order-last md:self-center'}`}><ImageBox src={post.image} alt="" height={variant === 'grid' ? 150 : variant === 'short' ? 150 : 140} radius={variant === 'grid' ? '0' : '6px'} /></Link>}
    </article>
  )
}
