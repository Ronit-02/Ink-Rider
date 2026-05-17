export default function Button({ children, variant = 'primary', onClick, className = '', disabled = false, style = {} }) {
  const base = 'inline-flex items-center justify-center px-[18px] py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:   'bg-[var(--color-accent)] text-[var(--color-text-inverted)] border border-[var(--color-accent)]',
    secondary: 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]',
    ghost:     'bg-transparent text-[var(--color-text-secondary)] border border-transparent',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
      style={style}
    >
      {children}
    </button>
  )
}
