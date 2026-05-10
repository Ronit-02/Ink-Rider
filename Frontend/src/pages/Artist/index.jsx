import { useState } from 'react'
import { authors, articles } from '@/data'
import { colors, radius, fonts, fontSizes, transitions } from '@/styles/tokens'
import Button from '@/components/ui/Button'
import Divider from '@/components/ui/Divider'
import ArticleCard from '@/components/article/ArticleCard'
import SubscriberContent from './SubscriberContent'
import Pill from '@/components/ui/Pill'

const ARTIST = { ...authors[0], followers: 2840, articles: 47, bio: authors[0].bio + ' Former journalist, current wanderer. I believe the best writing comes from a willingness to look foolish.' }

const ARTIST_TABS = [
  { id: 'posts',       label: 'Posts' },
  { id: 'collections', label: 'Collections' },
  { id: 'about',       label: 'About' },
]

const ARTIST_COLLECTIONS = [
  { id: 1, title: 'Places I Barely Remember', count: 8, image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&q=80' },
  { id: 2, title: 'On Writing Slowly',        count: 5, image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300&q=80' },
]

export default function ArtistPage() {
  const [subscribed, setSubscribed] = useState(false)
  const [following,  setFollowing]  = useState(false)
  const [activeTab,  setActiveTab]  = useState('posts')

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 32px 80px' }}>

      {/* ── Banner ── */}
      <div style={{ height: 200, borderRadius: `0 0 ${radius.xl} ${radius.xl}`, overflow: 'hidden', marginBottom: 60, position: 'relative', zIndex: 0 }}>
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
          alt="banner"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.4))' }} />
      </div>

      {/* ── Author header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginBottom: 24, marginTop: -80, position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
        <img
          src={ARTIST.avatar}
          alt={ARTIST.name}
          style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: `4px solid ${colors.surface}`, boxShadow: '0 2px 12px rgba(0,0,0,0.15)', flexShrink: 0, display: 'block' }}
        />
        <div style={{ flex: 1, paddingBottom: 4, minWidth: 200 }}>
          <h1 style={{ fontFamily: fonts.display, fontSize: fontSizes['2xl'], fontWeight: 700, letterSpacing: '-0.4px', marginBottom: 4, color: colors.text }}>
            {ARTIST.name}
          </h1>
          <p style={{ fontSize: fontSizes.base, color: colors.textSecondary, marginBottom: 8 }}>{ARTIST.bio}</p>
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { value: ARTIST.followers.toLocaleString(), label: 'followers' },
              { value: ARTIST.articles,                   label: 'articles' },
            ].map(s => (
              <span key={s.label} style={{ fontSize: fontSizes.sm, color: colors.textSecondary }}>
                <strong style={{ color: colors.text }}>{s.value}</strong> {s.label}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, paddingBottom: 4, flexShrink: 0 }}>
          <Button
            variant={following ? 'secondary' : 'ghost'}
            onClick={() => setFollowing(v => !v)}
            style={{ border: `1px solid ${colors.border}` }}
          >
            {following ? 'Following' : 'Follow'}
          </Button>
          <Button
            variant={subscribed ? 'secondary' : 'primary'}
            onClick={() => setSubscribed(v => !v)}
          >
            {subscribed ? 'Subscribed' : 'Subscribe'}
          </Button>
        </div>
      </div>

      <Divider style={{ marginBottom: 28 }} />

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {ARTIST_TABS.map(t => (
          <Pill key={t.id} label={t.label} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} />
        ))}
      </div>

      {/* ── Tab content ── */}
      {activeTab === 'posts' && (
        subscribed ? <SubscriberContent /> : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
              {articles.slice(0, 6).map(a => <ArticleCard key={a.id} article={a} />)}
            </div>
            {!subscribed && (
              <div style={{ textAlign: 'center', marginTop: 40, padding: '32px', background: colors.bgAlt, borderRadius: radius.xl, border: `1px solid ${colors.border}` }}>
                <p style={{ fontFamily: fonts.display, fontSize: fontSizes.xl, fontWeight: 700, marginBottom: 8, color: colors.text }}>
                  Unlock subscriber-only content
                </p>
                <p style={{ fontSize: fontSizes.base, color: colors.textSecondary, marginBottom: 16 }}>
                  Subscribe to access exclusive articles, early releases, and webinars from {ARTIST.name}.
                </p>
                <Button variant="primary" onClick={() => setSubscribed(true)}>Subscribe — Free</Button>
              </div>
            )}
          </div>
        )
      )}

      {activeTab === 'collections' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {ARTIST_COLLECTIONS.map(col => (
            <div key={col.id} className="hover-lift" style={{ background: colors.surface, borderRadius: radius.xl, border: `1px solid ${colors.border}`, overflow: 'hidden', cursor: 'pointer' }}>
              <img src={col.image} alt={col.title} style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '12px 16px' }}>
                <p style={{ fontWeight: 700, fontSize: fontSizes.base, marginBottom: 4, color: colors.text }}>{col.title}</p>
                <p style={{ fontSize: fontSizes.sm, color: colors.textMuted }}>{col.count} stories</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'about' && (
        <div style={{ maxWidth: 640 }}>
          <h3 style={{ fontFamily: fonts.display, fontSize: fontSizes.xl, fontWeight: 700, marginBottom: 16, color: colors.text }}>About {ARTIST.name}</h3>
          <p style={{ fontSize: fontSizes.base, color: colors.text, lineHeight: 1.8, marginBottom: 20 }}>
            {ARTIST.bio} Writing since 2018, with work published in various online and print publications. Currently working on a book about coastal landscapes and memory.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button variant="secondary">💌 Message</Button>
            <Button variant="secondary">🌐 Website</Button>
          </div>
        </div>
      )}
    </div>
  )
}
