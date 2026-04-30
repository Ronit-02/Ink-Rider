import { colors } from '@/styles/tokens'

export default function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2.5">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}