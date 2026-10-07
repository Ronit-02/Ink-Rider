import FilterPopover from './FilterPopover'
import Pill from './Pill'

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
  return <div className="flex min-w-max flex-1 justify-end"><FilterPopover activeFilterCount={activeFilterCount} title={`Filter by ${label.toLowerCase()}`} onClear={resetFilters}>
    <div className="mt-5"><p className="mb-3 text-[12px] font-semibold text-[var(--color-text)]">{label}</p><div className="flex flex-wrap gap-2">{options.map(option => <Pill key={option.id} label={option.label} active={value === option.id} onClick={() => onChange(option.id)} />)}</div></div>
    {sortOptions.length > 0 && <label className="mt-5 block border-t border-[var(--color-border)] pt-5 text-[12px] font-semibold text-[var(--color-text)]">Sort<select value={sortValue || defaultSort} onChange={event => onSortChange?.(event.target.value)} className="mt-3 block min-h-11 w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[13px] font-normal text-[var(--color-text)] outline-none focus:border-[var(--color-focus)]">{sortOptions.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>}
  </FilterPopover></div>
}
