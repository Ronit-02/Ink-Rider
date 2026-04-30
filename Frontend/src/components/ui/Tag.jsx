import { colors, radius, fontSizes } from '@/styles/tokens'

export default function Tag({ label }) {
  return (
    <span
      style={{
        padding: '6px 10px',
        borderRadius: radius.full,
        // border: `1px solid ${colors.border}`,
        background: colors.bgAlt,
        color: colors.textSecondary,
        fontSize: fontSizes.sm,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        display: 'inline-block',
      }}
    >
      {label}
    </span>
  )
}
