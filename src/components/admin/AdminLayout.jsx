// src/components/admin/AdminLayout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, Bookmark, LogOut, Pill } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './AdminLayout.css'

const NAV = [
  { to:'dashboard', icon:<LayoutDashboard size={18}/>, label:'Dashboard' },
  { to:'produtos',  icon:<Package size={18}/>,         label:'Produtos' },
  { to:'pedidos',   icon:<ShoppingBag size={18}/>,     label:'Pedidos' },
  { to:'reservas',  icon:<Bookmark size={18}/>,        label:'Reservas' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function sair() {
    await logout()
    navigate('/admin/login')
  }

  return (
    <div className="admin-wrap">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon"><Pill size={16}/></div>
          <div>
            <div className="admin-brand-name">FarmaVida</div>
            <div className="admin-brand-sub">Painel Admin</div>
          </div>
        </div>

        <nav className="admin-nav">
          {NAV.map(n=>(
            <NavLink key={n.to} to={n.to} className={({isActive})=>`admin-navlink ${isActive?'active':''}`}>
              {n.icon} {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-user">
          <div className="admin-user-info">
            <div className="admin-user-avatar">{user?.email?.[0]?.toUpperCase()}</div>
            <div className="admin-user-email">{user?.email}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={sair} title="Sair">
            <LogOut size={16}/>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet/>
      </main>
    </div>
  )
}
