import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { storeApi } from '@/services/store'
import type { CartItem, Product, UserRecord } from '@/types/store'

interface StoreContextValue {
  products: Product[]
  productsLoading: boolean
  productsError: string
  isGestaoConfigured: boolean
  checkoutBaseUrl: string
  user: UserRecord | null
  authReady: boolean
  isAdmin: boolean
  cart: CartItem[]
  cartCount: number
  cartSubtotal: number
  addToCart: (product: Product, variation: string, quantity?: number) => void
  updateCartQuantity: (productId: string, variation: string, quantity: number) => void
  removeFromCart: (productId: string, variation: string) => void
  clearCart: () => void
  buyNow: (product: Product, variation?: string, quantity?: number) => void
  refreshProducts: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    name: string
    email: string
    phone: string
    password: string
  }) => Promise<void>
  logout: () => void
}

const StoreContext = createContext<StoreContextValue | null>(null)
const CART_KEY = 'butterfly-cart-v1'

function loadCart(): CartItem[] {
  try {
    const saved = window.localStorage.getItem(CART_KEY)
    if (!saved) return []
    const parsed = JSON.parse(saved) as CartItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')
  const [isGestaoConfigured, setIsGestaoConfigured] = useState(true)
  const [checkoutBaseUrl, setCheckoutBaseUrl] = useState('')
  const [user, setUser] = useState<UserRecord | null>(storeApi.currentUser())
  const [authReady, setAuthReady] = useState(false)
  const [cart, setCart] = useState<CartItem[]>(loadCart)

  const refreshProducts = async () => {
    setProductsLoading(true)
    setProductsError('')
    try {
      const response = await storeApi.listLiveShop()
      setProducts(response.products || [])
      setIsGestaoConfigured(response.configured)
      if (response.checkoutBaseUrl) {
        setCheckoutBaseUrl(response.checkoutBaseUrl)
      }
    } catch (err) {
      const message =
        err &&
        typeof err === 'object' &&
        'message' in err &&
        typeof (err as { message: unknown }).message === 'string'
          ? (err as { message: string }).message
          : 'Não foi possível carregar o catálogo ao vivo no momento.'
      setProducts([])
      setProductsError(message)
    } finally {
      setProductsLoading(false)
    }
  }

  useEffect(() => {
    void refreshProducts()
    const unsubscribe = storeApi.onAuthChange(setUser)
    void storeApi.refreshAuth().finally(() => setAuthReady(true))
    return unsubscribe
  }, [])

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart])

  const addToCart = (product: Product, variation: string, quantity = 1) => {
    setCart((current) => {
      const index = current.findIndex(
        (item) => item.product.id === product.id && item.variation === variation,
      )
      if (index === -1)
        return [...current, { product, variation, quantity: Math.min(quantity, product.stock) }]
      return current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
          : item,
      )
    })
  }

  const updateCartQuantity = (productId: string, variation: string, quantity: number) => {
    setCart((current) =>
      current.map((item) =>
        item.product.id === productId && item.variation === variation
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.product.stock)) }
          : item,
      ),
    )
  }

  const removeFromCart = (productId: string, variation: string) => {
    setCart((current) =>
      current.filter((item) => !(item.product.id === productId && item.variation === variation)),
    )
  }

  const login = async (email: string, password: string) => {
    await storeApi.login(email, password)
    setUser(storeApi.currentUser())
  }

  const register = async (data: {
    name: string
    email: string
    phone: string
    password: string
  }) => {
    await storeApi.register(data)
    setUser(storeApi.currentUser())
  }

  const logout = () => {
    storeApi.logout()
    setUser(null)
  }

  const buyNow = (product: Product, variation?: string, quantity = 1) => {
    const url = storeApi.buildCheckoutUrl(product, variation, quantity, checkoutBaseUrl)
    if (url) {
      window.location.href = url
    }
  }

  const value = useMemo<StoreContextValue>(
    () => ({
      products,
      productsLoading,
      productsError,
      isGestaoConfigured,
      checkoutBaseUrl,
      user,
      authReady,
      isAdmin: user?.role === 'admin',
      cart,
      cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      cartSubtotal: cart.reduce((sum, item) => sum + item.product.price_cents * item.quantity, 0),
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart: () => setCart([]),
      buyNow,
      refreshProducts,
      login,
      register,
      logout,
    }),
    [
      products,
      productsLoading,
      productsError,
      isGestaoConfigured,
      checkoutBaseUrl,
      user,
      authReady,
      cart,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore deve ser usado dentro de StoreProvider')
  return context
}
