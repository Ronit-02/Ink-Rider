import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '@/shared/components/ui/Avatar'
import SectionHeading from '@/shared/components/ui/SectionHeading'
import { useCollections } from '@/features/collection/hooks/useCollections'
import CollectionCard from '@/features/collection/components/CollectionCard'
import DiscoveryPostCard from '@/features/discovery/components/DiscoveryPostCard'

function SectionBar({ title, action, children }) {
  return <div className="mb-5 flex items-end justify-between gap-4"><div><SectionHeading>{title}</SectionHeading>{children}</div>{action}</div>
}

function SectionPlaceholder() {
  return <div role="status" aria-label="Loading discovery section" className="animate-pulse">
    <div className="h-6 w-44 rounded bg-[var(--color-bg-alt)]" />
    <div className="mt-3 h-3 w-72 max-w-full rounded bg-[var(--color-bg-alt)]" />
    <div className="card-grid card-grid--post mt-6 gap-4">
      <div className="h-32 rounded-[14px] bg-[var(--color-bg-alt)]" />
      <div className="h-32 rounded-[14px] bg-[var(--color-bg-alt)]" />
      <div className="hidden h-32 rounded-[14px] bg-[var(--color-bg-alt)] lg:block" />
      <div className="hidden h-32 rounded-[14px] bg-[var(--color-bg-alt)] lg:block" />
    </div>
  </div>
}

function DeferredSection({ children }) {
  const ref = useRef(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (active || !ref.current) return undefined
    if (!('IntersectionObserver' in window)) {
      setActive(true)
      return undefined
    }
    const root = ref.current.closest('[data-app-scroll]')
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setActive(true)
        observer.disconnect()
      }
    }, { root, rootMargin: '240px 0px' })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [active])

  return <div ref={ref} className="my-10 border-b border-[var(--color-border)] py-12">
    {active ? <div className="fade-in">{children}</div> : <SectionPlaceholder />}
  </div>
}

function CategorySection({ posts }) {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const categories = [...new Set(posts.flatMap(post => post.tags || []))].slice(0, 7)
  const visiblePosts = (selectedCategory ? posts.filter(post => post.tags?.includes(selectedCategory)) : posts).slice(0, 4)
  if (!categories.length) return null
  return <section>
    <SectionBar title="Browse categories" action={<Link to={selectedCategory ? `/search?q=${encodeURIComponent(selectedCategory)}` : '/search'} className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-[18px] py-2 text-[13px] font-medium text-[var(--color-text)] transition-all duration-150 hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 sm:min-h-0">View more →</Link>}>
      <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">Follow a thread of curiosity through the latest writing.</p>
    </SectionBar>
    <div className="flex flex-wrap gap-2">
      {categories.map(category => <button key={category} type="button" aria-pressed={selectedCategory === category} onClick={() => setSelectedCategory(current => current === category ? null : category)} className={`min-h-10 rounded-full border px-4 py-2 text-[12px] font-medium transition-colors sm:min-h-0 ${selectedCategory === category ? 'border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-text-inverted)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-text)] hover:text-[var(--color-text)]'}`}>{category}</button>)}
    </div>
    {visiblePosts.length > 0 ? <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{visiblePosts.map(post => <DiscoveryPostCard key={post.id} post={post} variant="grid" />)}</div> : <p className="mt-6 py-8 text-center text-[13px] text-[var(--color-text-muted)]">No stories match this category yet.</p>}
  </section>
}

function CollectionsSection() {
  const query = useCollections(false)
  const collections = query.data?.pages.flatMap(page => page.data) || []
  if (query.isPending) return <section><SectionBar title="Browse collections" /><div role="status" aria-label="Loading collections" className="card-grid card-grid--collection gap-4"><div className="h-40 animate-pulse rounded-[16px] bg-[var(--color-bg-alt)]" /><div className="h-40 animate-pulse rounded-[16px] bg-[var(--color-bg-alt)]" /></div></section>
  if (query.isError) return <section><SectionBar title="Browse collections" /><div role="alert" className="border-y border-[var(--color-border)] py-8"><p className="text-[13px] text-[var(--color-danger)]">Collections could not be loaded.</p><button type="button" onClick={() => query.refetch()} className="mt-3 inline-flex min-h-10 items-center rounded-full border border-[var(--color-border)] px-4 py-2 text-[12px] font-semibold text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 sm:min-h-0">Try again</button></div></section>
  if (!collections.length) return null
  return <section><SectionBar title="Browse collections" action={<Link to="/collections" className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-[18px] py-2 text-[13px] font-medium text-[var(--color-text)] transition-all duration-150 hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 sm:min-h-0">See all →</Link>} /><div className="card-grid card-grid--collection gap-4">{collections.slice(0, 2).map(collection => <CollectionCard key={collection.id} collection={collection} />)}</div></section>
}

function WriterPicks({ posts }) {
  if (!posts.length) return null
  return <section><SectionBar title="Writer's picks" action={<Link to="/explore/trending" className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-[18px] py-2 text-[13px] font-medium text-[var(--color-text)] transition-all duration-150 hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 sm:min-h-0">View trending →</Link>} /><div className="card-grid card-grid--post gap-4">{posts.slice(0, 4).map(post => <DiscoveryPostCard key={post.id} post={post} variant="grid" />)}</div></section>
}

function TopAuthors({ posts }) {
  const authors = useMemo(() => {
    const map = new Map()
    posts.forEach(post => {
      if (!post.author?.id) return
      const current = map.get(post.author.id) || { ...post.author, stories: 0, likes: 0 }
      current.stories += 1
      current.likes += post.likesCount || 0
      map.set(post.author.id, current)
    })
    return [...map.values()].sort((a, b) => b.likes - a.likes || b.stories - a.stories).slice(0, 4)
  }, [posts])
  if (!authors.length) return null
  return <section><SectionBar title="Top authors" action={<Link to="/search?q=writer" className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-[18px] py-2 text-[13px] font-medium text-[var(--color-text)] transition-all duration-150 hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 sm:min-h-0">Find writers →</Link>} /><div className="grid gap-0 sm:grid-cols-2 sm:gap-x-8">{authors.map((author, index) => <Link key={author.id} to={`/author/${author.handle || encodeURIComponent(author.username)}`} className="flex items-center gap-3 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2"><span className="w-5 text-[12px] text-[var(--color-text-muted)]">0{index + 1}</span><Avatar src={author.picture} name={author.username} size={40} /><span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-semibold text-[var(--color-text)]">{author.username}</span><span className="mt-1 block text-[11px] text-[var(--color-text-muted)]">{author.stories} featured {author.stories === 1 ? 'story' : 'stories'}</span></span></Link>)}</div></section>
}

export default function HomeSections({ type, posts }) {
  const content = {
    writerPicks: <WriterPicks posts={posts} />,
    categories: <CategorySection posts={posts} />,
    collections: <CollectionsSection />,
    topAuthors: <TopAuthors posts={posts} />,
  }[type]
  return <DeferredSection>{content}</DeferredSection>
}
