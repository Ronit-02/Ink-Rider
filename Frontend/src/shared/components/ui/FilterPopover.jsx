import { useCallback, useId, useRef, useState } from 'react'
import ViewportPopover from './ViewportPopover'
import { useClickOutside } from '@/shared/hooks/useClickOutside'
import useDialogFocus from '@/shared/hooks/useDialogFocus'

function FilterIcon() {
  return <svg aria-hidden="true" className="shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
}

function CloseIcon() {
  return <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
}

export default function FilterPopover({ activeFilterCount = 0, title = 'Filters', description = 'Narrow the results without leaving the page.', onClear, children }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const ref = useRef(null)
  const panelRef = useRef(null)
  const triggerRef = useRef(null)
  const closeButtonRef = useRef(null)
  const closePopover = useCallback(() => setOpen(false), [])
  useClickOutside(ref, closePopover, panelRef)
  const dialogRef = useDialogFocus(closePopover, closeButtonRef, open)

  return <div ref={ref} className="relative inline-block shrink-0">
    <button ref={triggerRef} type="button" aria-expanded={open} aria-haspopup="dialog" aria-controls={panelId} onClick={() => setOpen(value => !value)} className={`flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-[12px] border px-4 text-[12px] font-semibold transition-colors sm:h-10 sm:min-h-0 ${open || activeFilterCount ? 'border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-text-inverted)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-text-secondary)]'}`}>
      <FilterIcon /> Filters {activeFilterCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-text-inverted)] px-1 text-[10px] text-[var(--color-text)]">{activeFilterCount}</span>}
    </button>
    {open && <ViewportPopover anchorRef={triggerRef} pinOnMobile onAnchorHidden={closePopover} ref={element => { panelRef.current = element; dialogRef.current = element }} id={panelId} role="dialog" tabIndex={-1} aria-label={title} aria-describedby={`${panelId}-description`} className="fixed z-[60] w-[min(90vw,420px)] overflow-y-auto overscroll-contain rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.16)]">
      <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] pb-4"><div><h2 className="text-[16px] font-semibold text-[var(--color-text)]">{title}</h2><p id={`${panelId}-description`} className="mt-1 text-[12px] leading-5 text-[var(--color-text-secondary)]">{description}</p></div><button ref={closeButtonRef} type="button" onClick={closePopover} aria-label="Close filters" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"><CloseIcon /></button></div>
      {children}
      <div className="mt-5 flex justify-end border-t border-[var(--color-border)] pt-4"><button type="button" onClick={() => onClear?.()} disabled={activeFilterCount === 0} className="min-h-11 rounded-[10px] border border-[var(--color-border)] px-4 text-[12px] font-semibold text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40">Reset filters</button></div>
    </ViewportPopover>}
  </div>
}
