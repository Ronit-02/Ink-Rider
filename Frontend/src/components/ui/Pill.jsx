import { colors, radius, transitions, fontSizes } from '@/styles/tokens'

export default function Pill({ label, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 16px',
        borderRadius: radius.full,
        border: `1px solid ${active ? colors.accent : colors.border}`,
        background: active ? colors.accent : colors.bgAlt,
        color: active ? colors.textInverted : '#4A4540',
        fontSize: fontSizes.base,
        fontWeight: 500,
        lineHeight: 1,
        cursor: onClick ? 'pointer' : 'default',
        whiteSpace: 'nowrap',
        transition: transitions.default,
      }}
    >
      {label}
    </button>
  )
}
