import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Package,
  RefreshCw,
  Save,
  Settings,
  ShieldCheck,
  Truck,
  UsersRound,
} from 'lucide-react'
import { CenteredLoader, ErrorState } from '@/components/LoadingState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStore } from '@/contexts/StoreContext'
import { useToast } from '@/hooks/use-toast'
import { readableError, storeApi } from '@/services/store'
import {
  formatCurrency,
  type OrderRecord,
  type Product,
  type ResellerApplication,
  type ShippingRange,
  type StoreSetting,
} from '@/types/store'

interface AdminData {
  orders: OrderRecord[]
  applications: ResellerApplication[]
  products: Product[]
  shipping: ShippingRange[]
  settings: StoreSetting[]
}
const applicationLabels: Record<string, string> = {
  new: 'Nova',
  reviewing: 'Em análise',
  contacted: 'Contatada',
  approved: 'Aprovada',
  declined: 'Não aprovada',
}

export default function AdminPage() {
  const { user, authReady, isAdmin } = useStore()
  const { toast } = useToast()
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setData(await storeApi.adminData())
    } catch (err) {
      setError(readableError(err))
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (isAdmin) void load()
  }, [isAdmin])
  const stats = useMemo(
    () => ({
      orders: data?.orders.length || 0,
      awaiting: data?.orders.filter((o) => o.status === 'awaiting_payment').length || 0,
      applications: data?.applications.filter((a) => a.status === 'new').length || 0,
      lowStock: data?.products.filter((p) => p.stock <= 8).length || 0,
    }),
    [data],
  )

  if (!authReady) return <CenteredLoader label="Verificando acesso administrativo..." />
  if (!user) return <Navigate to="/conta?retorno=/admin" replace />
  if (!isAdmin)
    return (
      <section className="section-block bg-white">
        <div className="site-shell max-w-xl text-center">
          <ShieldCheck className="mx-auto size-12 text-gold" />
          <h1 className="mt-5 font-serif text-4xl text-emerald-deep">Acesso restrito</h1>
          <p className="mt-3 text-muted-foreground">
            Esta área exige uma conta administrativa. As regras também são validadas no servidor.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Voltar ao início</Link>
          </Button>
        </div>
      </section>
    )
  if (loading) return <CenteredLoader label="Carregando administração..." />
  if (error || !data)
    return (
      <section className="section-block">
        <div className="site-shell">
          <ErrorState message={error || 'Dados indisponíveis'} onRetry={() => void load()} />
        </div>
      </section>
    )

  const updateApplication = async (
    application: ResellerApplication,
    status: ResellerApplication['status'],
  ) => {
    try {
      await storeApi.updateApplication(application.id, { status, notes: application.notes || '' })
      toast({ title: 'Candidatura atualizada' })
      void load()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Falha ao atualizar',
        description: readableError(err),
      })
    }
  }
  const updateStock = async (product: Product, value: number) => {
    try {
      await storeApi.updateProduct(product.id, { stock: value, available: value > 0 })
      toast({ title: 'Estoque provisório atualizado' })
      void load()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Falha ao atualizar',
        description: readableError(err),
      })
    }
  }
  const updateShipping = async (range: ShippingRange, value: number) => {
    try {
      await storeApi.updateShippingRange(range.id, { price_cents: value })
      toast({ title: 'Faixa provisória atualizada' })
      void load()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Falha ao atualizar',
        description: readableError(err),
      })
    }
  }

  return (
    <div className="admin-page">
      <section className="bg-emerald-deep text-white">
        <div className="site-shell flex flex-col gap-5 py-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-gold">Acesso protegido</p>
            <h1 className="font-serif text-4xl">Administração Butterfly</h1>
            <p className="mt-2 text-sm text-white/60">
              Dados operacionais provisórios • Butterfly Gestão será a fonte principal
            </p>
          </div>
          <Button
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:bg-white hover:text-emerald-deep"
            onClick={() => void load()}
          >
            <RefreshCw className="mr-2 size-4" /> Atualizar
          </Button>
        </div>
      </section>
      <section className="site-shell py-8">
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [ClipboardList, 'Pedidos', stats.orders],
            [Package, 'Aguardando Pix', stats.awaiting],
            [UsersRound, 'Novas candidatas', stats.applications],
            [Boxes, 'Estoque baixo', stats.lowStock],
          ].map(([Icon, label, value]) => {
            const C = Icon as typeof Package
            return (
              <div key={String(label)} className="admin-stat">
                <C />
                <div>
                  <span>{String(label)}</span>
                  <strong>{String(value)}</strong>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mb-6 grid gap-3 lg:grid-cols-3">
          <div className="admin-notice">
            <AlertTriangle />
            <div>
              <strong>Catálogo provisório</strong>
              <p>Produtos, preços e estoque aguardam integração com o Butterfly Gestão.</p>
            </div>
          </div>
          <div className="admin-notice">
            <Truck />
            <div>
              <strong>Frete provisório</strong>
              <p>Valores sujeitos à confirmação; nenhuma cotação real é exibida.</p>
            </div>
          </div>
          <div className="admin-notice">
            <CheckCircle2 />
            <div>
              <strong>Woovi segura</strong>
              <p>Cobranças reais off; “pago” apenas por webhook validado.</p>
            </div>
          </div>
        </div>
        <Tabs defaultValue="orders">
          <TabsList className="admin-tabs">
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="applications">Candidatas</TabsTrigger>
            <TabsTrigger value="products">Produtos e estoque</TabsTrigger>
            <TabsTrigger value="shipping">Frete</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
          <TabsContent value="orders" className="admin-panel">
            <div className="admin-panel__heading">
              <div>
                <h2>Pedidos</h2>
                <p>Pagamentos não podem ser alterados pelo painel.</p>
              </div>
            </div>
            {data.orders.length ? (
              <div className="admin-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Pedido</th>
                      <th>Data</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Pagamento</th>
                      <th>Sincronia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders.map((o) => (
                      <tr key={o.id}>
                        <td className="font-medium text-emerald-deep">{o.order_number}</td>
                        <td>{new Date(o.created).toLocaleDateString('pt-BR')}</td>
                        <td>{formatCurrency(o.total_cents)}</td>
                        <td>{o.status}</td>
                        <td>
                          <span className={`order-status order-status--${o.status}`}>
                            {o.webhook_confirmed ? 'Webhook confirmado' : 'Aguardando confirmação'}
                          </span>
                        </td>
                        <td>{o.external_sync_status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="admin-empty">Nenhum pedido registrado.</p>
            )}
          </TabsContent>
          <TabsContent value="applications" className="admin-panel">
            <div className="admin-panel__heading">
              <div>
                <h2>Candidatas a revendedora</h2>
                <p>Dados salvos pelo formulário público para análise.</p>
              </div>
            </div>
            {data.applications.length ? (
              <div className="admin-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Cidade</th>
                      <th>Contato</th>
                      <th>E-mail</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.applications.map((a) => (
                      <tr key={a.id}>
                        <td className="font-medium text-emerald-deep">{a.name}</td>
                        <td>{a.city}</td>
                        <td>
                          {a.whatsapp}
                          <br />
                          <small>{a.phone}</small>
                        </td>
                        <td>{a.email}</td>
                        <td>
                          <Select
                            value={a.status}
                            onValueChange={(value) =>
                              void updateApplication(a, value as ResellerApplication['status'])
                            }
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(applicationLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="admin-empty">Nenhuma candidatura recebida.</p>
            )}
          </TabsContent>
          <TabsContent value="products" className="admin-panel">
            <div className="admin-panel__heading">
              <div>
                <h2>Produtos e estoque</h2>
                <p>
                  Controle temporário. Não é um ERP; Butterfly Gestão terá prioridade quando
                  conectado.
                </p>
              </div>
            </div>
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Peça</th>
                    <th>SKU</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                    <th>Fonte</th>
                    <th>Foto</th>
                  </tr>
                </thead>
                <tbody>
                  {data.products.map((p) => (
                    <tr key={p.id}>
                      <td className="font-medium text-emerald-deep">{p.name}</td>
                      <td>{p.sku}</td>
                      <td>{formatCurrency(p.price_cents)}</td>
                      <td>
                        <form
                          className="flex items-center gap-2"
                          onSubmit={(e) => {
                            e.preventDefault()
                            const form = e.currentTarget
                            const input = form.elements.namedItem('stock') as HTMLInputElement
                            void updateStock(p, Number(input.value))
                          }}
                        >
                          <Input
                            name="stock"
                            type="number"
                            min={0}
                            defaultValue={p.stock}
                            className="h-9 w-20"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            type="submit"
                            aria-label="Salvar estoque"
                          >
                            <Save className="size-4" />
                          </Button>
                        </form>
                      </td>
                      <td>
                        <span className="admin-tag">
                          {p.source === 'provisional' ? 'Provisória' : 'Butterfly Gestão'}
                        </span>
                      </td>
                      <td>{p.image_is_provisional ? 'Provisória' : 'Oficial'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="shipping" className="admin-panel">
            <div className="admin-panel__heading">
              <div>
                <h2>Tabela de frete por CEP</h2>
                <p>
                  Configuração segura e provisória, preparada para futura integração com
                  transportadora.
                </p>
              </div>
            </div>
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Faixa</th>
                    <th>CEP inicial</th>
                    <th>CEP final</th>
                    <th>Estimativa</th>
                    <th>Valor provisório</th>
                  </tr>
                </thead>
                <tbody>
                  {data.shipping.map((r) => (
                    <tr key={r.id}>
                      <td className="font-medium text-emerald-deep">{r.name}</td>
                      <td>{String(r.start_cep).padStart(8, '0')}</td>
                      <td>{String(r.end_cep).padStart(8, '0')}</td>
                      <td>
                        {r.estimated_days_min}–{r.estimated_days_max} dias
                      </td>
                      <td>
                        <form
                          className="flex items-center gap-2"
                          onSubmit={(e) => {
                            e.preventDefault()
                            const input = e.currentTarget.elements.namedItem(
                              'price',
                            ) as HTMLInputElement
                            void updateShipping(r, Math.round(Number(input.value) * 100))
                          }}
                        >
                          <span>R$</span>
                          <Input
                            name="price"
                            type="number"
                            min={0}
                            step="0.01"
                            defaultValue={(r.price_cents / 100).toFixed(2)}
                            className="h-9 w-24"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            type="submit"
                            aria-label="Salvar frete"
                          >
                            <Save className="size-4" />
                          </Button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="settings" className="admin-panel">
            <div className="admin-panel__heading">
              <div>
                <h2>Configurações</h2>
                <p>Estados operacionais mantidos no backend. Segredos nunca aparecem aqui.</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {data.settings.map((s) => (
                <div key={s.id} className="rounded-sm border bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Settings className="mb-3 size-5 text-gold-deep" />
                      <h3 className="font-medium text-emerald-deep">{s.key}</h3>
                    </div>
                    <span className="admin-tag">Servidor</span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">{s.description}</p>
                  <pre className="mt-4 overflow-x-auto rounded bg-ivory p-3 text-[0.7rem]">
                    {JSON.stringify(s.value, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-sm border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950">
              <strong>Webhook Woovi:</strong> endpoint preparado em{' '}
              <code>/backend/v1/butterfly/v1/webhooks/woovi</code>. O segredo{' '}
              <code>WOOVI_WEBHOOK_SECRET</code> ainda não está configurado; nesse estado seguro, o
              endpoint rejeita todas as confirmações e nenhum pedido pode virar pago.
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}
