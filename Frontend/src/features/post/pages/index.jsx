import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom'
import { BackIcon, BookmarkIcon, ShareIcon, LinkIcon, XIcon } from '@/shared/icons'
import AuthorMeta from '@/shared/components/ui/AuthorMeta'
import Tag from '@/shared/components/ui/Tag'
import Divider from '@/shared/components/ui/Divider'
import Button from '@/shared/components/ui/Button'
import { PostDetailSkeleton } from '@/shared/components/ui/Skeleton'
import PostBody from './PostBody'
import AuthorBio from './AuthorBio'
import CommentsSection from './CommentsSection'
import { AIStickyButtons, AccessPanel, SummaryPanel, ReadAloudPanel } from './AIPanel'
import useFetchPost from '../hooks/useFetchPost'
import useBookmarkPost from '../hooks/useBookmarkPost'
import usePostLike from '../hooks/usePostLike'
import useReportPost from '../hooks/useReportPost'
import useReadingProgress from '../hooks/useProgressBar'
import useAuth from '@/features/auth/hooks/useAuth'
import { createInteractionEvent, recordInteractionEvents } from '@/features/discovery/api/events'
import useEntitlements from '@/features/membership/hooks/useEntitlements'
import ShortReadModal from '@/features/discovery/components/ShortReadModal'
import PageFrame from '@/shared/components/layout/PageFrame'
import ImageBox from '@/shared/components/ui/ImageBox'
import useToast from '@/shared/hooks/useToast'
import { useEscapeKey } from '@/shared/hooks/useEscapeKey'

const HeartIcon = ({ filled }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
)

const FlagIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 21V4" />
    <path d="M5 5h11l-1.5 4L16 13H5" />
  </svg>
)

const parsePostBlocks = body => {
  try {
    const blocks = JSON.parse(body)
    return Array.isArray(blocks) ? blocks : null
  } catch {
    return null
  }
}

export default function PostPage() {
  const navigate  = useNavigate()
  const location = useLocation()
  const { id: postId } = useParams();
  const { loggedIn, signIn } = useAuth()
  const entitlements = useEntitlements(loggedIn)

  // UI State
  const [showSummary, setShowSummary] = useState(false)
  const [readAloud,   setReadAloud]   = useState(false)
  const [showShare,   setShowShare]   = useState(false)
  const [showReport,  setShowReport]  = useState(false)
  const [shortReadId, setShortReadId] = useState(null)
  const hasSidePanel = showSummary || readAloud;

  // Hooks
  const { data: postData, isLoading: fetchPostIsLoading, isError, error, refetch } = useFetchPost(postId);
  const BookmarkMutation = useBookmarkPost(postId);
  const likeMutation = usePostLike(postId)
  const reportMutation = useReportPost(postId)
  const pageRef = useRef(null)
  const shareTriggerRef = useRef(null)
  const progress = useReadingProgress(pageRef);
  const recordedPostId = useRef(null)
  const recordedCompletion = useRef(false)
  const recordedDepths = useRef(new Set())

  const closeShareMenu = ({ restoreFocus = false } = {}) => {
    setShowShare(false)
    if (restoreFocus) requestAnimationFrame(() => shareTriggerRef.current?.focus())
  }

  // Page Effects
  // Close share menu on outside click
  useEffect(() => {
    if (!showShare) return
    const close = () => setShowShare(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [showShare])

  useEscapeKey(() => {
    if (showShare) closeShareMenu({ restoreFocus: true })
    setShowReport(false)
  })

  useEffect(() => {
    if (!postData?._id || recordedPostId.current === postData._id) return
    recordedPostId.current = postData._id
    recordedCompletion.current = false
    recordedDepths.current = new Set()
    recordInteractionEvents([createInteractionEvent({
      eventType: 'open',
      postId: postData._id,
      writerId: postData.author?._id,
      surface: 'article',
    })]).catch(() => {})
  }, [postData])

  useEffect(() => {
    if (!postData?._id) return
    const milestone = [75, 50, 25].find(value => progress >= value && !recordedDepths.current.has(value))
    if (!milestone) return
    recordedDepths.current.add(milestone)
    recordInteractionEvents([createInteractionEvent({
      eventType: 'reading_depth',
      postId: postData._id,
      writerId: postData.author?._id,
      surface: 'article',
      metadata: { readingDepth: milestone },
    })]).catch(() => recordedDepths.current.delete(milestone))
  }, [postData, progress])

  useEffect(() => {
    if (!postData?._id || progress < 90 || recordedCompletion.current) return
    recordedCompletion.current = true
    recordInteractionEvents([createInteractionEvent({
      eventType: 'complete',
      postId: postData._id,
      writerId: postData.author?._id,
      surface: 'article',
      metadata: { readingDepth: Math.min(100, Math.round(progress)) },
    })]).catch(() => {})
  }, [postData, progress])

  // Action Handlers
  const handleBookmark = () => {
    if (!loggedIn) return signIn()
    BookmarkMutation.mutate(!postData.isBookmarked);
  }

  const handleLike = () => {
    if (!loggedIn) return signIn()
    likeMutation.mutate(!postData.isLiked)
  }

  const handleReportOpen = () => {
    if (!loggedIn) return signIn()
    reportMutation.reset()
    setShowReport(value => !value)
  }

  // Conditional Rendering
  if (fetchPostIsLoading) return <PostDetailSkeleton />;
  if (isError) return <PostErrorState notFound={error?.response?.status === 404} onRetry={refetch} />;
  const postBlocks = parsePostBlocks(postData.body)
  if (!postBlocks) return <PostErrorState onRetry={() => navigate('/')} invalidContent />
  const capabilities = new Set(entitlements.data?.capabilities || [])
  const articleText = [postData.title, ...postBlocks.filter(block => !['image', 'divider'].includes(block.type)).map(block => String(block.content || '').replace(/<[^>]*>/g, ' '))]
    .join('. ').replace(/\s+/g, ' ').trim()

  const openPremiumPanel = (setter, otherSetter) => {
    if (!loggedIn) return signIn()
    setter(value => !value)
    otherSetter(false)
  }

  return (
    <div ref={pageRef} className="relative bg-(--color-bg) text-(--color-text) min-h-screen">
      <PostMetadata post={postData} blocks={postBlocks} />

      {/* ── Reading progress bar (full width, below navbar) ── */}
      <div
        data-reading-progress="true"
        className="fixed left-0 right-0 top-14 z-[110] h-[3px]"
        aria-hidden="true"
        style={{ backgroundColor: 'var(--color-bg-alt)' }}
      >
        <div
          className="h-full"
          style={{ width: `${progress}%`, backgroundColor: 'var(--color-accent)' }}
        />
      </div>

      {/* ── Page body — LEFT aligned (matches sidebar layout) ── */}
      <PageFrame className="flex flex-col gap-8 lg:flex-row">

        {/* ── Article column ── */}
        <div className={`order-2 min-w-0 w-full flex-1 lg:order-none ${hasSidePanel ? '' : 'max-w-[760px]'}`}>

          {/* Back button */}
          <Link to={location.state?.from || "/"}
            className="inline-flex items-center gap-1.5 bg-(--color-bg-alt) border border-(--color-border) text-(--color-text-secondary) text-[13px] cursor-pointer mb-7 px-3.5 py-1.5 rounded-full transition-all hover:bg-(--color-border) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2">
            <BackIcon /> 
            Back
          </Link>

          {/* Tags */}
          {postData.tags?.length > 0 && (
            <div className="flex gap-1.5 mb-3.5 flex-wrap">
              {postData.tags.map(t => <Tag key={t} label={t} clickable />)}
            </div>
          )}

          {/* Hero image */}
          <ImageBox src={postData.coverImage} alt="" height="clamp(180px, 30vw, 320px)" radius="20px" placeholderLabel="Text-only story" style={{ marginBottom: '2rem' }} />

          {/* Title */}
          <h1 className="break-words font-bold text-(--color-text) leading-[1.3] tracking-[-0.5px] mb-5 text-[clamp(22px,4vw,32px)]"
            style={{ fontFamily: 'var(--font-display)' }}>
            {postData.title}
          </h1>

          {/* Author row + actions */}
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <AuthorMeta author={postData.author} readTime={postData?.readTime || '5 mins'} date={postData.createdAt} size="md" />

            <div className="flex gap-2 shrink-0">
              
              <button
                type="button"
                onClick={handleLike}
                disabled={likeMutation.isPending}
                aria-label={postData.isLiked ? 'Remove appreciation' : 'Appreciate this article'}
                aria-pressed={postData.isLiked}
                className={`h-10 sm:h-9 px-3 rounded-full border border-(--color-border) flex items-center gap-1.5 justify-center cursor-pointer transition-all duration-150
                  disabled:opacity-60 ${postData.isLiked ? 'bg-(--color-accent) text-(--color-text-inverted)' : 'bg-(--color-surface) text-(--color-text-secondary)'}`}>
                <HeartIcon filled={postData.isLiked} />
                <span className="text-[12px] tabular-nums">{postData.likesCount || 0}</span>
              </button>

              <button type="button" onClick={handleBookmark}
                disabled={BookmarkMutation.isPending}
                aria-label={postData.isBookmarked ? 'Remove from saved articles' : 'Save this article'}
                aria-pressed={postData.isBookmarked}
                className={`w-10 h-10 sm:w-9 sm:h-9 rounded-full border border-(--color-border) flex items-center justify-center cursor-pointer transition-all duration-150
                  disabled:opacity-60 ${postData.isBookmarked ? 'bg-(--color-accent) text-(--color-text-inverted)' : 'bg-(--color-surface) text-(--color-text-secondary)'}`}>
                <BookmarkIcon filled={postData.isBookmarked} />
              </button>
              
              {/* Share */}
              <div className="relative">
                <button ref={shareTriggerRef} type="button" onClick={e => { e.stopPropagation(); setShowShare(v => !v) }}
                  aria-label="Share this article"
                  aria-expanded={showShare}
                  aria-haspopup="menu"
                  aria-controls={showShare ? 'article-share-menu' : undefined}
                  className="w-10 h-10 sm:w-9 sm:h-9 rounded-full border border-(--color-border) bg-(--color-surface) text-(--color-text-secondary) flex items-center justify-center cursor-pointer transition-all">
                  <ShareIcon />
                </button>
                {showShare && <ShareDropdown onClose={closeShareMenu} />}
              </div>

              <button
                type="button"
                onClick={handleReportOpen}
                aria-label="Report this article"
                aria-expanded={showReport}
                  className="w-10 h-10 sm:w-9 sm:h-9 rounded-full border border-(--color-border) bg-(--color-surface)
                  text-(--color-text-secondary) flex items-center justify-center cursor-pointer transition-all">
                <FlagIcon />
              </button>
            </div>
            
          </div>

          <Divider className="mb-6" />

          {postData.seriesContext && <nav aria-label="Short series progression" className="mb-7 rounded-[14px] border border-(--color-border) bg-(--color-bg-alt) p-4"><div className="flex flex-wrap items-center justify-between gap-4"><div className="min-w-0"><Link to={`/shorts/series/${postData.seriesContext.id}`} className="rounded-[4px] text-[12px] font-semibold text-(--color-accent) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2">{postData.seriesContext.title}</Link><p className="mt-1 text-[11px] text-(--color-text-muted)">Part {postData.seriesContext.position + 1} of {postData.seriesContext.total}</p></div><div className="flex flex-wrap gap-2">{postData.seriesContext.previous && <Link to={`/post/${postData.seriesContext.previous.id}`} className="inline-flex min-h-10 items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface) px-[18px] py-2 text-[13px] font-medium whitespace-nowrap text-(--color-text) transition-all duration-150 hover:bg-(--color-bg-alt) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 sm:min-h-0">← Previous</Link>}{postData.seriesContext.next && <Link to={`/post/${postData.seriesContext.next.id}`} className="inline-flex min-h-10 items-center justify-center rounded-full border border-(--color-accent) bg-(--color-accent) px-[18px] py-2 text-[13px] font-medium whitespace-nowrap text-(--color-text-inverted) transition-all duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 sm:min-h-0">Next →</Link>}</div></div></nav>}

          {postData.depthContext && <aside className="mb-7 flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-(--color-border) bg-(--color-bg-alt) p-4"><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-(--color-text-muted)">{postData.depthContext.deeper ? 'Go deeper' : 'Need the quick version?'}</p><p className="mt-1 text-[13px] font-semibold text-(--color-text)">{postData.depthContext.deeper?.title || postData.depthContext.quick?.title}</p></div>{postData.depthContext.deeper ? <Link to={`/post/${postData.depthContext.deeper.id}`} className="inline-flex min-h-10 items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface) px-[18px] py-2 text-[13px] font-medium whitespace-nowrap text-(--color-text) transition-all duration-150 hover:bg-(--color-bg-alt) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 sm:min-h-0">Read full article →</Link> : <Button className="min-h-10 sm:min-h-0" variant="secondary" onClick={() => setShortReadId(postData.depthContext.quick.id)}>Read short →</Button>}</aside>}

          {(BookmarkMutation.isError || likeMutation.isError) && (
            <p role="alert" className="text-[12px] text-[var(--color-danger)] mb-4">
              We couldn't update that article action. Please try again.
            </p>
          )}

          {showReport && (
            <ReportPanel
              mutation={reportMutation}
              onClose={() => setShowReport(false)}
            />
          )}

          {/* Body */}
          <article aria-label="Article body" className="max-w-[44rem]">
            <PostBody body={postBlocks} />
          </article>

          <Divider className="my-10" />

          {/* Author bio */}
          <AuthorBio author={postData.author} />

          <Divider className="my-10" />

          {/* Comments (renamed from Responses) */}
          <CommentsSection postId={postId} initialCount={postData.commentsCount || 0} />
        </div>

        {/* ── AI sticky buttons ── */}
        <div className="order-1 w-full shrink-0 lg:order-none lg:w-13">
          <AIStickyButtons
            showSummary={showSummary} readAloud={readAloud}
            onSummary={() => openPremiumPanel(setShowSummary, setReadAloud)}
            onAudio={() => openPremiumPanel(setReadAloud, setShowSummary)}
          />
        </div>

        {/* ── Side AI panels ── */}
        {hasSidePanel && (
          <div className="order-3 h-fit w-full shrink-0 flex flex-col gap-3 lg:order-none lg:sticky lg:top-20 lg:w-90">
            {showSummary && (capabilities.has('article_summary') ? <SummaryPanel postId={postId} /> : <AccessPanel capability="article_summary" />)}
            {readAloud && (capabilities.has('read_aloud') ? <ReadAloudPanel text={articleText} /> : <AccessPanel capability="read_aloud" />)}
          </div>
        )}
      </PageFrame>
      {shortReadId && <ShortReadModal postId={shortReadId} onClose={() => setShortReadId(null)} />}
    </div>
  )
}

function PostErrorState({ notFound = false, invalidContent = false, onRetry }) {
  const title = notFound ? 'This article is no longer available' : 'The article could not be loaded'
  const detail = invalidContent
    ? 'The published content is not in a readable format. Please return to discovery and try another story.'
    : 'Something went wrong while loading this story. You can try again or return to discovery.'

  return (
    <PageFrame>
      <div role="alert" className="max-w-[620px] border-y border-[var(--color-border)] py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">Article</p>
        <h1 className="mt-3 text-[clamp(28px,5vw,44px)] font-bold tracking-[-0.045em] text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>{title}</h1>
        <p className="mt-4 text-[14px] leading-7 text-[var(--color-text-secondary)]">{detail}</p>
        <div className="mt-7 flex flex-wrap gap-2">
          {!invalidContent && !notFound && <Button variant="secondary" onClick={onRetry}>Try again</Button>}
          <Link to="/" className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-[18px] py-2 text-[13px] font-medium text-[var(--color-text-inverted)] transition-all duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 sm:min-h-0">Return home</Link>
        </div>
      </div>
    </PageFrame>
  )
}

function PostMetadata({ post, blocks }) {
  useEffect(() => {
    const previousTitle = document.title
    const description = blocks.filter(block => !['image', 'divider', 'code'].includes(block.type)).map(block => String(block.content || '')).join(' ').replace(/\s+/g, ' ').trim().slice(0, 160)
    const canonicalUrl = `${window.location.origin}/post/${post._id}`
    document.title = `${post.title} · Ink-Rider`
    const ensureMeta = (selector, attributes) => {
      let node = document.head.querySelector(selector)
      if (!node) { node = document.createElement('meta'); node.dataset.inkRiderDynamic = 'true'; document.head.appendChild(node) }
      Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value))
      return node
    }
    ensureMeta('meta[name="description"]', { name: 'description', content: description })
    ensureMeta('meta[property="og:title"]', { property: 'og:title', content: post.title })
    ensureMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    ensureMeta('meta[property="og:type"]', { property: 'og:type', content: 'article' })
    ensureMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl })
    if (post.coverImage) ensureMeta('meta[property="og:image"]', { property: 'og:image', content: post.coverImage })
    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; canonical.dataset.inkRiderDynamic = 'true'; document.head.appendChild(canonical) }
    canonical.href = canonicalUrl
    const structured = document.createElement('script')
    structured.type = 'application/ld+json'
    structured.dataset.inkRiderDynamic = 'true'
    structured.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: post.title, description, image: post.coverImage || undefined, datePublished: post.createdAt, dateModified: post.updatedAt || post.createdAt, author: { '@type': 'Person', name: post.author?.username || 'Ink-Rider writer', url: post.author?.handle ? `${window.location.origin}/author/${post.author.handle}` : undefined }, mainEntityOfPage: canonicalUrl })
    document.head.appendChild(structured)
    return () => {
      document.title = previousTitle
      document.head.querySelectorAll('[data-ink-rider-dynamic="true"]').forEach(node => node.remove())
    }
  }, [post, blocks])
  return null
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or deceptive content' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'hate', label: 'Hateful content' },
  { value: 'toxicity', label: 'Toxic or abusive content' },
  { value: 'plagiarism', label: 'Plagiarism' },
  { value: 'misinformation', label: 'Potential misinformation' },
  { value: 'other', label: 'Something else' },
]

function ReportPanel({ mutation, onClose }) {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')

  const handleSubmit = () => {
    if (!reason || mutation.isPending) return
    mutation.mutate({ reason, details })
  }

  if (mutation.isSuccess) {
    return (
      <section aria-live="polite" className="mb-6 p-5 rounded-[14px] bg-(--color-bg-alt) border border-(--color-border)">
        <h2 className="font-semibold text-[14px] text-(--color-text) mb-1">Report received</h2>
        <p className="text-[13px] text-(--color-text-secondary) mb-4">
          Our moderation queue will review this article.
        </p>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </section>
    )
  }

  return (
    <section aria-labelledby="report-heading" className="mb-6 p-5 rounded-[14px] bg-(--color-bg-alt) border border-(--color-border)">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 id="report-heading" className="font-semibold text-[14px] text-(--color-text) mb-1">Report this article</h2>
          <p className="text-[12px] text-(--color-text-secondary)">Reports are private and help the moderation team review harmful content.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close report form"
          className="w-10 h-10 sm:w-8 sm:h-8 rounded-full border border-(--color-border) bg-(--color-surface) text-(--color-text-secondary)">
          ×
        </button>
      </div>

      <label htmlFor="report-reason" className="block text-[12px] font-semibold text-(--color-text) mb-2">Reason</label>
      <select
        id="report-reason"
        value={reason}
        onChange={event => setReason(event.target.value)}
        className="w-full px-3 py-2.5 rounded-[10px] border border-(--color-border) bg-(--color-surface)
          text-[13px] text-(--color-text) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] mb-4"
      >
        <option value="">Select a reason</option>
        {REPORT_REASONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>

      <label htmlFor="report-details" className="block text-[12px] font-semibold text-(--color-text) mb-2">
        Details <span className="font-normal text-(--color-text-muted)">(optional)</span>
      </label>
      <textarea
        id="report-details"
        value={details}
        maxLength={1000}
        onChange={event => setDetails(event.target.value)}
        className="w-full min-h-[90px] px-3 py-2.5 rounded-[10px] border border-(--color-border) bg-(--color-surface)
          text-[13px] text-(--color-text) resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"
        placeholder="Add context that will help the review"
      />
      <div className="flex items-center justify-between gap-4 mt-3">
        <span className="text-[11px] text-(--color-text-muted)">{details.length}/1000</span>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!reason || mutation.isPending}>
            {mutation.isPending ? 'Submitting…' : 'Submit report'}
          </Button>
        </div>
      </div>
      {mutation.isError && (
        <p role="alert" className="text-[12px] text-[var(--color-danger)] mt-3">
          We couldn't submit the report. Please try again.
        </p>
      )}
    </section>
  )
}

function ShareDropdown({ onClose }) {
  const url = window.location.href
  const { notify } = useToast()
  const menuRef = useRef(null)
  useEffect(() => {
    const frame = requestAnimationFrame(() => menuRef.current?.querySelector('[role="menuitem"]')?.focus())
    return () => cancelAnimationFrame(frame)
  }, [])
  const copyLink = () => { 
    navigator.clipboard.writeText(url).then(() => notify('Article link copied.')).catch(() => notify('The article link could not be copied.', { tone: 'error' })).finally(() => onClose({ restoreFocus: true }))
  }
  const shareX = () => { 
    window.open(`https://x.com/intent/tweet?url=${encodeURIComponent(url)}`); 
    notify('Share window opened.')
    onClose({ restoreFocus: true })
  }

  const handleKeyDown = event => {
    const items = [...(menuRef.current?.querySelectorAll('[role="menuitem"]') || [])]
    if (!items.length) return

    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onClose({ restoreFocus: true })
      return
    }
    if (event.key === 'Tab') {
      const currentIndex = items.indexOf(document.activeElement)
      const leavesMenu = (event.shiftKey && currentIndex === 0) || (!event.shiftKey && currentIndex === items.length - 1)
      if (leavesMenu) setTimeout(() => onClose(), 0)
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

  const SHARE_MENU = [
    { label: 'Copy Link', icon: <LinkIcon />, fn: copyLink }, 
    { label: 'Share on X', icon: <XIcon />, fn: shareX }
  ]

  return (
    <div ref={menuRef} id="article-share-menu" role="menu" aria-label="Share article" onKeyDown={handleKeyDown} className="absolute top-full right-0 mt-1.5 bg-(--color-surface) border border-(--color-border) rounded-[14px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden z-50 min-w-45">
      {SHARE_MENU.map(item => (
        <button type="button" role="menuitem" key={item.label} onClick={item.fn}
          className="flex items-center gap-2.5 w-full px-3.5 py-2.5 border-none bg-transparent text-(--color-text) text-[13px] cursor-pointer text-left hover:bg-(--color-bg-alt) focus:bg-(--color-bg-alt) focus:outline-none transition-colors">
          {item.icon} {item.label}
        </button>
      ))}
    </div>
  )
}
