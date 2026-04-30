import { colors } from '@/styles/tokens'

export default function Divider({ style = {} }) {
  return (
    <div
      style={{
        height: 1,
        width: '100%',
        background: colors.border,
        flexShrink: 0,
        ...style,
      }}
    />
  )
}
