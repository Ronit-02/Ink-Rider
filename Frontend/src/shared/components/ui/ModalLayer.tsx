import { useLayoutEffect, useRef, type DialogHTMLAttributes, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import useOverlayViewport from '@/shared/hooks/useOverlayViewport'

type Props = DialogHTMLAttributes<HTMLDialogElement> & { onDismiss: () => void; dismissOnBackdrop?: boolean; returnFocusRef?: RefObject<HTMLElement> }

export default function ModalLayer({ children, onDismiss, dismissOnBackdrop = true, returnFocusRef, className = '', ...props }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const returnFocus = useRef(document.activeElement instanceof HTMLElement ? document.activeElement : null)
  const viewportStyle = useOverlayViewport()
  useLayoutEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    return () => {
      dialog?.close()
      requestAnimationFrame(() => (returnFocusRef?.current || returnFocus.current)?.focus({ preventScroll: true }))
    }
  }, [returnFocusRef])
  return createPortal(<dialog {...props} ref={ref} tabIndex={-1}
    onCancel={event => { event.preventDefault(); onDismiss() }}
    onMouseDown={event => { if (dismissOnBackdrop && event.target === event.currentTarget) onDismiss() }}
    style={viewportStyle}
    className={`fixed m-0 max-h-none max-w-none overflow-hidden border-0 bg-transparent text-[var(--color-text)] backdrop:bg-black/45 [&>section]:max-h-[calc(var(--overlay-height)-2rem)] [&>section]:min-w-0 ${className}`}>
    {children}
  </dialog>, document.body)
}
