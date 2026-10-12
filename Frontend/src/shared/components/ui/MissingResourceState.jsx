import ButtonLink from './ButtonLink'
import PageFrame from '@/shared/components/layout/PageFrame'

export default function MissingResourceState({ eyebrow, title, detail, recoveryTo, recoveryLabel }) {
  return (
    <PageFrame>
      <section role="alert" className="max-w-[620px] border-y border-[var(--color-border)] py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">{eyebrow}</p>
        <h1 className="mt-3 text-[clamp(28px,5vw,44px)] font-bold tracking-[-0.045em] text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>{title}</h1>
        <p className="mt-4 text-[14px] leading-7 text-[var(--color-text-secondary)]">{detail}</p>
        <ButtonLink to={recoveryTo} className="mt-7">{recoveryLabel}</ButtonLink>
      </section>
    </PageFrame>
  )
}
