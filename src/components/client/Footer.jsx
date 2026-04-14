// src/components/client/Footer.jsx
import { Pill, Phone, MapPin, Clock } from 'lucide-react'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-logo">
            <div className="footer-logo-badge">Farma &amp; Farma</div>
          </div>
          <p>Farmácia do Sílvio.<br/>Saúde e bem-estar para toda a família.</p>
        </div>
        <div>
          <h4>Atendimento</h4>
          <ul>
            <li><Phone size={13}/> (48) 99999-9999</li>
            <li><MapPin size={13}/> Rua das Flores, 123 — Centro</li>
            <li><Clock size={13}/> Seg–Sex 8h–20h · Sáb 8h–18h</li>
          </ul>
        </div>
        <div>
          <h4>Pagamentos aceitos</h4>
          <div className="footer-pags">
            <span>PIX</span><span>Visa</span><span>Master</span><span>Elo</span>
          </div>
          <p style={{marginTop:12,fontSize:12}}>Pagamento seguro pela Stone Pagamentos</p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} FarmaVida. Todos os direitos reservados.</span>
      </div>
    </footer>
  )
}
