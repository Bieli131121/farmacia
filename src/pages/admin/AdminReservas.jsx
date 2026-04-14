// src/pages/admin/AdminReservas.jsx
import { useState, useEffect } from 'react'
import { Bookmark, Eye, X, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { subscribeReservas, updateStatusReserva } from '../../services/db'
import './AdminReservas.css'

const STATUS_OPTS  = ['ativa','retirada','expirada','cancelada']
const STATUS_LABEL = { ativa:'Ativa', retirada:'Retirada', expirada:'Expirada', cancelada:'Cancelada' }
const STATUS_CLASS = { ativa:'badge-green', retirada:'badge-gray', expirada:'badge-yellow', cancelada:'badge-red' }

function tempoRestante(expiraEm) {
  const diff = new Date(expiraEm) - Date.now()
  if (diff <= 0) return 'Expirada'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return `${h}h ${m}m restantes`
}

export default function AdminReservas() {
  const [reservas, setReservas] = useState([])
  const [filtro, setFiltro]     = useState('todos')
  const [detalhe, setDetalhe]   = useState(null)
  const [loading, setLoading]   = useState({})

  useEffect(() => {
    const unsub = subscribeReservas(setReservas)
    return unsub
  }, [])

  async function mudarStatus(id, status) {
    setLoading(l => ({ ...l, [id]: true }))
    try {
      await updateStatusReserva(id, status)
      toast.success(`Status → ${STATUS_LABEL[status]}`)
    } catch (err) { toast.error(err.message) }
    finally { setLoading(l => ({ ...l, [id]: false })) }
  }

  const lista = filtro === 'todos' ? reservas : reservas.filter(r => r.status === filtro)

  return (
    <div className="adm-res">
      <div className="adm-page-header">
        <div>
          <h1><Bookmark size={22} /> Reservas</h1>
          <p>{reservas.filter(r => r.status === 'ativa').length} ativa{reservas.filter(r => r.status === 'ativa').length !== 1 ? 's' : ''} · {reservas.length} total</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="ped-filtros">
        {['todos', ...STATUS_OPTS].map(s => (
          <button key={s} className={`filtro-btn ${filtro === s ? 'ativo' : ''}`} onClick={() => setFiltro(s)}>
            {s === 'todos' ? 'Todas' : STATUS_LABEL[s]}
            <span className="filtro-count">
              {s === 'todos' ? reservas.length : reservas.filter(r => r.status === s).length}
            </span>
          </button>
        ))}
      </div>

      <div className="card">
        <table className="adm-table">
          <thead>
            <tr><th>#</th><th>Cliente</th><th>Itens</th><th>Expira em</th><th>Status</th><th>Data</th><th>Ações</th></tr>
          </thead>
          <tbody>
            {lista.map(r => (
              <tr key={r.id}>
                <td><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.id.slice(0, 8).toUpperCase()}</span></td>
                <td>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{r.cliente_nome}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.cliente_email}</div>
                  {r.cliente_fone && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.cliente_fone}</div>}
                </td>
                <td style={{ fontSize: 13 }}>{(r.itens || []).length} item(s)</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: r.status === 'ativa' ? 'var(--warning)' : 'var(--text-muted)' }}>
                    <Clock size={12} />
                    {r.expira_em ? tempoRestante(r.expira_em) : '—'}
                  </div>
                </td>
                <td>
                  <select
                    className={`status-select badge ${STATUS_CLASS[r.status] || 'badge-gray'}`}
                    value={r.status}
                    onChange={e => mudarStatus(r.id, e.target.value)}
                    disabled={loading[r.id]}
                  >
                    {STATUS_OPTS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </select>
                </td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {new Date(r.created_at).toLocaleDateString('pt-BR')}
                  <br />{new Date(r.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => setDetalhe(r)}>
                    <Eye size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Nenhuma reserva encontrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal detalhe */}
      {detalhe && (
        <div className="adm-modal-overlay" onClick={() => setDetalhe(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2>Reserva #{detalhe.id.slice(0, 8).toUpperCase()}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setDetalhe(null)}><X size={18} /></button>
            </div>
            <div className="adm-modal-body">
              <div className="grid-2">
                <div><b>Cliente</b><p style={{ marginTop: 4 }}>{detalhe.cliente_nome}</p></div>
                <div><b>E-mail</b><p style={{ marginTop: 4 }}>{detalhe.cliente_email}</p></div>
                <div><b>Telefone</b><p style={{ marginTop: 4 }}>{detalhe.cliente_fone || '—'}</p></div>
                <div><b>Criada em</b><p style={{ marginTop: 4 }}>{new Date(detalhe.created_at).toLocaleString('pt-BR')}</p></div>
                <div><b>Expira em</b><p style={{ marginTop: 4 }}>{detalhe.expira_em ? new Date(detalhe.expira_em).toLocaleString('pt-BR') : '—'}</p></div>
                <div>
                  <b>Status</b>
                  <p style={{ marginTop: 4 }}>
                    <span className={`badge ${STATUS_CLASS[detalhe.status] || 'badge-gray'}`}>{STATUS_LABEL[detalhe.status]}</span>
                  </p>
                </div>
              </div>

              <div className="divider" />
              <b>Itens reservados</b>
              {(detalhe.itens || []).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{item.nome}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Qtd: {item.quantidade}</div>
                  </div>
                  <div style={{ fontWeight: 600 }}>R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</div>
                </div>
              ))}

              {detalhe.observacoes && (
                <div style={{ background: 'var(--creme)', padding: 12, borderRadius: 8, fontSize: 13, marginTop: 8 }}>
                  <b>Observações:</b> {detalhe.observacoes}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  className="btn btn-primary btn-full"
                  onClick={() => { mudarStatus(detalhe.id, 'retirada'); setDetalhe(null) }}
                  disabled={detalhe.status !== 'ativa'}
                >
                  <Bookmark size={15} /> Confirmar retirada
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => { mudarStatus(detalhe.id, 'cancelada'); setDetalhe(null) }}
                  disabled={detalhe.status !== 'ativa'}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
