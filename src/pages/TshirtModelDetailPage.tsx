import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, ChevronRight, ShieldCheck, Sparkles, Truck, XCircle, ArrowLeft } from 'lucide-react'
import { CenteredLoader } from '@/components/LoadingState'
import { ProductGallery } from '@/components/ProductGallery'
import { variantGalleryImages } from '@/lib/gallery'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useStore } from '@/contexts/StoreContext'
import { storeApi } from '@/services/store'
import { formatCurrency, type TshirtModel, type TshirtVariant } from '@/types/store'

export default function TshirtModelDetailPage() {
  const { modelId } = useParams<{ modelId: string }>()
  const { buyVariant, checkoutBaseUrl } = useStore()

  const [model, setModel] = useState<TshirtModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Seleção de cor e tamanho
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    storeApi
      .listTshirts()
      .then((res) => {
        if (!active) return
        let found = res.tshirtModels?.find((m) => m.id === modelId)

        // Se não achou em tshirtModels, tenta agrupar de products
        if (!found && res.products && res.products.length > 0) {
          const matching = res.products.filter(
            (p) =>
              (p.modelId === modelId || p.slug === modelId || p.id === modelId) &&
              p.productType === 'tshirt',
          )
          if (matching.length > 0) {
            const first = matching[0]
            const colors = Array.from(
              new Set(matching.map((p) => p.color).filter(Boolean) as string[]),
            )
            const sizes = Array.from(
              new Set(matching.map((p) => p.size).filter(Boolean) as string[]),
            )
            found = {
              id: modelId || first.id,
              name: first.modelName || first.name,
              description: first.description || '',
              photo: first.image_url || first.photo || '',
              priceFrom: first.price || first.price_cents / 100,
              priceFromCents: first.price_cents,
              colors,
              sizes,
              variants: matching.map((p) => ({
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
              })),
            }
          }
        }

        setModel(found || null)
        if (found) {
          // Inicializa cor e tamanho padrão
          const firstAvailable =
            found.variants.find((v) => v.available && v.stock > 0) || found.variants[0]
          if (firstAvailable) {
            setSelectedColor(firstAvailable.color || found.colors[0] || '')
            setSelectedSize(firstAvailable.size || found.sizes[0] || '')
          } else {
            setSelectedColor(found.colors[0] || '')
            setSelectedSize(found.sizes[0] || '')
          }
        }
      })
      .catch((err) => {
        if (!active) return
        setError(
          err &&
            typeof err === 'object' &&
            'message' in err &&
            typeof (err as { message: unknown }).message === 'string'
            ? (err as { message: string }).message
            : 'Não foi possível carregar os detalhes do modelo no momento.',
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [modelId])

  // Todas as cores e tamanhos únicos do modelo
  const colors = useMemo(() => {
    if (!model) return []
    if (model.colors && model.colors.length > 0) return model.colors
    return Array.from(new Set(model.variants.map((v) => v.color).filter(Boolean)))
  }, [model])

  const sizes = useMemo(() => {
    if (!model) return []
    if (model.sizes && model.sizes.length > 0) return model.sizes
    return Array.from(new Set(model.variants.map((v) => v.size).filter(Boolean)))
  }, [model])

  // Variação exatamente selecionada
  const selectedVariant: TshirtVariant | undefined = useMemo(() => {
    if (!model || !model.variants || model.variants.length === 0) return undefined
    return model.variants.find((v) => {
      const matchColor = !selectedColor || v.color.toLowerCase() === selectedColor.toLowerCase()
      const matchSize = !selectedSize || v.size.toLowerCase() === selectedSize.toLowerCase()
      return matchColor && matchSize
    })
  }, [model, selectedColor, selectedSize])

  // Galeria da variação selecionada: cada cor usa SOMENTE as próprias fotos
  // (images/photos/photo da variante). Foto singular do modelo é o fallback
  // para registros antigos com uma única foto.
  const gallery = useMemo(() => {
    const variantImages = variantGalleryImages(selectedVariant, model?.photo || '')
    return variantImages.filter((image) => image.url)
  }, [selectedVariant, model?.photo])

  // Preço e estoque da variação selecionada (nunca o total do modelo)
  const isSelectedAvailable = Boolean(
    selectedVariant && selectedVariant.available && selectedVariant.stock > 0,
  )
  const selectedStock = selectedVariant?.stock ?? 0
  const selectedPriceCents = selectedVariant
    ? selectedVariant.price_cents || Math.round((selectedVariant.price || 0) * 100)
    : model?.priceFromCents || Math.round((model?.priceFrom || 0) * 100)

  // Ao clicar em adicionar à sacola, encaminha para o checkout centralizado usando o ID da variação escolhida
  const handleAddToCart = () => {
    if (!selectedVariant) return
    buyVariant(selectedVariant.id, 1)
  }

  if (loading) return <CenteredLoader label="Carregando modelo de t-shirt..." />

  if (!model) {
    return (
      <div className="site-shell py-24 text-center">
        <h1 className="font-serif text-4xl text-emerald-deep">Modelo não encontrado</h1>
        <p className="mt-3 text-muted-foreground max-w-md mx-auto">
          {error ||
            'Este modelo de t-shirt pode não estar disponível no catálogo ao vivo no momento.'}
        </p>
        <Button asChild className="mt-6">
          <Link to="/tshirteria">Voltar à T-shirteria</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="site-shell py-5 border-b border-emerald-900/10">
        <nav
          className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
          aria-label="Navegação estrutural"
        >
          <Link to="/" className="hover:text-emerald-deep">
            Início
          </Link>
          <ChevronRight className="size-3" />
          <Link to="/tshirteria" className="hover:text-emerald-deep">
            T-shirteria
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground font-medium">{model.name}</span>
        </nav>
      </div>

      <section className="site-shell grid gap-10 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
        {/* Galeria: fotos da cor selecionada (images/photos/photo da variante);
            foto singular do modelo é o fallback para registros antigos */}
        <div className="product-detail__image-wrap bg-ivory rounded-sm overflow-hidden border border-emerald-900/10">
          {gallery.length > 0 ? (
            <ProductGallery
              images={gallery}
              alt={`${model.name}${selectedColor ? ` - ${selectedColor}` : ''}`}
            />
          ) : (
            <img
              src="https://img.usecurling.com/p/800/900?q=tshirt%20cotton%20fashion&color=white"
              alt={`${model.name}${selectedColor ? ` - ${selectedColor}` : ''}`}
              className="product-detail__image object-cover w-full h-full min-h-[420px]"
            />
          )}
        </div>

        {/* Informações e seletores */}
        <div className="py-2 lg:py-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="badge-gold">T-shirteria Exclusiva</Badge>
            <Badge variant="outline" className="text-emerald-deep border-emerald-900/20">
              Pronta entrega
            </Badge>
          </div>

          <p className="eyebrow mt-4 text-gold-deep">
            Combine seu look com nossas t-shirts exclusivas
          </p>
          <h1 className="font-serif text-3xl leading-tight text-emerald-deep md:text-4xl lg:text-5xl">
            {model.name}
          </h1>

          {/* Preço da variação selecionada */}
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-medium text-emerald-deep">
              {formatCurrency(selectedPriceCents)}
            </span>
            {selectedVariant?.sku && (
              <span className="text-xs text-muted-foreground">SKU: {selectedVariant.sku}</span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Preço e estoque sincronizados em tempo real com o Butterfly Gestão
          </p>

          <div className="my-6 h-px bg-emerald-900/10" />

          {model.description && (
            <p className="leading-relaxed text-muted-foreground text-sm md:text-base">
              {model.description}
            </p>
          )}

          {/* Seletor de Cores */}
          {colors.length > 0 && (
            <div className="mt-6">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-emerald-deep">
                Cor:{' '}
                <span className="font-normal text-foreground normal-case">
                  {selectedColor || 'Selecione'}
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map((colorName) => {
                  const isColorSelected = selectedColor.toLowerCase() === colorName.toLowerCase()
                  // Verifica se há estoque nesta cor em algum tamanho
                  const hasAnyStock = model.variants.some(
                    (v) =>
                      v.color.toLowerCase() === colorName.toLowerCase() &&
                      v.available &&
                      v.stock > 0,
                  )
                  return (
                    <button
                      key={colorName}
                      type="button"
                      onClick={() => setSelectedColor(colorName)}
                      className={`px-3.5 py-2 text-xs font-medium rounded border transition-all ${
                        isColorSelected
                          ? 'border-emerald-deep bg-emerald-deep text-white shadow-sm'
                          : 'border-emerald-900/15 bg-white text-foreground hover:border-emerald-deep/40'
                      }`}
                    >
                      {colorName}
                      {!hasAnyStock && (
                        <span className="ml-1 text-[0.65rem] opacity-70">(Esgotada)</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Seletor de Tamanhos */}
          {sizes.length > 0 && (
            <div className="mt-6">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-emerald-deep">
                Tamanho:{' '}
                <span className="font-normal text-foreground normal-case">
                  {selectedSize || 'Selecione'}
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((sizeName) => {
                  const isSizeSelected = selectedSize.toLowerCase() === sizeName.toLowerCase()
                  // Verifica disponibilidade para a cor atualmente selecionada
                  const variantForSize = model.variants.find(
                    (v) =>
                      (!selectedColor || v.color.toLowerCase() === selectedColor.toLowerCase()) &&
                      v.size.toLowerCase() === sizeName.toLowerCase(),
                  )
                  const isSizeInStock = Boolean(
                    variantForSize && variantForSize.available && variantForSize.stock > 0,
                  )

                  return (
                    <button
                      key={sizeName}
                      type="button"
                      onClick={() => setSelectedSize(sizeName)}
                      className={`min-w-[42px] px-3 py-2 text-xs font-medium rounded border transition-all ${
                        isSizeSelected
                          ? 'border-gold-deep bg-gold/15 text-emerald-deep ring-2 ring-gold-deep font-bold'
                          : isSizeInStock
                            ? 'border-emerald-900/15 bg-white text-foreground hover:border-emerald-deep/40'
                            : 'border-emerald-900/10 bg-ivory text-muted-foreground/60 line-through'
                      }`}
                      title={
                        isSizeInStock
                          ? `Disponível (${variantForSize?.stock} un.)`
                          : 'Indisponível neste tamanho'
                      }
                    >
                      {sizeName}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Indicador de Disponibilidade Específico da Variação Selecionada */}
          <div className="mt-5 p-3 rounded bg-ivory border border-emerald-900/10 text-xs">
            {selectedVariant ? (
              isSelectedAvailable ? (
                <div className="flex items-center gap-2 text-emerald-800 font-medium">
                  <Check className="size-4 text-emerald-600 shrink-0" />
                  <span>
                    Pronta entrega • Cor <strong>{selectedVariant.color}</strong>, Tamanho{' '}
                    <strong>{selectedVariant.size}</strong>: {selectedStock}{' '}
                    {selectedStock === 1 ? 'unidade disponível' : 'unidades disponíveis'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-800 font-medium">
                  <XCircle className="size-4 text-amber-600 shrink-0" />
                  <span>
                    A variação {selectedColor} / {selectedSize} está temporariamente indisponível
                    para pronta entrega. Escolha outro tamanho ou cor.
                  </span>
                </div>
              )
            ) : (
              <p className="text-muted-foreground">
                Selecione uma cor e um tamanho para verificar a pronta entrega.
              </p>
            )}
            <p className="text-[0.7rem] text-muted-foreground mt-1">
              * O estoque informado refere-se exclusivamente à variação selecionada, não ao total do
              modelo.
            </p>
          </div>

          {/* Botão Adicionar à sacola com texto exato */}
          <div className="mt-6">
            <Button
              size="lg"
              disabled={!selectedVariant || !isSelectedAvailable}
              className="h-14 w-full text-base bg-emerald-deep text-white hover:bg-emerald-900 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAddToCart}
            >
              Adicionar à sacola
            </Button>
          </div>

          {/* Benefícios */}
          <div className="mt-8 grid gap-4 border-y border-emerald-900/10 py-5 sm:grid-cols-3">
            <div className="product-benefit">
              <ShieldCheck />
              <span>
                <strong>Pronta entrega</strong>
                <small>Sem espera de encomenda</small>
              </span>
            </div>
            <div className="product-benefit">
              <Truck />
              <span>
                <strong>Checkout oficial</strong>
                <small>Butterfly Gestão</small>
              </span>
            </div>
            <div className="product-benefit">
              <Sparkles />
              <span>
                <strong>Curadoria</strong>
                <small>Butterfly SEMIJOIAS</small>
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-emerald-deep hover:text-gold-deep"
            >
              <Link to="/tshirteria">
                <ArrowLeft className="mr-2 size-4" /> Ver outros modelos da T-shirteria
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
