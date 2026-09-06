import { useCallback, useId, useLayoutEffect, useRef, useState } from 'react'
import { useClickOutside } from '@/shared/hooks/useClickOutside'
import useDialogFocus from '@/shared/hooks/useDialogFocus'

function FilterIcon() {
  return <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
}

function CloseIcon() {
  return <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
}

export default function FilterPopover({ activeFilterCount = 0, title = 'Filters', description = 'Narrow the results without leaving the page.', onClear, children }) {
  const [open, setOpen] = useState(false)
  const [panelPosition, setPanelPosition] = useState({ left: 0, top: null })
  const panelId = useId()
  const ref = useRef(null)
  const panelRef = useRef(null)
  const triggerRef = useRef(null)
  const closeButtonRef = useRef(null)
  const closePopover = useCallback(() => setOpen(false), [])
  useClickOutside(ref, closePopover)
  const dialogRef = useDialogFocus(closePopover, closeButtonRef, open)

  useLayoutEffect(() => {
    if (!open) return undefined

    const updatePanelPosition = () => {
      const anchor = ref.current?.getBoundingClientRect()
      const panel = panelRef.current?.getBoundingClientRect()
      if (!anchor || !panel) return

      const scrollRoot = ref.current.closest('[data-app-scroll]')
      const rootBounds = scrollRoot?.getBoundingClientRect()
      const minX = rootBounds?.left ?? 0
      const maxX = rootBounds?.right ?? window.innerWidth
      const minY = rootBounds?.top ?? 0
      const maxY = rootBounds?.bottom ?? window.innerHeight
      const gap = 8
      const left = Math.min(Math.max(anchor.right - panel.width, minX), Math.max(minX, maxX - panel.width))
      const belowTop = anchor.bottom + gap
      const aboveTop = anchor.top - panel.height - gap
      const top = belowTop + panel.height <= maxY || aboveTop < minY ? belowTop : aboveTop

      setPanelPosition({ left: left - anchor.left, top: top - anchor.top })
    }

    updatePanelPosition()
    window.addEventListener('resize', updatePanelPosition)
    const scrollRoot = ref.current?.closest('[data-app-scroll]')
    scrollRoot?.addEventListener('scroll', updatePanelPosition)
    return () => {
      window.removeEventListener('resize', updatePanelPosition)
      scrollRoot?.removeEventListener('scroll', updatePanelPosition)
    }
  }, [open])

  return <div ref={ref} className="relative inline-block">
    <button ref={triggerRef} type="button" aria-expanded={open} aria-haspopup="dialog" aria-controls={panelId} onClick={() => setOpen(value => !value)} className={`flex min-h-11 items-center gap-2 rounded-[12px] border px-4 text-[12px] font-semibold transition-colors sm:h-10 sm:min-h-0 ${open || activeFilterCount ? 'border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-text-inverted)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-text-secondary)]'}`}>
      <FilterIcon /> Filters {activeFilterCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-text-inverted)] px-1 text-[10px] text-[var(--color-text)]">{activeFilterCount}</span>}
    </button>
    {open && <div ref={element => { panelRef.current = element; dialogRef.current = element }} id={panelId} role="dialog" aria-label={title} aria-describedby={`${panelId}-description`} style={{ left: `${panelPosition.left}px`, ...(panelPosition.top === null ? {} : { top: `${panelPosition.top}px` }) }} className="absolute top-[calc(100%+8px)] z-[60] w-[min(90vw,420px)] rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)]">
      <div className="flex items-start justify-between gap-4"><div><h2 className="text-[13px] font-semibold text-[var(--color-text)]">{title}</h2><p id={`${panelId}-description`} className="mt-1 text-[11px] text-[var(--color-text-muted)]">{description}</p></div><button ref={closeButtonRef} type="button" onClick={closePopover} aria-label="Close filters" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text)] sm:h-7 sm:w-7"><CloseIcon /></button></div>
      {children}
      <div className="mt-4 flex justify-end border-t border-[var(--color-border)] pt-3"><button type="button" onClick={() => onClear?.()} disabled={activeFilterCount === 0} className="min-h-10 text-[12px] font-semibold text-[var(--color-text-secondary)] underline underline-offset-2 hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0">Reset filters</button></div>
    </div>}
  </div>
}
