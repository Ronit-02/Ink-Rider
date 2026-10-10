import ModalHeader from '@/shared/components/ui/ModalHeader'
import useOverlayViewport from '@/shared/hooks/useOverlayViewport'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import CommentsSection from '@/features/post/pages/CommentsSection'
import useDialogFocus from '@/shared/hooks/useDialogFocus'

type CommentsModalProps = {
  id: string
  postId: string
  title: string
  initialCount: number
  onClose: () => void
}

export default function CommentsModal({ id, postId, title, initialCount, onClose }: CommentsModalProps) {
  const viewportStyle = useOverlayViewport()
  const nativeDialogRef = useRef<HTMLDialogElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef(document.activeElement instanceof HTMLElement ? document.activeElement : null)
  const focusRef = useDialogFocus(onClose, closeButtonRef)

  useEffect(() => {
    const dialog = nativeDialogRef.current
    const previousOverflow = document.body.style.overflow
    dialog?.showModal()
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus({ preventScroll: true })
    return () => {
      dialog?.close()
      document.body.style.overflow = previousOverflow
      requestAnimationFrame(() => returnFocusRef.current?.focus({ preventScroll: true }))
    }
  }, [])

  return createPortal(
    <dialog style={viewportStyle} id={id} ref={element => { nativeDialogRef.current = element; focusRef.current = element }}
      aria-labelledby={`${id}-title`} tabIndex={-1}
      onCancel={event => { event.preventDefault(); onClose() }}
      onClick={event => { if (event.target === event.currentTarget) onClose() }}
      className="fixed inset-0 m-0 flex h-[100dvh] max-h-none w-full max-w-none items-center justify-center overflow-hidden border-0 bg-transparent p-4 text-[var(--color-text)] backdrop:bg-black/45">
      <section className="flex max-h-[calc(var(--overlay-height)-2rem)] w-full max-w-[620px] flex-col overflow-hidden rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-float)]">
        <ModalHeader title="Comments" titleId={`${id}-title`} subtitle={title} onClose={onClose} closeLabel="Close comments" closeRef={closeButtonRef} />
        <div className="min-h-0 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
          <CommentsSection postId={postId} initialCount={initialCount} compact />
        </div>
      </section>
    </dialog>, document.body,
  )
}
