import type { ReactNode, RefObject } from 'react'

type Props = {
  title: ReactNode
  titleId: string
  subtitle?: ReactNode
  onClose: () => void
  closeLabel: string
  closeRef?: RefObject<HTMLButtonElement>
  className?: string
}

export default function ModalHeader({ title, titleId, subtitle, onClose, closeLabel, closeRef, className = '' }: Props) {
  return <header data-modal-header className={`flex shrink-0 ${subtitle ? 'items-start' : 'items-center'} justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 sm:px-6 ${className}`}>
    <div className="min-w-0 flex-1">
      <h2 id={titleId} className="break-words text-[20px] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>{title}</h2>
      {subtitle && <p className="mt-1 line-clamp-2 break-words text-[12px] text-[var(--color-text-secondary)]">{subtitle}</p>}
    </div>
    <button ref={closeRef} type="button" aria-label={closeLabel} onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-0 bg-transparent text-[24px] text-[var(--color-text)] hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">×</button>
  </header>
}
