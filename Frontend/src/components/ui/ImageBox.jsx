import { colors, radius as r } from '@/styles/tokens'

export default function ImageBox({ src, alt = '', height = 180, radius = r.xxs, style = {} }) {
  return (
    <div
      style={{
        width: '100%',
        height,
        borderRadius: radius,
        overflow: 'hidden',
        background: colors.bgAlt,
        flexShrink: 0,
        ...style,
      }}
    >
      {src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      )}
    </div>
  )
}
