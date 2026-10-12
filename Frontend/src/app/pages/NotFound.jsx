import ButtonLink from '@/shared/components/ui/ButtonLink'

export default function NotFound() {
  return <main className="max-w-[720px] mx-auto px-6 py-24 text-center"><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-accent)]">404</p><h1 className="mt-3 text-[clamp(32px,6vw,58px)] font-bold tracking-[-0.05em] text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>This page slipped between the lines.</h1><p className="mt-4 text-[14px] text-[var(--color-text-secondary)]">The link may be old, private, or mistyped.</p><ButtonLink to="/" className="mt-7">Return home</ButtonLink></main>
}
