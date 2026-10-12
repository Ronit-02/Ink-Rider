export type ButtonSize = 'sm' | 'md' | 'lg'
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'action' | 'menu' | 'disclosure' | 'danger' | 'selector'

const sizes: Record<ButtonSize, string> = {
  sm: 'button-size-sm px-3 py-2 text-[12px]',
  md: 'button-size-md px-[18px] py-2 text-[13px]',
  lg: 'button-size-lg px-6 py-3 text-[15px]',
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--color-accent)] text-[var(--color-text-inverted)] border border-[var(--color-accent)]',
  secondary: 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]',
  ghost: 'bg-transparent text-[var(--color-text-secondary)] border border-transparent',
  action: 'bg-transparent text-[var(--color-text-secondary)] border border-transparent gap-2 hover:bg-[var(--color-bg-alt)]',
  menu: 'w-full !justify-start !rounded-[8px] bg-transparent text-[var(--color-text-secondary)] border border-transparent gap-2.5 hover:bg-[var(--color-bg-alt)]',
  disclosure: 'w-full !justify-between !rounded-none !whitespace-normal !text-left gap-3 bg-transparent text-[var(--color-text)] border-0 hover:bg-[var(--color-bg-alt)]',
  danger: 'bg-[var(--color-danger)] text-[var(--color-text-inverted)] border border-[var(--color-danger)]',
  selector: 'bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-accent)]',
}

// Native buttons and navigation links share appearance without sharing behavior.
export function getButtonClasses({ variant = 'primary', size = 'md', className = '' }: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return `app-button inline-flex items-center justify-center rounded-full font-medium whitespace-nowrap transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]} ${className}`
}
