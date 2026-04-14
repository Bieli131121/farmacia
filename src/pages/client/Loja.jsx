// src/pages/client/Loja.jsx
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loader } from 'lucide-react'
import { subscribeProdutos } from '../../services/db'
import ProductCard from '../../components/client/ProductCard'
import './Loja.css'

const CATS = ['Todos','Medicamentos','Dermocosméticos','Vitaminas','Higiene','Bebê','Promoções']

const DEMO = [
  {id:'d1',nome:'Dipirona 500mg — 20 comprimidos',categoria:'Medicamentos',preco:8.90,estoque:50,descricao:'Analgésico e antitérmico. Genérico.',ativo:true},
  {id:'d2',nome:'Vitamina C 1000mg + Zinco',categoria:'Vitaminas',preco:34.90,preco_original:44.90,estoque:30,ativo:true},
  {id:'d3',nome:'Protetor Solar FPS 60 — 200ml',categoria:'Dermocosméticos',preco:52.00,estoque:20,ativo:true},
  {id:'d4',nome:'Bepantol Derma 30g',categoria:'Higiene',preco:22.50,estoque:15,descricao:'Cicatrizante e hidratante.',ativo:true},
  {id:'d5',nome:'Omeprazol 20mg — 28 cápsulas',categoria:'Medicamentos',preco:15.90,estoque:40,ativo:true},
  {id:'d6',nome:'Fralda Pampers G — 28 unidades',categoria:'Bebê',preco:65.90,preco_original:79.90,estoque:25,ativo:true},
  {id:'d7',nome:'Shampoo Elseve 400ml',categoria:'Higiene',preco:18.90,estoque:35,ativo:true},
  {id:'d8',nome:'Complexo B — 60 comprimidos',categoria:'Vitaminas',preco:12.50,estoque:60,ativo:true},
  {id:'d9',nome:'Ibuprofeno 600mg — 20 comprimidos',categoria:'Medicamentos',preco:11.90,estoque:0,ativo:true},
  {id:'d10',nome:'Creme Facial Nivea Q10',categoria:'Dermocosméticos',preco:42.90,preco_original:55.00,estoque:18,ativo:true},
  {id:'d11',nome:'Ômega 3 1g — 60 cápsulas',categoria:'Vitaminas',preco:28.90,estoque:22,ativo:true},
  {id:'d12',nome:'Lenços Umedecidos Bebê — 100un',categoria:'Bebê',preco:15.90,estoque:45,ativo:true},
]

export default function Loja() {
  const [produtos, setProdutos] = useState(DEMO)
  const [loading, setLoading]   = useState(true)
  const [cat, setCat]           = useState('Todos')
  const [searchParams]          = useSearchParams()
  const busca   = searchParams.get('busca') || ''
  const catParam = searchParams.get('categoria') || ''

  useEffect(() => { if (catParam) setCat(catParam) }, [catParam])

  useEffect(() => {
    let done = false
    const t = setTimeout(() => { if (!done) setLoading(false) }, 3000)
    try {
      const unsub = subscribeProdutos(data => {
        done = true
        if (data.length > 0) setProdutos(data)
        setLoading(false)
      })
      return () => { unsub(); clearTimeout(t) }
    } catch { clearTimeout(t); setLoading(false) }
  }, [])

  const lista = produtos.filter(p => {
    const okCat   = cat === 'Todos' || p.categoria === cat
    const okBusca = !busca || p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (p.descricao||'').toLowerCase().includes(busca.toLowerCase())
    return okCat && okBusca && p.ativo !== false
  })

  return (
    <div>
      {/* Hero */}
      <section className="loja-hero">
        <div className="container">
          <h1>Sua saúde em<br/><em>boas mãos</em></h1>
          <p>Reserve online e retire em até 2h.<br/>PIX ou cartão pela Stone Pagamentos.</p>
        </div>
        <div className="hero-blob hero-blob-1"/>
        <div className="hero-blob hero-blob-2"/>
      </section>

      {/* Filtros */}
      <div className="loja-filtros container">
        <div className="filtros-scroll">
          {CATS.map(c => (
            <button key={c} className={`filtro-btn ${cat===c?'ativo':''}`} onClick={()=>setCat(c)}>{c}</button>
          ))}
        </div>
        <span style={{fontSize:13,color:'var(--text-muted)',whiteSpace:'nowrap'}}>
          {lista.length} produto{lista.length!==1?'s':''}
        </span>
      </div>

      {/* Grid */}
      <div className="container" style={{paddingBottom:60}}>
        {loading ? (
          <div className="loja-center">
            <Loader size={30} style={{animation:'spin .7s linear infinite'}}/>
            <span>Carregando produtos...</span>
          </div>
        ) : lista.length === 0 ? (
          <div className="loja-center">
            <p>Nenhum produto encontrado.</p>
            <button className="btn btn-outline" onClick={()=>setCat('Todos')}>Ver todos</button>
          </div>
        ) : (
          <div className="grid-4">
            {lista.map(p => <ProductCard key={p.id} produto={p}/>)}
          </div>
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
