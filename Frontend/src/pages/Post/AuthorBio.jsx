import { colors, radius, fontSizes } from '@/styles/tokens'
import Button from '@/components/ui/Button'
import Divider from '@/components/ui/Divider'

export default function AuthorBio({ author }) {
  return (
    <>
      <Divider style={{ margin: '32px 0' }} />
      <div
        style={{
          display: 'flex',
          gap: 16,
          padding: 24,
          background: colors.bgAlt,
          borderRadius: radius.xl,
        }}
      >
        <img
          src={author.avatar}
          alt={author.name}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            objectFit: 'cover',
            flexShrink: 0,
          }}
        />
        <div>
          <p style={{ fontWeight: 700, fontSize: fontSizes.md, marginBottom: 4 }}>{author.name}</p>
          <p style={{ fontSize: fontSizes.base, color: colors.textSecondary, lineHeight: 1.6 }}>
            {author.bio}
          </p>
          <Button variant="secondary" style={{ marginTop: 12, fontSize: fontSizes.sm }}>
            Follow
          </Button>
        </div>
      </div>
    </>
  )
}
