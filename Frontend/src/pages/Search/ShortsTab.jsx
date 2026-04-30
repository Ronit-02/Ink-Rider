import { useNavigate, useSearchParams } from 'react-router-dom'
import { articles } from '@/data'
import { colors, radius, fontSizes } from '@/styles/tokens'

export default function ShortsTab() {

  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  const filteredArticles = query
    ? articles.filter((a) =>
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.author.name.toLowerCase().includes(query.toLowerCase())
      )
    : articles

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
      {filteredArticles.length > 0 ? (
        filteredArticles.map((article) => (
          <ShortCard key={article.id} article={article} />
        ))
      ) : (
        <p style={{ color: colors.textMuted, fontSize: fontSizes.base, marginTop: 10 }}>
          No shorts for "{query}"
        </p>
      )}
    </div>
  )
}

function ShortCard({ article }) {
  const navigate = useNavigate()

  return (
    <div
      className="hover-lift"
      onClick={() => navigate(`/post/${article.id}`)}
      style={{
        background: colors.surface,
        borderRadius: radius.xl,
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      <img
        src={article.image}
        alt={article.title}
        loading="lazy"
        style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
      />
      <div style={{ padding: '10px 12px 14px' }}>
        <p
          style={{
            fontWeight: 600,
            fontSize: fontSizes.base,
            lineHeight: 1.5,
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