import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ExternalLink,
  LogOut,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStore } from '@/contexts/StoreContext'
import { useToast } from '@/hooks/use-toast'
import { CenteredLoader } from '@/components/LoadingState'
import { readableError, storeApi } from '@/services/store'
import { GESTAO_ACCOUNT_URL, GESTAO_RESELLER_URL } from '@/components/Layout'
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
  const { user, authReady, isAdmin, logout } = useStore()
  const { toast } = useToast()
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loadingData, setLoadingData] = useState(false)

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

  if (!authReady) return <CenteredLoader label="Verificando sua conta..." />

  if (!user)
    return (
      <div className="account-auth">
        <div className="account-auth__visual">
          <div className="relative z-10 max-w-md p-8 text-white md:p-12">
            <p className="eyebrow text-gold">Butterfly Gestão</p>
            <h1 className="font-serif text-5xl leading-tight">
              Acesso centralizado de clientes e revendedoras.
            </h1>
            <p className="mt-5 leading-8 text-white/70">
              O cadastro, login e recuperação de senha oficiais são realizados diretamente no portal
              do Butterfly Gestão.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center bg-white px-5 py-16">
          <div className="w-full max-w-md text-center sm:text-left">
            <span className="eyebrow text-gold-deep">Portal oficial</span>
            <h2 className="mt-2 font-serif text-3xl text-emerald-deep">
              Acesse sua conta Butterfly
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              O acesso de clientes e revendedoras está publicado e centralizado no Butterfly Gestão.
              Não é necessário criar um cadastro paralelo nesta vitrine.
            </p>

            <div className="mt-8 grid gap-3">
              <Button
                asChild
                size="lg"
                className="w-full bg-emerald-deep text-white hover:bg-emerald-900 h-13"
              >
                <a href={GESTAO_ACCOUNT_URL} target="_blank" rel="noopener noreferrer">
                  <UserRound className="mr-2 size-5" /> Acessar Minha Conta no Gestão
                  <ExternalLink className="ml-auto size-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-gold/50 bg-gold/5 text-emerald-deep hover:bg-gold/15 h-13"
              >
                <a href={GESTAO_RESELLER_URL} target="_blank" rel="noopener noreferrer">
                  <Sparkles className="mr-2 size-5 text-gold-deep" /> Área da Revendedora (Gestão)
                  <ExternalLink className="ml-auto size-4" />
                </a>
              </Button>
              <Button asChild variant="ghost" className="mt-2">
                <Link to="/loja">Voltar à loja virtual</Link>
              </Button>
            </div>

            <div className="mt-10 rounded-sm border border-emerald-900/10 bg-ivory p-4 text-xs leading-5 text-muted-foreground text-left">
              <p>
                <strong>Equipe interna ou suporte:</strong> caso precise acessar a área
                administrativa local deste ambiente de teste, utilize as credenciais administrativas
                configuradas.
              </p>
            </div>
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
