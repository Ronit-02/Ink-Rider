import { useState } from 'react'
import { articles } from '@/data'
import Pill from '@/components/ui/Pill'
import ArticleCard from '@/components/article/ArticleCard'

const SUB_TABS = [
  { id: 'today', label: 'Trending Today' },
  { id: 'hot100', label: 'Hot 100' },
]

export default function TrendingTab() {
  const [subTab, setSubTab] = useState('today')

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {SUB_TABS.map((t) => (
          <Pill
            key={t.id}
            label={t.label}
            active={subTab === t.id}
            onClick={() => setSubTab(t.id)}
          />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {articles.slice(0, 6).map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}
