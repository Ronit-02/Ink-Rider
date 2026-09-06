import FilterPopover from './FilterPopover'

export default function FilterBar({ label = 'Filter', options, value, onChange, sortOptions = [], sortValue, onSortChange, onReset }) {
  const defaultValue = options[0]?.id
  const defaultSort = sortOptions[0]?.id
  const activeFilterCount = (value !== defaultValue ? 1 : 0) + (sortOptions.length > 0 && sortValue !== defaultSort ? 1 : 0)
  const resetFilters = () => {
    if (onReset) {
      onReset()
      return
    }
    onChange(defaultValue)
    if (sortOptions.length > 0) onSortChange?.(defaultSort)
  }
  return <div className="flex flex-1 justify-end"><FilterPopover activeFilterCount={activeFilterCount} title={`Filter by ${label.toLowerCase()}`} onClear={resetFilters}>
    <div className="mt-4"><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">{label}</p><div className="flex flex-wrap gap-2">{options.map(option => <button key={option.id} type="button" aria-pressed={value === option.id} onClick={() => onChange(option.id)} className={`min-h-11 rounded-full border px-3 py-2 text-[11px] transition-colors sm:min-h-0 ${value === option.id ? 'border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-text-inverted)]' : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-secondary)]'}`}>{option.label}</button>)}</div></div>
    {sortOptions.length > 0 && <label className="mt-4 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Sort<select value={sortValue || defaultSort} onChange={event => onSortChange?.(event.target.value)} className="mt-2 block min-h-11 w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[12px] font-normal normal-case tracking-normal text-[var(--color-text)] outline-none focus:border-[var(--color-focus)] sm:min-h-0">{sortOptions.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>}
  </FilterPopover></div>
}
