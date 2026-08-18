export default function Button({ children, variant = 'primary', onClick, className = '', disabled = false, style = {}, type = 'button', ...buttonProps }) {
  const base = 'inline-flex min-h-10 items-center justify-center px-[18px] py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:min-h-0'

  const variants = {
    primary:   'bg-[var(--color-accent)] text-[var(--color-text-inverted)] border border-[var(--color-accent)]',
    secondary: 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]',
    ghost:     'bg-transparent text-[var(--color-text-secondary)] border border-transparent',
  }

  return (
    <button
      {...buttonProps}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
      style={style}
    >
      {children}
    </button>
  )
}
