/* CollectionDetail — view posts inside a collection */
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { articles } from '@/shared/data'
import Divider from '@/shared/components/ui/Divider'
import HorizontalCard from '@/features/post/components/HorizontalCard'
import Button from '@/shared/components/ui/Button'
import { ALL_COLLECTIONS } from './index'

export default function CollectionDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const col      = ALL_COLLECTIONS.find(c => c.id === Number(id)) ?? ALL_COLLECTIONS[0]
  const [saved, setSaved] = useState(false)

  // Simulate collection posts (use first N articles)
  const posts = articles.slice(0, col.stories ? Math.min(col.stories, articles.length) : 4)

  return (
    <div className="max-w-200 px-6 pt-8 pb-20">
      
      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 bg-(--color-bg-alt) border border-(--color-border) text-(--color-text-secondary) text-[13px] cursor-pointer mb-7 px-3.5 py-1.5rounded-full transition-all hover:bg-(--color-border)">
        ← Back to Collections
      </button>

      {/* Hero */}
      <img src={col.image} alt={col.title} className="w-full h-55 object-cover rounded-[20px] block mb-6" />

      {/* Metadata header */}
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div className="flex-1">
          {col.recommended && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-(--color-bg-alt)
              text-(--color-text-muted) font-medium mb-3 inline-block">✦ Recommended by Ink Rider</span>
          )}
          <h1 className="font-bold text-[28px] text-(--color-text) leading-[1.3] mb-2"
            style={{ fontFamily: 'var(--font-display)' }}>{col.title}</h1>
          <p className="text-[14px] text-(--color-text-secondary) leading-[1.7]">{col.description}</p>
        </div>
        <button onClick={() => setSaved(v => !v)}
          className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border text-[13px] font-medium cursor-pointer transition-all
            ${saved ? 'bg-(--color-accent) text-(--color-text-inverted) border-(--color-accent)'
                    : 'bg-(--color-surface) text-(--color-text-secondary) border-(--color-border)'}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
          </svg>
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>

      {/* Meta row */}
      <div className="flex gap-4 items-center mb-6 flex-wrap">
        {col.curator && (
          <div className="flex items-center gap-2">
            <img src={col.curator.avatar} alt={col.curator.name} className="w-7 h-7 rounded-full object-cover" />
            <span className="text-[12px] text-(--color-text-secondary) font-medium">
              Curated by {col.curator.name}
            </span>
          </div>
        )}
        {col.createdAt && (
          <span className="text-[12px] text-(--color-text-muted)">Created {col.createdAt}</span>
        )}
        <span className="text-[12px] text-(--color-text-muted)">{posts.length} stories</span>
      </div>

      <Divider className="mb-8" />

      {/* Posts */}
      <p className="text-[11px] font-bold text-(--color-text-muted) uppercase tracking-[0.08em] mb-4">
        Stories in this collection
      </p>
      {posts.map(a => <HorizontalCard key={a.id} article={a} />)}

    </div>
  )
}
