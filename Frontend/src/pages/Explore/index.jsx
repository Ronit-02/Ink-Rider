import { useState } from 'react'
import { colors, fontSizes, transitions } from '@/styles/tokens'
import { Outlet } from 'react-router-dom'

export default function ExplorePage() {

  return (
    <main style={{ flex: 1, marginLeft: 25, marginTop: 40, overflowY: 'auto', overflowX: 'hidden', maxWidth: 1200 }}>
      <Outlet />
    </main>
  )
}
