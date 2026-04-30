import { useState } from 'react'
import { authors } from '@/data'
import { colors, fontSizes } from '@/styles/tokens'
import Button from '@/components/ui/Button'

export default function StepFollow({ selected, onToggle }) {

  return (
    <div>
      {authors.slice(0, 6).map((author) => (
        <div
          key={author.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '12px 0',
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <img
            src={author.avatar}
            alt={author.name}
            style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: fontSizes.md, marginBottom: 2 }}>
              {author.name}
            </p>
            <p style={{ fontSize: fontSizes.sm, color: colors.textMuted }}>{author.bio}</p>
          </div>
          <Button
            variant={selected.includes(author.id) ? 'secondary' : 'primary'}
            onClick={() => onToggle(author.id)}
            style={{ fontSize: fontSizes.sm, flexShrink: 0 }}
          >
            {selected.includes(author.id) ? 'Following' : 'Follow'}
          </Button>
        </div>
      ))}
    </div>
  )
}
