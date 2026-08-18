import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import PageFrame from '@/shared/components/layout/PageFrame'
import PageHeader from '@/shared/components/ui/PageHeader'
import Pill from '@/shared/components/ui/Pill'
import Button from '@/shared/components/ui/Button'
import DiscoveryPostCard from '@/features/discovery/components/DiscoveryPostCard'
import CollectionCard from '../components/CollectionCard'
import { PostCardSkeleton } from '@/shared/components/ui/Skeleton'
import { fetchBookmarks } from '@/features/user/api/profile'
import { useSavedCollections } from '../hooks/useCollections'

const getExcerpt = body => {
  try {
    const blocks = JSON.parse(body)
    return blocks.filter(block => !['image', 'divider'].includes(block?.type)).map(block => String(block.content || '')).join(' ').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 180)
  } catch {
    return ''
  }
}

const toStoryPost = post => ({
  id: post._id || post.id,
  title: post.title,
  image: post.coverImage || post.image || null,
  excerpt: getExcerpt(post.body),
  tags: post.tags || [],
  likesCount: post.likesCount || 0,
  commentsCount: post.commentsCount || 0,
  isLiked: Boolean(post.isLiked),
  isBookmarked: true,
  createdAt: post.createdAt,
  readTime: post.readTime || (post.format === 'short' ? 'Short read' : 'Article'),
  author: {
    id: post.author?._id || post.author?.id || null,
    username: post.author?.username || post.author?.displayName || 'Ink Rider writer',
    picture: post.author?.picture || post.author?.avatarUrl || null,
    handle: post.author?.handle || null,
  },
})

function SavedStoryList({ posts }) {
  if (!posts.length) return <p className="py-16 text-center text-[13px] text-[var(--color-text-muted)]">Stories you save will appear here.</p>
  return <div>{posts.map(post => <DiscoveryPostCard key={post._id || post.id} post={toStoryPost(post)} />)}</div>
}

export default function SavedPage() {
  const [params, setParams] = useSearchParams()
  const section = ['stories', 'collections'].includes(params.get('savedSection')) ? params.get('savedSection') : 'stories'
  const sections = ['stories', 'collections']
  const sort = ['latest', 'popular'].includes(params.get('savedSort')) ? params.get('savedSort') : 'latest'
  const updateFilter = (key, value, defaultValue) => {
    setParams(current => {
      const next = new URLSearchParams(current)
    if (value === defaultValue) next.delete(key)
    else next.set(key, value)
      return next
    })
  }
  const handleSectionKeyDown = event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const currentIndex = sections.indexOf(section)
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? sections.length - 1
        : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + sections.length) % sections.length
    const nextSection = sections[nextIndex]
    updateFilter('savedSection', nextSection, 'stories')
    requestAnimationFrame(() => document.querySelectorAll('[role="tab"][aria-controls="saved-tabpanel"]')[nextIndex]?.focus())
  }
  const stories = useQuery({ queryKey: ['me', 'bookmarks'], queryFn: fetchBookmarks, enabled: section === 'stories' })
  const collections = useSavedCollections(sort)
  const savedCollections = collections.data?.pages.flatMap(page => page.data) || []

  return <PageFrame>
    <PageHeader eyebrow="Your library" title="Saved" description="Keep the stories and collections you want to return to." />
    <div className="mb-8 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex max-w-full gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Saved library sections">
        <Pill label="Stories" role="tab" ariaControls="saved-tabpanel" tabIndex={section === 'stories' ? 0 : -1} active={section === 'stories'} onKeyDown={handleSectionKeyDown} onClick={() => updateFilter('savedSection', 'stories', 'stories')} />
        <Pill label="Collections" role="tab" ariaControls="saved-tabpanel" tabIndex={section === 'collections' ? 0 : -1} active={section === 'collections'} onKeyDown={handleSectionKeyDown} onClick={() => updateFilter('savedSection', 'collections', 'stories')} />
      </div>
      {section === 'collections' && <label className="flex items-center justify-between gap-2 text-[11px] text-[var(--color-text-secondary)] sm:justify-end">Sort <select value={sort} onChange={event => updateFilter('savedSort', event.target.value, 'latest')} className="min-h-11 rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-[11px] text-[var(--color-text)] sm:min-h-0"><option value="latest">Latest saved</option><option value="popular">Most saved</option></select></label>}
    </div>
    <div id="saved-tabpanel" role="tabpanel" aria-label={`${section === 'stories' ? 'Stories' : 'Collections'} content`}>
      {section === 'stories' && (stories.isPending ? <div role="status" aria-label="Loading saved stories" className="space-y-4"><PostCardSkeleton compact /><PostCardSkeleton compact /><PostCardSkeleton compact /></div> : stories.isError ? <div className="py-12 text-center"><p role="alert" className="text-[13px] text-[var(--color-danger)]">Saved stories could not be loaded.</p><Button className="mt-4" variant="secondary" onClick={() => stories.refetch()}>Try again</Button></div> : <SavedStoryList posts={stories.data || []} />)}
      {section === 'collections' && (collections.isPending ? <div role="status" aria-label="Loading saved collections" className="card-grid card-grid--collection gap-5"><PostCardSkeleton compact /><PostCardSkeleton compact /></div> : collections.isError ? <div className="py-12 text-center"><p role="alert" className="text-[13px] text-[var(--color-danger)]">Saved collections could not be loaded.</p><Button className="mt-4" variant="secondary" onClick={() => collections.refetch()}>Try again</Button></div> : savedCollections.length ? <><section className="card-grid card-grid--collection gap-5">{savedCollections.map(collection => <CollectionCard key={collection.id} collection={collection} />)}</section>{collections.hasNextPage && <div className="pt-9 text-center"><Button variant="secondary" onClick={() => collections.fetchNextPage()} disabled={collections.isFetchingNextPage}>{collections.isFetchingNextPage ? 'Loading…' : 'Load more'}</Button></div>}</> : <p className="py-16 text-center text-[13px] text-[var(--color-text-muted)]">Collections you save will appear here.</p>)}
    </div>
  </PageFrame>
}
