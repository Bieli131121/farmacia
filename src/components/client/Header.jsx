// src/components/client/Header.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, Menu, X, Pill } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import './Header.css'

const CATS = ['Medicamentos','Dermocosméticos','Vitaminas','Higiene','Bebê','Promoções']

export default function Header() {
  const { qtdTotal } = useCart()
  const [open, setOpen] = useState(false)
  const [q, setQ]       = useState('')
  const navigate        = useNavigate()

  function buscar(e) {
    e.preventDefault()
    navigate(`/?busca=${encodeURIComponent(q)}`)
    setOpen(false)
  }

  return (
    <header className="hdr">
      <div className="hdr-top">
        <span>🏪 Retire na farmácia em até 2h após confirmação do pedido</span>
        <Link to="/admin/login">Área administrativa →</Link>
      </div>

      <div className="hdr-main container">
        <Link to="/" className="hdr-logo">
          <div className="logo-icon"><Pill size={18} /></div>
          <div>
            <div className="logo-name">FarmaVida</div>
            <div className="logo-sub">Saúde &amp; Bem-estar</div>
          </div>
        </Link>

        <form className="hdr-search" onSubmit={buscar}>
          <Search size={15} style={{color:'var(--text-muted)',flexShrink:0}} />
          <input placeholder="Buscar medicamentos, produtos..." value={q} onChange={e=>setQ(e.target.value)} />
          <button type="submit" className="btn btn-primary btn-sm">Buscar</button>
        </form>

        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <Link to="/meus-pedidos" className="btn btn-ghost btn-sm" style={{display:'none'}} id="pedidos-link">Meus pedidos</Link>
          <Link to="/carrinho" className="cart-btn">
            <ShoppingCart size={20} />
            {qtdTotal > 0 && <span className="cart-badge">{qtdTotal}</span>}
          </Link>
          <button className="hdr-menu-btn" onClick={()=>setOpen(!open)}>
            {open ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
      </div>

      <nav className="hdr-nav container">
        {CATS.map(c => (
          <Link key={c} to={`/?categoria=${encodeURIComponent(c)}`} className="hdr-navlink">{c}</Link>
        ))}
        <Link to="/meus-pedidos" className="hdr-navlink" style={{marginLeft:'auto',color:'var(--verde)'}}>Meus pedidos</Link>
      </nav>

      {open && (
        <div className="hdr-mobile">
          <form className="hdr-mobile-search" onSubmit={buscar}>
            <input className="input" placeholder="Buscar..." value={q} onChange={e=>setQ(e.target.value)} />
          </form>
          {CATS.map(c => (
            <Link key={c} to={`/?categoria=${encodeURIComponent(c)}`} className="hdr-mobile-link" onClick={()=>setOpen(false)}>{c}</Link>
          ))}
          <Link to="/meus-pedidos" className="hdr-mobile-link" onClick={()=>setOpen(false)}>Meus pedidos</Link>
        </div>
      )}
    </header>
  )
}
