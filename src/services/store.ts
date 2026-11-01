import pb from '@/lib/pocketbase/client'
import type {
  Address,
  CartItem,
  CheckoutAddress,
  CheckoutOrder,
  GestaoPublicConfig,
  GestaoShopResponse,
  OrderRecord,
  Product,
  ResellerApplication,
  ShippingQuote,
  ShippingRange,
  StoreSetting,
  UserRecord,
} from '@/types/store'

const normalizeProduct = (product: Product): Product => ({
  ...product,
  variations:
    Array.isArray(product.variations) && product.variations.length > 0
      ? product.variations
      : ['Dourado'],
})

export const storeApi = {
  async getPublicConfig(): Promise<GestaoPublicConfig> {
    return pb.send<GestaoPublicConfig>('/backend/v1/butterfly/v1/public-config', {
      method: 'GET',
    })
  },

  async listLiveShop(): Promise<GestaoShopResponse> {
    const res = await pb.send<GestaoShopResponse>('/backend/v1/butterfly/v1/gestao/shop', {
      method: 'GET',
    })
    return {
      ...res,
      products: Array.isArray(res.products) ? res.products.map(normalizeProduct) : [],
    }
  },

  async listProducts(): Promise<Product[]> {
    const response = await storeApi.listLiveShop()
    return response.products
  },

  buildCheckoutUrl(
    product: Product,
    variation?: string,
    quantity = 1,
    gestaoCheckoutBase?: string,
  ): string {
    const DEFAULT_GESTAO_CHECKOUT =
      'https://butterfly-semijoias-gestao.luka251083739205.chatgpt.site/checkout'
    const base = product.checkoutUrl || gestaoCheckoutBase || DEFAULT_GESTAO_CHECKOUT
    if (!base) return ''
    try {
      const url = new URL(base, window.location.origin)
      if (product.sku) url.searchParams.set('sku', product.sku)
      if (product.id) url.searchParams.set('productId', product.id)
      url.searchParams.set('source', 'skip')
      if (variation) url.searchParams.set('variation', variation)
      if (quantity > 1) url.searchParams.set('quantity', String(quantity))
      return url.toString()
    } catch {
      const sep = base.includes('?') ? '&' : '?'
      const params = new URLSearchParams()
      if (product.sku) params.set('sku', product.sku)
      if (product.id) params.set('productId', product.id)
      params.set('source', 'skip')
      if (variation) params.set('variation', variation)
      if (quantity > 1) params.set('quantity', String(quantity))
      return `${base}${sep}${params.toString()}`
    }
  },

  redirectToCheckout(
    product: Product,
    variation?: string,
    quantity = 1,
    gestaoCheckoutBase?: string,
  ) {
    const url = storeApi.buildCheckoutUrl(product, variation, quantity, gestaoCheckoutBase)
    if (url) {
      window.location.href = url
    }
  },

  async listLegacyLocalProducts() {
    const records = await pb
      .collection('products')
      .getFullList<Product>({ sort: '-featured,-created' })
    return records.map(normalizeProduct)
  },

  async login(email: string, password: string) {
    const result = await pb.collection('users').authWithPassword<UserRecord>(email, password)
    return result.record
  },

  async register(data: { name: string; email: string; phone: string; password: string }) {
    const record = await pb.collection('users').create<UserRecord>({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      password: data.password,
      passwordConfirm: data.password,
      role: 'customer',
    })
    await pb.collection('users').authWithPassword(data.email.trim().toLowerCase(), data.password)
    return record
  },

  logout() {
    pb.authStore.clear()
  },

  currentUser() {
    return pb.authStore.record as unknown as UserRecord | null
  },

  onAuthChange(callback: (user: UserRecord | null) => void) {
    return pb.authStore.onChange(
      (_token, record) => callback(record as unknown as UserRecord | null),
      true,
    )
  },

  async refreshAuth() {
    if (!pb.authStore.isValid) return null
    try {
      const result = await pb.collection('users').authRefresh<UserRecord>()
      return result.record
    } catch {
      pb.authStore.clear()
      return null
    }
  },

  async quoteShipping(postalCode: string) {
    return pb.send<ShippingQuote>('/backend/v1/butterfly/v1/shipping/quote', {
      method: 'GET',
      query: { cep: postalCode },
    })
  },

  async createOrder(items: CartItem[], address: CheckoutAddress, clientRequestId: string) {
    return pb.send<{ order: CheckoutOrder; duplicatePrevented: boolean; testNotice?: string }>(
      '/backend/v1/butterfly/v1/checkout/orders',
      {
        method: 'POST',
        body: {
          clientRequestId,
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            variation: item.variation,
          })),
          address,
        },
      },
    )
  },

  async listOrders() {
    return pb.collection('orders').getFullList<OrderRecord>({ sort: '-created' })
  },

  async listAddresses() {
    return pb.collection('addresses').getFullList<Address>({ sort: '-is_default,-created' })
  },

  async saveAddress(userId: string, address: CheckoutAddress, label = 'Principal') {
    return pb.collection('addresses').create<Address>({
      user: userId,
      label,
      recipient: address.recipient,
      postal_code: address.postalCode.replace(/\D/g, ''),
      street: address.street,
      number: address.number,
      complement: address.complement,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state.toUpperCase(),
      is_default: true,
    })
  },

  async submitResellerApplication(
    data: Omit<ResellerApplication, 'id' | 'status' | 'notes' | 'external_sync_status' | 'created'>,
  ) {
    return pb.send<{ id: string; status: string; message: string }>(
      '/backend/v1/butterfly/v1/reseller-applications',
      { method: 'POST', body: data },
    )
  },

  async adminData() {
    const [orders, applications, products, shipping, settings] = await Promise.all([
      pb.collection('orders').getFullList<OrderRecord>({ sort: '-created' }),
      pb.collection('reseller_applications').getFullList<ResellerApplication>({ sort: '-created' }),
      pb.collection('products').getFullList<Product>({ sort: 'name' }),
      pb.collection('shipping_ranges').getFullList<ShippingRange>({ sort: 'start_cep' }),
      pb.collection('store_settings').getFullList<StoreSetting>({ sort: 'key' }),
    ])
    return { orders, applications, products: products.map(normalizeProduct), shipping, settings }
  },

  async updateApplication(id: string, data: Pick<ResellerApplication, 'status' | 'notes'>) {
    return pb.collection('reseller_applications').update<ResellerApplication>(id, data)
  },

  async updateProduct(
    id: string,
    data: Partial<Pick<Product, 'stock' | 'price_cents' | 'available'>>,
  ) {
    return pb.collection('products').update<Product>(id, data)
  },

  async updateShippingRange(id: string, data: Partial<ShippingRange>) {
    return pb.collection('shipping_ranges').update<ShippingRange>(id, data)
  },

  async updateSetting(id: string, value: Record<string, unknown>, description: string) {
    return pb.collection('store_settings').update<StoreSetting>(id, { value, description })
  },
}

export function readableError(error: unknown) {
  if (error && typeof error === 'object') {
    const candidate = error as {
      response?: { message?: string; data?: Record<string, { message?: string }> }
      message?: string
    }
    const fieldMessage = candidate.response?.data
      ? Object.values(candidate.response.data).find((item) => item?.message)?.message
      : undefined
    return (
      fieldMessage ||
      candidate.response?.message ||
      candidate.message ||
      'Não foi possível concluir. Tente novamente.'
    )
  }
  return 'Não foi possível concluir. Tente novamente.'
}
