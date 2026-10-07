import { useLocation, useNavigate } from 'react-router-dom'
import BackIcon from '@/shared/icons/BackIcon'

type BackButtonProps = {
  fallbackTo?: string
  onBack?: () => void
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

function parentPath(pathname: string) {
  if (pathname.startsWith('/explore/questions/')) return '/explore/questions'
  if (pathname.startsWith('/explore/competitions/')) return '/explore/competitions'
  if (pathname.startsWith('/collections/')) return '/collections'
  if (pathname.startsWith('/shorts/series/')) return '/shorts'
  if (['/settings', '/history'].includes(pathname)) return '/profile'
  return '/'
}

export default function BackButton({ fallbackTo, onBack, disabled = false, className = '', ariaLabel }: BackButtonProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const handleBack = () => {
    if (onBack) return onBack()
    // BrowserRouter's index excludes an external page or a fresh direct entry.
    if (window.history.state?.idx > 0) navigate(-1)
    else navigate(fallbackTo || parentPath(location.pathname), { replace: true })
  }

  return <button type="button" onClick={handleBack} disabled={disabled} aria-label={ariaLabel}
    className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-alt)] px-3.5 py-2 text-[13px] font-normal text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}>
    <span aria-hidden="true"><BackIcon /></span>Back
  </button>
}
