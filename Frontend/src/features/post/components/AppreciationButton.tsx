type AppreciationButtonProps = {
  isLiked?: boolean
  count?: number
  label: string
  disabled?: boolean
  onClick: () => void
}

export default function AppreciationButton({ isLiked = false, count = 0, label, disabled = false, onClick }: AppreciationButtonProps) {
  return <button
    type="button"
    aria-label={label}
    aria-pressed={isLiked}
    disabled={disabled}
    onClick={onClick}
    className={`flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 text-[12px] tabular-nums transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 disabled:opacity-60 ${isLiked ? 'bg-[var(--color-accent)] text-[var(--color-text-inverted)] hover:bg-[var(--color-accent-hover)]' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)]'}`}
  >
    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
    <span>{count}</span>
  </button>
}
