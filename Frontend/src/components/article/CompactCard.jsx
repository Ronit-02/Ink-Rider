import { useNavigate } from 'react-router-dom'
import { colors, radius, transitions, fontSizes } from '@/styles/tokens'

export default function CompactCard({ article }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/post/${article.id}`)}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.72')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      style={{
        display: 'flex',
        gap: 12,
        padding: '12px 0',
        cursor: 'pointer',
        borderBottom: `1px solid ${colors.borderLight}`,
        transition: transitions.default,
      }}
    >
      <img
        src={article.author.avatar}
        alt={article.author.name}
        loading="lazy"
        style={{
          width: 44,
          height: 44,
          borderRadius: radius.md,
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 8,
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: 500 }}>
            {article.author.name}
          </span>
          <span style={{ fontSize: fontSizes.sm, color: colors.textMuted, whiteSpace: 'nowrap' }}>
            {article.readTime}
          </span>
        </div>
        <p
          style={{
            fontSize: fontSizes.md,
            fontWeight: 600,
            color: colors.text,
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {article.title}
        </p>
      </div>
    </div>
  )
}
