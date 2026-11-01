import { useEffect, useState, type FormEvent } from 'react'
import { storeApi } from '@/services/store'
import type {
  Address,
  CheckoutAddress,
  CheckoutOrder,
  OrderRecord,
  Product,
  ShippingQuote,
  UserRecord,
} from '@/types/store'

const DEMO_EMAIL = 'cliente.qa@butterfly.local'
const DEMO_PASSWORD = 'ButterflyQA2026!'

interface CheckResult {
  name: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  detail: string
}

const initialChecks: CheckResult[] = [
  { name: 'Backend e catálogo', status: 'pending', detail: 'Aguardando' },
  { name: 'Cadastro ou login', status: 'pending', detail: 'Aguardando' },
  { name: 'Frete provisório', status: 'pending', detail: 'Aguardando' },
  { name: 'Pedido Pix de teste', status: 'pending', detail: 'Aguardando' },
  { name: 'Histórico do cliente', status: 'pending', detail: 'Aguardando' },
  { name: 'Webhook sem segredo', status: 'pending', detail: 'Aguardando' },
  { name: 'Isolamento de pedidos', status: 'pending', detail: 'Aguardando' },
]

function resultClass(status: CheckResult['status']) {
  return status === 'passed'
    ? 'text-emerald-700'
    : status === 'failed'
      ? 'text-red-700'
      : 'text-amber-700'
}

export default function QaFlowPage() {
  const [checks, setChecks] = useState(initialChecks)
  const [running, setRunning] = useState(false)
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    document.title = 'QA Butterfly — fluxo integrado'
  }, [])

  const update = (name: string, status: CheckResult['status'], detail: string) => {
    setChecks((current) =>
      current.map((check) => (check.name === name ? { ...check, status, detail } : check)),
    )
  }

  const run = async (event: FormEvent) => {
    event.preventDefault()
    setRunning(true)
    setComplete(false)
    setChecks(initialChecks)
    let user: UserRecord | null = null
    let product: Product | null = null
    let quote: ShippingQuote | null = null
    let order: CheckoutOrder | null = null
    const address: CheckoutAddress = {
      recipient: 'Cliente QA Butterfly',
      postalCode: '01001000',
      street: 'Rua de Validação',
      number: '100',
      complement: '',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
    }

    try {
      update('Backend e catálogo', 'running', 'Consultando produtos reais')
      const products = await storeApi.listProducts()
      if (!products.length) throw new Error('Catálogo sem produtos')
      product = products[0]
      update(
        'Backend e catálogo',
        'passed',
        `${products.length} produtos carregados; fonte ${product.source}`,
      )

      update('Cadastro ou login', 'running', 'Autenticando cliente de QA')
      try {
        user = await storeApi.register({
          name: 'Cliente QA Butterfly',
          email: DEMO_EMAIL,
          phone: '11999990000',
          password: DEMO_PASSWORD,
        })
        update('Cadastro ou login', 'passed', `Conta criada: ${user.id}`)
      } catch {
        user = await storeApi.login(DEMO_EMAIL, DEMO_PASSWORD)
        update('Cadastro ou login', 'passed', `Conta autenticada: ${user.id}`)
      }

      update('Frete provisório', 'running', 'Calculando CEP 01001-000')
      quote = await storeApi.quoteShipping(address.postalCode)
      if (!quote.provisional || quote.priceCents <= 0)
        throw new Error('Cotação não está marcada como provisória')
      update(
        'Frete provisório',
        'passed',
        `${quote.name}: ${quote.priceCents} centavos, marcada como provisória`,
      )

      update('Pedido Pix de teste', 'running', 'Criando pedido idempotente')
      const requestId = `qa_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`
      const result = await storeApi.createOrder(
        [{ product, variation: product.variations[0] || 'Dourado', quantity: 1 }],
        address,
        requestId,
      )
      order = result.order
      if (
        order.pixMode !== 'test_placeholder' ||
        order.paymentStatus !== 'awaiting' ||
        order.webhookConfirmed
      )
        throw new Error('Pedido não nasceu no estado seguro esperado')
      const duplicate = await storeApi.createOrder(
        [{ product, variation: product.variations[0] || 'Dourado', quantity: 1 }],
        address,
        requestId,
      )
      if (!duplicate.duplicatePrevented || duplicate.order.id !== order.id)
        throw new Error('Idempotência do checkout falhou')
      update(
        'Pedido Pix de teste',
        'passed',
        `${order.orderNumber}: teste, aguardando e duplicata prevenida`,
      )

      update('Histórico do cliente', 'running', 'Consultando pedidos do usuário')
      const history = await storeApi.listOrders()
      if (!history.some((item) => item.id === order?.id))
        throw new Error('Pedido não apareceu no histórico')
      update(
        'Histórico do cliente',
        'passed',
        `${history.length} pedido(s) visível(is); novo pedido localizado`,
      )

      update('Webhook sem segredo', 'running', 'Confirmando bloqueio seguro')
      let webhookBlocked = false
      try {
        const base = import.meta.env.VITE_POCKETBASE_URL as string
        const response = await fetch(`${base}/backend/v1/butterfly/v1/webhooks/woovi`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-openpix-signature': 'assinatura-invalida',
          },
          body: JSON.stringify({
            event: 'OPENPIX:CHARGE_COMPLETED',
            charge: {
              correlationID: order.pixCorrelationId,
              status: 'COMPLETED',
              value: order.totalCents,
            },
          }),
        })
        webhookBlocked = !response.ok
      } catch {
        webhookBlocked = true
      }
      const refreshed = await storeApi.listOrders()
      const afterWebhook = refreshed.find((item) => item.id === order?.id)
      if (
        !webhookBlocked ||
        afterWebhook?.payment_status !== 'awaiting' ||
        afterWebhook.webhook_confirmed
      )
        throw new Error('Webhook sem configuração alterou o pedido')
      update(
        'Webhook sem segredo',
        'passed',
        'Rejeitado; pedido continuou aguardando e sem confirmação',
      )

      update('Isolamento de pedidos', 'running', 'Validando regra de proprietário')
      const ownerHistory = await storeApi.listOrders()
      if (ownerHistory.some((item: OrderRecord) => item.customer !== user?.id))
        throw new Error('Histórico contém pedido de outro usuário')
      update(
        'Isolamento de pedidos',
        'passed',
        'Todos os registros retornados pertencem ao usuário autenticado',
      )

      const addresses = await storeApi.listAddresses()
      if (!addresses.some((item: Address) => item.postal_code === address.postalCode))
        await storeApi.saveAddress(user.id, address, 'QA')
      setComplete(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha inesperada'
      setChecks((current) => {
        let marked = false
        return current.map((check) => {
          if (!marked && (check.status === 'running' || check.status === 'pending')) {
            marked = true
            return { ...check, status: 'failed', detail: message }
          }
          return check
        })
      })
    } finally {
      setRunning(false)
    }
  }

  return (
    <main className="min-h-screen bg-stone-100 p-6 text-stone-900">
      <div className="mx-auto max-w-3xl rounded-lg bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
          Butterfly SEMIJOIAS
        </p>
        <h1 className="mt-2 text-3xl font-bold">Validação integrada do fluxo</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Executa um fluxo controlado no backend preview: catálogo, autenticação, frete provisório,
          pedido Pix de teste, idempotência, histórico, bloqueio do webhook sem segredo e isolamento
          do cliente.
        </p>
        <form onSubmit={run} className="mt-6">
          <button
            type="submit"
            disabled={running}
            className="rounded bg-emerald-800 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {running ? 'Executando...' : 'Executar validação'}
          </button>
        </form>
        <div className="mt-8 space-y-3">
          {checks.map((check) => (
            <div key={check.name} className="rounded border p-4">
              <div className="flex items-center justify-between gap-4">
                <strong className="text-sm">{check.name}</strong>
                <span className={`text-xs font-bold uppercase ${resultClass(check.status)}`}>
                  {check.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-stone-600">{check.detail}</p>
            </div>
          ))}
        </div>
        {complete && (
          <div className="mt-6 rounded border border-emerald-300 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
            Fluxo concluído com sucesso. A conta e o pedido criados são dados de QA claramente
            identificados.
          </div>
        )}
      </div>
    </main>
  )
}
