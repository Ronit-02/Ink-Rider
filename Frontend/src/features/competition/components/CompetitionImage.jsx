export default function CompetitionImage({ src, title, status, height = 80, radius = '10px' }) {
  const label = title ? `${title} competition cover` : 'Competition cover'
  return <div className="relative w-full shrink-0 overflow-hidden bg-[var(--color-bg-alt)]" style={{ height, borderRadius: radius }}>
    {src ? <img src={src} alt={label} loading="lazy" className="block h-full w-full object-cover" /> : <div aria-label={`${label} placeholder`} className="flex h-full w-full flex-col justify-center border border-[var(--color-border)] px-4 text-left">
      <span aria-hidden="true" className="text-[clamp(24px,4vw,38px)] font-bold leading-none tracking-[-0.08em] text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>IR</span>
      <span className="mt-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">Competition</span>
      {status && <span className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{status}</span>}
    </div>}
  </div>
}
