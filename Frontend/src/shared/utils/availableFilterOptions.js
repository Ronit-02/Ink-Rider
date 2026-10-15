export const availableFilterOptions = (options, items, getValues, selected, mayHaveMore = false) => {
  if (!items.length) return []
  const values = new Set(items.flatMap(item => getValues(item)).map(value => String(value).trim().toLowerCase()).filter(Boolean))
  return options.filter((option, index) => index === 0 || values.has(option.id) || (mayHaveMore && option.id === selected))
}

export const tagFilterOptions = (items, selected, mayHaveMore = false) => {
  if (!items.length) return []
  const counts = new Map()
  items.forEach(item => new Set((item.tags || []).map(tag => String(tag).trim().toLowerCase()).filter(Boolean)).forEach(tag => counts.set(tag, (counts.get(tag) || 0) + 1)))
  const tags = [...counts].filter(([tag, count]) => count < items.length || (mayHaveMore && tag === selected)).map(([tag]) => tag)
  if (mayHaveMore && selected && selected !== 'all' && !tags.includes(selected)) tags.push(selected)
  tags.sort()
  return tags.length ? [{ id: 'all', label: 'All' }, ...tags.map(tag => ({ id: tag, label: tag.charAt(0).toUpperCase() + tag.slice(1) }))] : []
}
