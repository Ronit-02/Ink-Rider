import Select from '@/shared/components/ui/Select'
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
    {options.length > 0 && <div className="mt-4"><p className="mb-2 text-[12px] font-semibold text-[var(--color-text)]">{label}</p><div className="flex flex-wrap gap-2">{options.map(option => <Pill key={option.id} label={option.label} active={value === option.id} onClick={() => onChange(option.id)} />)}</div></div>}
    {sortOptions.length > 0 && <div className={`mt-4 ${options.length ? 'border-t border-[var(--color-border)] pt-4' : ''}`}><Select label="Sort" value={sortValue || defaultSort} options={sortOptions.map(option => ({ value: option.id, label: option.label }))} onChange={value => onSortChange?.(value)} className="max-w-none" /></div>}
  </FilterPopover></div>
}
