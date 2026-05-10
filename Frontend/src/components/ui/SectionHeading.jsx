/* SectionHeading — serif display heading for page sections */
export default function SectionHeading({ children, className = '' }) {
  return (
    <h2
      className={`font-bold text-[22px] text-[var(--color-text)] tracking-[-0.4px] ${className}`}
      style={{ fontFamily: 'var(--font-display)' }}
    >
      {children}
    </h2>
  )
}
