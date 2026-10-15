import { useEffect, useRef, useState } from 'react'

export default function useFittingPills(labels: readonly string[], enabled = true) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = useState(0)
  const labelsKey = labels.join('\u0000')

  useEffect(() => {
    const container = containerRef.current
    if (!container || !enabled) return undefined
    let active = true
    const measure = () => {
      if (!active) return
      const gap = parseFloat(getComputedStyle(container).columnGap) || 0
      const available = container.getBoundingClientRect().width
      let used = 0
      let count = 0
      for (const child of container.children) {
        const next = used + (count ? gap : 0) + child.getBoundingClientRect().width
        if (next > available + 0.5) break
        used = next
        count++
      }
      setVisibleCount(current => current === count ? current : count)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    document.fonts?.ready.then(measure)
    return () => { active = false; observer.disconnect() }
  }, [labelsKey, enabled])

  return { containerRef, visibleCount }
}
