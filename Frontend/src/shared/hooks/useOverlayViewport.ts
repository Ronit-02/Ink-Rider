import { useLayoutEffect, useState, type CSSProperties } from 'react'

type ViewportStyle = CSSProperties & { '--overlay-height': string }

export default function useOverlayViewport(): ViewportStyle {
  const readViewport = () => {
    const viewport = window.visualViewport
    return { left: viewport?.offsetLeft || 0, top: viewport?.offsetTop || 0, width: viewport?.width || window.innerWidth, height: viewport?.height || window.innerHeight }
  }
  const [viewport, setViewport] = useState(readViewport)
  useLayoutEffect(() => {
    const update = () => setViewport(readViewport())
    window.addEventListener('resize', update)
    window.visualViewport?.addEventListener('resize', update)
    window.visualViewport?.addEventListener('scroll', update)
    return () => {
      window.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('scroll', update)
    }
  }, [])
  return { inset: 'auto', left: viewport.left, top: viewport.top, width: viewport.width, height: viewport.height, '--overlay-height': `${viewport.height}px` }
}
