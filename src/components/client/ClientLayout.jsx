// src/components/client/ClientLayout.jsx
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function ClientLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
