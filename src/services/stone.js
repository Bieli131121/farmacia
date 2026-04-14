// src/services/stone.js
// Stone Pagamentos — docs: https://docs.stone.com.br/
const BASE = 'https://sandbox-api.openbank.stone.com.br/api/v1'
const ACCOUNT_ID = import.meta.env.VITE_STONE_ACCOUNT_ID

async function token() {
  // Em produção: gere o token em uma Edge Function do Supabase
  // para não expor a chave privada no frontend.
  return import.meta.env.VITE_STONE_ACCESS_TOKEN
}

export async function criarCobrancaPix({ valor, clienteEmail }) {
  try {
    const t = await token()
    const res = await fetch(`${BASE}/pix/payment-links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({
        account_id: ACCOUNT_ID,
        amount: Math.round(valor * 100),
        expiration_date: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        transaction_id: `fv_${Date.now()}`,
      }),
    })
    if (!res.ok) throw new Error((await res.json()).message)
    const d = await res.json()
    return { id: d.id, qrCodeTexto: d.brcode, qrCodeImagem: d.qr_code_url, valor }
  } catch (e) {
    console.warn('[Stone PIX mock]', e.message)
    return mockPix(valor)
  }
}

export async function criarCobrancaCartao({ valor, parcelas = 1, cardToken, clienteNome, clienteEmail }) {
  try {
    const t = await token()
    const res = await fetch(`${BASE}/charges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({
        account_id: ACCOUNT_ID,
        amount: Math.round(valor * 100),
        currency: 'BRL',
        payment_method: 'credit',
        card_token: cardToken,
        installment_plan: { number_of_installments: parcelas },
        customer: { name: clienteNome, email: clienteEmail },
      }),
    })
    if (!res.ok) throw new Error((await res.json()).message)
    const d = await res.json()
    return { id: d.id, status: d.status }
  } catch (e) {
    console.warn('[Stone Cartão mock]', e.message)
    return mockCartao(valor)
  }
}

const mockPix = v => ({
  id: `mock_pix_${Date.now()}`, _mock: true, valor: v,
  qrCodeTexto: '00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-42661417400052040000530398654' + String(Math.round(v * 100)).padStart(10,'0') + '5802BR5913FarmaVida SC6009GAROPABA62070503***6304ABCD',
  qrCodeImagem: null,
})
const mockCartao = v => ({ id: `mock_card_${Date.now()}`, status: 'approved', _mock: true, valor: v })
