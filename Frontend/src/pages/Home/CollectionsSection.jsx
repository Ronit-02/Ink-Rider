import { collections } from '@/data'
import { colors, radius, fontSizes, fonts } from '@/styles/tokens'
import SectionHeading from '@/components/ui/SectionHeading'
import Divider from '@/components/ui/Divider'

function CollectionCard({ collection }) {
  return (
    <div
      className="hover-lift"
      style={{
        // background: colors.surface,
        borderRadius: radius.sm,
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
        display: 'flex',
        cursor: 'pointer',
        minHeight: 140,
      }}
    >
      {/* Text side */}
      <div style={{ flex: 1, padding: 20 }}>
        {collection.curator ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <img
              src={collection.curator.avatar}
              alt={collection.curator.name}
              style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
            />
            <span style={{ fontSize: fontSizes.base, fontWeight: 600, color: colors.text }}>
              {collection.curator.name}
            </span>
          </div>
        ) : (
          <h3
            style={{
              fontFamily: fonts.display,
              fontSize: fontSizes.lg,
              fontWeight: 700,
              color: colors.text,
              marginBottom: 8,
              lineHeight: 1.3,
            }}
          >
            {collection.title}
          </h3>
        )}

        <p
          style={{
            fontSize: fontSizes.sm,
            color: colors.textSecondary,
            lineHeight: 1.55,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: 12,
          }}
        >
          {collection.description}
        </p>
        <span style={{ fontSize: fontSizes.sm, color: colors.textMuted, fontWeight: 500 }}>
          {collection.stories} Stories
        </span>
      </div>

      {/* Image side */}
      <div style={{ width: 140, flexShrink: 0 }}>
        <img
          src={collection.image}
          alt={collection.title}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    </div>
  )
}

export default function CollectionsSection() {
  return (
    <div className="fade-in fade-in-2" style={{ marginBottom: 52 }}>
      <SectionHeading style={{ marginBottom: 36 }}>Browse Collections</SectionHeading>
      {/* <Divider style={{ marginBottom: 24 }} /> */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {collections.map((col) => (
          <CollectionCard key={col.id} collection={col} />
        ))}
      </div>
    </div>
  )
}
