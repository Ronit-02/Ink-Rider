import { forwardRef, useState } from 'react'
import { getButtonClasses } from './buttonStyles'

const Button = forwardRef(function Button({ children, variant = 'primary', size = 'md', boundary = false, flush = false, leadingIcon, trailingIcon, onClick, className = '', disabled = false, style = {}, type = 'button', ...buttonProps }, ref) {
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
  return (
    <button
      {...buttonProps}
      ref={ref}
      type={type}
      onClick={handleClick}
      disabled={disabled || busy}
      aria-busy={busy}
      data-button-variant={variant}
      data-button-size={size}
      data-button-style={variant === 'action' ? 'action' : buttonProps['data-button-style']}
      data-button-boundary={boundary || buttonProps['data-button-boundary'] || undefined}
      className={getButtonClasses({ variant, size, className: `${leadingIcon || trailingIcon ? 'gap-2' : ''} ${variant === 'disclosure' && !flush ? '!px-3 !py-3' : ''} ${className}` })}
      style={style}
    >
      {leadingIcon && <span data-button-icon aria-hidden="true" className="inline-flex shrink-0">{leadingIcon}</span>}
      {variant === 'disclosure' ? <span className="min-w-0 flex-1">{children}</span> : children}
      {trailingIcon && <span data-button-icon aria-hidden="true" className="inline-flex shrink-0">{trailingIcon}</span>}
      {variant === 'disclosure' && !trailingIcon && <svg data-disclosure-chevron aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 transition-transform duration-150 motion-reduce:transition-none ${buttonProps['aria-expanded'] ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>}
    </button>
  )
})

export default Button
