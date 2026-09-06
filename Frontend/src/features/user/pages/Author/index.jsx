import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import Button from '@/shared/components/ui/Button'
import Avatar from '@/shared/components/ui/Avatar'
import Tag from '@/shared/components/ui/Tag'
import useAuth from '@/features/auth/hooks/useAuth'
import useWriter from '../../hooks/useWriter'
import useWriterFollow from '../../hooks/useWriterFollow'
import useEntitlements from '@/features/membership/hooks/useEntitlements'
import { sendCreatorRequest, supportCreator } from '@/features/membership/api/memberExperience'
import { ListSkeleton, Skeleton } from '@/shared/components/ui/Skeleton'
import PageFrame from '@/shared/components/layout/PageFrame'

const formatJoinedDate = value => new Intl.DateTimeFormat('en', {
  month: 'long',
  year: 'numeric',
}).format(new Date(value))

function WriterPostCard({ post }) {
  return (
    <article className="group min-w-0">
      <Link to={`/post/${post.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] rounded-[14px]">
        {post.image ? (
          <img
            src={post.image}
            alt=""
            className="w-full aspect-[16/10] object-cover rounded-[14px] mb-4 bg-[var(--color-bg-alt)]"
          />
        ) : (
          <div aria-hidden="true" className="w-full aspect-[16/10] rounded-[14px] mb-4 bg-[var(--color-bg-alt)]" />
        )}
        <p className="text-[12px] text-[var(--color-text-muted)] mb-2">
          {post.readTime} · {new Date(post.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
        <h2 className="font-bold text-[18px] leading-[1.35] text-[var(--color-text)] group-hover:underline underline-offset-4"
          style={{ fontFamily: 'var(--font-display)' }}>
          {post.title}
        </h2>
      </Link>
      {post.tags?.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-3">
          {post.tags.slice(0, 3).map(tag => <Tag key={tag} label={tag} clickable />)}
        </div>
      )}
      <p className="text-[12px] text-[var(--color-text-muted)] mt-3 tabular-nums">
        {post.likesCount || 0} appreciations · {post.commentsCount || 0} comments
      </p>
    </article>
  )
}

export default function AuthorPage() {
  const { handle } = useParams()
  const { loggedIn, signIn } = useAuth()
  const [requestOpen, setRequestOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [details, setDetails] = useState('')
  const entitlements = useEntitlements(loggedIn)
  const writerQuery = useWriter(handle)
  const writer = writerQuery.data
  const followMutation = useWriterFollow({ writerId: writer?.id, handle })
  const requestMutation = useMutation({ mutationFn: sendCreatorRequest, onSuccess: () => { setSubject(''); setDetails('') } })
  const supportMutation = useMutation({ mutationFn: supportCreator })

  if (!handle) {
    return (
      <main className="max-w-[720px] mx-auto px-6 py-20 text-center">
        <h1 className="font-bold text-[28px] text-[var(--color-text)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
          Choose a writer to view their profile
        </h1>
        <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">Search for writers by name or explore an article to discover its author.</p>
        <Link
          to="/search?type=writers"
          className="inline-flex items-center justify-center rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-[18px] py-2 text-[13px] font-medium text-[var(--color-text-inverted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2"
        >
          Search writers
        </Link>
      </main>
    )
  }

  if (writerQuery.isLoading) {
    return <main className="max-w-[900px] mx-auto px-6 md:px-8 pt-10 pb-20"><div role="status" aria-label="Loading writer profile"><div className="flex items-start gap-5"><Skeleton className="h-20 w-20 rounded-full" /><div className="flex-1"><Skeleton className="h-7 w-48" /><Skeleton className="mt-3 h-3 w-32" /><Skeleton className="mt-4 h-3 w-full max-w-xl" /></div></div><div className="mt-10"><ListSkeleton count={4} role={undefined} /></div></div></main>
  }

  if (writerQuery.isError) {
    const notFound = writerQuery.error?.response?.status === 404
    return (
      <main className="max-w-[720px] mx-auto px-6 py-20 text-center">
        <div role="alert">
        <h1 className="font-bold text-[28px] text-[var(--color-text)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
          {notFound ? 'Writer not found' : 'Profile unavailable'}
        </h1>
        <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">
          {notFound ? 'This writer handle does not exist.' : 'We could not load this profile. Please try again.'}
        </p>
        {notFound
          ? <Link to="/" className="text-[13px] font-semibold underline underline-offset-4">Return home</Link>
          : <Button variant="secondary" onClick={() => writerQuery.refetch()}>Try again</Button>}
        </div>
      </main>
    )
  }

  const handleFollow = () => {
    if (!loggedIn) return signIn()
    followMutation.mutate(!writer.isFollowing)
  }

  return (
    <main className="max-w-[1080px] mx-auto px-6 md:px-8 pb-20">
      <div className="h-[180px] md:h-[220px] rounded-b-[20px] mb-0 relative overflow-hidden
        bg-[var(--color-bg-alt)] border-x border-b border-[var(--color-border)]">
        <div className="absolute inset-0 opacity-70"
          style={{ backgroundImage: 'radial-gradient(circle at 18% 25%, rgba(138,90,50,.16), transparent 35%), radial-gradient(circle at 78% 65%, rgba(25,25,25,.10), transparent 40%)' }} />
        <span className="absolute bottom-5 right-6 text-[11px] text-[var(--color-text-muted)] tracking-[0.08em] uppercase">
          @{writer.handle}
        </span>
      </div>

      <section className="relative -mt-12 md:-mt-14 px-2 md:px-5 pb-8 border-b border-[var(--color-border)]">
        <div className="flex items-end gap-5 flex-wrap">
          <div className="rounded-full border-4 border-[var(--color-bg)] bg-[var(--color-bg)]">
            <Avatar src={writer.avatarUrl} name={writer.displayName} size={96} />
          </div>

          <div className="flex-1 min-w-[220px] pb-1">
            <h1 className="font-bold text-[28px] tracking-[-0.04em] text-[var(--color-text)] mb-1"
              style={{ fontFamily: 'var(--font-display)' }}>
              {writer.displayName}
            </h1>
            <p className="text-[13px] text-[var(--color-text-muted)]">@{writer.handle}</p>
          </div>

          {!writer.isSelf && (
            <div className="flex gap-2 flex-wrap">
              <Button variant={writer.isFollowing ? 'secondary' : 'primary'} onClick={handleFollow} disabled={followMutation.isPending}>
                {followMutation.isPending ? 'Updating…' : writer.isFollowing ? 'Following' : 'Follow'}
              </Button>
              {loggedIn && entitlements.data?.capabilities?.includes('behind_scenes') && (
                <Button variant="secondary" disabled={supportMutation.isPending || supportMutation.isSuccess} onClick={() => supportMutation.mutate({ creatorId: writer.id })}>
                  {supportMutation.isSuccess ? 'Supported' : 'Support writer'}
                </Button>
              )}
              {writer.directRequestsEnabled && (
                <Button
                  variant="secondary"
                  aria-expanded={loggedIn ? requestOpen : false}
                  aria-controls={loggedIn ? 'direct-request-panel' : undefined}
                  onClick={() => loggedIn ? setRequestOpen(value => !value) : signIn()}
                >
                  Request an article
                </Button>
              )}
            </div>
          )}
        </div>

        <p className="text-[15px] leading-[1.7] text-[var(--color-text-secondary)] max-w-[680px] mt-5">
          {writer.bio || 'This writer has not added a biography yet.'}
        </p>

        <div className="flex items-center gap-6 flex-wrap mt-4 text-[13px] text-[var(--color-text-secondary)]">
          <span><strong className="text-[var(--color-text)] tabular-nums">{writer.followersCount}</strong> followers</span>
          <span><strong className="text-[var(--color-text)] tabular-nums">{writer.posts.length}</strong> articles</span>
          <span>Joined {formatJoinedDate(writer.joinedAt)}</span>
          {writer.websiteUrl && (
            <a href={writer.websiteUrl} target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-4">
              Website
            </a>
          )}
        </div>

        {followMutation.isError && (
          <p role="alert" className="text-[12px] text-[var(--color-danger)] mt-3">
            We couldn't update your follow. Please try again.
          </p>
        )}
        {supportMutation.isError && <p role="alert" className="mt-3 text-[12px] text-[var(--color-danger)]">Creator support could not be updated. Please try again.</p>}
        {requestOpen && (
          <section id="direct-request-panel" aria-labelledby="direct-request-heading" className="mt-5 max-w-[620px] rounded-[16px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-5">
            <h2 id="direct-request-heading" className="font-semibold text-[14px] text-[var(--color-text)]">Direct request to {writer.displayName}</h2>
            {!entitlements.data?.capabilities?.includes('direct_creator_requests') ? (
              <p className="mt-2 text-[12px] text-[var(--color-text-secondary)]">Direct creator requests are available to members.</p>
            ) : requestMutation.isSuccess ? (
              <p role="status" className="mt-2 text-[12px] text-[var(--color-accent)]">Request sent. You have {requestMutation.data.remainingThisMonth} left this month.</p>
            ) : (
              <form
                className="mt-4"
                onSubmit={event => {
                  event.preventDefault()
                  requestMutation.mutate({ creatorId: writer.id, subject, details })
                }}
              >
                <label htmlFor="creator-request-subject" className="block text-[12px] font-semibold text-[var(--color-text)]">Request subject</label>
                <p id="creator-request-subject-help" className="mt-1 text-[11px] text-[var(--color-text-muted)]">Describe the article or question in one line.</p>
                <input
                  id="creator-request-subject"
                  value={subject}
                  maxLength={140}
                  required
                  aria-describedby="creator-request-subject-help creator-request-subject-count"
                  onChange={event => setSubject(event.target.value)}
                  className="mt-2 w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-focus)] focus:ring-2 focus:ring-[var(--color-focus)]/15"
                />
                <p id="creator-request-subject-count" className="mt-1 text-right text-[10px] tabular-nums text-[var(--color-text-muted)]">{subject.length}/140</p>

                <label htmlFor="creator-request-details" className="mt-3 block text-[12px] font-semibold text-[var(--color-text)]">Request details</label>
                <p id="creator-request-details-help" className="mt-1 text-[11px] text-[var(--color-text-muted)]">Add the context that would help the writer respond well.</p>
                <textarea
                  id="creator-request-details"
                  value={details}
                  maxLength={2000}
                  required
                  aria-describedby="creator-request-details-help creator-request-details-count"
                  onChange={event => setDetails(event.target.value)}
                  className="mt-2 min-h-24 w-full resize-y rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-focus)] focus:ring-2 focus:ring-[var(--color-focus)]/15"
                />
                <p id="creator-request-details-count" className="mt-1 text-right text-[10px] tabular-nums text-[var(--color-text-muted)]">{details.length}/2000</p>

                <Button className="mt-3" type="submit" disabled={!subject.trim() || !details.trim() || requestMutation.isPending}>{requestMutation.isPending ? 'Sending…' : 'Send request'}</Button>
                {requestMutation.isError && <p role="alert" className="mt-2 text-[11px] text-[var(--color-danger)]">The request could not be sent. Check your membership and try again.</p>}
              </form>
            )}
          </section>
        )}
      </section>

      <section className="pt-10" aria-labelledby="writer-posts-heading">
        <div className="flex items-end justify-between gap-4 mb-7">
          <div>
            <p className="text-[12px] text-[var(--color-text-muted)] mb-1">Published by {writer.displayName}</p>
            <h2 id="writer-posts-heading" className="font-bold text-[24px] text-[var(--color-text)]"
              style={{ fontFamily: 'var(--font-display)' }}>
              Articles
            </h2>
          </div>
        </div>

        {writer.posts.length > 0 ? (
          <div className="card-grid card-grid--post gap-x-6 gap-y-10">
            {writer.posts.map(post => <WriterPostCard key={post.id} post={post} />)}
          </div>
        ) : (
          <div className="py-14 border-y border-[var(--color-border)]">
            <p className="text-[15px] text-[var(--color-text-secondary)]">No published articles yet.</p>
          </div>
        )}
      </section>
    </main>
  )
}
