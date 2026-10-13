import { Link } from 'react-router-dom'
import Avatar from './Avatar'

export default function AuthorMeta({ author, readTime, date, size = 'sm', stacked = false, variant = 'default', compactMobile = false }) {
  const hasAuthor = Boolean(author?.username && author.username !== 'Unknown writer')
  author = { ...author, username: author?.username || 'Unknown writer' }
  const article = variant === 'article'
  const textSize  = size === 'sm' ? 'text-[12px]' : 'text-[13px]'
  const avatarSz  = size === 'sm' ? 22 : 28
  const compactDate = date ? new Date(date).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : null
  const compactReadTime = readTime?.replace(/\s+read$/i, '')

  const fallbackHandle = author.username
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const handle = hasAuthor ? author.handle || fallbackHandle : null
  const authorPath = handle ? `/author/${encodeURIComponent(handle)}` : null
  const metadata = <div className={`flex max-w-full flex-wrap items-center gap-1.5 ${article ? 'text-[12px] leading-5' : textSize} ${compactMobile ? 'max-[540px]:hidden' : ''} text-(--color-text-muted)`}>
    {date && <span>{new Date(date).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
    {date && readTime && <span aria-hidden="true">·</span>}
    {readTime && <span className="whitespace-nowrap">{readTime}</span>}
  </div>
  const name = <span className={`${article ? 'text-[14px] leading-5 font-semibold text-(--color-text)' : `${textSize} text-(--color-text-secondary) font-medium ${compactMobile ? 'max-[540px]:text-(--color-text-muted)' : ''}`} min-w-0 break-words hover:text-(--color-text) transition-colors capitalize`}>
      {author.username}
    </span>
  const authorContent = <>
    <Avatar src={author.picture} name={author.username} size={article ? 40 : avatarSz} />
    {name}
  </>

  return (
    <div className={`${stacked ? 'flex flex-col items-start gap-1' : 'flex items-center flex-wrap justify-between gap-1'} ${compactMobile ? 'max-[540px]:flex-row max-[540px]:items-center max-[540px]:justify-start max-[540px]:gap-1.5' : ''} min-w-0 flex-1`}>
      {article ? (
        <div className="flex max-w-full min-w-0 min-h-11 items-center gap-3">
          {authorPath ? <Link to={authorPath} aria-label={`Open writer profile for ${author.username}`} className="flex min-h-11 shrink-0 items-center rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2"><Avatar src={author.picture} name={author.username} size={40} /></Link> : <Avatar src={author.picture} name={author.username} size={40} />}
          <div className="flex min-w-0 flex-col gap-1">
            {authorPath ? <Link to={authorPath} aria-label={`View ${author.username}'s profile`} className="self-start max-w-full rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2">{name}</Link> : name}
            {metadata}
          </div>
        </div>
      ) : authorPath ? (
        <Link
          to={authorPath}
          onClick={event => event.stopPropagation()}
          aria-label={`View ${author.username}'s profile`}
          className={`flex max-w-full min-w-0 items-center ${article ? 'min-h-11 gap-3' : 'gap-2'} rounded-[4px] p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2`}
        >
          {authorContent}
        </Link>
      ) : (
        <span className={`flex max-w-full min-w-0 items-center ${article ? 'min-h-11 gap-3' : 'gap-2'} rounded-[4px]`}>
          {authorContent}
        </span>
      )}

      {!stacked && !article && (date || readTime) && <span aria-hidden="true" className="text-(--color-text-muted)">·</span>}

      {/* Meta: date + read time */}
      {!article && metadata}
      {!article && compactMobile && (compactDate || compactReadTime) && <div className="hidden shrink-0 whitespace-nowrap text-[11px] text-(--color-text-muted) max-[540px]:flex max-[540px]:items-center max-[540px]:gap-1">
        <span aria-hidden="true">·</span>
        {compactDate && <span>{compactDate}</span>}
        {compactDate && compactReadTime && <span aria-hidden="true">·</span>}
        {compactReadTime && <span>{compactReadTime}</span>}
      </div>}
    </div>
  )
}
