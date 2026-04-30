import { colors, radius, fontSizes, transitions } from '@/styles/tokens'

const ALL_INTERESTS = [
  'Fiction', 'Poetry', 'Essays', 'Technology', 'Science',
  'Arts & Culture', 'History', 'Travel', 'Food', 'Philosophy',
  'Comedy', 'Politics', 'Design', 'Music', 'Wellness', 'Finance',
]

export default function StepInterests({ selected, onToggle }) {
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {ALL_INTERESTS.map((item) => {
          const active = selected.includes(item)
          return (
            <button
              key={item}
              onClick={() => onToggle(item)}
              style={{
                padding: '8px 16px',
                borderRadius: radius.full,
                border: `1px solid ${active ? colors.accent : colors.border}`,
                background: active ? colors.accent : colors.surface,
                color: active ? colors.textInverted : colors.textSecondary,
                fontSize: fontSizes.base,
                fontWeight: 500,
                cursor: 'pointer',
                transition: transitions.default,
              }}
            >
              {item}
            </button>
          )
        })}
      </div>
    </div>
  )
}
