import { colors, radius, fontSizes } from '@/styles/tokens'

const FEATURES = [
  {
    emoji: '🤖',
    title: 'AI Summaries',
    description: 'Get the gist of any article instantly with one tap.',
  },
  {
    emoji: '🎧',
    title: 'Read Aloud',
    description: 'Listen to articles hands-free while commuting or cooking.',
  },
  {
    emoji: '🏆',
    title: 'Competitions',
    description: 'Enter writing competitions and win featured placements.',
  },
  {
    emoji: '❓',
    title: 'Questions',
    description: 'Ask the community anything. Get thoughtful answers.',
  },
]

export default function StepFeatures() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {FEATURES.map((f) => (
        <div
          key={f.title}
          style={{
            padding: 20,
            background: colors.surface,
            borderRadius: radius.xl,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 10 }}>{f.emoji}</div>
          <p style={{ fontWeight: 700, fontSize: fontSizes.md, marginBottom: 6 }}>{f.title}</p>
          <p style={{ fontSize: fontSizes.base, color: colors.textSecondary, lineHeight: 1.6 }}>
            {f.description}
          </p>
        </div>
      ))}
    </div>
  )
}
