/* Tag — small category/label pill */
import { useNavigate } from 'react-router-dom'

export default function Tag({ label, clickable = false }) {
  const navigate = useNavigate()

  const handleClick = (e) => {
    if (clickable) {
      e.stopPropagation()
      navigate(`/search?q=${encodeURIComponent(label)}`)
    }
  }

  return (
    <span
      onClick={handleClick}
      className={`inline-block px-[10px] py-[6px] rounded-full bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)] text-[12px] font-medium whitespace-nowrap ${clickable ? 'cursor-pointer hover:bg-[var(--color-border)] transition-colors' : ''}`}
    >
      {label}
    </span>
  )
}
