import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthorMeta from '@/shared/components/ui/AuthorMeta'
import ImageBox from '@/shared/components/ui/ImageBox'
import Tag from '@/shared/components/ui/Tag'
import PostEngagementControls from './PostEngagementControls'
import ShortCard from './ShortCard'
import PostCardMenu from './PostCardMenu'

export { PostCardMenu }

export default function DiscoveryPostCard(props) {
  return props.post.format === 'short' || props.variant === 'short'
    ? <ShortCard {...props} />
    : <DiscoveryCard {...props} />
}

function DiscoveryCard({ post, onHide, onOpen, comfortable = false, variant = 'list', flushTop = true }) {
  const [isHidden, setIsHidden] = useState(false)
  const authorHandle = post.author?.handle || post.author?.username?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  const handleOpen = event => {
    if (!onOpen) return
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    onOpen(post)
  }

  if (isHidden) return null

  return (
    <article
      data-story-format="article"
      className={`group relative border-b border-[var(--color-border)] ${variant === 'grid' ? 'flex flex-col overflow-visible rounded-[16px] border bg-[var(--color-surface)]' : comfortable ? 'max-md:flex max-md:flex-col py-10 first:pt-10' : `max-md:flex max-md:flex-col py-6 ${flushTop ? 'first:pt-0' : ''}`}
        ${post.image && variant !== 'grid' ? 'md:grid md:grid-cols-[minmax(0,1fr)_240px] md:gap-8' : ''}`}
    >
      <div className={`min-w-0 flex flex-col ${variant === 'grid' ? 'order-last p-4' : 'max-md:contents'}`}>
        {post.isEarlyAccess && <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[var(--color-accent)]">Member early access</p>}
        <div className="flex items-start justify-between gap-4 [&>div:first-child]:relative [&>div:first-child]:z-10 [&>div:first-child]:gap-2 [&>div:first-child]:max-md:flex-col [&>div:first-child]:max-md:items-start [&>div:first-child>span]:max-md:hidden [&>div:first-child>div]:flex-wrap [&>div:first-child>a]:min-w-0 [&>div:first-child>a]:max-w-full [&>div:first-child>a>span]:min-w-0 [&>div:first-child>a>span]:break-words">
          {variant === 'grid' ? <p className="relative z-10 min-w-0 truncate text-[11px] text-[var(--color-text-muted)]"><span>{post.readTime || 'Article'}</span> · {authorHandle ? <Link to={`/author/${encodeURIComponent(authorHandle)}`} aria-label={`View ${post.author.username}'s profile`} className="text-inherit rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">{post.author.username}</Link> : <>{post.author?.username || 'Ink Rider writer'}</>}</p> : <AuthorMeta author={post.author} readTime={post.readTime} date={post.createdAt} size="sm" stacked />}
          <PostCardMenu post={post} variant={variant} onHide={hidden => { if (onHide) onHide(hidden); else setIsHidden(true) }} />
        </div>
        <h2 className={`${variant === 'grid' ? 'mt-3 line-clamp-3 text-[16px] leading-[1.3]' : 'max-md:order-[-2] mt-5 text-[20px] leading-[1.12]'} break-words font-bold tracking-[-0.045em] text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors`}
          style={{ fontFamily: 'var(--font-display)' }}>
          <Link to={`/post/${post.id}`} onClick={handleOpen} className="rounded-[4px] after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2">{post.title}</Link>
        </h2>
        {post.excerpt && <p className={`${variant === 'list' ? 'max-md:order-[-2]' : ''} mt-3 text-[13px] leading-[1.65] break-words line-clamp-3 text-[var(--color-text-secondary)]`}>{post.excerpt}</p>}
        <div className={`${variant === 'list' ? 'mt-auto pt-3 md:pt-5 max-md:grid max-md:grid-cols-[minmax(0,1fr)_auto] max-md:items-start max-md:gap-x-3' : 'mt-auto pt-5'} flex flex-wrap items-center gap-x-2 gap-y-2`}>
          {variant !== 'grid' && <div className={`${variant === 'list' ? 'max-md:py-[7px]' : ''} flex min-w-0 flex-wrap gap-2 [&>a]:relative [&>a]:z-10 [&>a]:max-w-full [&>a]:whitespace-normal [&>a]:break-words [&>span]:max-w-full [&>span]:break-words`}>
            {post.tags?.slice(0, 3).map(tag => <Tag key={tag} label={tag} clickable />)}
          </div>}
          <PostEngagementControls post={post} />
        </div>
      </div>
      {post.image && <Link to={`/post/${post.id}`} onClick={handleOpen} aria-label={`Read ${post.title}`} className={`relative z-10 ${variant === 'grid' ? 'order-first overflow-hidden rounded-t-[16px]' : 'max-md:order-[-1] mt-4 md:mt-0 md:order-last md:self-center'}`}><ImageBox src={post.image} alt="" height={variant === 'grid' ? 150 : 140} radius={variant === 'grid' ? '0' : '6px'} /></Link>}
    </article>
  )
}
