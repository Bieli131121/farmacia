// src/pages/client/Carrinho.jsx
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import './Carrinho.css'

export default function Carrinho() {
  const { itens, removeItem, updateQtd, total, limpar } = useCart()
  const navigate = useNavigate()

  if (itens.length === 0) return (
    <div className="carrinho-vazio container">
      <ShoppingCart size={64} style={{color:'var(--border)'}}/>
      <h2>Seu carrinho está vazio</h2>
      <p>Adicione produtos e volte aqui para finalizar sua compra ou reserva.</p>
      <Link to="/" className="btn btn-primary btn-lg">Ver produtos</Link>
    </div>
  )

  return (
    <div className="carrinho-page container">
      <h1 className="carrinho-titulo">Meu Carrinho</h1>

      <div className="carrinho-layout">
        {/* Lista de itens */}
        <div className="carrinho-itens">
          {itens.map(item => (
            <div key={item.produtoId} className="carrinho-item">
              <div className="ci-img">
                {item.imagemUrl
                  ? <img src={item.imagemUrl} alt={item.nome}/>
                  : <ShoppingCart size={24} style={{color:'var(--border)'}}/>
                }
              </div>
              <div className="ci-info">
                <div className="ci-nome">{item.nome}</div>
                <div className="ci-preco">R$ {item.preco.toFixed(2).replace('.',',')}</div>
              </div>
              <div className="ci-qtd">
                <button className="qtd-btn" onClick={()=>updateQtd(item.produtoId, item.quantidade-1)}><Minus size={14}/></button>
                <span>{item.quantidade}</span>
                <button className="qtd-btn" onClick={()=>updateQtd(item.produtoId, item.quantidade+1)} disabled={item.quantidade>=item.estoqueMax}><Plus size={14}/></button>
              </div>
              <div className="ci-subtotal">
                R$ {(item.preco * item.quantidade).toFixed(2).replace('.',',')}
              </div>
              <button className="ci-remove" onClick={()=>removeItem(item.produtoId)}>
                <Trash2 size={16}/>
              </button>
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" onClick={limpar} style={{alignSelf:'flex-start',marginTop:8}}>
            <Trash2 size={14}/> Limpar carrinho
          </button>
        </div>

        {/* Resumo */}
        <div className="carrinho-resumo card">
          <div className="card-body">
            <h3>Resumo do pedido</h3>
            <div className="divider"/>
            {itens.map(i => (
              <div key={i.produtoId} className="resumo-linha">
                <span>{i.nome} × {i.quantidade}</span>
                <span>R$ {(i.preco*i.quantidade).toFixed(2).replace('.',',')}</span>
              </div>
            ))}
            <div className="divider"/>
            <div className="resumo-total">
              <span>Total</span>
              <span>R$ {total.toFixed(2).replace('.',',')}</span>
            </div>

            <div className="resumo-acoes">
              <button className="btn btn-primary btn-lg btn-full" onClick={()=>navigate('/checkout?modo=compra')}>
                Finalizar compra <ArrowRight size={16}/>
              </button>
              <button className="btn btn-outline btn-lg btn-full" onClick={()=>navigate('/checkout?modo=reserva')}>
                Reservar para retirada
              </button>
            </div>

            <p className="resumo-info">
              🏪 Reserva gratuita, válida por 24h.<br/>
              💳 Pagamento na retirada ou online agora.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
