// src/pages/client/Confirmacao.jsx
import { Link, useSearchParams, useParams } from 'react-router-dom'
import { CheckCircle, Bookmark, Clock, Package, ArrowRight } from 'lucide-react'
import './Confirmacao.css'

export default function Confirmacao() {
  const { id } = useParams()
  const [sp]   = useSearchParams()
  const tipo   = sp.get('tipo') // 'cartao' | 'pix' | 'reserva'

  const cfg = {
    cartao: { icon:<CheckCircle size={56} style={{color:'var(--success)'}}/>, titulo:'Pagamento aprovado!', sub:'Seu pedido foi confirmado e já está sendo separado.', cor:'var(--success)' },
    pix:    { icon:<CheckCircle size={56} style={{color:'var(--pix)'}}/>,     titulo:'PIX recebido!',       sub:'Pagamento confirmado. Seu pedido está sendo preparado.',cor:'var(--pix)' },
    reserva:{ icon:<Bookmark size={56} style={{color:'var(--verde)'}}/>,      titulo:'Reserva confirmada!', sub:'Seus produtos estão reservados por 24 horas.',          cor:'var(--verde)' },
  }
  const c = cfg[tipo] || cfg.cartao

  return (
    <div className="conf container">
      <div className="conf-card card card-body">
        {c.icon}
        <h1>{c.titulo}</h1>
        <p>{c.sub}</p>

        <div className="conf-id">
          <span>Número do pedido</span>
          <strong>{id?.slice(0,8).toUpperCase()}</strong>
        </div>

        <div className="conf-steps">
          <div className="conf-step">
            <Package size={20} style={{color:c.cor}}/>
            <div>
              <b>{tipo==='reserva' ? 'Reserva ativa' : 'Pedido confirmado'}</b>
              <span>{tipo==='reserva' ? 'Válida por 24h a partir de agora' : 'Pagamento aprovado'}</span>
            </div>
          </div>
          <div className="conf-step">
            <Clock size={20} style={{color:c.cor}}/>
            <div>
              <b>Preparação</b>
              <span>Produtos sendo separados</span>
            </div>
          </div>
          <div className="conf-step">
            <CheckCircle size={20} style={{color:c.cor}}/>
            <div>
              <b>Retire na farmácia</b>
              <span>Leve o número do pedido na retirada</span>
            </div>
          </div>
        </div>

        <div className="conf-aviso">
          📍 <strong>Endereço:</strong> Rua das Flores, 123 — Centro &nbsp;|&nbsp;
          ⏰ Seg–Sex 8h–20h · Sáb 8h–18h
        </div>

        <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
          <Link to="/meus-pedidos" className="btn btn-outline">Ver meus pedidos</Link>
          <Link to="/" className="btn btn-primary">
            Continuar comprando <ArrowRight size={15}/>
          </Link>
        </div>
      </div>
    </div>
  )
}
