import { Link } from 'react-router-dom'
import Avatar from '@/shared/components/ui/Avatar'

export default function AuthorBio({ author }) {
  const name = author?.username || 'Unknown writer'
  const fallbackHandle = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  const handle = author?.handle || fallbackHandle
  return (
      <div className="flex gap-4 p-4 bg-[var(--color-bg-alt)] rounded-[20px]">
        <Avatar src={author?.picture} name={name} size={56} />
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="min-w-[120px] flex-1">
            <p className="mb-1 text-[14px] font-bold text-[var(--color-text)]">{name}</p>
            <p className="text-[13px] leading-[1.6] text-[var(--color-text-secondary)]">
              {author?.bio || 'This writer has not added a biography yet.'}
            </p>
          </div>
          <Link to={`/author/${encodeURIComponent(handle)}`} className="button-target inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-[18px] py-2 text-[12px] font-medium text-[var(--color-text)] transition-all duration-150 hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 sm:min-h-0">View Profile</Link>
        </div>
      </div>
  )
}
