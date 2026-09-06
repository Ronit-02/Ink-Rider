import { Link } from 'react-router-dom'
import Avatar from './Avatar'

export default function AuthorMeta({ author, readTime, date, size = 'sm', stacked = false }) {
  const textSize  = size === 'sm' ? 'text-[12px]' : 'text-[13px]'
  const avatarSz  = size === 'sm' ? 22 : 28

  const fallbackHandle = author.username
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const handle = author.handle || fallbackHandle
  const authorPath = handle ? `/author/${encodeURIComponent(handle)}` : null
  const authorContent = <>
    <Avatar src={author.picture} name={author.username} size={avatarSz} />
    <span className={`${textSize} text-(--color-text-secondary) font-medium hover:text-(--color-text) transition-colors capitalize`}>
      {author.username}
    </span>
  </>

  return (
    <div className={`${stacked ? 'flex flex-col items-start gap-1' : 'flex items-center flex-wrap justify-between gap-1'} min-w-0 flex-1`}>
      {authorPath ? (
        <Link
          to={authorPath}
          onClick={event => event.stopPropagation()}
          aria-label={`View ${author.username}'s profile`}
          className="flex items-center gap-2 rounded-[4px] p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2"
        >
          {authorContent}
        </Link>
      ) : (
        <span className="flex items-center gap-2 rounded-[4px]">
          {authorContent}
        </span>
      )}

      {!stacked && <span className="text-(--color-text-muted)">·</span>}

      {/* Meta: date + read time */}
      <div className={`flex items-center gap-1.5 ${textSize} text-(--color-text-muted)`}>
        {date && <>
          <span>{ new Date(date).toLocaleString('en-GB', {day:'numeric', month: 'long', year:'numeric'})}</span>
          <span>·</span>
        </>}
        {readTime && <span>{readTime}</span>}
      </div>
    </div>
  )
}
