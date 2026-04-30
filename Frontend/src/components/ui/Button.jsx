import { colors, radius, transitions, fontSizes } from '@/styles/tokens'

const variants = {
  primary: {
    background: colors.accent,
    color: colors.textInverted,
    border: colors.accent,
  },
  secondary: {
    background: colors.surface,
    color: colors.text,
    border: colors.border,
  },
  ghost: {
    background: 'transparent',
    color: colors.textSecondary,
    border: 'transparent',
  },
}

export default function Button({ children, variant = 'primary', onClick, style = {}, disabled = false }) {
  const v = variants[variant]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '8px 18px',
        borderRadius: radius.full,
        border: `1px solid ${v.border}`,
        background: v.background,
        color: v.color,
        fontSize: fontSizes.base,
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: transitions.default,
        whiteSpace: 'nowrap',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  )
}
