import { useNavigate } from 'react-router-dom'
import { colors, radius, fonts, fontSizes } from '@/styles/tokens'
import AuthorMeta from '@/components/ui/AuthorMeta'
import Tag from '@/components/ui/Tag'
import ImageBox from '@/components/ui/ImageBox'

export default function ArticleCard({ article }) {
  const navigate = useNavigate()

  return (
    <div
      className="hover-lift"
      onClick={() => navigate(`/post/${article.id}`)}
      style={{
        cursor: 'pointer',
        // background: colors.surface,
        borderRadius: radius.xs,
        overflow: 'hidden',
        // border: `1px solid ${colors.border}`,
      }}
    >
      <ImageBox src={article.image} alt={article.title} height={180} radius="0" />
      <div style={{ padding: '14px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <AuthorMeta author={article.author} readTime={article.readTime} />
        <h3
          style={{
            fontFamily: fonts.display,
            fontSize: fontSizes.md,
            fontWeight: 700,
            color: colors.text,
            lineHeight: 1.45,
            marginTop: 8,
            letterSpacing: '-0.15px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {article.title}
        </h3>
        {article.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {article.tags.slice(0, 2).map((t) => (
              <Tag key={t} label={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
