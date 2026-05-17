import { useState } from 'react'
import { authors, articles } from '@/shared/data'
import Button from '@/shared/components/ui/Button'
import Divider from '@/shared/components/ui/Divider'
import Pill from '@/shared/components/ui/Pill'
import ArticleCard from '@/features/posts/components/ArticleCard'

// ─── Keep SubscriberContent here from old Artist folder ───────────────────────
import SubscriberContent from './SubscriberContent'

const AUTHOR = {
  ...authors[0],
  followers: 2840,
  totalArticles: 47,
  bio: authors[0].bio + ' Former journalist, current wanderer. I believe the best writing comes from a willingness to look foolish.',
}

const TABS = [
  { id: 'posts',       label: 'Posts' },
  { id: 'collections', label: 'Collections' },
  { id: 'about',       label: 'About' },
]

const AUTHOR_COLLECTIONS = [
  { id: 1, title: 'Places I Barely Remember', count: 8,  image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&q=80' },
  { id: 2, title: 'On Writing Slowly',        count: 5,  image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300&q=80' },
]

export default function AuthorPage() {
  const [subscribed, setSubscribed] = useState(false)
  const [following,  setFollowing]  = useState(false)
  const [activeTab,  setActiveTab]  = useState('posts')

  return (
    <div className="max-w-[960px] mx-auto px-8 pb-20">

      {/* ── Banner ── */}
      <div className="h-[200px] rounded-b-[20px] overflow-hidden mb-[60px] relative z-0">
        <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80" alt="banner"
          className="w-full h-full object-cover block" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.4))' }} />
      </div>

      {/* ── Author header — overlaps banner ── */}
      <div className="flex items-end gap-5 mb-6 -mt-20 relative z-10 flex-wrap">
        <img src={AUTHOR.avatar} alt={AUTHOR.name}
          className="w-[84px] h-[84px] rounded-full object-cover flex-shrink-0 block"
          style={{ border: '4px solid var(--color-surface)', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }} />

        <div className="flex-1 pb-1 min-w-[200px]">
          <h1 className="font-bold text-[22px] tracking-[-0.4px] mb-1 text-[var(--color-text)]"
            style={{ fontFamily: 'var(--font-display)' }}>
            {AUTHOR.name}
          </h1>
          <p className="text-[13px] text-[var(--color-text-secondary)] mb-2">{AUTHOR.bio}</p>
          <div className="flex gap-5">
            {[{ v: AUTHOR.followers.toLocaleString(), l: 'followers' }, { v: AUTHOR.totalArticles, l: 'articles' }].map(s => (
              <span key={s.l} className="text-[12px] text-[var(--color-text-secondary)]">
                <strong className="text-[var(--color-text)]">{s.v}</strong> {s.l}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pb-1 flex-shrink-0">
          <Button variant={following ? 'secondary' : 'ghost'}
            onClick={() => setFollowing(v => !v)}
            style={{ border: '1px solid var(--color-border)' }}>
            {following ? 'Following' : 'Follow'}
          </Button>
          <Button variant={subscribed ? 'secondary' : 'primary'}
            onClick={() => setSubscribed(v => !v)}>
            {subscribed ? 'Subscribed' : 'Subscribe'}
          </Button>
        </div>
      </div>

      <Divider className="mb-7" />

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-8">
        {TABS.map(t => <Pill key={t.id} label={t.label} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} />)}
      </div>

      {/* ── Posts tab ── */}
      {activeTab === 'posts' && (
        subscribed ? <SubscriberContent /> : (
          <div>
            <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              {articles.slice(0, 6).map(a => <ArticleCard key={a.id} article={a} />)}
            </div>
            <div className="text-center mt-10 p-8 bg-[var(--color-bg-alt)] rounded-[20px] border border-[var(--color-border)]">
              <p className="font-bold text-[18px] mb-2 text-[var(--color-text)]"
                style={{ fontFamily: 'var(--font-display)' }}>
                Unlock subscriber-only content
              </p>
              <p className="text-[13px] text-[var(--color-text-secondary)] mb-4">
                Subscribe to access exclusive articles, early releases, and webinars from {AUTHOR.name}.
              </p>
              <Button variant="primary" onClick={() => setSubscribed(true)}>Subscribe — Free</Button>
            </div>
          </div>
        )
      )}

      {/* ── Collections tab ── */}
      {activeTab === 'collections' && (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {AUTHOR_COLLECTIONS.map(col => (
            <div key={col.id} className="hover-lift bg-[var(--color-surface)] rounded-[20px]
              border border-[var(--color-border)] overflow-hidden cursor-pointer">
              <img src={col.image} alt={col.title} className="w-full h-[140px] object-cover block" />
              <div className="p-4">
                <p className="font-bold text-[14px] mb-1 text-[var(--color-text)]">{col.title}</p>
                <p className="text-[12px] text-[var(--color-text-muted)]">{col.count} stories</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── About tab ── */}
      {activeTab === 'about' && (
        <div className="max-w-[640px]">
          <h3 className="font-bold text-[18px] mb-4 text-[var(--color-text)]"
            style={{ fontFamily: 'var(--font-display)' }}>
            About {AUTHOR.name}
          </h3>
          <p className="text-[13px] text-[var(--color-text)] leading-[1.8] mb-5">
            {AUTHOR.bio} Writing since 2018, with work in various publications.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary">💌 Message</Button>
            <Button variant="secondary">🌐 Website</Button>
          </div>
        </div>
      )}
    </div>
  )
}
