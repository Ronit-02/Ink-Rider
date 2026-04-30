import { useNavigate } from 'react-router-dom'
import { colors, radius } from '@/styles/tokens'
import AuthorMeta from '@/components/ui/AuthorMeta'
import Tag from '@/components/ui/Tag'
import ImageBox from '@/components/ui/ImageBox'
import { fontSizes, fonts } from '@/styles/tokens'

export default function FeaturedCard({ article }) {
  const navigate = useNavigate()

  return (
    <div
      className="hover-lift"
      onClick={() => navigate(`/post/${article.id}`)}
      style={{
        cursor: 'pointer',
        background: colors.surface,
        borderRadius: radius.xs,
        overflow: 'hidden',
        // border: `1px solid ${colors.border}`,
      }}
    >
      <ImageBox src={article.image} alt={article.title} height={220} radius="0" />
      <div style={{ padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AuthorMeta author={article.author} readTime={article.readTime} date={article.date} />
        <h3
          style={{
            fontFamily: fonts.display,
            fontSize: fontSizes.lg,
            fontWeight: 700,
            color: colors.text,
            lineHeight: 1.4,
            marginTop: 10,
            letterSpacing: '-0.2px',
          }}
        >
          {article.title}
        </h3>
        {article.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {article.tags.map((t) => (
              <Tag key={t} label={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
