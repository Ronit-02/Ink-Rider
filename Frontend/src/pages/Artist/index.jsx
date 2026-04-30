import { useState } from 'react'
import { authors, articles } from '@/data'
import { colors, radius, fonts, fontSizes } from '@/styles/tokens'
import Button from '@/components/ui/Button'
import Divider from '@/components/ui/Divider'
import ArticleCard from '@/components/article/ArticleCard'
import SubscriberContent from './SubscriberContent'

const ARTIST = authors[0]

function PublicGrid() {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {articles.slice(0, 2).map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {articles.slice(0, 4).map((a) => (
          <div
            key={a.id}
            style={{
              background: colors.surface,
              borderRadius: radius.lg,
              border: `1px solid ${colors.border}`,
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            <img
              src={a.image}
              alt={a.title}
              loading="lazy"
              style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }}
            />
          </div>
        ))}
      </div>
    </>
  )
}

export default function ArtistPage() {
  const [subscribed, setSubscribed] = useState(false)

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 32px 80px' }}>
      {/* Banner */}
      <div
        style={{
          height: 200,
          borderRadius: `0 0 ${radius.xl} ${radius.xl}`,
          overflow: 'hidden',
          marginBottom: 60,
          position: 'relative',
          zIndex: 0,
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
          alt="banner"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.4))',
          }}
        />
      </div>

      {/* Author header — overlaps banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 20,
          marginBottom: 32,
          marginTop: -80,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <img
          src={ARTIST.avatar}
          alt={ARTIST.name}
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            objectFit: 'cover',
            border: `3px solid ${colors.surface}`,
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            flexShrink: 0,
            display: 'block',
          }}
        />
        <div style={{ flex: 1, paddingBottom: 4 }}>
          <h1
            style={{
              fontFamily: fonts.display,
              fontSize: fontSizes['2xl'],
              fontWeight: 700,
              letterSpacing: '-0.4px',
              marginBottom: 4,
            }}
          >
            {ARTIST.name}
          </h1>
          <p style={{ fontSize: fontSizes.base, color: colors.textSecondary }}>{ARTIST.bio}</p>
        </div>
        <Button
          variant={subscribed ? 'secondary' : 'primary'}
          onClick={() => setSubscribed((v) => !v)}
          style={{ marginBottom: 4 }}
        >
          {subscribed ? 'Subscribed' : 'Subscribe'}
        </Button>
      </div>

      <Divider style={{ marginBottom: 40 }} />

      {/* Content */}
      {subscribed ? <SubscriberContent /> : <PublicGrid />}
    </div>
  )
}
