export default function CompetitionImage({ src, title, status, height = 80, radius = '10px' }) {
  const label = title ? `${title} competition cover` : 'Competition cover'
  const isCompact = typeof height === 'number' && height <= 100
  return <div className="relative w-full shrink-0 overflow-hidden bg-[var(--color-bg-alt)]" style={{ height, borderRadius: radius }}>
    {src ? <img src={src} alt={label} loading="lazy" className="block h-full w-full object-cover" /> : isCompact ? <div aria-label={`${label} placeholder`} className="relative flex h-full w-full items-center justify-center overflow-hidden border border-[var(--color-border)] bg-[linear-gradient(135deg,var(--color-bg-alt),var(--color-surface))]">
      <span aria-hidden="true" className="absolute -right-4 -top-5 h-20 w-20 rounded-full border border-[var(--color-accent)]/35" />
      <span aria-hidden="true" className="relative text-[22px] font-bold tracking-[-0.08em] text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>IR</span>
      {status && <span className="absolute bottom-2 left-2 rounded-full bg-[var(--color-surface)]/90 px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">{status}</span>}
    </div> : <div aria-label={`${label} placeholder`} className="relative flex h-full w-full items-end overflow-hidden border border-[var(--color-border)] bg-[linear-gradient(135deg,var(--color-bg-alt),var(--color-surface))] p-4 text-left sm:p-7">
      <div aria-hidden="true" className="absolute -right-[8%] -top-[32%] h-[150%] w-[42%] rotate-[24deg] border-l border-[var(--color-border)] bg-[var(--color-surface)]/60" />
      <div aria-hidden="true" className="absolute left-[12%] top-[18%] h-10 w-10 rounded-full border border-[var(--color-accent)]/45 sm:h-16 sm:w-16" />
      <div className="relative max-w-[78%]">
        <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">Ink Rider competition</span>
        <span className="mt-2 block text-[clamp(18px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.04em] text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>{title || 'A new writing prompt'}</span>
        {status && <span className="mt-3 inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/80 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">{status}</span>}
      </div>
    </div>}
  </div>
}
