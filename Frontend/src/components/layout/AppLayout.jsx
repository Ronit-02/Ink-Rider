import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { colors } from '@/styles/tokens'
import Sidebar from './Sidebar'

export default function AppLayout() {
  return (
    <div
      style={{
        // height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: colors.surface,
        // overflow: 'hidden',
        gap: 50,
      }}
    >
      <Navbar />
      <div 
        style={{
          flex: 1,
          display: 'flex',
          gap: 32,
          padding: '0 32px',
        }}
      >
        <Sidebar />
        <main style={{ flex: 1, marginLeft: 150, marginTop: 56, overflowY: 'auto', overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
