import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import ViewportPopover from './ViewportPopover'

type Option = Readonly<{ value: string; label: string }>
type Props = {
  id: string
  label: string
  value: string
  options: readonly Option[]
  onChange: (value: string) => void
  describedBy?: string
  disabled?: boolean
}

export default function Select({ id, label, value, options, onChange, describedBy, disabled = false }: Props) {
  const listId = useId()
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const search = useRef({ text: '', time: 0 })
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const selected = options.findIndex(option => option.value === value)
  const close = () => setOpen(false)
  const show = (index = Math.max(0, selected)) => {
    setActive(index)
    search.current = { text: '', time: 0 }
    setOpen(true)
  }
  const choose = (index: number) => {
    const option = options[index]
    if (!option) return
    onChange(option.value)
    close()
    trigger.current?.focus({ preventScroll: true })
  }

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
    const option = panel.current?.querySelector<HTMLElement>(`[data-option-index="${active}"]`)
    const list = panel.current
    // Scroll only the list, without moving the settings page.
    if (option && list) {
      if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop
      else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight
    }
  }, [active, open])

  const handleKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Tab') { close(); return }
    if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); close(); return }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault()
      if (!open) show(event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : Math.max(0, selected))
      else setActive(index => event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (open) choose(active)
      else show()
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault()
      const now = Date.now()
      const text = (now - search.current.time < 500 ? search.current.text : '') + event.key.toLowerCase()
      const index = options.findIndex(option => option.label.toLowerCase().startsWith(text))
      if (index >= 0) { if (!open) show(index); else setActive(index) }
      search.current = { text, time: now }
    }
  }

  return <div className="w-full max-w-[420px]">
    <label id={`${id}-label`} htmlFor={id} className="mb-2 block text-[13px] font-semibold">{label}</label>
    <button ref={trigger} id={id} type="button" role="combobox" aria-labelledby={`${id}-label`} aria-describedby={describedBy} aria-expanded={open} aria-controls={open ? listId : undefined} aria-haspopup="listbox" aria-activedescendant={open ? `${listId}-${active}` : undefined} disabled={disabled || options.length === 0} onKeyDown={handleKey} onClick={() => open ? close() : show()} className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-alt)] px-3 py-2 text-left text-[14px] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] disabled:cursor-not-allowed disabled:opacity-60">
      <span id={`${id}-value`} className="min-w-0 break-words">{options[selected]?.label || 'Select an option'}</span>
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`select-chevron shrink-0 ${open ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
    </button>
    {open && <ViewportPopover ref={panel} anchorRef={trigger} matchAnchorWidth align="start" anchorGap={0} preferredSide="bottom" onAnchorHidden={close} id={listId} role="listbox" aria-labelledby={`${id}-label`} className="select-options border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-[var(--shadow-menu)]">
      {options.map((option, index) => <button key={option.value} id={`${listId}-${index}`} type="button" role="option" aria-selected={option.value === value} tabIndex={-1} data-option-index={index} onPointerDown={event => event.preventDefault()} onPointerMove={() => setActive(index)} onClick={() => choose(index)} className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-[14px] text-[var(--color-text)] ${index === active ? 'bg-[var(--color-bg-alt)]' : ''}`}>
        <span className="min-w-0 break-words">{option.label}</span>
        {option.value === value && <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><path d="m5 12 4 4L19 6" /></svg>}
      </button>)}
    </ViewportPopover>}
  </div>
}
