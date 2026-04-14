// src/pages/admin/AdminPedidos.jsx
import { useState, useEffect } from 'react'
import { ShoppingBag, Eye, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { subscribePedidos, updateStatusPedido } from '../../services/db'
import './AdminPedidos.css'

const STATUS_OPTS = ['pendente','pago','pronto','retirado','cancelado']
const STATUS_LABEL = { pendente:'Pendente',pago:'Pago',pronto:'Pronto p/ retirada',retirado:'Retirado',cancelado:'Cancelado' }
const STATUS_CLASS = { pendente:'badge-yellow',pago:'badge-green',pronto:'badge-blue',retirado:'badge-gray',cancelado:'badge-red' }

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [filtro, setFiltro]   = useState('todos')
  const [detalhe, setDetalhe] = useState(null)
  const [loading, setLoading] = useState({})

  useEffect(()=>{
    const unsub = subscribePedidos(setPedidos)
    return unsub
  },[])

  async function mudarStatus(id, status) {
    setLoading(l=>({...l,[id]:true}))
    try {
      await updateStatusPedido(id, status)
      toast.success(`Status → ${STATUS_LABEL[status]}`)
    } catch(err) { toast.error(err.message) }
    finally { setLoading(l=>({...l,[id]:false})) }
  }

  const lista = filtro==='todos' ? pedidos : pedidos.filter(p=>p.status===filtro)

  return (
    <div className="adm-ped">
      <div className="adm-page-header">
        <div>
          <h1><ShoppingBag size={22}/> Pedidos</h1>
          <p>{pedidos.length} pedido{pedidos.length!==1?'s':''} no total</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="ped-filtros">
        {['todos',...STATUS_OPTS].map(s=>(
          <button key={s} className={`filtro-btn ${filtro===s?'ativo':''}`} onClick={()=>setFiltro(s)}>
            {s==='todos'?'Todos':STATUS_LABEL[s]}
            <span className="filtro-count">
              {s==='todos' ? pedidos.length : pedidos.filter(p=>p.status===s).length}
            </span>
          </button>
        ))}
      </div>

      <div className="card">
        <table className="adm-table">
          <thead>
            <tr><th>#</th><th>Cliente</th><th>Total</th><th>Pagamento</th><th>Status</th><th>Data</th><th>Ações</th></tr>
          </thead>
          <tbody>
            {lista.map(p=>(
              <tr key={p.id}>
                <td><span style={{fontFamily:'monospace',fontSize:12}}>{p.id.slice(0,8).toUpperCase()}</span></td>
                <td>
                  <div style={{fontSize:13,fontWeight:500}}>{p.cliente_nome}</div>
                  <div style={{fontSize:11,color:'var(--text-muted)'}}>{p.cliente_email}</div>
                </td>
                <td style={{fontWeight:700}}>R$ {Number(p.total).toFixed(2).replace('.',',')}</td>
                <td>
                  <span className={`badge ${p.metodo_pag==='pix'?'badge-teal':'badge-blue'}`}>
                    {p.metodo_pag==='pix'?'PIX':`Cartão ${p.parcelas>1?`${p.parcelas}x`:''}`}
                  </span>
                </td>
                <td>
                  <select
                    className={`status-select badge ${STATUS_CLASS[p.status]||'badge-gray'}`}
                    value={p.status}
                    onChange={e=>mudarStatus(p.id,e.target.value)}
                    disabled={loading[p.id]}
                  >
                    {STATUS_OPTS.map(s=><option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </select>
                </td>
                <td style={{fontSize:12,color:'var(--text-muted)'}}>
                  {new Date(p.created_at).toLocaleDateString('pt-BR')}
                  <br/>{new Date(p.created_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={()=>setDetalhe(p)}>
                    <Eye size={14}/>
                  </button>
                </td>
              </tr>
            ))}
            {lista.length===0 && (
              <tr><td colSpan={7} style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>Nenhum pedido encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal detalhe */}
      {detalhe && (
        <div className="adm-modal-overlay" onClick={()=>setDetalhe(null)}>
          <div className="adm-modal" onClick={e=>e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2>Pedido #{detalhe.id.slice(0,8).toUpperCase()}</h2>
              <button className="btn btn-ghost btn-sm" onClick={()=>setDetalhe(null)}><X size={18}/></button>
            </div>
            <div className="adm-modal-body">
              <div className="grid-2">
                <div><b>Cliente</b><p>{detalhe.cliente_nome}</p></div>
                <div><b>E-mail</b><p>{detalhe.cliente_email}</p></div>
                <div><b>Telefone</b><p>{detalhe.cliente_fone||'—'}</p></div>
                <div><b>Data</b><p>{new Date(detalhe.created_at).toLocaleString('pt-BR')}</p></div>
              </div>
              <div className="divider"/>
              <b>Itens do pedido</b>
              {(detalhe.itens||[]).map((i,idx)=>(
                <div key={idx} style={{display:'flex',justifyContent:'space-between',fontSize:14,padding:'6px 0',borderBottom:'1px solid var(--border)'}}>
                  <span>{i.nome} × {i.quantidade}</span>
                  <span>R$ {(i.preco*i.quantidade).toFixed(2).replace('.',',')}</span>
                </div>
              ))}
              <div style={{display:'flex',justifyContent:'space-between',fontWeight:700,fontSize:16,marginTop:8}}>
                <span>Total</span>
                <span>R$ {Number(detalhe.total).toFixed(2).replace('.',',')}</span>
              </div>
              {detalhe.observacoes && (
                <div style={{background:'var(--creme)',padding:12,borderRadius:8,fontSize:13}}>
                  <b>Obs:</b> {detalhe.observacoes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
