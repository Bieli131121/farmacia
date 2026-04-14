// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { ShoppingBag, Bookmark, Package, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { getPedidos, getReservas, getProdutos } from '../../services/db'
import './AdminDashboard.css'

const STATUS_CLASS = { pendente:'badge-yellow',pago:'badge-green',pronto:'badge-blue',retirado:'badge-gray',cancelado:'badge-red' }
const STATUS_LABEL = { pendente:'Pendente',pago:'Pago',pronto:'Pronto',retirado:'Retirado',cancelado:'Cancelado' }

export default function AdminDashboard() {
  const [pedidos,  setPedidos]  = useState([])
  const [reservas, setReservas] = useState([])
  const [produtos, setProdutos] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(()=>{
    Promise.all([getPedidos(), getReservas(), getProdutos()])
      .then(([p,r,pr])=>{ setPedidos(p); setReservas(r); setProdutos(pr) })
      .catch(console.error)
      .finally(()=>setLoading(false))
  },[])

  const receitaTotal = pedidos.filter(p=>p.status==='pago'||p.status==='retirado').reduce((s,p)=>s+Number(p.total),0)
  const pedidosHoje  = pedidos.filter(p=>new Date(p.created_at).toDateString()===new Date().toDateString()).length
  const reservasAtivas = reservas.filter(r=>r.status==='ativa').length
  const estoqueBaixo   = produtos.filter(p=>p.estoque<=5).length

  const kpis = [
    { label:'Receita total',    value:`R$ ${receitaTotal.toFixed(2).replace('.',',')}`, icon:<TrendingUp size={20}/>, color:'#059669' },
    { label:'Pedidos hoje',     value:pedidosHoje,  icon:<ShoppingBag size={20}/>, color:'#1d4ed8' },
    { label:'Reservas ativas',  value:reservasAtivas, icon:<Bookmark size={20}/>,   color:'#7c3aed' },
    { label:'Estoque baixo',    value:estoqueBaixo, icon:<AlertCircle size={20}/>,  color:'#d97706' },
  ]

  if (loading) return <div style={{padding:40,color:'var(--text-muted)'}}>Carregando...</div>

  return (
    <div className="adm-dash">
      <h1>Dashboard</h1>
      <p>Visão geral da FarmaVida</p>

      {/* KPIs */}
      <div className="dash-kpis">
        {kpis.map(k=>(
          <div key={k.label} className="kpi-card card card-body">
            <div className="kpi-icon" style={{background:`${k.color}18`,color:k.color}}>{k.icon}</div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="dash-cols">
        {/* Pedidos recentes */}
        <div className="card">
          <div className="card-body" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <h3><ShoppingBag size={16}/> Pedidos recentes</h3>
            <a href="/admin/pedidos" className="btn btn-ghost btn-sm">Ver todos</a>
          </div>
          <table className="adm-table">
            <thead><tr><th>#</th><th>Cliente</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {pedidos.slice(0,6).map(p=>(
                <tr key={p.id}>
                  <td><span style={{fontFamily:'monospace',fontSize:12}}>{p.id.slice(0,8).toUpperCase()}</span></td>
                  <td><div style={{fontSize:13}}>{p.cliente_nome}</div><div style={{fontSize:11,color:'var(--text-muted)'}}>{p.cliente_email}</div></td>
                  <td style={{fontWeight:600}}>R$ {Number(p.total).toFixed(2).replace('.',',')}</td>
                  <td><span className={`badge ${STATUS_CLASS[p.status]||'badge-gray'}`}>{STATUS_LABEL[p.status]||p.status}</span></td>
                </tr>
              ))}
              {pedidos.length===0 && <tr><td colSpan={4} style={{textAlign:'center',color:'var(--text-muted)',padding:20}}>Nenhum pedido</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Reservas ativas + Estoque crítico */}
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          <div className="card card-body">
            <h3 style={{marginBottom:14}}><Bookmark size={16}/> Reservas ativas ({reservasAtivas})</h3>
            {reservas.filter(r=>r.status==='ativa').slice(0,4).map(r=>(
              <div key={r.id} className="dash-reserva-row">
                <div>
                  <div style={{fontSize:13,fontWeight:500}}>{r.cliente_nome}</div>
                  <div style={{fontSize:11,color:'var(--text-muted)'}}>{(r.itens||[]).length} item(s)</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:11,color:'var(--warning)',display:'flex',alignItems:'center',gap:3}}>
                    <Clock size={11}/> 24h
                  </div>
                </div>
              </div>
            ))}
            {reservasAtivas===0 && <p style={{fontSize:13,color:'var(--text-muted)'}}>Sem reservas ativas.</p>}
          </div>

          <div className="card card-body">
            <h3 style={{marginBottom:14}}><AlertCircle size={16}/> Estoque crítico</h3>
            {produtos.filter(p=>p.estoque<=5).slice(0,5).map(p=>(
              <div key={p.id} className="dash-stock-row">
                <span style={{fontSize:13}}>{p.nome}</span>
                <span className={`badge ${p.estoque===0?'badge-red':'badge-yellow'}`}>{p.estoque} un</span>
              </div>
            ))}
            {estoqueBaixo===0 && <p style={{fontSize:13,color:'var(--success)',display:'flex',alignItems:'center',gap:5}}><CheckCircle size={14}/> Estoque OK em todos os produtos</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
