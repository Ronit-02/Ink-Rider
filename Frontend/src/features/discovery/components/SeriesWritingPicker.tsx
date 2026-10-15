import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import ViewportPopover from '@/shared/components/ui/ViewportPopover'

type WritingOption = Readonly<{ id: string; title: string }>
type Props = {
  options: readonly WritingOption[]
  selectedIds: readonly string[]
  onChange: (ids: string[]) => void
  format: 'article' | 'short'
  disabled?: boolean
  limit?: number
}

export default function SeriesWritingPicker({ options, selectedIds, onChange, format, disabled = false, limit = 50 }: Props) {
  const generatedId = useId()
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const activeIndex = Math.max(0, Math.min(active, options.length - 1))
  const noun = format === 'short' ? 'shorts' : 'posts'
  const selected = selectedIds.map(id => options.find(option => option.id === id)).filter((option): option is WritingOption => Boolean(option))
  const allSelected = options.length > 0 && options.slice(0, limit).every(option => selectedIds.includes(option.id))

  useEffect(() => {
    if (!open) return
    const dismiss = (event: PointerEvent | FocusEvent) => {
      if (event.target instanceof Node && !trigger.current?.contains(event.target) && !panel.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('focusin', dismiss)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('focusin', dismiss)
    }
  }, [open])

  useEffect(() => {
    const row = panel.current?.querySelector<HTMLElement>(`[data-option-index="${activeIndex}"]`)
    if (!row || !panel.current) return
    if (row.offsetTop < panel.current.scrollTop) panel.current.scrollTop = row.offsetTop
    else if (row.offsetTop + row.offsetHeight > panel.current.scrollTop + panel.current.clientHeight) panel.current.scrollTop = row.offsetTop + row.offsetHeight - panel.current.clientHeight
  }, [activeIndex, open])

  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter(value => value !== id) : selectedIds.length < limit ? [...selectedIds, id] : [...selectedIds])
  }
  const move = (index: number, offset: number) => {
    const next = [...selectedIds]
    const [item] = next.splice(index, 1)
    next.splice(index + offset, 0, item)
    onChange(next)
  }
  const handleKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Tab') { setOpen(false); return }
    if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); setOpen(false); return }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault()
      if (!open) setOpen(true)
      setActive(index => event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : options.length - 1)) % options.length)
    } else if ((event.key === 'Enter' || event.key === ' ') && open && options[activeIndex]) {
      event.preventDefault()
      toggle(options[activeIndex].id)
    }
  }
  const handlePanelKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Tab') { setOpen(false); return }
    if (event.key !== 'Escape') return
    event.preventDefault()
    event.stopPropagation()
    setOpen(false)
    trigger.current?.focus()
  }

  return <div>
    <button ref={trigger} id={`${generatedId}-trigger`} type="button" role="combobox" aria-label={`Choose published ${noun}`} aria-expanded={open} aria-controls={open ? `${generatedId}-options` : undefined} aria-haspopup="listbox" aria-activedescendant={open && options.length ? `${generatedId}-option-${activeIndex}` : undefined} disabled={disabled || options.length === 0} onKeyDown={handleKey} onClick={() => setOpen(value => !value)} className="flex min-h-11 w-full items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] px-3 py-2 text-left text-[13px] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] disabled:cursor-not-allowed disabled:opacity-60">
      <span>{selectedIds.length ? `${selectedIds.length} ${noun} selected` : `Select ${noun}`}</span>
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
    </button>
    {open && <ViewportPopover ref={panel} anchorRef={trigger} matchAnchorWidth align="start" anchorGap={0} preferredSide="bottom" onAnchorHidden={() => setOpen(false)} onKeyDown={handlePanelKey} className="rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-[var(--shadow-menu)]" style={{ maxHeight: 280, overflowY: 'auto' }}>
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface)] p-2">
        <span className="text-[11px] text-[var(--color-text-muted)]">{selectedIds.length}/{Math.min(limit, options.length)} selected</span>
        <button type="button" onClick={() => onChange(allSelected ? [] : options.slice(0, limit).map(option => option.id))} className="min-h-10 rounded-full px-3 text-[12px] font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">{allSelected ? 'Clear all' : 'Select all'}</button>
      </div>
      <div id={`${generatedId}-options`} role="listbox" aria-label={`Published ${noun}`} aria-multiselectable="true">
        {options.map((option, index) => {
          const isSelected = selectedIds.includes(option.id)
          return <button key={option.id} id={`${generatedId}-option-${index}`} data-option-index={index} type="button" role="option" aria-selected={isSelected} tabIndex={-1} onPointerDown={event => event.preventDefault()} onPointerMove={() => setActive(index)} onClick={() => toggle(option.id)} className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-[8px] px-3 py-2 text-left text-[13px] text-[var(--color-text)] ${index === activeIndex ? 'bg-[var(--color-bg-alt)]' : ''}`}>
            <span className="min-w-0 break-words">{option.title}</span>
            {isSelected && <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-[var(--color-accent)]"><path d="m5 12 4 4L19 6" /></svg>}
          </button>
        })}
      </div>
    </ViewportPopover>}
    {!open && selected.length > 0 && <ol aria-label={`Selected ${noun} in reading order`} className="mt-3 overflow-hidden rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-alt)]">
      {selected.map((option, index) => <li key={option.id} className="flex min-h-11 items-center gap-2 border-b border-[var(--color-border)] px-3 last:border-0"><span className="w-6 shrink-0 text-[11px] text-[var(--color-text-muted)]">{String(index + 1).padStart(2, '0')}</span><span className="min-w-0 flex-1 break-words text-[13px] text-[var(--color-text)]">{option.title}</span><button type="button" disabled={index === 0 || disabled} aria-label={`Move ${option.title} earlier`} onClick={() => move(index, -1)} className="h-11 w-11 shrink-0 rounded-full border border-[var(--color-border)] disabled:opacity-30">↑</button><button type="button" disabled={index === selected.length - 1 || disabled} aria-label={`Move ${option.title} later`} onClick={() => move(index, 1)} className="h-11 w-11 shrink-0 rounded-full border border-[var(--color-border)] disabled:opacity-30">↓</button><button type="button" disabled={disabled} aria-label={`Remove ${option.title} from series`} onClick={() => toggle(option.id)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[18px] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">×</button></li>)}
    </ol>}
    <p className="mt-2 text-[11px] text-[var(--color-text-muted)]">Select at least two. Use the arrows to set their reading order.</p>
  </div>
}
