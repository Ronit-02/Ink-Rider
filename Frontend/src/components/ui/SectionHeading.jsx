import { colors, fonts, fontSizes } from '@/styles/tokens'

export default function SectionHeading({ children, style = {} }) {
  return (
    <h2
      style={{
        fontFamily: fonts.display,
        fontSize: fontSizes['2xl'],
        fontWeight: 700,
        color: colors.text,
        letterSpacing: '-0.4px',
        ...style,
      }}
    >
      {children}
    </h2>
  )
}
