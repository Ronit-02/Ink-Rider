import { colors, radius } from '@/styles/tokens'

export default function Avatar({ src, name = '', size = 32 }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        loading="lazy"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          border: `1.5px solid ${colors.borderLight}`,
          display: 'block',
        }}
      />
    )
  }

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: colors.bgAlt,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.35,
        fontWeight: 600,
        color: colors.textSecondary,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}
