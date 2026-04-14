// src/context/CartContext.jsx
import { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [itens, setItens] = useState([])

  const addItem = useCallback((produto, quantidade = 1) => {
    setItens(prev => {
      const ex = prev.find(i => i.produtoId === produto.id)
      if (ex) return prev.map(i => i.produtoId === produto.id
        ? { ...i, quantidade: Math.min(i.quantidade + quantidade, produto.estoque) } : i)
      return [...prev, { produtoId: produto.id, nome: produto.nome, preco: produto.preco,
        imagemUrl: produto.imagem_url, quantidade, estoqueMax: produto.estoque }]
    })
  }, [])

  const removeItem  = useCallback(id => setItens(p => p.filter(i => i.produtoId !== id)), [])
  const updateQtd   = useCallback((id, qtd) => {
    if (qtd <= 0) return setItens(p => p.filter(i => i.produtoId !== id))
    setItens(p => p.map(i => i.produtoId === id ? { ...i, quantidade: Math.min(qtd, i.estoqueMax) } : i))
  }, [])
  const limpar = useCallback(() => setItens([]), [])

  const total    = itens.reduce((s, i) => s + i.preco * i.quantidade, 0)
  const qtdTotal = itens.reduce((s, i) => s + i.quantidade, 0)

  return (
    <CartContext.Provider value={{ itens, addItem, removeItem, updateQtd, limpar, total, qtdTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
