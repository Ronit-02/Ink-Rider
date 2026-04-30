import { colors, radius, fonts, fontSizes } from '@/styles/tokens'
import Button from '@/components/ui/Button'

const WEEKLY_DRIVES = [
  {
    id: 1,
    name: 'Flash Fiction Friday',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=80',
  },
  {
    id: 2,
    name: 'Science Sunday',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80',
  },
]

function SubLabel({ children }) {
  return (
    <p
      style={{
        fontSize: fontSizes.sm,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: colors.textMuted,
        marginBottom: 14,
      }}
    >
      {children}
    </p>
  )
}

export default function CompetitionsTab() {
  return (
    <div>
      {/* Featured competition */}
      <SubLabel>Upcoming Competition</SubLabel>
      <div
        style={{
          background: colors.surface,
          borderRadius: radius.xl,
          border: `1px solid ${colors.border}`,
          overflow: 'hidden',
          marginBottom: 36,
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80"
          alt="competition"
          style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
        />
        <div style={{ padding: '16px 20px 20px' }}>
          <p
            style={{
              fontFamily: fonts.display,
              fontSize: fontSizes.lg,
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            The Long-Form Essay Challenge
          </p>
          <p
            style={{
              fontSize: fontSizes.base,
              color: colors.textSecondary,
              lineHeight: 1.6,
              marginBottom: 14,
            }}
          >
            Write a 2,000–5,000 word essay on any topic. Top 3 entries win a feature slot on the
            homepage and a cash prize.
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Button variant="primary">Enter Now</Button>
            <span style={{ fontSize: fontSizes.sm, color: colors.textMuted }}>
              Closes Jan 15, 2025
            </span>
          </div>
        </div>
      </div>

      {/* Weekly drives */}
      <SubLabel>Weekly Drives</SubLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {WEEKLY_DRIVES.map((drive) => (
          <div
            key={drive.id}
            className="hover-lift"
            style={{
              background: colors.surface,
              borderRadius: radius.xl,
              border: `1px solid ${colors.border}`,
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            <img
              src={drive.image}
              alt={drive.name}
              style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }}
            />
            <div style={{ padding: '12px 14px' }}>
              <p style={{ fontWeight: 600, fontSize: fontSizes.base }}>{drive.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
