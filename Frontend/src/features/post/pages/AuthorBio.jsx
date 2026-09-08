import { Link } from 'react-router-dom'
import Avatar from '@/shared/components/ui/Avatar'

export default function AuthorBio({ author }) {
  const name = author?.username || 'Unknown writer'
  const fallbackHandle = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  const handle = author?.handle || fallbackHandle
  return (
      <div className="flex gap-4 p-6 bg-[var(--color-bg-alt)] rounded-[20px]">
        <Avatar src={author?.picture} name={name} size={56} />
        <div>
          <p className="font-bold text-[14px] mb-1 text-[var(--color-text)]">{name}</p>
          <p className="text-[13px] text-[var(--color-text-secondary)] leading-[1.6]">
            {author?.bio || 'This writer has not added a biography yet.'}
          </p>
          <div className="flex gap-2 mt-3">
          <Link to={`/author/${encodeURIComponent(handle)}`} className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-[18px] py-2 text-[12px] font-medium text-[var(--color-text)] transition-all duration-150 hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 sm:min-h-0">View Profile</Link>
          </div>
        </div>
      </div>
  )
}
