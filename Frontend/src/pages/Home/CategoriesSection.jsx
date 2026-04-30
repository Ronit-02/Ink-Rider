import { useState } from 'react'
import { articles, categories } from '@/data'
import { colors } from '@/styles/tokens'
import SectionHeading from '@/components/ui/SectionHeading'
import Divider from '@/components/ui/Divider'
import Pill from '@/components/ui/Pill'
import ArticleCard from '@/components/article/ArticleCard'

function ChevronRight() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2.5">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export default function CategoriesSection() {
  const [activeCategory, setActiveCategory] = useState(categories[0])

  const filtered = articles.filter((a) => a.category === activeCategory).slice(0, 6)
  const displayed = filtered.length >= 3 ? filtered : articles.slice(0, 6)

  return (
    <div className="fade-in fade-in-1" style={{ marginBottom: 52 }}>
      <SectionHeading style={{ marginBottom: 36 }}>Browse Categories</SectionHeading>
      {/* <Divider style={{ marginBottom: 18 }} /> */}

      {/* Pills row */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          marginBottom: 28,
          flexWrap: 'wrap',
        }}
      >
        {categories.map((cat) => (
          <Pill
            key={cat}
            label={cat}
            active={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
          />
        ))}
        <button
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: `1px solid ${colors.border}`,
            background: colors.surface,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <ChevronRight />
        </button>
      </div>

      {/* Article grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        {displayed.slice(0, 6).map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}
