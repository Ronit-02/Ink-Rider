import Avatar from './Avatar'
import { colors, fontSizes } from '@/styles/tokens'

export default function AuthorMeta({ author, readTime, date, size = 'sm' }) {
  const fs = size === 'sm' ? fontSizes.sm : fontSizes.base
  const avatarSize = size === 'sm' ? 22 : 28

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar src={author.avatar} name={author.name} size={avatarSize} />
        <span style={{ fontSize: fs, color: colors.textSecondary, fontWeight: 500 }}>
          {author.name}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {date && (
          <>
            <span style={{ fontSize: fs, color: colors.textMuted }}>{date}</span>
            <span style={{ fontSize: fs, color: colors.textMuted }}>·</span>
          </>
        )}
        <span style={{ fontSize: fs, color: colors.textMuted }}>{readTime}</span>
      </div>
    </div>
  )
}
