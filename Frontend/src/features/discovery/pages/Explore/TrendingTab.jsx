import retainRetryView from '@/shared/utils/retainRetryView'
import { useSearchParams } from 'react-router-dom'
import useDiscoveryFeed from '../../hooks/useDiscoveryFeed'
import DiscoveryPostCard from '../../components/DiscoveryPostCard'
import FeaturedPostCard from '../../components/FeaturedPostCard'
import PageHeader from '@/shared/components/ui/PageHeader'
import SectionHeading from '@/shared/components/ui/SectionHeading'
import { PostFeedSkeleton } from '@/shared/components/ui/Skeleton'
import FilterBar from '@/shared/components/ui/FilterBar'

export default function TrendingTab() {
  const [params, setParams] = useSearchParams()
  const requestedSort = params.get('trendingSort')
  const sort = ['popular', 'latest'].includes(requestedSort) ? requestedSort : 'popular'
  const feed = retainRetryView(useDiscoveryFeed('popular', sort))
  const requestedTopic = params.get('trendingTopic')
  const topic = ['all', 'science', 'design', 'wellness', 'career'].includes(requestedTopic) ? requestedTopic : 'all'
  const posts = feed.data?.pages.flatMap(page => page.data) || []
  const filteredPosts = topic === 'all' ? posts : posts.filter(post => (post.tags || []).some(tag => tag.toLowerCase() === topic))
  const articleOfDay = posts.find(post => post.format !== 'short')
  const resetFilters = () => {
    setParams(current => {
      const next = new URLSearchParams(current)
      next.delete('trendingTopic')
      next.delete('trendingSort')
      return next
    })
  }
  const updateFilter = (key, value, defaultValue) => {
    setParams(current => {
      const next = new URLSearchParams(current)
    if (value === defaultValue) next.delete(key)
    else next.set(key, value)
      return next
    })
  }
  return (
    <section aria-labelledby="trending-heading">
      <PageHeader headingId="trending-heading" eyebrow="Explore" title="Trending now" description="Stories readers are responding to." />
      {articleOfDay && <section className="mb-12">
        <FeaturedPostCard post={articleOfDay} />
      </section>}
      <div className="mb-4 mt-5 flex flex-wrap items-center justify-between gap-4"><SectionHeading>Trending stories</SectionHeading><FilterBar label="Topic" value={topic} onReset={resetFilters} onChange={value => updateFilter('trendingTopic', value, 'all')} options={[{ id: 'all', label: 'All' }, { id: 'science', label: 'Science' }, { id: 'design', label: 'Design' }, { id: 'wellness', label: 'Wellness' }, { id: 'career', label: 'Career' }]} sortOptions={[{ id: 'popular', label: 'Most appreciated' }, { id: 'latest', label: 'Latest' }]} sortValue={sort} onSortChange={value => updateFilter('trendingSort', value, 'popular')} /></div>
      {feed.isPending && <PostFeedSkeleton count={3} label="Loading trending stories" />}
      {feed.isError && <div role="alert" className="py-12"><p className="text-[13px] text-[var(--color-danger)]">Popular stories are unavailable.</p><button type="button" onClick={() => feed.refetch()} className="button-target mt-3 inline-flex min-h-11 items-center text-[12px] font-semibold underline sm:min-h-0" aria-busy={feed.isFetching} disabled={feed.isFetching}>Try again</button></div>}
      {!feed.isPending && !feed.isError && posts.length === 0 && <p className="py-12 text-[13px] text-[var(--color-text-muted)]">Popular stories will appear as readers begin responding.</p>}
      {filteredPosts.filter(post => post.id !== articleOfDay?.id).map(post => <DiscoveryPostCard key={post.id} post={post} />)}
      {feed.hasNextPage && <button type="button" onClick={() => feed.fetchNextPage()} disabled={feed.isFetchingNextPage} className="button-target mt-8 px-5 py-2.5 rounded-full border border-[var(--color-border)] text-[12px] font-semibold disabled:opacity-50" aria-busy={feed.isFetchingNextPage}>{'Load more'}</button>}
    </section>
  )
}
