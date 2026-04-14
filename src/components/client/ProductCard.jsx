// src/components/client/ProductCard.jsx
import { useState } from 'react'
import { ShoppingCart, Package, Star } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import './ProductCard.css'

export default function ProductCard({ produto }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const semEstoque = produto.estoque <= 0
  const desc = produto.preco_original
    ? Math.round((1 - produto.preco / produto.preco_original) * 100) : null

  function handle(e) {
    e.preventDefault()
    addItem(produto)
    setAdded(true)
    setTimeout(()=>setAdded(false), 1400)
  }

  return (
    <div className="pcard">
      {desc && <span className="pcard-desc">-{desc}%</span>}
      {semEstoque && <span className="pcard-out">Indisponível</span>}
      <div className="pcard-img">
        {produto.imagem_url
          ? <img src={produto.imagem_url} alt={produto.nome} />
          : <Package size={36} />
        }
      </div>
      <div className="pcard-body">
        <span className="pcard-cat">{produto.categoria}</span>
        <h3 className="pcard-nome">{produto.nome}</h3>
        {produto.descricao && <p className="pcard-descr">{produto.descricao}</p>}
        <div className="pcard-stars">
          {[1,2,3,4,5].map(i=><Star key={i} size={11} fill={i<=4?'#f59e0b':'none'} stroke="#f59e0b"/>)}
        </div>
        <div className="pcard-preco-row">
          {produto.preco_original && (
            <span className="pcard-old">R$ {produto.preco_original.toFixed(2).replace('.',',')}</span>
          )}
          <span className="pcard-preco">R$ {produto.preco.toFixed(2).replace('.',',')}</span>
        </div>
        <div className="pcard-estoque">
          {semEstoque ? <span style={{color:'var(--danger)',fontSize:12}}>Sem estoque</span>
            : <span style={{color:'var(--success)',fontSize:12}}>✓ Em estoque ({produto.estoque})</span>}
        </div>
        <button className={`btn btn-primary btn-full ${added?'btn-ok':''}`}
          onClick={handle} disabled={semEstoque} style={{marginTop:8}}>
          <ShoppingCart size={15}/>
          {added ? 'Adicionado!' : 'Adicionar'}
        </button>
      </div>
    </div>
  )
}
