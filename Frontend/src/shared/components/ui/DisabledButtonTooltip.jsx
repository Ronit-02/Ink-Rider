import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

function buttonReason(button) {
  const explicit = button.dataset.disabledReason || button.getAttribute('title')
  if (explicit) return explicit
  if (button.getAttribute('aria-busy') === 'true') return 'Please wait for the current action to finish.'

  const label = (button.getAttribute('aria-label') || button.textContent || '').trim().toLowerCase()
  if (/\b(earlier|previous|first)\b/.test(label)) return 'This item is already at the beginning.'
  if (/\b(later|next|last)\b/.test(label)) return 'This item is already at the end.'

  const invalid = button.form?.querySelector(':invalid')
  if (invalid) {
    const field = invalid.labels?.[0]?.textContent?.trim() || invalid.getAttribute('aria-label') || invalid.getAttribute('placeholder') || 'the required fields'
    return `Complete ${field} to continue.`
  }
  return 'This action is unavailable until its requirements are met.'
}

export default function DisabledButtonTooltip() {
  const [tip, setTip] = useState(null)

  useEffect(() => {
    const update = event => {
      const button = document.elementsFromPoint(event.clientX, event.clientY)
        .map(element => element.closest?.('button'))
        .find(element => element?.disabled || element?.getAttribute('aria-disabled') === 'true')
      if (!button) { setTip(null); return }
      setTip({ text: buttonReason(button), x: event.clientX, y: event.clientY, container: button.closest('dialog[open]') || document.body })
    }
    const hide = () => setTip(null)
    document.addEventListener('pointermove', update, true)
    document.addEventListener('scroll', hide, true)
    window.addEventListener('blur', hide)
    return () => {
      document.removeEventListener('pointermove', update, true)
      document.removeEventListener('scroll', hide, true)
      window.removeEventListener('blur', hide)
    }
  }, [])

  if (!tip) return null
  return createPortal(<div role="tooltip" className="pointer-events-none fixed z-[10000] max-w-[min(18rem,calc(100vw-2rem))] rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[12px] leading-5 text-[var(--color-text)] shadow-[var(--shadow-menu)]" style={{ left: Math.max(8, Math.min(tip.x + 12, window.innerWidth - 300)), top: Math.max(8, Math.min(tip.y + 14, window.innerHeight - 80)) }}>{tip.text}</div>, tip.container)
}
