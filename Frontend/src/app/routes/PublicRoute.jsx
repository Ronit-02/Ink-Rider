import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"

export default function PublicRoute({children}) {
    const user = useSelector((state) => state.auth.user)
    const isReady = useSelector((state) => state.auth.isReady)

    if (!isReady) {
        return <main role="status" className="min-h-[40vh] flex items-center justify-center text-[13px] text-[var(--color-text-muted)]">Restoring your session…</main>
    }

    if (user) {
        return <Navigate to="/" replace />
    }

    return children
}
