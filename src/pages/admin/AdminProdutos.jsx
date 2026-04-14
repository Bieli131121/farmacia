// src/pages/admin/AdminProdutos.jsx
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Package, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { subscribeProdutos, addProduto, updateProduto, deleteProduto } from '../../services/db'
import './AdminProdutos.css'

const CATS = ['Medicamentos','Dermocosméticos','Vitaminas','Higiene','Bebê','Promoções','Outros']
const VAZIO = { nome:'', descricao:'', categoria:'Medicamentos', preco:'', preco_original:'', estoque:'', imagem_url:'' }

export default function AdminProdutos() {
  const [produtos, setProdutos] = useState([])
  const [modal, setModal]   = useState(false)
  const [form, setForm]     = useState(VAZIO)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [busca, setBusca]   = useState('')

  useEffect(()=>{
    const unsub = subscribeProdutos(setProdutos)
    return unsub
  },[])

  function abrirNovo() { setForm(VAZIO); setEditId(null); setModal(true) }
  function abrirEditar(p) {
    setForm({
      nome:p.nome, descricao:p.descricao||'', categoria:p.categoria,
      preco:String(p.preco), preco_original:p.preco_original?String(p.preco_original):'',
      estoque:String(p.estoque), imagem_url:p.imagem_url||'',
    })
    setEditId(p.id)
    setModal(true)
  }
  function fechar() { setModal(false); setEditId(null); setForm(VAZIO) }

  async function salvar(e) {
    e.preventDefault()
    if (!form.nome || !form.preco || !form.estoque) return toast.error('Preencha os campos obrigatórios')
    setLoading(true)
    try {
      const payload = {
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || null,
        categoria: form.categoria,
        preco: parseFloat(form.preco),
        preco_original: form.preco_original ? parseFloat(form.preco_original) : null,
        estoque: parseInt(form.estoque),
        imagem_url: form.imagem_url.trim() || null,
      }
      if (editId) {
        await updateProduto(editId, payload)
        toast.success('Produto atualizado!')
      } else {
        await addProduto(payload)
        toast.success('Produto adicionado!')
      }
      fechar()
    } catch(err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  async function excluir(p) {
    if (!confirm(`Excluir "${p.nome}"?`)) return
    try {
      await deleteProduto(p.id)
      toast.success('Produto removido')
    } catch(err) { toast.error(err.message) }
  }

  const lista = produtos.filter(p=>
    !busca || p.nome.toLowerCase().includes(busca.toLowerCase()) || p.categoria.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="adm-prod">
      <div className="adm-page-header">
        <div>
          <h1><Package size={22}/> Produtos</h1>
          <p>{produtos.length} produto{produtos.length!==1?'s':''} cadastrado{produtos.length!==1?'s':''}</p>
        </div>
        <button className="btn btn-primary" onClick={abrirNovo}>
          <Plus size={16}/> Novo produto
        </button>
      </div>

      <div className="adm-toolbar">
        <input className="input" placeholder="Buscar por nome ou categoria..." value={busca} onChange={e=>setBusca(e.target.value)} style={{maxWidth:320}}/>
      </div>

      <div className="card">
        <table className="adm-table">
          <thead>
            <tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Ativo</th><th>Ações</th></tr>
          </thead>
          <tbody>
            {lista.map(p=>(
              <tr key={p.id}>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    {p.imagem_url
                      ? <img src={p.imagem_url} style={{width:36,height:36,borderRadius:6,objectFit:'contain',background:'var(--creme)'}}/>
                      : <div style={{width:36,height:36,borderRadius:6,background:'var(--creme)',display:'flex',alignItems:'center',justifyContent:'center'}}><Package size={16} style={{color:'var(--border)'}}/></div>
                    }
                    <div>
                      <div style={{fontSize:14,fontWeight:500}}>{p.nome}</div>
                      {p.descricao && <div style={{fontSize:12,color:'var(--text-muted)'}}>{p.descricao.slice(0,50)}</div>}
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-blue">{p.categoria}</span></td>
                <td>
                  <div style={{fontWeight:600}}>R$ {Number(p.preco).toFixed(2).replace('.',',')}</div>
                  {p.preco_original && <div style={{fontSize:11,color:'var(--text-muted)',textDecoration:'line-through'}}>R$ {Number(p.preco_original).toFixed(2).replace('.',',')}</div>}
                </td>
                <td>
                  <span className={`badge ${p.estoque===0?'badge-red':p.estoque<=5?'badge-yellow':'badge-green'}`}>
                    {p.estoque} un
                  </span>
                </td>
                <td>
                  {p.ativo!==false
                    ? <Check size={16} style={{color:'var(--success)'}}/>
                    : <X size={16} style={{color:'var(--danger)'}}/>
                  }
                </td>
                <td>
                  <div style={{display:'flex',gap:6}}>
                    <button className="btn btn-ghost btn-sm" onClick={()=>abrirEditar(p)}><Pencil size={14}/></button>
                    <button className="btn btn-ghost btn-sm" onClick={()=>excluir(p)} style={{color:'var(--danger)'}}><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
            {lista.length===0 && (
              <tr><td colSpan={6} style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>Nenhum produto encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="adm-modal-overlay" onClick={fechar}>
          <div className="adm-modal" onClick={e=>e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2>{editId ? 'Editar produto' : 'Novo produto'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={fechar}><X size={18}/></button>
            </div>
            <form onSubmit={salvar} className="adm-modal-body">
              <div className="field">
                <label>Nome *</label>
                <input className="input" value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} required placeholder="Ex: Dipirona 500mg — 20 comprimidos"/>
              </div>
              <div className="field">
                <label>Descrição</label>
                <textarea className="input" rows={2} value={form.descricao} onChange={e=>setForm(f=>({...f,descricao:e.target.value}))} placeholder="Breve descrição do produto"/>
              </div>
              <div className="grid-2">
                <div className="field">
                  <label>Categoria *</label>
                  <select className="input" value={form.categoria} onChange={e=>setForm(f=>({...f,categoria:e.target.value}))}>
                    {CATS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Estoque *</label>
                  <input className="input" type="number" min={0} value={form.estoque} onChange={e=>setForm(f=>({...f,estoque:e.target.value}))} required placeholder="0"/>
                </div>
              </div>
              <div className="grid-2">
                <div className="field">
                  <label>Preço (R$) *</label>
                  <input className="input" type="number" step="0.01" min={0} value={form.preco} onChange={e=>setForm(f=>({...f,preco:e.target.value}))} required placeholder="0.00"/>
                </div>
                <div className="field">
                  <label>Preço original (opcional)</label>
                  <input className="input" type="number" step="0.01" min={0} value={form.preco_original} onChange={e=>setForm(f=>({...f,preco_original:e.target.value}))} placeholder="0.00"/>
                </div>
              </div>
              <div className="field">
                <label>URL da imagem (opcional)</label>
                <input className="input" type="url" value={form.imagem_url} onChange={e=>setForm(f=>({...f,imagem_url:e.target.value}))} placeholder="https://..."/>
              </div>
              <div style={{display:'flex',gap:10,justifyContent:'flex-end',paddingTop:8}}>
                <button type="button" className="btn btn-ghost" onClick={fechar}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading?<span className="spinner"/>:null}
                  {editId ? 'Salvar alterações' : 'Adicionar produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
