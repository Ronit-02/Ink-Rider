/* Tag — small category/label pill */
import { Link } from 'react-router-dom'

export default function Tag({ label, clickable = false }) {
  const className = `inline-block px-[10px] py-[6px] rounded-full bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)] text-[12px] font-medium whitespace-nowrap ${clickable ? 'cursor-pointer hover:bg-[var(--color-border)] transition-colors' : ''}`

  if (clickable) {
    return <Link to={`/search?q=${encodeURIComponent(label)}`} onClick={event => event.stopPropagation()} className={className}>{label}</Link>
  }

  return <span className={className}>{label}</span>
}
