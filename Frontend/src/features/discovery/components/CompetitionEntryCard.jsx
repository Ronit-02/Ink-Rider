import { Link } from 'react-router-dom'
import Avatar from '@/shared/components/ui/Avatar'
import ImageBox from '@/shared/components/ui/ImageBox'
import ShortCard from './ShortCard'

const entryMetaDate = value => value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date unavailable'

export default function CompetitionEntryCard({ entry, status, voting, onVote, from }) {
  const post = entry.post
  const isShort = post?.format === 'short'
  return <article className={isShort ? 'relative min-w-0' : 'group relative overflow-hidden rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)]'}>
    {isShort ? <div><ShortCard post={{ ...post, id: post._id || post.id, image: post.coverImage || post.image, author: entry.author }} /><p className="px-4 py-2 text-[12px] text-[var(--color-text-secondary)]">{entry.isWinner && 'Winner · '}{entry.rank && `Rank ${entry.rank}`}</p></div> : <>
      <ImageBox src={post?.coverImage || post?.image} alt="" height={144} radius="0" placeholderLabel="Text-only entry" />
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link to={entry.author?.handle ? `/author/${encodeURIComponent(entry.author.handle)}` : '/author'} aria-label={`View ${entry.author?.username || 'writer'}'s profile`} className="relative z-10 inline-flex min-w-0 max-w-full items-center gap-2 rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"><Avatar src={entry.author?.picture} name={entry.author?.username} size={28} /><span className="min-w-0 break-words text-[13px] text-[var(--color-text-secondary)] sm:text-[12px]">{entry.author?.username || 'Ink Rider writer'}</span></Link>
          {post && <span className="w-full min-w-0 text-[12px] leading-5 text-[var(--color-text-secondary)] sm:text-[11px] sm:text-[var(--color-text-muted)]">{entryMetaDate(post.createdAt)} · {post.readTime || '1 min read'}</span>}
          {entry.isWinner && <span className="text-[12px] font-semibold text-[var(--color-accent)] sm:text-[11px]">Winner</span>}
        </div>
        <h3 className="mt-4 break-words text-[18px] font-bold leading-snug text-[var(--color-text)] sm:mt-3 sm:text-[17px]" style={{ fontFamily: 'var(--font-display)' }}>{post ? <Link to={`/post/${post._id || post.id}`} state={{ from }} className="rounded-[4px] after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">{post.title}</Link> : 'Unavailable article'}</h3>
        {post && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[12px] text-[var(--color-text-secondary)] sm:text-[11px] sm:text-[var(--color-text-muted)]"><span>{post.commentsCount || 0} comments</span>{entry.rank && <span>Rank {entry.rank}</span>}</div>}
      </div>
    </>}
    {status !== 'closed' && <button type="button" disabled={voting} aria-busy={voting} onClick={onVote} aria-label={`${entry.isVoted ? 'Remove vote from' : 'Vote for'} ${post?.title || 'this entry'}`} aria-pressed={entry.isVoted} className={`relative z-10 mx-4 mb-4 flex min-h-11 ${isShort ? '' : 'sm:absolute sm:right-4 sm:top-4 sm:z-10 sm:m-0'} items-center justify-center gap-2 rounded-[12px] border px-3.5 py-2 text-[12px] font-semibold shadow-sm transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 ${entry.isVoted ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-text-inverted)]' : 'border-[var(--color-border)] bg-[var(--color-surface)]/95 text-[var(--color-text-secondary)]'}`}><span data-button-icon aria-hidden="true" className="text-[15px]">{entry.isVoted ? '✓' : '＋'}</span><span>{entry.isVoted ? 'Voted' : 'Vote'}</span><span className="tabular-nums">{entry.likesCount}</span></button>}
  </article>
}
