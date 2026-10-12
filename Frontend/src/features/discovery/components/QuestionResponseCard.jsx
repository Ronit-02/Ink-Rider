import { Link } from 'react-router-dom'
import AuthorMeta from '@/shared/components/ui/AuthorMeta'

export default function QuestionResponseCard({ post }) {
  const id = post.id || post._id
  return <article className="rounded-[14px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5">
    <AuthorMeta author={post.author} date={post.createdAt} readTime={post.readTime} size="sm" stacked />
    <h3 className="mt-3 break-words text-[18px] font-bold leading-snug text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>{post.title}</h3>
    {post.excerpt && <p className="mt-2 line-clamp-3 break-words text-[13px] leading-6 text-[var(--color-text-secondary)]">{post.excerpt}</p>}
    <Link to={`/post/${id}`} className="mt-4 inline-flex min-h-11 items-center rounded-[4px] text-[13px] font-semibold text-[var(--color-accent)] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">Read response</Link>
  </article>
}
