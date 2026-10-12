import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import Button from './Button'
import type { ButtonSize, ButtonVariant } from './buttonStyles'

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> & {
  label: string
  icon: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
}

export default forwardRef<HTMLButtonElement, Props>(function IconButton({ label, icon, variant = 'secondary', size = 'md', className = '', ...props }, ref) {
  return <Button {...props} ref={ref} variant={variant} size={size} aria-label={label} className={`button-circle !p-0 shrink-0 ${className}`}>
    <span data-button-icon aria-hidden="true" className="inline-flex items-center justify-center">{icon}</span>
  </Button>
})
