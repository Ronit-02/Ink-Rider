import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthorMeta from '@/shared/components/ui/AuthorMeta'
import ImageBox from '@/shared/components/ui/ImageBox'
import PostEngagementControls from './PostEngagementControls'
import PostCardMenu from './PostCardMenu'
import ShortReadModal from './ShortReadModal'

export default function ShortCard({ post, onHide, onOpen, menuOverride, fluid = false }) {
  const [readerOpen, setReaderOpen] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const handleOpen = event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    if (onOpen) onOpen(post)
    else setReaderOpen(true)
  }

  if (isHidden) return null

  return <article data-story-format="short" className={`group relative flex w-full self-start flex-col rounded-[16px] border border-[var(--color-border)] ${fluid ? 'aspect-[2/3] min-h-[285px] p-3 max-[1023px]:px-4 min-[376px]:max-[391px]:min-h-[270px] min-[376px]:max-[391px]:py-2 min-[376px]:max-[391px]:px-3' : 'h-[380px] max-w-[250px] p-5'}`}>
    <div className="flex min-w-0 flex-1 flex-col justify-between">
      <div className="flex min-w-0 flex-col">
        <div className={`flex flex-wrap items-start justify-between gap-x-4 [&>div:first-child]:relative [&>div:first-child]:z-10 [&>div:first-child]:translate-y-[11px] [&>div:first-child]:gap-2 [&>div:first-child]:max-md:flex-col [&>div:first-child]:max-md:items-start [&>div:first-child>span]:max-md:hidden [&>div:first-child>div]:flex-wrap [&>div:first-child>a]:min-w-0 [&>div:first-child>a]:max-w-full [&>div:first-child>a>span]:min-w-0 [&>div:first-child>a>span]:break-words ${fluid ? 'min-[376px]:max-[391px]:gap-x-1' : ''}`}>
          <AuthorMeta author={post.author} size="sm" stacked />
          {menuOverride
            ? <div className="relative z-20 shrink-0">{menuOverride}</div>
            : <PostCardMenu post={post} variant="short" onHide={hidden => { if (onHide) onHide(hidden); else setIsHidden(true) }} />}
          {!fluid && Boolean(post.createdAt || post.readTime) && <div className="mt-2 flex w-full flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[var(--color-text-muted)]">
            {post.createdAt && post.readTime
              ? <span className="whitespace-nowrap">{new Date(post.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}<span aria-hidden="true" className="mx-1.5">·</span>{post.readTime}</span>
              : <span className="whitespace-nowrap">{post.createdAt ? new Date(post.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : post.readTime}</span>}
          </div>}
        </div>
        <h2 className={`${fluid ? 'mt-2 line-clamp-2 text-[16px]' : 'mt-5 line-clamp-3 text-[22px]'} break-words leading-[1.15] font-bold tracking-[-0.045em] text-[var(--color-text)] transition-colors group-hover:text-[var(--color-accent)]`} style={{ fontFamily: 'var(--font-display)' }}>
          <Link to={`/post/${post.id}`} onClick={handleOpen} className="rounded-[4px] after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2">{post.title}</Link>
        </h2>
        {post.excerpt && <p className={`break-words text-[13px] leading-[1.6] text-[var(--color-text-secondary)] ${fluid ? `mt-2 ${post.image ? 'line-clamp-1' : 'line-clamp-2'}` : 'mt-3 line-clamp-4'}`}>{post.excerpt}</p>}
      </div>
      <div className={`${fluid ? 'mt-2 pt-2' : 'mt-5 pt-5'} flex flex-col items-start gap-y-2 border-t border-[var(--color-border)]`}>
        <PostEngagementControls post={post} divider />
      </div>
    </div>
    {post.image && <Link to={`/post/${post.id}`} onClick={handleOpen} aria-label={`Read ${post.title}`} className={`relative z-10 order-first ${fluid ? 'mb-2' : 'mb-4'}`}><ImageBox src={post.image} alt="" height="auto" aspectRatio="16 / 9" radius="6px" /></Link>}
    {readerOpen && <ShortReadModal postId={post.id} onClose={() => setReaderOpen(false)} />}
  </article>
}
