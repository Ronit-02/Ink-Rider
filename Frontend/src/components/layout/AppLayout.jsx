/* AppLayout — shell with sticky sidebar + independently scrolling main content */
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import BottomBar from './BottomBar'

export default function AppLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--color-bg)]">
      {/* Fixed-height navbar */}
      <Navbar />

      {/* Content area fills remaining height, both sidebar and main inside */}
      <div className="flex flex-1 overflow-hidden mt-14">

        {/* Sidebar — stays fixed height, doesn't scroll with page */}
        <Sidebar />

        {/* Main — scrolls independently */}
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden max-md:pb-[72px]">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom bar */}
      <BottomBar />
    </div>
  )
}
