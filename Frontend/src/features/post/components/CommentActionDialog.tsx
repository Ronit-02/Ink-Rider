import { useEffect, useId, useRef } from 'react'
import Button from '@/shared/components/ui/Button'
import ModalHeader from '@/shared/components/ui/ModalHeader'
import ModalLayer from '@/shared/components/ui/ModalLayer'
import useDialogFocus from '@/shared/hooks/useDialogFocus'

type Props = {
  mode: 'edit' | 'delete'
  text: string
  onTextChange: (text: string) => void
  pending: boolean
  hasError: boolean
  onSubmit: () => void
  onClose: () => void
}

export default function CommentActionDialog({ mode, text, onTextChange, pending, hasError, onSubmit, onClose }: Props) {
  const id = useId()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const opener = useRef(document.activeElement instanceof HTMLElement ? document.activeElement : null)
  const fallback = useRef(opener.current?.closest('section')?.querySelector<HTMLElement>('button[aria-controls], textarea, button'))
  useEffect(() => () => {
    requestAnimationFrame(() => { if (!opener.current?.isConnected) fallback.current?.focus({ preventScroll: true }) })
  }, [])
  const dismiss = () => { if (!pending) onClose() }
  const dialogRef = useDialogFocus(dismiss, mode === 'edit' ? inputRef : cancelRef)
  return <ModalLayer onDismiss={dismiss} aria-labelledby={`${id}-title`} className="flex items-center justify-center p-4">
    <section ref={dialogRef} tabIndex={-1} className="w-full max-w-[420px] overflow-y-auto rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-menu)]">
      <ModalHeader title={mode === 'edit' ? 'Edit comment' : 'Delete comment?'} titleId={`${id}-title`} onClose={dismiss} closeLabel="Close comment action" closeRef={cancelRef} />
      <form className="p-4 sm:p-6" onSubmit={event => { event.preventDefault(); if (!pending && (mode === 'delete' || text.trim())) onSubmit() }}>
        {mode === 'edit' ? <>
          <label htmlFor={`${id}-input`} className="mb-2 block text-[13px] font-semibold">Edit comment</label>
          <textarea ref={inputRef} id={`${id}-input`} required maxLength={1000} value={text} disabled={pending} onChange={event => onTextChange(event.target.value)} className="w-full min-h-20 p-3 rounded-[12px] bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[13px] text-[var(--color-text)]" />
        </> : <p className="text-[13px] leading-5 text-[var(--color-text-secondary)]">Delete this comment? Any remaining replies will be kept.</p>}
        {hasError && <p role="alert" className="mt-3 text-[12px] text-[var(--color-danger)]">We couldn't update the comment. Please try again.</p>}
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button className="!min-h-11" variant="secondary" disabled={pending} onClick={dismiss}>{mode === 'delete' ? 'Cancel delete' : 'Cancel'}</Button>
          <Button className="!min-h-11" type="submit" disabled={pending || (mode === 'edit' && !text.trim())} aria-busy={pending}>{mode === 'edit' ? 'Save comment' : 'Delete comment'}</Button>
        </div>
      </form>
    </section>
  </ModalLayer>
}
