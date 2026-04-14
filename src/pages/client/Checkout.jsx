// src/pages/client/Checkout.jsx
import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { CreditCard, QrCode, Bookmark, Lock, Copy, CheckCircle, Clock, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCart } from '../../context/CartContext'
import { criarPedido, criarReserva } from '../../services/db'
import { criarCobrancaCartao, criarCobrancaPix } from '../../services/stone'
import './Checkout.css'

export default function Checkout() {
  const { itens, total, limpar } = useCart()
  const navigate      = useNavigate()
  const [sp]          = useSearchParams()
  const modoInicial   = sp.get('modo') === 'reserva' ? 'reserva' : 'compra'

  const [modo, setModo]       = useState(modoInicial)      // 'compra' | 'reserva'
  const [metodo, setMetodo]   = useState('cartao')          // 'cartao' | 'pix'
  const [step, setStep]       = useState(1)                 // 1=dados 2=pagamento 3=aguardando pix
  const [loading, setLoading] = useState(false)
  const [dadosPix, setDadosPix] = useState(null)
  const [copiado, setCopiado] = useState(false)
  const [tempo, setTempo]     = useState(30 * 60)

  const [form, setForm] = useState({
    nome:'', email:'', fone:'', obs:'',
    // cartão
    cardNumero:'', cardNome:'', cardValidade:'', cardCvv:'', parcelas:'1',
  })

  const fmt = v => v.toFixed(2).replace('.', ',')

  function maskCard(val, type) {
    if (type==='cardNumero')   return val.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim()
    if (type==='cardValidade') return val.replace(/\D/g,'').slice(0,4).replace(/^(.{2})/,'$1/')
    if (type==='cardCvv')      return val.replace(/\D/g,'').slice(0,4)
    return val
  }
  const change = e => setForm(f=>({...f,[e.target.name]: maskCard(e.target.value, e.target.name)}))

  if (itens.length === 0) return (
    <div style={{textAlign:'center',padding:'80px 24px'}}>
      <p>Carrinho vazio.</p>
      <Link to="/" className="btn btn-primary" style={{marginTop:16}}>Ver produtos</Link>
    </div>
  )

  // ── STEP 1 — Dados ──────────────────────────────────────
  async function avancar(e) {
    e.preventDefault()
    if (!form.nome || !form.email) return toast.error('Preencha nome e e-mail')
    if (modo === 'reserva') return finalizarReserva()
    if (metodo === 'pix')   return iniciarPix()
    setStep(2)
  }

  // ── RESERVA ─────────────────────────────────────────────
  async function finalizarReserva() {
    setLoading(true)
    try {
      const id = await criarReserva({
        clienteNome: form.nome, clienteEmail: form.email,
        clienteFone: form.fone, observacoes: form.obs,
        itens: itens.map(i=>({ produtoId:i.produtoId, nome:i.nome, preco:i.preco, quantidade:i.quantidade })),
      })
      limpar()
      navigate(`/confirmacao/${id}?tipo=reserva`)
    } catch(err) {
      toast.error('Erro ao criar reserva: '+err.message)
    } finally { setLoading(false) }
  }

  // ── PIX ─────────────────────────────────────────────────
  async function iniciarPix() {
    setLoading(true)
    try {
      const pix = await criarCobrancaPix({ valor: total, clienteEmail: form.email })
      setDadosPix(pix)
      setStep(3)
      // timer
      const t = setInterval(() => setTempo(s => { if(s<=1){clearInterval(t);return 0} return s-1 }), 1000)
    } catch(err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  async function confirmarPix() {
    setLoading(true)
    try {
      const id = await criarPedido({
        clienteNome:form.nome, clienteEmail:form.email, clienteFone:form.fone,
        itens: itens.map(i=>({produtoId:i.produtoId,nome:i.nome,preco:i.preco,quantidade:i.quantidade})),
        total, metodoPag:'pix', paymentId: dadosPix?.id, observacoes:form.obs,
      })
      limpar()
      navigate(`/confirmacao/${id}?tipo=pix`)
    } catch(err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  // ── CARTÃO ──────────────────────────────────────────────
  async function pagarCartao(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const stone = await criarCobrancaCartao({
        valor: total, parcelas: parseInt(form.parcelas),
        cardToken: `tok_${Date.now()}`, // Em prod: use Stone.js para tokenizar
        clienteNome: form.nome, clienteEmail: form.email,
      })
      if (stone.status !== 'approved') throw new Error('Pagamento recusado pela operadora')
      const id = await criarPedido({
        clienteNome:form.nome, clienteEmail:form.email, clienteFone:form.fone,
        itens: itens.map(i=>({produtoId:i.produtoId,nome:i.nome,preco:i.preco,quantidade:i.quantidade})),
        total, metodoPag:'cartao', parcelas:parseInt(form.parcelas),
        paymentId: stone.id, status:'pago', observacoes:form.obs,
      })
      limpar()
      navigate(`/confirmacao/${id}?tipo=cartao`)
    } catch(err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  function copiarPix() {
    navigator.clipboard.writeText(dadosPix?.qrCodeTexto||'')
    setCopiado(true); toast.success('Código copiado!')
    setTimeout(()=>setCopiado(false),3000)
  }

  const mm = String(Math.floor(tempo/60)).padStart(2,'0')
  const ss = String(tempo%60).padStart(2,'0')
  const parcOpts = [1,2,3,6,12].map(n=>({v:String(n),l:n===1?`À vista — R$ ${fmt(total)}`:`${n}x de R$ ${fmt(total/n)} s/juros`}))
  const bandeira = (n=>(n=n.replace(/\s/g,''),/^4/.test(n)?'Visa':/^5[1-5]/.test(n)?'Master':/^6/.test(n)?'Elo':null))(form.cardNumero)

  return (
    <div className="checkout container">
      <Link to="/carrinho" className="btn btn-ghost btn-sm" style={{marginBottom:20}}>
        <ArrowLeft size={15}/> Voltar ao carrinho
      </Link>

      <div className="checkout-layout">

        {/* ── Coluna esquerda ── */}
        <div className="checkout-main">

          {/* Modo */}
          <div className="card card-body" style={{marginBottom:20}}>
            <div className="modo-tabs">
              <button className={`modo-tab ${modo==='compra'?'ativo':''}`} onClick={()=>setModo('compra')}>
                <CreditCard size={16}/> Comprar agora
              </button>
              <button className={`modo-tab ${modo==='reserva'?'ativo':''}`} onClick={()=>setModo('reserva')}>
                <Bookmark size={16}/> Reservar (grátis, 24h)
              </button>
            </div>
          </div>

          {/* Step 1 — Dados do cliente */}
          {step === 1 && (
            <form className="card card-body checkout-form" onSubmit={avancar}>
              <h3>Seus dados</h3>
              <div className="grid-2">
                <div className="field">
                  <label>Nome completo *</label>
                  <input className="input" name="nome" value={form.nome} onChange={change} required placeholder="Maria da Silva"/>
                </div>
                <div className="field">
                  <label>E-mail *</label>
                  <input className="input" type="email" name="email" value={form.email} onChange={change} required placeholder="maria@email.com"/>
                </div>
              </div>
              <div className="field">
                <label>Telefone / WhatsApp</label>
                <input className="input" name="fone" value={form.fone} onChange={change} placeholder="(48) 99999-9999"/>
              </div>

              {/* Método de pagamento (só na compra) */}
              {modo === 'compra' && (
                <>
                  <h3 style={{marginTop:8}}>Forma de pagamento</h3>
                  <div className="metodo-tabs">
                    <button type="button" className={`metodo-tab ${metodo==='cartao'?'ativo':''}`} onClick={()=>setMetodo('cartao')}>
                      <CreditCard size={16}/> Cartão de crédito
                    </button>
                    <button type="button" className={`metodo-tab ${metodo==='pix'?'ativo pix':''}`} onClick={()=>setMetodo('pix')}>
                      <QrCode size={16}/> PIX
                    </button>
                  </div>
                </>
              )}

              <div className="field">
                <label>Observações (opcional)</label>
                <textarea className="input" name="obs" value={form.obs} onChange={change} rows={2} placeholder="Ex: Medicamento de uso contínuo, preciso com urgência"/>
              </div>

              <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
                {loading ? <span className="spinner"/> : null}
                {modo==='reserva' ? 'Confirmar reserva' : metodo==='pix' ? 'Gerar código PIX' : 'Continuar para pagamento'}
              </button>
            </form>
          )}

          {/* Step 2 — Dados do cartão */}
          {step === 2 && modo === 'compra' && metodo === 'cartao' && (
            <form className="card card-body checkout-form" onSubmit={pagarCartao}>
              <h3>Dados do cartão</h3>

              {/* Preview cartão */}
              <div className="card-preview">
                <div className="card-visual">
                  <div className="card-chip"/>
                  <div className="card-num">{form.cardNumero||'•••• •••• •••• ••••'}</div>
                  <div className="card-row">
                    <div><span className="card-lbl">TITULAR</span><span className="card-val">{form.cardNome.toUpperCase()||'SEU NOME'}</span></div>
                    <div><span className="card-lbl">VALIDADE</span><span className="card-val">{form.cardValidade||'MM/AA'}</span></div>
                    {bandeira && <span className="card-brand">{bandeira}</span>}
                  </div>
                </div>
              </div>

              <div className="field">
                <label>Número do cartão</label>
                <input className="input" name="cardNumero" value={form.cardNumero} onChange={change} placeholder="0000 0000 0000 0000" required maxLength={19}/>
              </div>
              <div className="field">
                <label>Nome no cartão</label>
                <input className="input" name="cardNome" value={form.cardNome} onChange={change} placeholder="Como impresso no cartão" required/>
              </div>
              <div className="grid-2">
                <div className="field">
                  <label>Validade</label>
                  <input className="input" name="cardValidade" value={form.cardValidade} onChange={change} placeholder="MM/AA" required maxLength={5}/>
                </div>
                <div className="field">
                  <label>CVV</label>
                  <input className="input" name="cardCvv" value={form.cardCvv} onChange={change} placeholder="•••" required maxLength={4}/>
                </div>
              </div>
              <div className="field">
                <label>Parcelamento</label>
                <select className="input" name="parcelas" value={form.parcelas} onChange={change}>
                  {parcOpts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              </div>

              <div className="checkout-secure">
                <Lock size={13}/> Pagamento processado pela Stone Pagamentos — 100% seguro
              </div>

              <div style={{display:'flex',gap:10}}>
                <button type="button" className="btn btn-ghost" onClick={()=>setStep(1)}>
                  <ArrowLeft size={14}/> Voltar
                </button>
                <button type="submit" className="btn btn-primary btn-lg" style={{flex:1}} disabled={loading}>
                  {loading ? <span className="spinner"/> : <CreditCard size={16}/>}
                  {loading ? 'Processando...' : `Pagar R$ ${fmt(total)}`}
                </button>
              </div>
            </form>
          )}

          {/* Step 3 — Aguardar PIX */}
          {step === 3 && (
            <div className="card card-body checkout-form">
              <div className="pix-header">
                <div className="pix-logo">PIX</div>
                <div>
                  <div style={{fontSize:24,fontWeight:700,color:'var(--verde-escuro)'}}>R$ {fmt(total)}</div>
                  <div style={{fontSize:13,color:'var(--text-muted)'}}>Escaneie ou copie o código</div>
                </div>
              </div>

              <div className="pix-qr">
                {dadosPix?.qrCodeImagem
                  ? <img src={dadosPix.qrCodeImagem} alt="QR PIX" style={{width:160,height:160}}/>
                  : <QrCode size={80} style={{color:'var(--pix)'}}/>
                }
              </div>

              <div className={`pix-timer ${tempo===0?'exp':''}`}>
                <Clock size={13}/>
                {tempo===0 ? 'Código expirado' : `Expira em ${mm}:${ss}`}
              </div>

              {dadosPix?.qrCodeTexto && (
                <div className="pix-copy">
                  <span className="pix-copy-txt">{dadosPix.qrCodeTexto.slice(0,60)}…</span>
                  <button className={`btn btn-sm ${copiado?'btn-primary':'btn-outline'}`} onClick={copiarPix}>
                    {copiado?<CheckCircle size={13}/>:<Copy size={13}/>} {copiado?'Copiado!':'Copiar'}
                  </button>
                </div>
              )}

              <div className="pix-steps">
                <b>Como pagar:</b>
                <ol><li>Abra o app do banco</li><li>PIX → Pagar → QR Code ou Copia e Cola</li><li>Confirme o valor de <b>R$ {fmt(total)}</b></li></ol>
              </div>

              <button className="btn btn-primary btn-lg btn-full" onClick={confirmarPix} disabled={loading||tempo===0}>
                {loading?<span className="spinner"/>:<CheckCircle size={16}/>}
                {loading?'Registrando...':'Já paguei via PIX'}
              </button>
            </div>
          )}
        </div>

        {/* ── Resumo lateral ── */}
        <div className="checkout-resumo card card-body">
          <h3>Resumo</h3>
          <div className="divider"/>
          {itens.map(i=>(
            <div key={i.produtoId} className="res-linha">
              <span>{i.nome} ×{i.quantidade}</span>
              <span>R$ {fmt(i.preco*i.quantidade)}</span>
            </div>
          ))}
          <div className="divider"/>
          <div className="res-total"><span>Total</span><span>R$ {fmt(total)}</span></div>
          {modo==='reserva' && (
            <div className="res-info">
              <Bookmark size={13}/> Reserva gratuita · sem pagamento agora · válida 24h
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
