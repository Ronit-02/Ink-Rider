import retainRetryView from '@/shared/utils/retainRetryView'
/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role -- The tab container owns tab semantics. */
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useAuth from '@/features/auth/hooks/useAuth'
import Button from '@/shared/components/ui/Button'
import ButtonLink from '@/shared/components/ui/ButtonLink'
import FilterBar from '@/shared/components/ui/FilterBar'
import { ListSkeleton, Skeleton } from '@/shared/components/ui/Skeleton'
import useEntitlements from '@/features/membership/hooks/useEntitlements'
import { openBillingPortal, startMembershipCheckout } from '@/features/membership/api/membership'
import { fetchMyPosts, fetchMyProfile, fetchWriterAnalytics, updateMyProfile } from '../../api/profile'
import { fetchDrafts } from '@/features/editor/api/drafts'
import DeleteDraftButton from '@/features/editor/components/DeleteDraftButton'
import FormatChooser from '@/features/editor/components/FormatChooser'
import { PenIcon } from '@/shared/icons'
import PageHeader from '@/shared/components/ui/PageHeader'
import PageFrame from '@/shared/components/layout/PageFrame'
import useToast from '@/shared/hooks/useToast'
import Avatar from '@/shared/components/ui/Avatar'
import DiscoveryPostCard from '@/features/discovery/components/DiscoveryPostCard'
import PublishedWritingTabs from '../../components/PublishedWritingTabs'
import useWriter from '../../hooks/useWriter'
import SignInPrompt from '@/shared/components/ui/SignInPrompt'
import WritingStudioShortCard from '../../components/WritingStudioShortCard'
import WritingPostRow from '../../components/WritingPostRow'

const WRITING_TABS = [
  { id: 'published', label: 'Published' },
  { id: 'drafts', label: 'Drafts' },
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

function PostRows({ posts = [], emptyMessage, manage = false, gridShorts = false }) {
  if (gridShorts) return <>
    {!posts.length && <p className="py-10 text-center text-[13px] text-[var(--color-text-muted)]">{emptyMessage}</p>}
    {!!posts.length && <div className="card-grid card-grid--short gap-4">{posts.map(post => <WritingStudioShortCard key={post._id || post.id} post={post} />)}</div>}
  </>
  return <div>
    {!posts.length && <p className="py-10 text-center text-[13px] text-[var(--color-text-muted)]">{emptyMessage}</p>}
    {posts.map(post => <WritingPostRow key={post._id || post.id} post={post} manage={manage} />)}
  </div>
}
function ProfileDataError({ message, onRetry }) {
  return <div role="alert"><p className="text-[13px] text-[var(--color-danger)]">{message}</p><Button className="mt-4" variant="secondary" onClick={onRetry}>Try again</Button></div>
}

export default function ProfilePage() {
  const [params] = useSearchParams()
  const location = useLocation()
  const legacyTab = params.get('profileTab')
  const legacyParams = new URLSearchParams(params)
  legacyParams.delete('profileTab')
  const legacyPath = ['posts', 'shorts', 'drafts', 'analytics'].includes(legacyTab) ? '/studio' : ['bookmarks', 'history'].includes(legacyTab) ? '/saved' : null
  if (legacyPath === '/studio') legacyParams.set('writingTab', legacyTab)
  if (legacyTab === 'history') legacyParams.set('libraryTab', 'history')
  const legacyDestination = legacyPath ? `${legacyPath}${legacyParams.size ? `?${legacyParams}` : ''}${location.hash}` : null
  const isReady = useSelector(state => state.auth.isReady)
  const auth = useAuth()
  if (!isReady) return <PageFrame><p role="status" className="text-[13px] text-[var(--color-text-muted)]">Restoring your session…</p></PageFrame>
  const accountActions = <section aria-label="Account" className={`mb-8 border-b border-[var(--color-border)] pb-6 ${auth.loggedIn ? 'md:hidden' : ''}`}>
    <h2 className="mb-3 text-[15px] font-semibold">Account</h2>
    <div className="flex flex-wrap gap-2">
        {[{ to: '/saved', label: 'Library' }, { to: '/studio', label: 'Writing studio' }, { to: '/settings', label: 'Settings' }, { to: '/notifications', label: 'Notifications' }].map(link => <Link key={link.to} to={link.to} className="inline-flex min-h-11 items-center rounded-full border border-[var(--color-border)] px-4 text-[13px]">{link.label}</Link>)}
        <Button variant="secondary" disabled={auth.isSigningOut} aria-busy={auth.isSigningOut} onClick={auth.signOut}>Sign Out</Button>
        <Button variant="secondary" disabled={auth.isSigningOut} aria-busy={auth.isSigningOut} onClick={auth.signOutAllDevices}>Sign Out all Devices</Button>
    </div>
  </section>
  if (!auth.loggedIn) return <PageFrame className="flex min-h-full flex-col !py-6">
    <SignInPrompt message="Sign in to view your profile." />
  </PageFrame>
  if (legacyDestination) return <Navigate to={legacyDestination} replace />
  return <MemberProfile accountActions={accountActions} />
}

export function MemberProfile({ accountActions = null, writing = false }) {
  const [choosingFormat, setChoosingFormat] = useState(false)
  const location = useLocation()
  const TABS = writing ? WRITING_TABS : []
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { notify } = useToast()
  const [params, setParams] = useSearchParams()
  const requestedTab = params.get('writingTab')
  const tab = writing ? (TABS.some(item => item.id === requestedTab) ? requestedTab : 'published') : 'overview'
  const writingFormat = params.get('writingFormat') === 'short' || (requestedTab === 'shorts' && !params.has('writingFormat')) ? 'short' : 'article'
  const draftFormat = params.get('draftFormat') === 'short' ? 'short' : 'article'
  const viewer = useSelector(state => state.auth.user)
  const profile = retainRetryView(useQuery({ queryKey: ['me', 'profile'], queryFn: fetchMyProfile, enabled: !writing }))
  const publishedWriting = retainRetryView(useWriter(!writing ? profile.data?.handle : undefined))
  const publishedFormat = params.get('profileFormat') === 'short' ? 'short' : 'article'
  const publishedSort = ['oldest', 'popular'].includes(params.get('profileSort')) ? params.get('profileSort') : 'latest'
  const visiblePublishedPosts = (publishedWriting.data?.posts || []).filter(post => (post.format || 'article') === publishedFormat).sort((left, right) => {
    const dateOrder = new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    if (publishedSort === 'popular') return (right.likesCount || 0) - (left.likesCount || 0) || dateOrder
    return publishedSort === 'oldest' ? -dateOrder : dateOrder
  })
  const setPublishedFilter = (key, value, defaultValue) => {
    const next = new URLSearchParams(params)
    if (value === defaultValue) next.delete(key)
    else next.set(key, value)
    navigate({ search: next.size ? `?${next}` : '', hash: location.hash }, { preventScrollReset: true })
  }
  const posts = retainRetryView(useQuery({ queryKey: ['me', 'posts', viewer], queryFn: fetchMyPosts, enabled: writing }))
  const drafts = retainRetryView(useQuery({ queryKey: ['me', 'drafts'], queryFn: fetchDrafts, enabled: tab === 'drafts' }))
  const entitlements = useEntitlements(writing && tab === 'analytics')
  const canViewAnalytics = entitlements.data?.capabilities?.includes('writer_analytics')
  const analytics = retainRetryView(useQuery({ queryKey: ['me', 'analytics'], queryFn: fetchWriterAnalytics, enabled: tab === 'analytics' && canViewAnalytics }))
  const updateProfile = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me', 'profile'] })
      notify('Profile updated.')
    },
    onError: () => notify('Your profile could not be updated.', { tone: 'error' }),
  })
  const billing = useMutation({
    mutationFn: () => entitlements.data?.membership?.status === 'active' ? openBillingPortal() : startMembershipCheckout(),
    onSuccess: data => { window.location.assign(data.portalUrl || data.checkoutUrl) },
    onError: () => notify('Billing is temporarily unavailable.', { tone: 'error' }),
  })

  const setTab = nextTab => {
    const next = new URLSearchParams(params)
    if (requestedTab === 'shorts' && !next.has('writingFormat')) next.set('writingFormat', 'short')
    if (nextTab === 'published') next.delete('writingTab')
    else next.set('writingTab', nextTab)
    setParams(next, { replace: true })
  }
  const setWritingFormat = (key, format) => {
    const next = new URLSearchParams(params)
    if (format === 'article') next.delete(key)
    else next.set(key, format)
    if (key === 'writingFormat' && ['posts', 'shorts'].includes(next.get('writingTab'))) next.delete('writingTab')
    setParams(next, { replace: true, preventScrollReset: true })
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
    requestAnimationFrame(() => document.querySelectorAll('[role="tab"][aria-controls="writing-tabpanel"]')[nextIndex]?.focus())
  }


  if (writing && posts.isLoading) return <PageFrame><PageHeader eyebrow="Publishing" title="Writing studio" /><div role="status" aria-label="Loading posts"><ListSkeleton count={4} role={undefined} /></div></PageFrame>
  if (!writing && profile.isLoading) return <PageFrame>{accountActions}<div role="status" aria-label="Loading profile"><div className="flex items-start gap-5"><Skeleton className="h-20 w-20 shrink-0 rounded-full" /><div className="flex-1"><Skeleton className="h-7 w-48" /><Skeleton className="mt-3 h-3 w-72" /><Skeleton className="mt-2 h-3 w-full max-w-xl" /></div></div><div className="mt-10 grid gap-[14px] sm:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="rounded-[14px] border border-[var(--color-border)] p-5"><Skeleton className="h-7 w-16" /><Skeleton className="mt-2 h-3 w-24" /></div>)}</div><div className="mt-10"><ListSkeleton count={4} role={undefined} /></div></div></PageFrame>
  if (!writing && profile.isError) return <PageFrame>{accountActions}<div><p role="alert" className="text-[13px] text-[var(--color-danger)]">We couldn’t load your profile.</p><Button variant="secondary" className="mt-4" onClick={() => profile.refetch()} aria-busy={profile.isFetching} disabled={profile.isFetching}>Try again</Button></div></PageFrame>
  const me = profile.data || {}

  return (
    <PageFrame>
      {writing && <PageHeader eyebrow="Publishing" title="Writing studio" description="Manage published posts, continue drafts, and view writing analytics." actions={<button type="button" onClick={() => setChoosingFormat(true)} className="button-target inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-[18px] py-2 text-[13px] font-medium whitespace-nowrap text-[var(--color-text-inverted)] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 sm:min-h-0">Write a post</button>} />}
      {!writing && <header className="flex gap-5 mb-8 items-start flex-wrap">
        <Avatar src={me.avatarUrl} name={me.displayName} size={80} />
        <div className="flex-1 min-w-[240px]">
          <>
              <h1 className="font-bold text-[24px] text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>{me.displayName}</h1>
              {me.handle && <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">@{me.handle}</p>}
              <p className="mt-3 max-w-2xl text-[13px] leading-[1.65] text-[var(--color-text-secondary)]">{me.bio || 'Add a short biography so readers know what you write about.'}</p>
              <p className="mt-2 text-[11px] text-[var(--color-text-muted)]">Member since {new Date(me.joinedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
          </>
        </div>
        <div className="flex flex-wrap gap-2">
          {me.writerStatus === 'writer' && <Link to="/opportunities" className="button-target inline-flex min-h-10 items-center rounded-full border border-[var(--color-border)] px-4 py-2 text-[12px] font-semibold text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 sm:min-h-0">Find reader demand</Link>}
        {['moderator', 'admin'].includes(me.role) && <Link to="/staff" className="button-target ml-auto inline-flex min-h-10 shrink-0 items-center whitespace-nowrap rounded-full border border-[var(--color-border)] px-4 py-2 text-[12px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 sm:min-h-0">Open staff console</Link>}
          <Button variant="secondary" onClick={() => navigate(`/profile/edit${params.size ? `?${params}` : ''}`)}>Edit profile</Button>
        </div>
      </header>}
      {accountActions}

      {updateProfile.isError && <p role="alert" className="mb-5 text-[12px] text-[var(--color-danger)]">{updateProfile.error?.response?.data?.message || 'Profile update failed.'}</p>}

      {writing && <nav aria-label="Writing sections" className="mb-8 flex max-w-full gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b border-[var(--color-border)]" role="tablist">
        {TABS.map(item => <button key={item.id} type="button" role="tab" aria-controls="writing-tabpanel" aria-selected={tab === item.id} tabIndex={tab === item.id ? 0 : -1} onKeyDown={handleTabKeyDown} onClick={() => setTab(item.id)} className={`button-target inline-flex min-h-11 shrink-0 items-center rounded-t-[10px] border-b-2 px-3 py-2 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 sm:min-h-0 ${tab === item.id ? 'border-[var(--color-accent)] text-[var(--color-text)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>{item.label}</button>)}

      </nav>}

      <div id={writing ? "writing-tabpanel" : undefined} role={writing ? "tabpanel" : undefined} aria-label={`${TABS.find(item => item.id === tab)?.label || 'Overview'} content`}>
      {!writing && <div className="flex flex-col gap-8"><div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))' }}><StatCard label="Published posts" value={me.postCount} /><StatCard label="Followers" value={me.followersCount} /><StatCard label="Following" value={me.followingCount} /><StatCard label="Account type" value={me.writerStatus === 'writer' ? 'Writer' : 'Reader'} /></div>{me.writerStatus === 'writer' && <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-5 flex items-center justify-between gap-4"><div><h2 className="text-[14px] font-semibold text-[var(--color-text)]">Direct member requests</h2><p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">Choose whether members can send you up to three private requests per month.</p></div><Button variant={me.directRequestsEnabled ? 'primary' : 'secondary'} disabled={updateProfile.isPending} onClick={() => updateProfile.mutate({ directRequestsEnabled: !me.directRequestsEnabled })} aria-busy={updateProfile.isPending}>{me.directRequestsEnabled ? 'Accepting requests' : 'Requests off'}</Button></section>}</div>}
      {!writing && <section className="pt-10" aria-labelledby="profile-posts-heading">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-1 text-[12px] text-[var(--color-text-muted)]">Published by {me.displayName}</p><h2 id="profile-posts-heading" className="text-[24px] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>Your published writing</h2></div><ButtonLink to="/studio" variant="secondary">Edit in Writing studio</ButtonLink></div>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4"><PublishedWritingTabs value={publishedFormat} onChange={value => setPublishedFilter('profileFormat', value, 'article')} controlsId="profile-writing-panel" /><FilterBar label="Published writing" options={[]} sortOptions={[{ id: 'latest', label: 'Newest' }, { id: 'oldest', label: 'Oldest' }, { id: 'popular', label: 'Most appreciated' }]} sortValue={publishedSort} onSortChange={value => setPublishedFilter('profileSort', value, 'latest')} onReset={() => setPublishedFilter('profileSort', 'latest', 'latest')} /></div>
        <div id="profile-writing-panel" role="tabpanel" aria-label={`${publishedFormat === 'short' ? 'Shorts' : 'Posts'} content`}>
        {publishedWriting.isLoading ? <ListSkeleton label="Loading published writing" />
          : publishedWriting.isError ? <ProfileDataError message="Published writing could not be loaded." onRetry={() => publishedWriting.refetch()} />
          : visiblePublishedPosts.length ? <div className={`${publishedFormat === 'short' ? 'card-grid card-grid--short' : 'grid grid-cols-1 min-[540px]:grid-cols-2 lg:grid-cols-3'} gap-x-6 gap-y-10`}>{visiblePublishedPosts.map(post => <DiscoveryPostCard key={post.id} post={post} variant="grid" />)}</div>
          : <div className="border-y border-[var(--color-border)] py-14"><p className="text-[15px] text-[var(--color-text-secondary)]">{publishedFormat === 'short' ? 'No published shorts yet.' : 'No published posts yet.'}</p></div>}
        </div>
      </section>}
      {writing && tab === 'published' && <div className="mb-6"><PublishedWritingTabs value={writingFormat} onChange={value => setWritingFormat('writingFormat', value)} controlsId="studio-published-panel" firstLabel="Stories" ariaLabel="Published categories" /></div>}
      {writing && tab === 'published' && <div id="studio-published-panel" role="tabpanel" aria-label={`${writingFormat === 'short' ? 'Shorts' : 'Stories'} content`}>
      {posts.isError ? <ProfileDataError message="Published posts could not be loaded." onRetry={() => posts.refetch()} /> : <PostRows posts={(posts.data || []).filter(post => (post.format || 'article') === writingFormat)} manage gridShorts={writingFormat === 'short'} emptyMessage={`You haven’t published any ${writingFormat === 'short' ? 'shorts' : 'stories'} yet.`} />}</div>}
      {writing && tab === 'drafts' && <div className="mb-6"><PublishedWritingTabs value={draftFormat} onChange={value => setWritingFormat('draftFormat', value)} controlsId="studio-drafts-panel" firstLabel="Stories" ariaLabel="Draft categories" /></div>}
      {tab === 'drafts' && <div id={writing ? 'studio-drafts-panel' : undefined} role={writing ? 'tabpanel' : undefined} aria-label={writing ? `${draftFormat === 'short' ? 'Shorts' : 'Stories'} drafts` : undefined}>{drafts.isLoading ? <div role="status" aria-label="Loading drafts"><ListSkeleton count={4} role={undefined} /></div> : drafts.isError ? <ProfileDataError message="Drafts could not be loaded." onRetry={() => drafts.refetch()} /> : (writing ? drafts.data?.filter(draft => (draft.format || 'article') === draftFormat) : drafts.data)?.length ? <div>{(writing ? drafts.data.filter(draft => (draft.format || 'article') === draftFormat) : drafts.data).map(draft => <div key={draft._id} className="flex min-w-0 items-center gap-3 border-b border-[var(--color-border)] py-7 sm:gap-5 sm:py-8"><div className="min-w-0 flex-1"><p className="font-semibold text-[16px] leading-[1.4] text-[var(--color-text)] [overflow-wrap:anywhere] sm:text-[18px]">{draft.title || 'Untitled draft'}</p><p className="mt-2 text-[12px] leading-5 text-[var(--color-text-muted)]">{draft.format === 'short' ? 'Short' : 'Article'} · Saved {new Date(draft.updatedAt).toLocaleString()}</p></div><div className="flex shrink-0 items-center gap-1 sm:gap-2"><Link to={`/studio?draft=${draft._id}`} aria-label={`Continue writing: ${draft.title || 'Untitled draft'}`} title="Continue writing" className="flex h-11 w-11 items-center justify-center rounded-[10px] text-[var(--color-accent)] hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus:ring-[var(--color-focus)]"><PenIcon /></Link><DeleteDraftButton draft={draft} /></div></div>)}</div> : <p className="py-10 text-center text-[13px] text-[var(--color-text-muted)]">{writing ? `No ${draftFormat === 'short' ? 'short' : 'story'} drafts yet.` : 'Your autosaved drafts will appear here.'}</p>}</div>}
      {tab === 'analytics' && (entitlements.isPending ? <p role="status">Checking analytics access...</p> : entitlements.isError ? <ProfileDataError message="Analytics access could not be loaded." onRetry={() => entitlements.refetch()} /> : null)}
      {tab === 'analytics' && !entitlements.isPending && !entitlements.isError && !canViewAnalytics && <section className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-7 text-center"><h2 className="font-semibold text-[16px] text-[var(--color-text)]">Advanced writer analytics</h2><p className="mt-2 text-[13px] text-[var(--color-text-secondary)]">See opens, completions, engagement, and completion rate with membership.</p><Button className="mt-5" disabled={billing.isPending} onClick={() => billing.mutate()} aria-busy={billing.isPending}>{'Become a member'}</Button></section>}
      {tab === 'analytics' && canViewAnalytics && (analytics.isLoading ? <div role="status" aria-label="Loading writer analytics"><ListSkeleton count={5} role={undefined} /></div> : analytics.isError ? <ProfileDataError message="Analytics could not be loaded." onRetry={() => analytics.refetch()} /> : analytics.data && <div className="flex flex-col gap-7"><div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))' }}><StatCard label="Article opens" value={analytics.data.totalViews} /><StatCard label="Completed reads" value={analytics.data.totalCompletions} /><StatCard label="Completion rate" value={`${analytics.data.completionRate}%`} /><StatCard label="Published posts" value={analytics.data.totalPosts} /></div><section><h2 className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-3">Post performance</h2>{analytics.data.posts.map(post => <div key={post.id} className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-4 py-3 border-b border-[var(--color-border)] text-[12px]"><Link to={`/post/${post.id}`} className="font-semibold text-[var(--color-text)] truncate">{post.title}</Link><span className="text-[var(--color-text-muted)]">{post.opens} opens</span><span className="text-[var(--color-text-muted)]">{post.completions} completed</span><span className="text-[var(--color-text-muted)]">{post.likes} likes</span></div>)}</section></div>)}
      </div>
      {writing && billing.isError && <p role="alert" className="mt-4 text-[12px] text-[var(--color-danger)]">Billing is temporarily unavailable.</p>}
      {writing && choosingFormat && <FormatChooser loggedIn={Boolean(viewer)} onClose={() => setChoosingFormat(false)} />}
    </PageFrame>
  )
}
