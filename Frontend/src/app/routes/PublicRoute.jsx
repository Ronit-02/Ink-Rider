import { useSelector } from "react-redux"
import { Navigate, useLocation } from "react-router-dom"
import { safeReturnTo } from '@/features/auth/utils/returnTo'

export default function PublicRoute({children}) {
    const location = useLocation()
    const user = useSelector((state) => state.auth.user)
    const isReady = useSelector((state) => state.auth.isReady)

    if (!isReady) {
        return <main role="status" className="min-h-[40vh] flex items-center justify-center text-[13px] text-[var(--color-text-muted)]">Restoring your session…</main>
    }

    if (user) {
        return <Navigate to={safeReturnTo(location.state?.returnTo)} replace />
    }

    return children
}
