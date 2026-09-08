import { Link } from 'react-router-dom'
import PageFrame from '@/shared/components/layout/PageFrame'

export default function MissingResourceState({ eyebrow, title, detail, recoveryTo, recoveryLabel }) {
  return (
    <PageFrame>
      <section role="alert" className="max-w-[620px] border-y border-[var(--color-border)] py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">{eyebrow}</p>
        <h1 className="mt-3 text-[clamp(28px,5vw,44px)] font-bold tracking-[-0.045em] text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>{title}</h1>
        <p className="mt-4 text-[14px] leading-7 text-[var(--color-text-secondary)]">{detail}</p>
        <Link to={recoveryTo} className="mt-7 inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-accent)] px-[18px] py-2 text-[13px] font-medium transition-all duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 sm:min-h-0" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-text-inverted)' }}>{recoveryLabel}</Link>
      </section>
    </PageFrame>
  )
}
