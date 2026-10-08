import { useId, type ReactNode, type RefObject } from 'react'
import ModalLayer from './ModalLayer'
import useDialogFocus from '@/shared/hooks/useDialogFocus'

export type ReportSubject = 'post' | 'short' | 'collection' | 'author' | 'question' | 'answer' | 'comment'

export const reportTitle = (subject: ReportSubject) => `Report this ${subject}`

type Props = { title: string; onClose: () => void; children: ReactNode; returnFocusRef?: RefObject<HTMLElement> }

export default function ReportModal({ title, onClose, children, returnFocusRef }: Props) {
  const titleId = useId()
  const panelRef = useDialogFocus(onClose)
  return <ModalLayer aria-labelledby={titleId} onDismiss={onClose} dismissOnBackdrop={false} returnFocusRef={returnFocusRef} className="flex items-center justify-center p-4">
    <section ref={panelRef} tabIndex={-1} className="w-full max-w-[560px] overflow-y-auto rounded-[14px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-float)]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 id={titleId} className="text-[14px] font-semibold text-[var(--color-text)]">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Close report dialog" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">×</button>
      </div>
      {children}
    </section>
  </ModalLayer>
}
