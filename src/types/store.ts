export type ProductCategory = 'brincos' | 'colares' | 'pulseiras' | 'aneis' | 'conjuntos' | 'outras'

export interface Product {
  id: string
  sku: string
  external_id?: string
  slug: string
  name: string
  description: string
  category: ProductCategory
  price_cents: number
  compare_price_cents: number
  variations: string[]
  image_url: string
  image_alt: string
  image_is_provisional: boolean
  stock: number
  available: boolean
  featured: boolean
  is_new: boolean
  best_seller: boolean
  source: 'provisional' | 'butterfly_gestao'
  checkoutUrl?: string
  created?: string
  updated?: string
  productType?: 'jewelry' | 'tshirt' | string
  availabilityMode?: string
  modelId?: string
  modelName?: string
  color?: string
  size?: string
  photo?: string
  price?: number
}

export interface TshirtVariant {
  id: string
  sku: string
  color: string
  size: string
  price: number
  price_cents: number
  stock: number
  available: boolean
  photo?: string
  checkoutUrl?: string
}

export interface TshirtModel {
  id: string
  name: string
  description: string
  photo: string
  priceFrom: number
  priceFromCents?: number
  colors: string[]
  sizes: string[]
  variants: TshirtVariant[]
}

export interface GestaoPublicConfig {
  publicationEnabled: boolean
  storeStatus: string
  payments: {
    provider: string
    mode: string
    realChargesEnabled: boolean
  }
  shipping: {
    provider: string
    realCarrierQuote: boolean
  }
  inventory: {
    primarySource: string
    connected: boolean
    currentData: string
  }
  gestao: {
    configured: boolean
    checkoutUrl: string
  }
}

export interface GestaoShopResponse {
  configured: boolean
  source: 'butterfly_gestao'
  products: Product[]
  tshirtModels?: TshirtModel[]
  count: number
  checkoutBaseUrl?: string
  metadata?: Record<string, unknown>
}

export interface CartItem {
  product: Product
  variation: string
  quantity: number
}

export interface UserRecord {
  id: string
  email: string
  name: string
  phone: string
  role: 'customer' | 'admin' | ''
  created: string
}

export interface Address {
  id: string
  user: string
  label: string
  recipient: string
  postal_code: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  is_default: boolean
  created: string
}

export interface ShippingQuote {
  id: string
  name: string
  priceCents: number
  estimatedDaysMin: number
  estimatedDaysMax: number
  provisional: true
  notice: string
}

export interface CheckoutAddress {
  recipient: string
  postalCode: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
}

export interface OrderRecord {
  id: string
  order_number: string
  client_request_id: string
  customer: string
  items: Array<{
    productId: string
    sku: string
    name: string
    imageUrl: string
    variation: string
    quantity: number
    unitPriceCents: number
    source: string
  }>
  shipping_address: CheckoutAddress
  subtotal_cents: number
  shipping_cents: number
  total_cents: number
  shipping_label: string
  shipping_provisional: boolean
  status: string
  payment_status: string
  payment_method: 'pix'
  pix_mode: 'test_placeholder' | 'woovi_test' | 'live'
  pix_correlation_id: string
  pix_copy_paste: string
  webhook_confirmed: boolean
  external_sync_status: string
  created: string
  updated: string
}

export interface CheckoutOrder {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  totalCents: number
  shippingCents: number
  shippingLabel: string
  shippingProvisional: boolean
  pixMode: 'test_placeholder' | 'woovi_test' | 'live'
  pixCorrelationId: string
  pixCopyPaste: string
  webhookConfirmed: boolean
  created: string
}

export interface ResellerApplication {
  id: string
  name: string
  city: string
  phone: string
  whatsapp: string
  email: string
  status: 'new' | 'reviewing' | 'contacted' | 'approved' | 'declined'
  notes: string
  external_sync_status: string
  created: string
}

export interface ShippingRange {
  id: string
  name: string
  start_cep: number
  end_cep: number
  price_cents: number
  estimated_days_min: number
  estimated_days_max: number
  active: boolean
  provisional: boolean
}

export interface StoreSetting {
  id: string
  key: string
  value: Record<string, unknown>
  description: string
  sensitive: boolean
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  brincos: 'Brincos',
  colares: 'Colares',
  pulseiras: 'Pulseiras',
  aneis: 'Anéis',
  conjuntos: 'Conjuntos',
  outras: 'Outras',
}

export const formatCurrency = (valueCents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valueCents / 100)
