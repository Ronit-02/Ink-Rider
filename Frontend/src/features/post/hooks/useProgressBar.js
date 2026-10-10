import { useState, useEffect } from "react"

export default function useReadingProgress(anchorRef, endRef) {
  const [progress, setProgress] = useState(0)

    useEffect(() => {
        const anchor = anchorRef?.current
        // AppLayout owns scrolling on the shell container. The article's own
        // <main> is content, not the element whose scrollTop changes.
        const scroller = document.querySelector('[data-app-scroll="true"]')
            || anchor?.closest('[data-app-scroll="true"]')
            || window

        const updateProgress = () => {
        const isWindow = scroller === window
        const scrollTop = isWindow ? window.scrollY : scroller.scrollTop
        const viewportHeight = isWindow
            ? window.innerHeight
            : scroller.clientHeight

        const end = endRef?.current

        if (!end) {
            setProgress(0)
            return
        }

        const scrollerTop = isWindow
            ? 0
            : scroller.getBoundingClientRect().top

        const endPosition =
            end.getBoundingClientRect().top - scrollerTop + scrollTop

        const total = endPosition - viewportHeight

        setProgress(
            total > 0
            ? Math.min(100, Math.max(0, (scrollTop / total) * 100))
            : 0
        )
        }

        updateProgress()
        scroller.addEventListener('scroll', updateProgress, { passive: true })
        window.addEventListener('resize', updateProgress)

        return () => {
        scroller.removeEventListener('scroll', updateProgress)
        window.removeEventListener('resize', updateProgress)
        }
    }, [anchorRef, endRef])

    return progress
}