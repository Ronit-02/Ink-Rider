import { useNavigate } from 'react-router-dom'
import { colors, fonts, fontSizes, transitions } from '@/styles/tokens'
import AuthorMeta from '@/components/ui/AuthorMeta'
import Tag from '@/components/ui/Tag'
import ImageBox from '@/components/ui/ImageBox'

export default function HorizontalCard({ article }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/post/${article.id}`)}
      onMouseEnter={(e) => (e.currentTarget.style.background = colors.surfaceHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      style={{
        display: 'flex',
        gap: 16,
        padding: '20px 0',
        borderBottom: `1px solid ${colors.border}`,
        cursor: 'pointer',
        transition: transitions.default,
        borderRadius: 4,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <AuthorMeta
          author={article.author}
          readTime={article.readTime}
          date={article.date}
          size="sm"
        />
        <h3
          style={{
            fontFamily: fonts.display,
            fontSize: fontSizes.lg,
            fontWeight: 700,
            color: colors.text,
            lineHeight: 1.4,
            margin: '8px 0 6px',
            letterSpacing: '-0.2px',
          }}
        >
          {article.title}
        </h3>
        <p
          style={{
            fontSize: fontSizes.base,
            color: colors.textSecondary,
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {article.excerpt}
        </p>
        {article.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            {article.tags.map((t) => (
              <Tag key={t} label={t} />
            ))}
          </div>
        )}
      </div>
      <ImageBox
        src={article.image}
        alt={article.title}
        height={110}
        style={{ width: 140, flexShrink: 0 }}
      />
    </div>
  )
}
