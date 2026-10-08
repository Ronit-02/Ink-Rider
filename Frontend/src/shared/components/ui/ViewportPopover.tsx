import { forwardRef, useLayoutEffect, useRef, type HTMLAttributes, type RefObject } from 'react'
import { createPortal } from 'react-dom'

type Props = HTMLAttributes<HTMLDivElement> & {
  anchorRef: RefObject<HTMLElement>
  pinOnMobile?: boolean
  matchAnchorWidth?: boolean
  align?: 'start' | 'end'
  onAnchorHidden?: () => void
}

// Keep the caller's semantics, actions, and focus behavior; own only placement.
const ViewportPopover = forwardRef<HTMLDivElement, Props>(function ViewportPopover({ anchorRef, pinOnMobile = false, matchAnchorWidth = false, align = 'end', onAnchorHidden, style, children, ...props }, forwardedRef) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const closeRef = useRef(onAnchorHidden)
  closeRef.current = onAnchorHidden
  useLayoutEffect(() => {
    const panel = panelRef.current
    const anchor = anchorRef.current
    if (!panel || !anchor) return
    let pinned: { left: number; top: number } | null = null
    const update = (resetPin = false) => {
      if (resetPin) pinned = null
      const viewport = window.visualViewport
      const gap = 8
      const viewportTop = viewport?.offsetTop || 0
      const viewportLeft = viewport?.offsetLeft || 0
      const root = anchor.closest('[data-app-scroll]')?.getBoundingClientRect()
      const navbar = document.querySelector('[aria-label="Global navigation"]')?.getBoundingClientRect()
      const bottomBar = document.querySelector('[aria-label="Mobile primary navigation"]')?.getBoundingClientRect()
      const inNavbar = anchor.closest('[aria-label="Global navigation"]') !== null
      const inDialog = anchor.closest('dialog[open]') !== null
      const left = Math.max(viewportLeft, root?.left || 0) + gap
      const right = Math.min(viewportLeft + (viewport?.width || window.innerWidth), root?.right || Infinity) - gap
      const top = Math.max(viewportTop, inNavbar || inDialog ? 0 : (navbar?.bottom || 0)) + gap
      const bottom = Math.min(viewportTop + (viewport?.height || window.innerHeight), !inDialog && bottomBar?.height ? bottomBar.top : Infinity) - gap
      const bounds = anchor.getBoundingClientRect()
      if (bounds.bottom < top || bounds.top > bottom) {
        closeRef.current?.()
        return
      }
      panel.style.maxWidth = `${Math.max(0, right - left)}px`
      if (matchAnchorWidth) panel.style.width = `${bounds.width}px`
      const naturalHeight = panel.scrollHeight + (panel.offsetHeight - panel.clientHeight)
      const below = Math.max(0, bottom - bounds.bottom - gap)
      const above = Math.max(0, bounds.top - gap - top)
      const opensBelow = naturalHeight <= below || below >= above
      // If neither side fits, use the larger side and keep every action scrollable.
      const maxHeight = Math.max(0, Math.min(typeof style?.maxHeight === 'number' ? style.maxHeight : Infinity, pinOnMobile ? bottom - top : (opensBelow ? below : above)))
      panel.style.maxHeight = `${maxHeight}px`
      const height = Math.min(naturalHeight, maxHeight)
      const width = panel.getBoundingClientRect().width
      const x = pinOnMobile && window.innerWidth < 768 ? left + (right - left - width) / 2 : Math.max(left, Math.min(align === 'start' ? bounds.left : bounds.right - width, right - width))
      const y = Math.max(top, Math.min(opensBelow ? bounds.bottom + gap : bounds.top - gap - height, bottom - height))
      const mobilePinned = pinOnMobile && window.innerWidth < 768
      if (!pinned || !mobilePinned) pinned = { left: x, top: y }
      panel.style.left = `${Math.max(left, Math.min(pinned.left, right - width))}px`
      panel.style.top = `${Math.max(top, Math.min(pinned.top, bottom - height))}px`
    }
    const scroll = (event: Event) => {
      if (event.target instanceof Node && panel.contains(event.target)) return
      update(true)
    }
    const resize = () => update(true)
    update()
    const observer = new ResizeObserver(() => update())
    observer.observe(panel)
    observer.observe(anchor)
    window.addEventListener('scroll', scroll, true)
    window.addEventListener('resize', resize)
    window.visualViewport?.addEventListener('resize', resize)
    window.visualViewport?.addEventListener('scroll', resize)
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', scroll, true)
      window.removeEventListener('resize', resize)
      window.visualViewport?.removeEventListener('resize', resize)
      window.visualViewport?.removeEventListener('scroll', resize)
    }
  }, [anchorRef, pinOnMobile, matchAnchorWidth, align, style?.maxHeight])
  return createPortal(<div {...props} ref={element => {
    panelRef.current = element
    if (typeof forwardedRef === 'function') forwardedRef(element)
    else if (forwardedRef) forwardedRef.current = element
  }} style={{ ...style, position: 'fixed', inset: 'auto', margin: 0, zIndex: 200, overflowY: 'auto', overscrollBehavior: 'contain' }}>{children}</div>, anchorRef.current?.closest('dialog[open]') || document.body)
})

export default ViewportPopover
