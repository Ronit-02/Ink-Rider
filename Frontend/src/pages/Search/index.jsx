import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AuthorsTab from './AuthorsTab'
import ShortsTab from './ShortsTab'
import { articles } from '@/data'
import { colors, radius, fontSizes } from '@/styles/tokens'
import Pill from '@/components/ui/Pill'
import HorizontalCard from '@/components/article/HorizontalCard'
import { useQuery } from '@tanstack/react-query'
import { searchPost } from '@/api/post/search'

const TABS = [
  { id: 'posts',   label: 'Posts' },
  { id: 'authors', label: 'Authors' },
  { id: 'shorts',  label: 'Shorts' },
]

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState('posts')
  const [filteredPosts, setFilteredPosts] = useState([])

  // Get search query from URL
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("")

  useEffect(() => {
      setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Fetching Filtered Posts
  const { data: postsData, isLoading: fetchPostIsLoading, isError, error } = useQuery({
    queryKey: ["post", { query, filter }],
    queryFn: searchPost,
    retry: 1   // limited retries, faster reload
  })

  useEffect(() => {
    if (postsData?.body) {
      setFilteredPosts(JSON.parse(postsData.body))
    }
  }, [postsData])

  return (
    <div style={{ maxWidth: 1200, margin: '0', padding: '40px 32px' }}>

      {/* Tab pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {TABS.map((t) => (
          <Pill
            key={t.id}
            label={t.label}
            active={activeTab === t.id}
            onClick={() => setActiveTab(t.id)}
          />
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'posts' &&
        (filteredPosts.length > 0 ? (
          filteredPosts.map((article) => <HorizontalCard key={article.id} article={article} />)
        ) : (
          <p style={{ color: colors.textMuted, fontSize: fontSizes.base, marginTop: 32 }}>
            No posts for "{query}"
          </p>
        ))}
      {activeTab === 'authors' && <AuthorsTab />}
      {activeTab === 'shorts'  && <ShortsTab />}
    </div>
  )
}
