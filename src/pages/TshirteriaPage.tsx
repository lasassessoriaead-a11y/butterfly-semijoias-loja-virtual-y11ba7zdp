import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, ShieldCheck, Truck, RefreshCw } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { LoadingGrid } from '@/components/LoadingState'
import { TshirtModelCard } from '@/components/TshirtModelCard'
import { Button } from '@/components/ui/button'
import { storeApi } from '@/services/store'
import type { TshirtModel } from '@/types/store'

export default function TshirteriaPage() {
  const [models, setModels] = useState<TshirtModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await storeApi.listTshirts()
      // A API retorna tshirtModels agrupados
      let loadedModels = response.tshirtModels || []

      // Se tshirtModels não veio agrupado mas vieram products com productType=tshirt
      if (loadedModels.length === 0 && response.products && response.products.length > 0) {
        const tshirtsOnly = response.products.filter((p) => p.productType === 'tshirt')
        const groupedMap = new Map<string, TshirtModel>()
        tshirtsOnly.forEach((p, index) => {
          const modelId = p.modelId || p.slug || `model-${index}`
          const modelName = p.modelName || p.name
          if (!groupedMap.has(modelId)) {
            groupedMap.set(modelId, {
              id: modelId,
              name: modelName,
              description: p.description || '',
              photo: p.image_url || p.photo || '',
              priceFrom: p.price || p.price_cents / 100,
              priceFromCents: p.price_cents,
              colors: p.color ? [p.color] : [],
              sizes: p.size ? [p.size] : [],
              variants: [],
            })
          }
          const current = groupedMap.get(modelId)!
          if (p.color && !current.colors.includes(p.color)) current.colors.push(p.color)
          if (p.size && !current.sizes.includes(p.size)) current.sizes.push(p.size)
          current.variants.push({
            id: p.id,
            sku: p.sku,
            color: p.color || '',
            size: p.size || '',
            price: p.price || p.price_cents / 100,
            price_cents: p.price_cents,
            stock: p.stock,
            available: p.available,
            photo: p.image_url || p.photo,
            checkoutUrl: p.checkoutUrl,
          })
        })
        loadedModels = Array.from(groupedMap.values())
      }

      setModels(loadedModels)
    } catch (err) {
      const message =
        err &&
        typeof err === 'object' &&
        'message' in err &&
        typeof (err as { message: unknown }).message === 'string'
          ? (err as { message: string }).message
          : 'Não foi possível carregar a coleção de t-shirts no momento. O catálogo ao vivo está temporariamente indisponível.'
      setError(message)
      setModels([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  return (
    <div className="bg-ivory min-h-screen">
      {/* Hero da T-shirteria */}
      <section className="page-hero page-hero--catalog bg-emerald-deep text-white relative overflow-hidden">
        <div className="site-shell relative z-10 py-16 text-center md:py-24">
          <p className="eyebrow text-gold inline-flex items-center gap-1.5 justify-center">
            <Sparkles className="size-3.5" /> Butterfly SEMIJOIAS • T-shirteria
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mt-2">
            T-shirteria
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl font-serif text-gold-light leading-relaxed">
            Combine seu look com nossas t-shirts exclusivas.
          </p>
          <p className="mt-3 max-w-xl mx-auto text-sm text-white/70">
            Modelos à pronta entrega com corte sofisticado, tecido de alta qualidade e caimento
            impecável para harmonizar com suas semijoias favoritas.
          </p>
        </div>
      </section>

      {/* Faixa de confiança / Pronta entrega */}
      <section className="border-b border-emerald-900/10 bg-white">
        <div className="site-shell grid gap-4 py-4 sm:grid-cols-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-gold-deep" />
            <span>
              <strong className="text-emerald-deep block font-semibold">
                Pronta entrega oficial
              </strong>
              Estoque sincronizado em tempo real
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-deep" />
            <span>
              <strong className="text-emerald-deep block font-semibold">Design exclusivo</strong>
              Cores e tamanhos com corte premium
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="size-4 text-gold-deep" />
            <span>
              <strong className="text-emerald-deep block font-semibold">Compra centralizada</strong>
              Checkout seguro Butterfly Gestão
            </span>
          </div>
        </div>
      </section>

      {/* Grade de modelos */}
      <section className="section-block bg-white">
        <div className="site-shell">
          <div className="section-heading flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8 border-b border-emerald-900/10 pb-5">
            <div>
              <p className="eyebrow">Coleção Oficial</p>
              <h2 className="font-serif text-3xl text-emerald-deep">Modelos de T-shirts</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Escolha o modelo para conferir as cores e tamanhos à pronta entrega.
              </p>
            </div>
            {!loading && models.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {models.length} {models.length === 1 ? 'modelo disponível' : 'modelos disponíveis'}
              </span>
            )}
          </div>

          {loading ? (
            <LoadingGrid />
          ) : error ? (
            <div className="rounded-sm border border-amber-200 bg-amber-50 p-10 text-center">
              <h2 className="font-serif text-2xl text-emerald-deep">
                Catálogo ao vivo indisponível
              </h2>
              <p className="mt-3 text-sm text-amber-900 max-w-lg mx-auto">{error}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Conforme as diretrizes de transparência da Butterfly SEMIJOIAS, produtos fictícios
                não são exibidos quando o sistema está indisponível.
              </p>
              <Button variant="outline" className="mt-5" onClick={() => void loadData()}>
                <RefreshCw className="mr-2 size-4" /> Tentar novamente
              </Button>
            </div>
          ) : models.length === 0 ? (
            <div className="rounded-sm bg-ivory p-14 text-center border border-emerald-900/10">
              <BrandLogo
                variant="light"
                className="h-16 w-auto mx-auto mb-4 object-contain opacity-80"
              />
              <h2 className="font-serif text-3xl text-emerald-deep">Coleção em preparação</h2>
              <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Nossas t-shirts exclusivas estão sendo preparadas para pronta entrega. Em breve
                novos modelos estarão disponíveis aqui.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Nenhum produto fictício é exibido nesta loja.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button asChild className="btn-gold">
                  <Link to="/loja">
                    Conhecer semijoias da loja <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/sobre">Sobre a Butterfly</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="product-grid product-grid--catalog">
              {models.map((model) => (
                <TshirtModelCard key={model.id} model={model} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Seção de inspiração combinando look */}
      <section className="section-block bg-ivory border-t border-emerald-900/10">
        <div className="site-shell grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow text-gold-deep">Estilo & Harmonia</p>
            <h2 className="font-serif text-3xl md:text-4xl text-emerald-deep">
              Combine seu look com nossas t-shirts exclusivas.
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed text-sm md:text-base">
              A elegância do casual chic: use nossas t-shirts com mix de colares, brincos de
              destaque e pulseiras douradas da Butterfly SEMIJOIAS para um visual marcante em
              qualquer momento do dia.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="btn-gold">
                <Link to="/loja">
                  Explorar semijoias <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/lancamentos">Ver lançamentos</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-sm overflow-hidden bg-emerald-deep/5 p-8 text-center border border-emerald-900/10">
            <h3 className="font-serif text-xl text-emerald-deep">Pronta entrega & Estoque real</h3>
            <p className="mt-2 text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Trabalhamos exclusivamente com pronta entrega. O estoque é acompanhado por cor e
              tamanho para garantir que a peça escolhida chegue até você sem esperas de pré-venda.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
