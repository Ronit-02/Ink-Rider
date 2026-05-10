/* CategoriesSection — category pill filter + article grid */
import { useState } from 'react'
import { articles, categories } from '@/data'
import SectionHeading from '@/components/ui/SectionHeading'
import Pill from '@/components/ui/Pill'
import ArticleCard from '@/components/article/ArticleCard'

export default function CategoriesSection() {
  const [active, setActive] = useState(categories[0])
  const filtered = articles.filter(a => a.category === active).slice(0, 6)
  const displayed = filtered.length >= 3 ? filtered : articles.slice(0, 6)

  return (
    <div className="fade-in fade-in-1 mb-13">
      <SectionHeading className="mb-9">Browse Categories</SectionHeading>
      <div className="flex gap-2 items-center mb-7 flex-wrap">
        {categories.map(cat => (
          <Pill key={cat} label={cat} active={active === cat} onClick={() => setActive(cat)} />
        ))}
      </div>
      <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))' }}>
        {displayed.map(a => <ArticleCard key={a.id} article={a} />)}
      </div>
    </div>
  )
}
