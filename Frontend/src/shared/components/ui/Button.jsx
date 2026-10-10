import { useState } from 'react'

export default function Button({ children, variant = 'primary', boundary = false, leadingIcon, trailingIcon, onClick, className = '', disabled = false, style = {}, type = 'button', ...buttonProps }) {
  const [pendingClick, setPendingClick] = useState(false)
  const busy = pendingClick || buttonProps['aria-busy'] === true
  const handleClick = event => {
    if (disabled || busy) return
    const result = onClick?.(event)
    // Retry callbacks return query promises; callers still own their errors.
    if (result && typeof result.then === 'function') {
      setPendingClick(true)
      Promise.resolve(result).finally(() => setPendingClick(false)).catch(() => {})
    }
  }
  const base = 'inline-flex min-h-10 items-center justify-center px-[18px] py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:min-h-0'

  const variants = {
    primary:   'bg-[var(--color-accent)] text-[var(--color-text-inverted)] border border-[var(--color-accent)]',
    secondary: 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]',
    ghost:     'bg-transparent text-[var(--color-text-secondary)] border border-transparent',
    action:    'bg-transparent text-[var(--color-text-secondary)] border border-transparent gap-2 hover:bg-[var(--color-bg-alt)]',
    menu:      'w-full justify-start rounded-[8px] bg-transparent text-[var(--color-text-secondary)] border border-transparent gap-2.5 hover:bg-[var(--color-bg-alt)]',
  }

  return (
    <button
      {...buttonProps}
      type={type}
      onClick={handleClick}
      disabled={disabled || busy}
      aria-busy={busy}
      data-button-style={variant === 'action' ? 'action' : buttonProps['data-button-style']}
      data-button-boundary={boundary || buttonProps['data-button-boundary'] || undefined}
      className={`${base} ${leadingIcon || trailingIcon ? 'gap-2' : ''} ${variants[variant]} ${className}`}
      style={style}
    >
      {leadingIcon && <span data-button-icon aria-hidden="true" className="inline-flex shrink-0">{leadingIcon}</span>}
      {children}
      {trailingIcon && <span data-button-icon aria-hidden="true" className="inline-flex shrink-0">{trailingIcon}</span>}
    </button>
  )
}
