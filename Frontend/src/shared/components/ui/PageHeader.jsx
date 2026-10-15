export default function PageHeader({ eyebrow, title, description, actions, headingId, className = '' }) {
  return (
    <header className={`mb-8 grid grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(0,1fr)_auto] ${className}`}>
      <div className="min-w-0 max-w-[720px]">
        {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">{eyebrow}</p>}
        <h1 id={headingId} className="mt-2 text-[clamp(29px,4vw,42px)] font-bold leading-[1.08] tracking-[-0.05em] text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>{title}</h1>
        {description && <p className="mt-3 max-w-[640px] text-[13px] leading-6 text-[var(--color-text-secondary)]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center justify-start sm:justify-end">{actions}</div>}
    </header>
  )
}
