// src/services/db.js
import { supabase } from './supabase'

// ── PRODUTOS ──────────────────────────────────────────────

export async function getProdutos() {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('ativo', true)
    .order('categoria')
  if (error) throw error
  return data
}

export async function addProduto(produto) {
  const { data, error } = await supabase
    .from('produtos')
    .insert([{
      nome: produto.nome,
      descricao: produto.descricao || null,
      categoria: produto.categoria,
      preco: produto.preco,
      preco_original: produto.precoOriginal || null,
      estoque: produto.estoque ?? 0,
      imagem_url: produto.imagemUrl || null,
      ativo: true,
    }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProduto(id, campos) {
  const { error } = await supabase
    .from('produtos')
    .update({ ...campos, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function deleteProduto(id) {
  // soft delete
  const { error } = await supabase
    .from('produtos')
    .update({ ativo: false })
    .eq('id', id)
  if (error) throw error
}

export function subscribeProdutos(callback) {
  // busca inicial
  getProdutos().then(callback).catch(console.error)
  // realtime
  const channel = supabase
    .channel('produtos-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, () => {
      getProdutos().then(callback).catch(console.error)
    })
    .subscribe()
  return () => supabase.removeChannel(channel)
}

// ── PEDIDOS ──────────────────────────────────────────────

export async function criarPedido(pedido) {
  // Insere o pedido
  const { data, error } = await supabase
    .from('pedidos')
    .insert([{
      cliente_nome:  pedido.clienteNome,
      cliente_email: pedido.clienteEmail,
      cliente_fone:  pedido.clienteFone || null,
      itens:         pedido.itens,
      total:         pedido.total,
      metodo_pag:    pedido.metodoPag,
      parcelas:      pedido.parcelas || 1,
      status:        'pendente',
      payment_id:    pedido.paymentId || null,
      observacoes:   pedido.observacoes || null,
    }])
    .select()
    .single()
  if (error) throw error

  // Decrementa estoque
  for (const item of pedido.itens) {
    await supabase.rpc('decrementar_estoque', {
      produto_id: item.produtoId,
      qtd: item.quantidade,
    })
  }
  return data.id
}

export async function getPedidos() {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getPedidosByEmail(email) {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .eq('cliente_email', email)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateStatusPedido(id, status, extra = {}) {
  const { error } = await supabase
    .from('pedidos')
    .update({ status, updated_at: new Date().toISOString(), ...extra })
    .eq('id', id)
  if (error) throw error
}

export function subscribePedidos(callback) {
  getPedidos().then(callback).catch(console.error)
  const channel = supabase
    .channel('pedidos-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
      getPedidos().then(callback).catch(console.error)
    })
    .subscribe()
  return () => supabase.removeChannel(channel)
}

// ── RESERVAS ──────────────────────────────────────────────

export async function criarReserva(reserva) {
  const { data, error } = await supabase
    .from('reservas')
    .insert([{
      cliente_nome:  reserva.clienteNome,
      cliente_email: reserva.clienteEmail,
      cliente_fone:  reserva.clienteFone || null,
      itens:         reserva.itens,
      observacoes:   reserva.observacoes || null,
      status:        'ativa',
      expira_em:     new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }])
    .select()
    .single()
  if (error) throw error

  for (const item of reserva.itens) {
    await supabase.rpc('decrementar_estoque', {
      produto_id: item.produtoId,
      qtd: item.quantidade,
    })
  }
  return data.id
}

export async function getReservas() {
  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateStatusReserva(id, status) {
  const { error } = await supabase
    .from('reservas')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export function subscribeReservas(callback) {
  getReservas().then(callback).catch(console.error)
  const channel = supabase
    .channel('reservas-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reservas' }, () => {
      getReservas().then(callback).catch(console.error)
    })
    .subscribe()
  return () => supabase.removeChannel(channel)
}
