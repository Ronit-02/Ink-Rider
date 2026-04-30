import { articles } from '@/data'
import { colors, radius, fonts, fontSizes } from '@/styles/tokens'
import ArticleCard from '@/components/article/ArticleCard'

function SectionLabel({ children }) {
  return (
    <p
      style={{
        fontSize: fontSizes.sm,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: colors.textMuted,
        marginBottom: 16,
      }}
    >
      {children}
    </p>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <SectionLabel>{title}</SectionLabel>
      {children}
    </div>
  )
}

export default function SubscriberContent() {
  return (
    <>
      {/* Upcoming webinar */}
      <Section title="Upcoming Webinar">
        <div
          style={{
            background: colors.surface,
            borderRadius: radius.xl,
            border: `1px solid ${colors.border}`,
            overflow: 'hidden',
            display: 'flex',
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&q=80"
            alt="webinar"
            loading="lazy"
            style={{ width: 260, height: 160, objectFit: 'cover', flexShrink: 0, display: 'block' }}
          />
          <div style={{ padding: '20px 24px' }}>
            <p
              style={{
                fontFamily: fonts.display,
                fontSize: fontSizes.xl,
                fontWeight: 700,
                marginBottom: 8,
                lineHeight: 1.3,
              }}
            >
              Writing in the Age of AI
            </p>
            <p
              style={{
                fontSize: fontSizes.base,
                color: colors.textSecondary,
                lineHeight: 1.6,
                marginBottom: 12,
              }}
            >
              Join Adeline for a live session on how writers can use AI as a creative tool — without
              losing their voice.
            </p>
            <p style={{ fontSize: fontSizes.sm, color: colors.textMuted }}>
              Jan 20, 2025 · 3:00 PM IST
            </p>
          </div>
        </div>
      </Section>

      {/* Early access */}
      <Section title="Early Access">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {articles.slice(2, 4).map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      </Section>

      {/* Behind the scenes */}
      <Section title="Behind the Scenes">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {articles.slice(4, 6).map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      </Section>
    </>
  )
}
