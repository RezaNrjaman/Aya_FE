/** M5: Cart State Context for Customer Portal */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Cart } from './types'
import { fetchCart, addToCart, updateCartItem, removeCartItem, clearCart } from './api'

interface CartContextValue {
  cart: Cart | null; itemCount: number; loading: boolean
  refreshCart: () => Promise<void>
  addItem: (pid: number, qty?: number) => Promise<void>
  updateItem: (pid: number, qty: number) => Promise<void>
  removeItem: (pid: number) => Promise<void>
  clearAll: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

function useCartMutations(setCart: (c: Cart | null) => void, setLoading: (l: boolean) => void, reload: () => Promise<void>) {
  const addItem = async (pid: number, qty = 1) => {
    setLoading(true); try { setCart(await addToCart(pid, qty)) } finally { setLoading(false) }
  }
  const updateItem = async (pid: number, qty: number) => {
    setLoading(true); try { setCart(await updateCartItem(pid, qty)) } finally { setLoading(false) }
  }
  const removeItem = async (pid: number) => {
    setLoading(true); try { setCart(await removeCartItem(pid)) } finally { setLoading(false) }
  }
  const clearAll = async () => {
    setLoading(true); try { await clearCart(); await reload() } finally { setLoading(false) }
  }
  return { addItem, updateItem, removeItem, clearAll }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)
  const refreshCart = useCallback(async () => {
    try { setCart(await fetchCart()) } catch { setCart(null) }
  }, [])
  useEffect(() => { refreshCart() }, [refreshCart])
  const mutations = useCartMutations(setCart, setLoading, refreshCart)
  const itemCount = cart?.items?.reduce((sum, it) => sum + it.quantity, 0) ?? 0

  return (
    <CartContext.Provider value={{ cart, itemCount, loading, refreshCart, ...mutations }}>
      {children}
    </CartContext.Provider>
  )
}
