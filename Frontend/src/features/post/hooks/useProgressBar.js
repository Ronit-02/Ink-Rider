import { useState, useEffect } from "react"


export default function useReadingProgress() {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const onScroll = () => {
            const total = document.documentElement.scrollHeight - window.innerHeight
            setProgress(total > 0 ? (window.pageYOffset / total) * 100 : 0)
        }

        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return progress
}