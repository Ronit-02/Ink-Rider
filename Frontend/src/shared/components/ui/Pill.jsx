/* Pill — filter/tab toggle button */
export default function Pill({ label, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-[7px] rounded-full text-[13px] font-medium leading-none whitespace-nowrap transition-all duration-150 border
        ${active
          ? 'bg-[var(--color-accent)] text-[var(--color-text-inverted)] border-[var(--color-accent)]'
          : 'bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
        } ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {label}
    </button>
  )
}
