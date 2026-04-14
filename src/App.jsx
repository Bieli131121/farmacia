// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Client layout + pages
import ClientLayout from './components/client/ClientLayout'
import Loja        from './pages/client/Loja'
import Carrinho    from './pages/client/Carrinho'
import Checkout    from './pages/client/Checkout'
import Confirmacao from './pages/client/Confirmacao'
import MeusPedidos from './pages/client/MeusPedidos'

// Admin layout + pages
import AdminLayout   from './components/admin/AdminLayout'
import AdminLogin    from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProdutos  from './pages/admin/AdminProdutos'
import AdminPedidos   from './pages/admin/AdminPedidos'
import AdminReservas  from './pages/admin/AdminReservas'

function ProtectedAdmin({ children }) {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}><span className="spinner spinner-dark" /></div>
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* ── Área do cliente ── */}
      <Route element={<ClientLayout />}>
        <Route path="/"              element={<Loja />} />
        <Route path="/carrinho"      element={<Carrinho />} />
        <Route path="/checkout"      element={<Checkout />} />
        <Route path="/confirmacao/:id" element={<Confirmacao />} />
        <Route path="/meus-pedidos"  element={<MeusPedidos />} />
      </Route>

      {/* ── Área admin ── */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedAdmin><AdminLayout /></ProtectedAdmin>}>
        <Route index                   element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"        element={<AdminDashboard />} />
        <Route path="produtos"         element={<AdminProdutos />} />
        <Route path="pedidos"          element={<AdminPedidos />} />
        <Route path="reservas"         element={<AdminReservas />} />
      </Route>
    </Routes>
  )
}
