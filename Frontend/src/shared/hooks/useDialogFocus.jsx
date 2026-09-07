import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Keeps keyboard focus inside a modal and returns it to the opening control.
 * The dialog owns its close behavior so this hook stays reusable across features.
 */
export default function useDialogFocus(onClose, initialFocusRef, enabled = true) {
  const dialogRef = useRef(null)
  const previousFocusRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!enabled) return undefined
    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null

    const dialog = dialogRef.current
    if (!dialog) return undefined

    const focusInitial = () => {
      const target = initialFocusRef?.current || dialog.querySelector(FOCUSABLE_SELECTOR)
      target?.focus()
    }

    focusInitial()

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = [...dialog.querySelectorAll(FOCUSABLE_SELECTOR)]
        .filter(element => element.getClientRects().length > 0)
      if (focusable.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    dialog.addEventListener('keydown', handleKeyDown)
    return () => {
      dialog.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus()
    }
  }, [enabled, initialFocusRef])

  return dialogRef
}
