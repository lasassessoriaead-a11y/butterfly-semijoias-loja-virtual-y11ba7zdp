import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, MapPin, Package, ShieldCheck, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStore } from '@/contexts/StoreContext'
import { useToast } from '@/hooks/use-toast'
import { CenteredLoader } from '@/components/LoadingState'
import { readableError, storeApi } from '@/services/store'
import { formatCurrency, type Address, type OrderRecord } from '@/types/store'

const statusLabel: Record<string, string> = {
  awaiting_payment: 'Aguardando pagamento',
  paid: 'Pago',
  preparing: 'Em preparação',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
  expired: 'Expirado',
}

export default function AccountPage() {
  const { user, authReady, isAdmin, login, register, logout } = useStore()
  const { toast } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [submitting, setSubmitting] = useState(false)
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' })

  const loadAccount = async () => {
    setLoadingData(true)
    try {
      const [orderData, addressData] = await Promise.all([
        storeApi.listOrders(),
        storeApi.listAddresses(),
      ])
      setOrders(orderData)
      setAddresses(addressData)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Não foi possível carregar sua conta',
        description: readableError(error),
      })
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    if (user) void loadAccount()
  }, [user?.id])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      if (mode === 'login') await login(form.email, form.password)
      else await register(form)
      toast({
        title: mode === 'login' ? 'Bem-vinda de volta' : 'Conta criada',
        description: 'Você já pode acompanhar pedidos e endereços.',
      })
      const returnTo = new URLSearchParams(location.search).get('retorno')
      if (returnTo?.startsWith('/')) navigate(returnTo)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: mode === 'login' ? 'Não foi possível entrar' : 'Não foi possível criar a conta',
        description: readableError(error),
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!authReady) return <CenteredLoader label="Verificando sua conta..." />

  if (!user)
    return (
      <div className="account-auth">
        <div className="account-auth__visual">
          <div className="relative z-10 max-w-md p-8 text-white md:p-12">
            <p className="eyebrow text-gold">Minha Butterfly</p>
            <h1 className="font-serif text-5xl leading-tight">
              Seu espaço para acompanhar cada escolha.
            </h1>
            <p className="mt-5 leading-8 text-white/70">
              Cadastre-se para registrar pedidos, salvar endereços e acompanhar o status com
              segurança.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center bg-white px-5 py-16">
          <div className="w-full max-w-md">
            <div className="mb-8 flex rounded-md bg-ivory p-1">
              <button
                className={`flex-1 rounded px-4 py-2 text-sm font-medium ${mode === 'login' ? 'bg-white text-emerald-deep shadow-sm' : 'text-muted-foreground'}`}
                onClick={() => setMode('login')}
              >
                Entrar
              </button>
              <button
                className={`flex-1 rounded px-4 py-2 text-sm font-medium ${mode === 'register' ? 'bg-white text-emerald-deep shadow-sm' : 'text-muted-foreground'}`}
                onClick={() => setMode('register')}
              >
                Criar conta
              </button>
            </div>
            <h2 className="font-serif text-3xl text-emerald-deep">
              {mode === 'login' ? 'Acesse sua conta' : 'Comece por aqui'}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === 'login'
                ? 'Use seu e-mail e senha cadastrados.'
                : 'Seus dados ficam protegidos e são usados apenas para operar a loja.'}
            </p>
            <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
              {mode === 'register' && (
                <>
                  <div>
                    <Label htmlFor="account-name">Nome completo</Label>
                    <Input
                      id="account-name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      minLength={3}
                      className="mt-2 h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="account-phone">Telefone</Label>
                    <Input
                      id="account-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="mt-2 h-12"
                    />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="account-email">E-mail</Label>
                <Input
                  id="account-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="mt-2 h-12"
                />
              </div>
              <div>
                <Label htmlFor="account-password">Senha</Label>
                <Input
                  id="account-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                  className="mt-2 h-12"
                />
              </div>
              <Button type="submit" size="lg" disabled={submitting} className="mt-2">
                {submitting ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar minha conta'}
              </Button>
              <p className="text-center text-xs leading-5 text-muted-foreground">
                Ao criar uma conta, você concorda com a{' '}
                <Link to="/politicas" className="underline">
                  Política de Privacidade
                </Link>
                .
              </p>
            </form>
          </div>
        </div>
      </div>
    )

  return (
    <div className="bg-white">
      <section className="page-hero page-hero--small">
        <div className="site-shell flex flex-col gap-4 py-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-gold">Minha Butterfly</p>
            <h1>Olá, {user.name?.split(' ')[0] || 'cliente'}</h1>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button asChild variant="secondary">
                <Link to="/admin">
                  <ShieldCheck className="mr-2 size-4" /> Administração
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white hover:text-emerald-deep"
              onClick={logout}
            >
              <LogOut className="mr-2 size-4" /> Sair
            </Button>
          </div>
        </div>
      </section>
      <section className="section-block">
        <div className="site-shell">
          {loadingData ? (
            <CenteredLoader label="Carregando seus dados..." />
          ) : (
            <Tabs defaultValue="orders">
              <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto bg-ivory p-1">
                <TabsTrigger value="orders" className="gap-2 px-5 py-3">
                  <Package className="size-4" /> Pedidos
                </TabsTrigger>
                <TabsTrigger value="addresses" className="gap-2 px-5 py-3">
                  <MapPin className="size-4" /> Endereços
                </TabsTrigger>
                <TabsTrigger value="profile" className="gap-2 px-5 py-3">
                  <UserRound className="size-4" /> Dados
                </TabsTrigger>
              </TabsList>
              <TabsContent value="orders" className="mt-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="font-serif text-3xl text-emerald-deep">Histórico de pedidos</h2>
                  <p className="text-xs text-muted-foreground">
                    Acompanhe suas compras e pedidos da Butterfly SEMIJOIAS
                  </p>
                </div>
                {orders.length ? (
                  <div className="mt-5 space-y-4">
                    {orders.map((order) => (
                      <article key={order.id} className="rounded-sm border p-5 md:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-widest text-muted-foreground">
                              Pedido
                            </p>
                            <h3 className="mt-1 font-serif text-xl text-emerald-deep">
                              {order.order_number}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {new Date(order.created).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="sm:text-right">
                            <span className={`order-status order-status--${order.status}`}>
                              {statusLabel[order.status] || order.status}
                            </span>
                            <p className="mt-3 font-semibold text-emerald-deep">
                              {formatCurrency(order.total_cents)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-5 grid gap-3 border-t pt-4 sm:grid-cols-2">
                          <p className="text-xs text-muted-foreground">
                            <strong className="text-foreground">Pagamento:</strong> Pix •{' '}
                            {order.webhook_confirmed
                              ? 'confirmado por webhook'
                              : 'aguardando webhook validado'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <strong className="text-foreground">Frete:</strong>{' '}
                            {order.shipping_label}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-sm bg-ivory p-10 text-center">
                    <Package className="mx-auto size-9 text-gold" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      Você ainda não registrou pedidos anteriores nesta conta.
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Suas compras na Butterfly SEMIJOIAS contam com ambiente seguro e
                      acompanhamento completo.
                    </p>
                    <Button asChild className="mt-4">
                      <Link to="/loja">Explorar a loja</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="addresses" className="mt-6">
                <h2 className="font-serif text-3xl text-emerald-deep">Endereços salvos</h2>
                {addresses.length ? (
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {addresses.map((address) => (
                      <div key={address.id} className="rounded-sm border p-5">
                        <div className="flex items-center justify-between">
                          <strong className="text-emerald-deep">{address.label}</strong>
                          {address.is_default && (
                            <span className="text-xs text-gold-deep">Principal</span>
                          )}
                        </div>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          {address.recipient}
                          <br />
                          {address.street}, {address.number}
                          {address.complement ? ` — ${address.complement}` : ''}
                          <br />
                          {address.neighborhood} • {address.city}/{address.state}
                          <br />
                          CEP {address.postal_code}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 rounded-sm bg-ivory p-8 text-sm text-muted-foreground">
                    Você pode salvar um endereço ao finalizar seu primeiro pedido.
                  </p>
                )}
              </TabsContent>
              <TabsContent value="profile" className="mt-6">
                <h2 className="font-serif text-3xl text-emerald-deep">Dados da conta</h2>
                <div className="mt-5 max-w-xl rounded-sm border p-6 text-sm leading-7">
                  <p>
                    <strong>Nome:</strong> {user.name}
                  </p>
                  <p>
                    <strong>E-mail:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Telefone:</strong> {user.phone || 'Não informado'}
                  </p>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Para solicitar correção ou exclusão de dados, use o canal de contato oficial
                    quando ele for ativado.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>
    </div>
  )
}
