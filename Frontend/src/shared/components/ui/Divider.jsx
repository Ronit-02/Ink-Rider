/* Divider — horizontal rule using design token color */
export default function Divider({ className = '' }) {
  return <div className={`h-px w-full bg-[var(--color-border)] shrink-0 ${className}`} />
}
