/* ImageBox — lazy-loaded image container with configurable radius */
import { useEffect, useState } from 'react'

export default function ImageBox({ src, alt = '', height = 180, radius = '0px', placeholderLabel = 'Text-only story', style = {} }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [src])

  return (
    <div
      className="w-full overflow-hidden bg-[var(--color-bg-alt)] shrink-0"
      style={{ height, borderRadius: radius, ...style }}
    >
      {src && !hasError ? (
        <img src={src} alt={alt} loading="lazy" onError={() => setHasError(true)}
          className="w-full h-full object-cover block" />
      ) : (
        <div className="flex h-full w-full items-center justify-center border-y border-[var(--color-border-subtle)] px-5 text-center">
          <div>
            <span aria-hidden="true" className="block text-[clamp(28px,5vw,44px)] font-bold leading-none tracking-[-0.08em] text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>IR</span>
            <span className="mt-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{placeholderLabel}</span>
          </div>
        </div>
      )}
    </div>
  )
}
