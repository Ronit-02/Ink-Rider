import { forwardRef, useEffect, useRef, type ButtonHTMLAttributes, type ReactNode, type RefObject } from 'react'
import ViewportPopover from './ViewportPopover'
import { getButtonClasses } from './buttonStyles'

type Props = {
  id: string
  label: string
  anchorRef: RefObject<HTMLElement>
  onClose: (options?: { restoreFocus?: boolean }) => void
  children: ReactNode
}

// Callers retain commands and pending state; this pattern owns menu presentation and focus.
export default function ActionMenu({ id, label, anchorRef, onClose, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    panelRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not(:disabled)')?.focus()
    const dismiss = (event: MouseEvent) => {
      if (event.target instanceof Node && !anchorRef.current?.contains(event.target) && !panelRef.current?.contains(event.target)) closeRef.current()
    }
    document.addEventListener('mousedown', dismiss)
    return () => document.removeEventListener('mousedown', dismiss)
  }, [anchorRef])

  return <ViewportPopover ref={panelRef} anchorRef={anchorRef} onAnchorHidden={() => closeRef.current()} id={id} role="menu" tabIndex={-1} aria-label={label}
    onKeyDown={event => {
      const items = [...panelRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)') || []]
      const index = items.findIndex(item => item === document.activeElement)
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        closeRef.current({ restoreFocus: true })
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        const offset = event.key === 'ArrowDown' ? 1 : -1
        items[(index + offset + items.length) % items.length]?.focus()
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault()
        items[event.key === 'Home' ? 0 : items.length - 1]?.focus()
      } else if (event.key === 'Tab' && ((event.shiftKey && index === 0) || (!event.shiftKey && index === items.length - 1))) {
        closeRef.current()
      }
    }}
    className="absolute right-0 top-10 z-[80] w-64 max-w-[calc(100vw-32px)] overflow-hidden rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-[var(--shadow-menu)]">{children}</ViewportPopover>
}

export const ActionMenuTrigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function ActionMenuTrigger(props, ref) {
  return <button {...props} ref={ref} type="button" aria-haspopup="menu" className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></svg>
  </button>
})

type ItemProps = ButtonHTMLAttributes<HTMLButtonElement> & { icon: ReactNode; tone?: 'default' | 'danger' }
export function ActionMenuItem({ icon, tone = 'default', children, ...props }: ItemProps) {
  return <button {...props} type="button" role="menuitem" data-button-size="sm" className={getButtonClasses({ variant: 'menu', size: 'sm', className: `!whitespace-normal !text-left ${tone === 'danger' ? '!text-[var(--color-danger)]' : ''}` })}><span data-button-icon aria-hidden="true" className="shrink-0">{icon}</span>{children}</button>
}

export function HideActionIcon() {
  return <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M6 6l12 12" /></svg>
}
