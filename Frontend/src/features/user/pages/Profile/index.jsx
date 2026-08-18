import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '@/shared/components/ui/Button'
import Pill from '@/shared/components/ui/Pill'
import AuthorMeta from '@/shared/components/ui/AuthorMeta'
import { ListSkeleton, PostCardSkeleton, Skeleton } from '@/shared/components/ui/Skeleton'
import useEntitlements from '@/features/membership/hooks/useEntitlements'
import { openBillingPortal, startMembershipCheckout } from '@/features/membership/api/membership'
import { fetchBookmarks, fetchMyPosts, fetchMyProfile, fetchWriterAnalytics, setPostPublication, updateMyProfile } from '../../api/profile'
import { fetchDrafts } from '@/features/editor/api/drafts'
import useReadingHistory from '@/features/discovery/hooks/useReadingHistory'
import PageFrame from '@/shared/components/layout/PageFrame'
import useToast from '@/shared/hooks/useToast'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'posts', label: 'My Posts' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'bookmarks', label: 'Bookmarks' },
  { id: 'history', label: 'Reading history' },
  { id: 'analytics', label: 'Analytics' },
]

function StatCard({ label, value, sub }) {
  return (
    <div className="px-5 py-4 bg-[var(--color-bg-alt)] rounded-[14px] border border-[var(--color-border)]">
      <p className="font-bold text-[22px] text-[var(--color-text)] mb-0.5">{value}</p>
      <p className="text-[12px] text-[var(--color-text-secondary)]">{label}</p>
      {sub && <p className="text-[11px] text-[var(--color-text-muted)] mt-1">{sub}</p>}
    </div>
  )
}

function PostRows({ posts = [], emptyMessage, manage = false }) {
  const queryClient = useQueryClient()
  const { notify } = useToast()
  const publication = useMutation({ mutationFn: setPostPublication, onSuccess: (_, input) => { queryClient.invalidateQueries({ queryKey: ['me', 'posts'] }); notify(input.status === 'published' ? 'Post republished.' : 'Post unpublished.') }, onError: () => notify('The post publication status could not be updated.', { tone: 'error' }) })
  if (!posts.length) return <p className="py-10 text-center text-[13px] text-[var(--color-text-muted)]">{emptyMessage}</p>
  return (
    <div className="border-t border-[var(--color-border)]">
      {posts.map(post => (
        <div key={post._id || post.id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-3 py-4 border-b border-[var(--color-border)] group sm:flex sm:items-center sm:gap-4">
          {post.coverImage ? <img src={post.coverImage} alt="" className="w-20 h-14 rounded-[10px] object-cover bg-[var(--color-bg-alt)]" /> : <div className="w-20 h-14 rounded-[10px] bg-[var(--color-bg-alt)]" />}
          <div className="min-w-0 flex-1">
            <Link to={`/post/${post._id || post.id}`} className="font-semibold text-[14px] text-[var(--color-text)] truncate group-hover:text-[var(--color-accent)] block">{post.title}</Link>
            <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">{post.format === 'short' ? 'Short' : 'Article'} · {new Date(post.createdAt).toLocaleDateString()}{post.publicationStatus === 'unpublished' ? ' · Unpublished' : ''}</p>
          </div>
          {post.likesCount !== undefined && <span className="col-start-2 text-[11px] text-[var(--color-text-muted)] sm:shrink-0">{post.likesCount} likes</span>}
          {manage && <div className="col-start-2 flex w-full gap-2 sm:w-auto"><Link to={`/write?edit=${post._id}`} className="inline-flex min-h-10 flex-1 items-center justify-center px-3 py-1.5 rounded-full border border-[var(--color-border)] text-[11px] font-semibold sm:min-h-0 sm:flex-none">Edit</Link><button type="button" disabled={publication.isPending} onClick={() => publication.mutate({ postId: post._id, status: post.publicationStatus === 'unpublished' ? 'published' : 'unpublished' })} className="min-h-10 flex-1 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-[11px] font-semibold disabled:opacity-50 sm:min-h-0 sm:flex-none">{post.publicationStatus === 'unpublished' ? 'Republish' : 'Unpublish'}</button></div>}
        </div>
      ))}
    </div>
  )
}

function HistoryRow({ item }) {
  return <Link to={`/post/${item.id}`} className="block py-5 border-b border-[var(--color-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2"><AuthorMeta author={item.author} date={item.lastReadAt} readTime={item.readTime} /><h2 className="mt-3 text-[17px] font-bold text-[var(--color-text)]">{item.title}</h2><div className="mt-3 flex items-center gap-3"><div className="h-1.5 flex-1 max-w-64 rounded-full bg-[var(--color-bg-alt)] overflow-hidden"><div className="h-full bg-[var(--color-accent)]" style={{ width: `${item.progress}%` }} /></div><span className="text-[11px] text-[var(--color-text-muted)]">{item.completed ? 'Completed' : item.progress ? `${item.progress}% read` : 'Opened'}</span></div></Link>
}

function ProfileDataError({ message, onRetry }) {
  return <div role="alert"><p className="text-[13px] text-[var(--color-danger)]">{message}</p><Button className="mt-4" variant="secondary" onClick={onRetry}>Try again</Button></div>
}

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const { notify } = useToast()
  const [params, setParams] = useSearchParams()
  const requestedTab = params.get('profileTab')
  const tab = TABS.some(item => item.id === requestedTab) ? requestedTab : 'overview'
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const profile = useQuery({ queryKey: ['me', 'profile'], queryFn: fetchMyProfile })
  const posts = useQuery({ queryKey: ['me', 'posts'], queryFn: fetchMyPosts })
  const bookmarks = useQuery({ queryKey: ['me', 'bookmarks'], queryFn: fetchBookmarks, enabled: tab === 'bookmarks' })
  const drafts = useQuery({ queryKey: ['me', 'drafts'], queryFn: fetchDrafts, enabled: tab === 'drafts' })
  const history = useReadingHistory()
  const entitlements = useEntitlements(true)
  const canViewAnalytics = entitlements.data?.capabilities?.includes('writer_analytics')
  const analytics = useQuery({ queryKey: ['me', 'analytics'], queryFn: fetchWriterAnalytics, enabled: tab === 'analytics' && canViewAnalytics })
  const updateProfile = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me', 'profile'] })
      setEditing(false)
      notify('Profile updated.')
    },
    onError: () => notify('Your profile could not be updated.', { tone: 'error' }),
  })
  const billing = useMutation({
    mutationFn: () => entitlements.data?.membership?.status === 'active' ? openBillingPortal() : startMembershipCheckout(),
    onSuccess: data => { window.location.assign(data.portalUrl || data.checkoutUrl) },
    onError: () => notify('Billing is temporarily unavailable.', { tone: 'error' }),
  })
  const submitProfile = event => {
    event.preventDefault()
    if (!name.trim() || updateProfile.isPending) return
    updateProfile.mutate({ username: name.trim(), bio: bio.trim() })
  }

  const setTab = nextTab => {
    const next = new URLSearchParams(params)
    if (nextTab === 'overview') next.delete('profileTab')
    else next.set('profileTab', nextTab)
    setParams(next, { replace: true })
  }
  const handleTabKeyDown = event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const currentIndex = TABS.findIndex(item => item.id === tab)
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? TABS.length - 1
        : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length
    const nextTab = TABS[nextIndex]
    setTab(nextTab.id)
    requestAnimationFrame(() => document.querySelectorAll('[role="tab"][aria-controls="profile-tabpanel"]')[nextIndex]?.focus())
  }

  useEffect(() => {
    if (!profile.data) return
    setName(profile.data.displayName || '')
    setBio(profile.data.bio || '')
  }, [profile.data])

  if (profile.isLoading || posts.isLoading) return <PageFrame><div role="status" aria-label="Loading profile"><div className="flex items-start gap-5"><Skeleton className="h-20 w-20 shrink-0 rounded-full" /><div className="flex-1"><Skeleton className="h-7 w-48" /><Skeleton className="mt-3 h-3 w-72" /><Skeleton className="mt-2 h-3 w-full max-w-xl" /></div></div><div className="mt-10 grid gap-[14px] sm:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="rounded-[14px] border border-[var(--color-border)] p-5"><Skeleton className="h-7 w-16" /><Skeleton className="mt-2 h-3 w-24" /></div>)}</div><div className="mt-10"><ListSkeleton count={4} role={undefined} /></div></div></PageFrame>
  if (profile.isError) return <PageFrame><div><p role="alert" className="text-[13px] text-[var(--color-danger)]">We couldn’t load your profile.</p><Button variant="secondary" className="mt-4" onClick={() => profile.refetch()}>Try again</Button></div></PageFrame>
  const me = profile.data
  const recentPosts = posts.data?.slice(0, 4) || []

  return (
    <PageFrame>
      <header className="flex gap-5 mb-8 items-start flex-wrap">
        {me.avatarUrl ? <img src={me.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover border-[3px] border-[var(--color-border)]" /> : <div className="w-20 h-20 rounded-full bg-[var(--color-bg-alt)] border-[3px] border-[var(--color-border)] flex items-center justify-center text-[24px] font-bold">{me.displayName?.[0]?.toUpperCase()}</div>}
        <div className="flex-1 min-w-[240px]">
          {editing ? (
            <form id="profile-edit-form" className="flex flex-col gap-2" onSubmit={submitProfile}>
              <label htmlFor="profile-display-name" className="text-[11px] font-semibold text-[var(--color-text-muted)]">Display name <span aria-hidden="true">(required)</span><input id="profile-display-name" required minLength={1} maxLength={80} value={name} aria-describedby="profile-display-name-help" onChange={event => setName(event.target.value)} className="mt-1 w-full text-[20px] font-bold border border-[var(--color-border)] rounded-[10px] px-3 py-2 bg-[var(--color-bg-alt)] text-[var(--color-text)]" /></label>
              <p id="profile-display-name-help" className="text-right text-[11px] text-[var(--color-text-muted)]">{name.length}/80 characters</p>
              <label htmlFor="profile-biography" className="text-[11px] font-semibold text-[var(--color-text-muted)]">Biography <span className="font-normal">(optional)</span><textarea id="profile-biography" maxLength={500} value={bio} aria-describedby="profile-biography-help" onChange={event => setBio(event.target.value)} className="mt-1 h-24 w-full text-[13px] border border-[var(--color-border)] rounded-[10px] px-3 py-2 bg-[var(--color-bg-alt)] text-[var(--color-text)] resize-y" /></label>
              <p id="profile-biography-help" className="text-right text-[11px] text-[var(--color-text-muted)]">{bio.length}/500 characters</p>
            </form>
          ) : (
            <>
              <h1 className="font-bold text-[24px] text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>{me.displayName}</h1>
              {me.handle && <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">@{me.handle}</p>}
              <p className="mt-3 max-w-2xl text-[13px] leading-[1.65] text-[var(--color-text-secondary)]">{me.bio || 'Add a short biography so readers know what you write about.'}</p>
              <p className="mt-2 text-[11px] text-[var(--color-text-muted)]">Member since {new Date(me.joinedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {me.writerStatus === 'writer' && <Link to="/opportunities" className="inline-flex min-h-10 items-center rounded-full border border-[var(--color-border)] px-4 py-2 text-[12px] font-semibold text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 sm:min-h-0">Find reader demand</Link>}
          {editing ? <><Button type="button" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button><Button type="submit" form="profile-edit-form" disabled={!name.trim() || updateProfile.isPending}>{updateProfile.isPending ? 'Saving…' : 'Save'}</Button></> : <Button variant="secondary" onClick={() => setEditing(true)}>Edit profile</Button>}
        </div>
      </header>

      {updateProfile.isError && <p role="alert" className="mb-5 text-[12px] text-[var(--color-danger)]">{updateProfile.error?.response?.data?.message || 'Profile update failed.'}</p>}

      <section className="mb-7 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-5 flex items-center justify-between gap-4 flex-wrap">
        <div><p className="text-[13px] font-semibold text-[var(--color-text)]">{entitlements.data?.membership?.status === 'active' ? 'Ink-Rider member' : 'Free membership'}</p><p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">Primary articles stay free. Membership adds summaries, audio, workshops, and creator extras.</p></div>
        <Button disabled={billing.isPending} onClick={() => billing.mutate()}>{billing.isPending ? 'Opening…' : entitlements.data?.membership?.status === 'active' ? 'Manage membership' : 'Become a member'}</Button>
      </section>
      {billing.isError && <p role="alert" className="-mt-4 mb-6 text-[12px] text-[var(--color-danger)]">{billing.error?.response?.data?.message || 'Billing is temporarily unavailable.'}</p>}

      <nav aria-label="Profile sections" className="mb-8 flex max-w-full gap-[6px] overflow-x-auto pb-1" role="tablist">
        {TABS.map(item => <Pill key={item.id} label={item.label} role="tab" ariaControls="profile-tabpanel" tabIndex={tab === item.id ? 0 : -1} active={tab === item.id} onKeyDown={handleTabKeyDown} onClick={() => setTab(item.id)} />)}
        {['moderator', 'admin'].includes(me.role) && <Link to="/staff" className="ml-auto inline-flex min-h-10 shrink-0 items-center whitespace-nowrap rounded-full border border-[var(--color-border)] px-4 py-2 text-[12px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 sm:min-h-0">Open staff console</Link>}
      </nav>

      <div id="profile-tabpanel" role="tabpanel" aria-label={`${TABS.find(item => item.id === tab)?.label || 'Overview'} content`}>
      {tab === 'overview' && <div className="flex flex-col gap-8"><div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))' }}><StatCard label="Published posts" value={me.postCount} /><StatCard label="Followers" value={me.followersCount} /><StatCard label="Following" value={me.followingCount} /><StatCard label="Account type" value={me.writerStatus === 'writer' ? 'Writer' : 'Reader'} /></div>{me.writerStatus === 'writer' && <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-5 flex items-center justify-between gap-4"><div><h2 className="text-[14px] font-semibold text-[var(--color-text)]">Direct member requests</h2><p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">Choose whether members can send you up to three private requests per month.</p></div><Button variant={me.directRequestsEnabled ? 'primary' : 'secondary'} disabled={updateProfile.isPending} onClick={() => updateProfile.mutate({ directRequestsEnabled: !me.directRequestsEnabled })}>{me.directRequestsEnabled ? 'Accepting requests' : 'Requests off'}</Button></section>}<section><h2 className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-3">Recent posts</h2>{posts.isError ? <ProfileDataError message="Published posts could not be loaded." onRetry={() => posts.refetch()} /> : <PostRows posts={recentPosts} emptyMessage="You haven’t published anything yet." />}</section></div>}
      {tab === 'posts' && (posts.isError ? <ProfileDataError message="Published posts could not be loaded." onRetry={() => posts.refetch()} /> : <PostRows posts={posts.data} manage emptyMessage="You haven’t published anything yet." />)}
      {tab === 'drafts' && (drafts.isLoading ? <div role="status" aria-label="Loading drafts"><ListSkeleton count={4} role={undefined} /></div> : drafts.isError ? <ProfileDataError message="Drafts could not be loaded." onRetry={() => drafts.refetch()} /> : drafts.data?.length ? <div className="border-t border-[var(--color-border)]">{drafts.data.map(draft => <Link key={draft._id} to={`/write?draft=${draft._id}`} className="flex items-center justify-between gap-4 py-4 border-b border-[var(--color-border)]"><div className="min-w-0"><p className="font-semibold text-[14px] text-[var(--color-text)] truncate">{draft.title || 'Untitled draft'}</p><p className="mt-1 text-[11px] text-[var(--color-text-muted)]">{draft.format === 'short' ? 'Short' : 'Article'} · Saved {new Date(draft.updatedAt).toLocaleString()}</p></div><span className="text-[12px] font-semibold text-[var(--color-accent)]">Continue writing →</span></Link>)}</div> : <p className="py-10 text-center text-[13px] text-[var(--color-text-muted)]">Your autosaved drafts will appear here.</p>)}
      {tab === 'bookmarks' && (bookmarks.isLoading ? <div role="status" aria-label="Loading saved articles" className="card-grid card-grid--post gap-4">{Array.from({ length: 4 }, (_, index) => <PostCardSkeleton key={index} compact />)}</div> : bookmarks.isError ? <div><p role="alert" className="text-[13px] text-[var(--color-danger)]">Saved articles could not be loaded.</p><Button className="mt-4" variant="secondary" onClick={() => bookmarks.refetch()}>Try again</Button></div> : <PostRows posts={bookmarks.data} emptyMessage="Saved articles will appear here." />)}
      {tab === 'history' && (history.isPending ? <div role="status" aria-label="Loading reading history"><ListSkeleton count={4} role={undefined} /></div> : history.isError ? <div><p role="alert" className="text-[13px] text-[var(--color-danger)]">Reading history could not be loaded.</p><Button className="mt-4" onClick={() => history.refetch()}>Try again</Button></div> : <div>{history.data.continueReading.length > 0 && <section className="mb-8"><h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">Continue reading</h2>{history.data.continueReading.map(item => <HistoryRow key={item.id} item={item} />)}</section>}<section><h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">Recent history</h2>{history.data.history.map(item => <HistoryRow key={item.id} item={item} />)}{history.data.history.length === 0 && <p className="py-10 text-center text-[13px] text-[var(--color-text-muted)]">Articles and shorts you open will appear here.</p>}</section></div>)}
      {tab === 'analytics' && !canViewAnalytics && <section className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-7 text-center"><h2 className="font-semibold text-[16px] text-[var(--color-text)]">Advanced writer analytics</h2><p className="mt-2 text-[13px] text-[var(--color-text-secondary)]">See opens, completions, engagement, and completion rate with membership.</p><Button className="mt-5" disabled={billing.isPending} onClick={() => billing.mutate()}>{billing.isPending ? 'Opening checkout…' : 'Become a member'}</Button></section>}
      {tab === 'analytics' && canViewAnalytics && (analytics.isLoading ? <div role="status" aria-label="Loading writer analytics"><ListSkeleton count={5} role={undefined} /></div> : analytics.isError ? <ProfileDataError message="Analytics could not be loaded." onRetry={() => analytics.refetch()} /> : analytics.data && <div className="flex flex-col gap-7"><div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))' }}><StatCard label="Article opens" value={analytics.data.totalViews} /><StatCard label="Completed reads" value={analytics.data.totalCompletions} /><StatCard label="Completion rate" value={`${analytics.data.completionRate}%`} /><StatCard label="Published posts" value={analytics.data.totalPosts} /></div><section><h2 className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-3">Post performance</h2>{analytics.data.posts.map(post => <div key={post.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 py-3 border-b border-[var(--color-border)] text-[12px]"><Link to={`/post/${post.id}`} className="font-semibold text-[var(--color-text)] truncate">{post.title}</Link><span className="text-[var(--color-text-muted)]">{post.opens} opens</span><span className="text-[var(--color-text-muted)]">{post.completions} completed</span><span className="text-[var(--color-text-muted)]">{post.likes} likes</span></div>)}</section></div>)}
      </div>
    </PageFrame>
  )
}
