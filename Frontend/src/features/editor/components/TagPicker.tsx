import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Button from '@/shared/components/ui/Button'
import ViewportPopover from '@/shared/components/ui/ViewportPopover'
import fetchTagOptions from '../api/fetchTagOptions'

type Props = { tags: string[]; onChange: (tags: string[]) => void }

export default function TagPicker({ tags, onChange }: Props) {
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const anchor = useRef<HTMLDivElement>(null)
  const field = useRef<HTMLInputElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const normalized = input.trim().toLowerCase()
  const valid = normalized.length > 0 && normalized.length <= 60 && !normalized.includes(',')
  const options = useQuery({ queryKey: ['editor-tags', query], queryFn: () => fetchTagOptions(query), enabled: open, retry: false, staleTime: 60000 })
  const choices = (query === input.trim() ? options.data || [] : []).filter(option => !tags.includes(option.value))
  const canCreate = valid && !tags.includes(normalized) && !choices.some(option => option.value === normalized)
  const rows = [...choices, ...(canCreate ? [{ value: normalized, label: `Add new tag “${normalized}”` }] : [])]
  const selected = Math.min(active, Math.max(0, rows.length - 1))
  const full = tags.length >= 20

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(input.trim()), 250)
    return () => window.clearTimeout(timer)
  }, [input])
  useEffect(() => {
    if (!open) return
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !anchor.current?.contains(event.target) && !panel.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [open])
  useEffect(() => {
    const row = panel.current?.querySelector<HTMLElement>(`[data-row="${selected}"]`)
    const menu = panel.current
    if (!row || !menu) return
    if (row.offsetTop < menu.scrollTop) menu.scrollTop = row.offsetTop
    else if (row.offsetTop + row.offsetHeight > menu.scrollTop + menu.clientHeight) menu.scrollTop = row.offsetTop + row.offsetHeight - menu.clientHeight
  }, [selected, rows.length])

  const add = (value: string) => {
    if (full || !value || tags.includes(value)) return
    onChange([...tags, value])
    setInput('')
    setQuery('')
    setActive(0)
    field.current?.focus()
    setOpen(false)
  }

  return <div>
    <label htmlFor="editor-tag-input" className="mb-2 flex items-center justify-between gap-3 text-[13px] font-semibold"><span>Tags <span className="font-normal text-[var(--color-text-secondary)]">(at least one)</span></span><span className="text-[11px] font-normal text-[var(--color-text-muted)]">{tags.length}/20</span></label>
    <div ref={anchor} className="flex gap-2">
      <input ref={field} id="editor-tag-input" aria-label="Add a tag" role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={open ? 'editor-tag-options' : undefined} aria-activedescendant={open && rows.length ? `editor-tag-${selected}` : undefined} aria-describedby="editor-tag-help"
        value={input} maxLength={60} disabled={full} placeholder="Search or add a tag…" onFocus={() => setOpen(true)} onClick={() => setOpen(true)}
        onChange={event => { setInput(event.target.value); setActive(0); setOpen(true) }}
        onKeyDown={event => {
          if (event.nativeEvent.isComposing) return
          if (event.key === 'Escape' || event.key === 'Tab') {
            if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation() }
            setOpen(false)
            return
          }
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault(); setOpen(true)
            if (rows.length) setActive((selected + (event.key === 'ArrowDown' ? 1 : rows.length - 1)) % rows.length)
          }
          if (event.key === 'Enter') { event.preventDefault(); if (open && rows[selected]) add(rows[selected].value); else if (valid) add(normalized) }
        }} className="min-h-11 min-w-0 flex-1 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[13px] text-[var(--color-text)]" />
      <Button variant="secondary" className="!min-h-11" disabled={!valid || full || tags.includes(normalized)} onClick={() => add(normalized)}>Add</Button>
    </div>
    {tags.length > 0 && <div aria-label="Selected tags" className="mt-3 flex flex-wrap gap-2 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-2">{tags.map(tag => <span key={tag} className="inline-flex min-h-11 max-w-full items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] pl-3 text-[13px] font-medium text-[var(--color-text)]">
      <span className="break-all">{tag}</span><button type="button" aria-label={`Remove ${tag} tag`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[18px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text)]" onClick={() => onChange(tags.filter(value => value !== tag))}>×</button>
    </span>)}</div>}
    <p id="editor-tag-help" className="mt-2 text-[12px] text-[var(--color-text-secondary)]">{full ? '20 tags selected. Remove one to add another.' : normalized.includes(',') ? 'Add one tag at a time, without commas.' : 'Choose an existing tag or create your own.'}</p>
    {options.isError && query === input.trim() && <div className="mt-2 text-[12px] text-[var(--color-text-secondary)]"><p role="alert">Tag suggestions could not load. You can still add your own.</p><Button variant="ghost" onClick={() => options.refetch()}>Retry tags</Button></div>}
    {open && !full && <ViewportPopover ref={panel} anchorRef={anchor} align="start" matchAnchorWidth preferredSide="bottom" onAnchorHidden={() => setOpen(false)}
      className="rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[13px] text-[var(--color-text)]" style={{ maxHeight: 264, overflowY: 'auto', boxShadow: 'var(--shadow-menu)' }}>
      {options.isFetching && <p role="status" className="p-2 text-[var(--color-text-secondary)]">Loading tags…</p>}
      <div id="editor-tag-options" role="listbox" aria-label="Tag suggestions">{rows.map((option, index) => <button key={option.value} id={`editor-tag-${index}`} data-row={index} type="button" role="option" aria-selected={selected === index} tabIndex={-1}
        onPointerDown={event => event.preventDefault()} onPointerMove={() => setActive(index)} onClick={() => add(option.value)}
        className={`min-h-11 w-full break-words rounded-[8px] px-3 py-2 text-left ${selected === index ? 'bg-[var(--color-bg-alt)]' : ''}`}>{option.label}</button>)}</div>
      {!rows.length && !options.isFetching && !options.isError && <p className="p-2 text-[var(--color-text-secondary)]">{normalized && tags.includes(normalized) ? 'This tag is already selected.' : 'Type to add a new tag.'}</p>}
    </ViewportPopover>}
  </div>
}
