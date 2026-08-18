import { useState, useEffect } from "react"

export default function useReadingProgress(anchorRef) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const anchor = anchorRef?.current
        // The app shell's main element exists while the post is loading, so use
        // it immediately instead of binding to window before the page ref mounts.
        const scroller = anchor?.closest('main') || document.querySelector('main') || window

        const onScroll = () => {
            const isWindow = scroller === window
            const position = isWindow ? window.scrollY : scroller.scrollTop
            const viewport = isWindow ? window.innerHeight : scroller.clientHeight
            const contentHeight = isWindow ? document.documentElement.scrollHeight : scroller.scrollHeight
            const total = contentHeight - viewport
            setProgress(total > 0 ? Math.min(100, Math.max(0, (position / total) * 100)) : 0)
        }

        onScroll()
        scroller.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll)
        return () => {
            scroller.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onScroll)
        }
    }, [anchorRef])

    return progress
}
