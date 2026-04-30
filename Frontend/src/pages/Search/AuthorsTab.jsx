import { useState } from 'react'
import { authors } from '@/data'
import { colors, fontSizes } from '@/styles/tokens'
import Button from '@/components/ui/Button'
import { useSearchParams } from 'react-router-dom'

export default function AuthorsTab() {

  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  const filteredAuthors = query
    ? authors.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()))
    : authors

  return (
    <div>
      {filteredAuthors.length > 0 ? (
      <div>
        {filteredAuthors.map((author) => (
          <AuthorRow key={author.id} author={author} />
        ))}
      </div>
    ) : (
      <p style={{ color: colors.textMuted, fontSize: fontSizes.base, marginTop: 32 }}>
        No authors for "{query}"
      </p>
    )}
    </div>
  )
}

function AuthorRow({ author }) {
  const [following, setFollowing] = useState(false)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 0',
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img
          src={author.avatar}
          alt={author.name}
          style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />
        <div>
          <p style={{ fontWeight: 600, fontSize: fontSizes.md, marginBottom: 2 }}>
            {author.name}
          </p>
          <p style={{ fontSize: fontSizes.sm, color: colors.textMuted }}>{author.bio}</p>
        </div>
      </div>
      <Button
        variant={following ? 'secondary' : 'primary'}
        onClick={() => setFollowing((v) => !v)}
        style={{ fontSize: fontSizes.sm, flexShrink: 0 }}
      >
        {following ? 'Following' : 'Follow'}
      </Button>
    </div>
  )
}