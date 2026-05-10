/* ExplorePage — wraps sub-tabs with an in-page selector on mobile */
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import Pill from '@/components/ui/Pill'

const SUB_TABS = [
  { id: 'trending',     label: '🔥 Trending',     path: '/explore/trending' },
  { id: 'questions',    label: '❓ Questions',    path: '/explore/questions' },
  { id: 'competitions', label: '🏆 Competitions', path: '/explore/competitions' },
]

export default function ExplorePage() {
  const { pathname } = useLocation()
  const navigate     = useNavigate()

  const active = SUB_TABS.find(t => pathname.startsWith(t.path))?.id || 'trending'

  return (
    <div className="flex-1 max-w-[1200px] pt-10 pb-20 px-8">
      {/* Sub-tab pills — always visible, replaces sidebar sub-items on mobile */}
      <div className="flex gap-2 mb-7 flex-wrap">
        {SUB_TABS.map(t => (
          <Pill key={t.id} label={t.label} active={active === t.id} onClick={() => navigate(t.path)} />
        ))}
      </div>

      <Outlet />
    </div>
  )
}
