// src/pages/client/MeusPedidos.jsx
import { useState } from 'react'
import { Package, Search } from 'lucide-react'
import { getPedidosByEmail } from '../../services/db'
import './MeusPedidos.css'

const STATUS_LABEL = { pendente:'Pendente',pago:'Pago',pronto:'Pronto p/ retirada',retirado:'Retirado',cancelado:'Cancelado' }
const STATUS_CLASS = { pendente:'badge-yellow',pago:'badge-green',pronto:'badge-blue',retirado:'badge-gray',cancelado:'badge-red' }

export default function MeusPedidos() {
  const [email, setEmail]   = useState('')
  const [pedidos, setPedidos] = useState(null)
  const [loading, setLoading] = useState(false)

  async function buscar(e) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const data = await getPedidosByEmail(email)
      setPedidos(data)
    } catch { setPedidos([]) }
    finally { setLoading(false) }
  }

  return (
    <div className="meus-pedidos container">
      <h1><Package size={28}/> Meus Pedidos</h1>
      <p>Informe seu e-mail para consultar seus pedidos e reservas.</p>

      <form className="mp-form" onSubmit={buscar}>
        <input className="input" type="email" placeholder="seu@email.com" value={email} onChange={e=>setEmail(e.target.value)} required/>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? <span className="spinner"/> : <Search size={16}/>}
          Buscar
        </button>
      </form>

      {pedidos !== null && (
        pedidos.length === 0
          ? <div className="mp-vazio"><Package size={40}/><p>Nenhum pedido encontrado para este e-mail.</p></div>
          : <div className="mp-lista">
              {pedidos.map(p => (
                <div key={p.id} className="mp-card card">
                  <div className="card-body">
                    <div className="mp-card-header">
                      <div>
                        <div className="mp-num">#{p.id.slice(0,8).toUpperCase()}</div>
                        <div className="mp-data">{new Date(p.created_at).toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})}</div>
                      </div>
                      <span className={`badge ${STATUS_CLASS[p.status]||'badge-gray'}`}>{STATUS_LABEL[p.status]||p.status}</span>
                    </div>
                    <div className="divider"/>
                    {(p.itens||[]).map((i,idx)=>(
                      <div key={idx} className="mp-item">
                        <span>{i.nome} × {i.quantidade}</span>
                        <span>R$ {(i.preco*i.quantidade).toFixed(2).replace('.',',')}</span>
                      </div>
                    ))}
                    <div className="divider"/>
                    <div className="mp-total">
                      <span>Total</span>
                      <strong>R$ {Number(p.total).toFixed(2).replace('.',',')}</strong>
                    </div>
                    <div className="mp-metodo">
                      {p.metodo_pag==='pix'?'💚 PIX':'💳 Cartão'} · {p.parcelas>1?`${p.parcelas}x`:'À vista'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
      )}
    </div>
  )
}
