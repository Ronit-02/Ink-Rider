import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { getButtonClasses, type ButtonSize, type ButtonVariant } from './buttonStyles'

type Appearance = {
  variant?: ButtonVariant
  size?: ButtonSize
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}
type Props = Appearance & (LinkProps & { href?: never } | AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; to?: never })

export default forwardRef<HTMLAnchorElement, Props>(function ButtonLink({ variant = 'primary', size = 'md', className = '', leadingIcon, trailingIcon, children, ...props }, ref) {
  const appearance = {
    ref,
    'data-button-variant': variant,
    'data-button-size': size,
    className: getButtonClasses({ variant, size, className: `${leadingIcon || trailingIcon ? 'gap-2' : ''} ${className}` }),
  }
  const content = <>{leadingIcon && <span data-button-icon aria-hidden="true" className="inline-flex shrink-0">{leadingIcon}</span>}{children}{trailingIcon && <span data-button-icon aria-hidden="true" className="inline-flex shrink-0">{trailingIcon}</span>}</>
  return 'to' in props && props.to !== undefined ? <Link {...props} {...appearance}>{content}</Link> : <a {...props} {...appearance}>{content}</a>
})
