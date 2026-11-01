import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Check,
  Copy,
  Minus,
  Plus,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useStore } from '@/contexts/StoreContext'
import { useToast } from '@/hooks/use-toast'
import { readableError, storeApi } from '@/services/store'
import {
  formatCurrency,
  type CheckoutAddress,
  type CheckoutOrder,
  type ShippingQuote,
} from '@/types/store'

const emptyAddress: CheckoutAddress = {
  recipient: '',
  postalCode: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
}

export default function CartCheckoutPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { cart, cartSubtotal, updateCartQuantity, removeFromCart, clearCart, user, authReady } =
    useStore()
  const [address, setAddress] = useState<CheckoutAddress>(emptyAddress)
  const [saveAddress, setSaveAddress] = useState(true)
  const [quote, setQuote] = useState<ShippingQuote | null>(null)
  const [quoting, setQuoting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [order, setOrder] = useState<CheckoutOrder | null>(null)
  const [qrData, setQrData] = useState('')
  const [checkoutId] = useState(() => `checkout_${crypto.randomUUID().replace(/-/g, '')}`)

  useEffect(() => {
    if (user) {
      void storeApi
        .listAddresses()
        .then((addresses) => {
          if (!addresses.length) return
          const saved = addresses[0]
          setAddress({
            recipient: saved.recipient,
            postalCode: saved.postal_code,
            street: saved.street,
            number: saved.number,
            complement: saved.complement,
            neighborhood: saved.neighborhood,
            city: saved.city,
            state: saved.state,
          })
        })
        .catch(() => undefined)
    }
  }, [user])

  useEffect(() => {
    if (!order?.pixCopyPaste) {
      return
    }
    QRCode.toDataURL(order.pixCopyPaste, {
      width: 560,
      margin: 3,
      errorCorrectionLevel: 'M',
      color: { dark: '#075746', light: '#FFFFFF' },
    })
      .then(setQrData)
      .catch(() => setQrData(''))
  }, [order])

  const total = useMemo(() => cartSubtotal + (quote?.priceCents || 0), [cartSubtotal, quote])
  const changeAddress = (field: keyof CheckoutAddress, value: string) =>
    setAddress((current) => ({ ...current, [field]: value }))

  const calculateShipping = async () => {
    setQuoting(true)
    setQuote(null)
    try {
      setQuote(await storeApi.quoteShipping(address.postalCode))
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Frete não calculado',
        description: readableError(error),
      })
    } finally {
      setQuoting(false)
    }
  }

  const submitOrder = async (event: FormEvent) => {
    event.preventDefault()
    if (!user) {
      toast({
        title: 'Entre na sua conta',
        description: 'O login é necessário para registrar e acompanhar o pedido.',
      })
      navigate('/conta?retorno=/carrinho')
      return
    }
    if (!quote) {
      toast({
        variant: 'destructive',
        title: 'Calcule o frete',
        description: 'Informe o CEP e confirme o valor provisório antes de continuar.',
      })
      return
    }
    setSubmitting(true)
    try {
      const result = await storeApi.createOrder(cart, address, checkoutId)
      if (saveAddress) {
        const existing = await storeApi.listAddresses()
        if (
          !existing.some(
            (item) =>
              item.postal_code === address.postalCode.replace(/\D/g, '') &&
              item.number === address.number,
          )
        ) {
          await storeApi.saveAddress(user.id, address)
        }
      }
      setOrder(result.order)
      clearCart()
      toast({
        title: 'Pedido registrado',
        description: 'Pix em modo de teste gerado. Nenhuma cobrança real foi criada.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Não foi possível criar o pedido',
        description: readableError(error),
      })
    } finally {
      setSubmitting(false)
    }
  }

  const copyPix = async () => {
    if (!order) return
    await navigator.clipboard.writeText(order.pixCopyPaste)
    toast({
      title: 'Código copiado',
      description: 'Este é um código de simulação; não realiza pagamento real.',
    })
  }

  if (order) {
    return (
      <section className="section-block bg-white">
        <div className="site-shell max-w-3xl">
          <div className="mb-8 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-deep">
              <Check className="size-7" />
            </span>
            <p className="eyebrow mt-5">Pedido registrado</p>
            <h1 className="font-serif text-4xl text-emerald-deep">{order.orderNumber}</h1>
            <p className="mt-2 text-muted-foreground">
              Aguardando confirmação de pagamento em ambiente de teste
            </p>
          </div>
          <div className="rounded-sm border border-gold/30 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            <strong>Simulação Pix:</strong> nenhuma cobrança real foi criada. O pedido permanecerá
            como “aguardando pagamento” e somente um webhook Woovi validado no servidor poderá
            alterá-lo para pago.
          </div>
          <div className="mt-6 grid gap-8 rounded-sm border p-6 md:grid-cols-[280px_1fr] md:p-8">
            <div className="flex min-h-[280px] items-center justify-center rounded-sm bg-white p-2 shadow-inner">
              {qrData ? (
                <img src={qrData} alt="QR Code Pix de teste" className="w-full" />
              ) : (
                <QrCode className="size-32 text-emerald-100" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-deep">
                Total do pedido
              </p>
              <p className="mt-1 font-serif text-4xl text-emerald-deep">
                {formatCurrency(order.totalCents)}
              </p>
              <p className="mt-4 text-sm font-medium text-emerald-deep">Pix Copia e Cola — TESTE</p>
              <div className="mt-2 break-all rounded-sm bg-ivory p-3 font-mono text-xs leading-5">
                {order.pixCopyPaste}
              </div>
              <Button className="mt-3 w-full" variant="outline" onClick={() => void copyPix()}>
                <Copy className="mr-2 size-4" /> Copiar código de teste
              </Button>
              <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-deep" />A tela não
                confirma pagamentos. O status é atualizado apenas pelo servidor após validação do
                webhook.
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link to="/conta">Ver no histórico</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/loja">Continuar navegando</Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  if (!cart.length) {
    return (
      <section className="section-block bg-white">
        <div className="site-shell max-w-xl text-center">
          <ShoppingBag className="mx-auto size-12 text-gold" />
          <h1 className="mt-5 font-serif text-4xl text-emerald-deep">Seu carrinho está vazio</h1>
          <p className="mt-3 text-muted-foreground">
            Descubra peças escolhidas para celebrar sua transformação.
          </p>
          <Button asChild className="mt-6">
            <Link to="/loja">Explorar a loja</Link>
          </Button>
        </div>
      </section>
    )
  }

  return (
    <div className="bg-white">
      <section className="page-hero page-hero--small">
        <div className="site-shell py-12 text-center">
          <p className="eyebrow text-gold">Sua seleção</p>
          <h1>Carrinho e checkout</h1>
        </div>
      </section>
      <section className="section-block">
        <form
          onSubmit={submitOrder}
          className="site-shell grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start"
        >
          <div className="space-y-8">
            <div className="rounded-sm border bg-white p-5 md:p-7">
              <h2 className="font-serif text-2xl text-emerald-deep">1. Revise suas peças</h2>
              <div className="mt-5 divide-y">
                {cart.map((item) => (
                  <div
                    key={`${item.product.id}-${item.variation}`}
                    className="grid grid-cols-[80px_1fr] gap-4 py-5 sm:grid-cols-[96px_1fr_auto]"
                  >
                    <img
                      src={item.product.image_url}
                      alt={item.product.image_alt}
                      className="aspect-square w-full rounded-sm object-cover"
                    />
                    <div>
                      <Link
                        to={`/produto/${item.product.slug}`}
                        className="font-serif text-lg text-emerald-deep hover:text-gold-deep"
                      >
                        {item.product.name}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">{item.variation}</p>
                      <p className="mt-2 text-sm font-medium">
                        {formatCurrency(item.product.price_cents)}
                      </p>
                      <div className="mt-3 inline-flex h-9 items-center rounded-md border">
                        <button
                          type="button"
                          aria-label="Diminuir"
                          className="px-2"
                          onClick={() =>
                            updateCartQuantity(item.product.id, item.variation, item.quantity - 1)
                          }
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Aumentar"
                          className="px-2"
                          onClick={() =>
                            updateCartQuantity(item.product.id, item.variation, item.quantity + 1)
                          }
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="col-start-2 inline-flex items-center gap-1 self-start text-xs text-muted-foreground hover:text-destructive sm:col-start-auto"
                      onClick={() => removeFromCart(item.product.id, item.variation)}
                    >
                      <Trash2 className="size-3.5" /> Remover
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-sm border bg-white p-5 md:p-7">
              <h2 className="font-serif text-2xl text-emerald-deep">2. Endereço de entrega</h2>
              {!authReady
                ? null
                : !user && (
                    <div className="mt-4 rounded-sm border border-gold/30 bg-gold/10 p-4 text-sm text-emerald-deep">
                      <AlertCircle className="mr-2 inline size-4" />
                      Você poderá preencher agora, mas precisará{' '}
                      <Link to="/conta?retorno=/carrinho" className="font-semibold underline">
                        entrar ou criar uma conta
                      </Link>{' '}
                      para finalizar.
                    </div>
                  )}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="recipient">Nome de quem recebe</Label>
                  <Input
                    id="recipient"
                    value={address.recipient}
                    onChange={(e) => changeAddress('recipient', e.target.value)}
                    required
                    className="mt-2 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="postal">CEP</Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      id="postal"
                      value={address.postalCode}
                      onChange={(e) => {
                        changeAddress('postalCode', e.target.value)
                        setQuote(null)
                      }}
                      placeholder="00000-000"
                      required
                      className="h-11"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={quoting}
                      onClick={() => void calculateShipping()}
                    >
                      {quoting ? 'Calculando...' : 'Calcular'}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="state">UF</Label>
                  <Input
                    id="state"
                    value={address.state}
                    onChange={(e) => changeAddress('state', e.target.value.slice(0, 2))}
                    placeholder="UF"
                    required
                    maxLength={2}
                    className="mt-2 h-11"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="street">Rua / Avenida</Label>
                  <Input
                    id="street"
                    value={address.street}
                    onChange={(e) => changeAddress('street', e.target.value)}
                    required
                    className="mt-2 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={address.number}
                    onChange={(e) => changeAddress('number', e.target.value)}
                    required
                    className="mt-2 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={address.complement}
                    onChange={(e) => changeAddress('complement', e.target.value)}
                    className="mt-2 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={address.neighborhood}
                    onChange={(e) => changeAddress('neighborhood', e.target.value)}
                    required
                    className="mt-2 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={address.city}
                    onChange={(e) => changeAddress('city', e.target.value)}
                    required
                    className="mt-2 h-11"
                  />
                </div>
              </div>
              {user && (
                <label className="mt-5 flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox
                    checked={saveAddress}
                    onCheckedChange={(value) => setSaveAddress(Boolean(value))}
                  />{' '}
                  Salvar este endereço na minha conta
                </label>
              )}
            </div>
            <div className="rounded-sm border bg-white p-5 md:p-7">
              <h2 className="font-serif text-2xl text-emerald-deep">3. Pagamento</h2>
              <div className="mt-5 flex items-start gap-4 rounded-sm border-2 border-emerald-deep bg-emerald-50/40 p-4">
                <QrCode className="mt-1 size-6 text-emerald-deep" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-emerald-deep">Pix em modo de teste</strong>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-amber-800">
                      sem cobrança real
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Será gerado um QR Code e código Copia e Cola de simulação. O pedido só muda para
                    pago após confirmação segura do webhook Woovi.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <aside className="checkout-summary">
            <h2 className="font-serif text-2xl text-emerald-deep">Resumo</h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(cartSubtotal)}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span>Frete</span>
                <span className="text-right">
                  {quote ? formatCurrency(quote.priceCents) : 'Calcule pelo CEP'}
                </span>
              </div>
            </div>
            {quote && (
              <div className="mt-4 rounded-sm bg-amber-50 p-3 text-xs leading-5 text-amber-950">
                <Truck className="mr-1 inline size-3.5" />
                <strong>Frete provisório:</strong> {quote.name}, estimativa de{' '}
                {quote.estimatedDaysMin} a {quote.estimatedDaysMax} dias. Sujeito à confirmação; não
                é cotação real de transportadora.
              </div>
            )}
            <Separator className="my-5" />
            <div className="flex items-end justify-between">
              <strong className="text-emerald-deep">Total</strong>
              <span className="font-serif text-3xl text-emerald-deep">{formatCurrency(total)}</span>
            </div>
            <Button type="submit" size="lg" disabled={submitting || !quote} className="mt-6 w-full">
              {submitting ? 'Registrando pedido...' : 'Gerar Pix de teste'}
            </Button>
            <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              Nenhuma cobrança real será criada nesta versão.
            </div>
          </aside>
        </form>
      </section>
    </div>
  )
}
