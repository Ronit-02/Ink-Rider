/* Pill — filter/tab toggle button */
export default function Pill({ label, active = false, onClick, role, ariaControls, onKeyDown, tabIndex }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={role}
      aria-pressed={role === 'tab' ? undefined : active}
      aria-selected={role === 'tab' ? active : undefined}
      aria-controls={ariaControls}
      tabIndex={tabIndex}
      className={`min-h-11 px-4 py-[7px] sm:min-h-0 rounded-full text-[13px] font-medium leading-none whitespace-nowrap transition-all duration-150 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2
        ${active
          ? 'bg-[var(--color-accent)] text-[var(--color-text-inverted)] border-[var(--color-accent)]'
          : 'bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
        } ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {label}
    </button>
  )
}
