// src/pages/admin/AdminLogin.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pill, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import './AdminLogin.css'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  async function handle(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await login(email, senha)
      if (error) throw error
      navigate('/admin/dashboard')
    } catch(err) {
      toast.error(err.message || 'Credenciais inválidas')
    } finally { setLoading(false) }
  }

  return (
    <div className="adm-login">
      <div className="adm-login-card">
        <div className="adm-login-brand">
          <div className="adm-login-badge">Farma &amp; Farma</div>
          <h1>Farmácia do Sílvio</h1>
          <p>Área administrativa</p>
        </div>

        <form onSubmit={handle} className="adm-login-form">
          <div className="field">
            <label>E-mail</label>
            <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="admin@farmavida.com.br"/>
          </div>
          <div className="field">
            <label>Senha</label>
            <input className="input" type="password" value={senha} onChange={e=>setSenha(e.target.value)} required placeholder="••••••••"/>
          </div>
          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
            {loading ? <span className="spinner"/> : <Lock size={16}/>}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <a href="/" style={{display:'block',textAlign:'center',marginTop:16,fontSize:13,color:'var(--text-muted)'}}>
          ← Voltar para a loja
        </a>
      </div>
    </div>
  )
}
