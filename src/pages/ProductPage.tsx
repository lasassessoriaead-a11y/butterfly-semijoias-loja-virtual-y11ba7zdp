import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Check,
  ChevronRight,
  ImageIcon,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from 'lucide-react'
import { CenteredLoader } from '@/components/LoadingState'
import { ProductCard } from '@/components/ProductCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useStore } from '@/contexts/StoreContext'
import { CATEGORY_LABELS, formatCurrency } from '@/types/store'

export default function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { products, productsLoading, addToCart } = useStore()
  const product = products.find((item) => item.slug === slug)
  const [variation, setVariation] = useState('')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (product) setVariation(product.variations[0] || 'Dourado')
  }, [product])

  if (productsLoading) return <CenteredLoader label="Preparando os detalhes da peça..." />
  if (!product) {
    return (
      <div className="site-shell py-24 text-center">
        <h1 className="font-serif text-4xl text-emerald-deep">Peça não encontrada</h1>
        <p className="mt-3 text-muted-foreground">
          Este item pode ter saído do catálogo provisório.
        </p>
        <Button asChild className="mt-6">
          <Link to="/loja">Voltar à loja</Link>
        </Button>
      </div>
    )
  }

  const related = products
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, 4)
  const handleAdd = (goToCart = false) => {
    addToCart(product, variation || product.variations[0] || 'Dourado', quantity)
    toast({ title: 'Peça adicionada', description: `${product.name} está no seu carrinho.` })
    if (goToCart) navigate('/carrinho')
  }

  return (
    <div className="bg-white">
      <div className="site-shell py-5">
        <nav
          className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
          aria-label="Navegação estrutural"
        >
          <Link to="/">Início</Link>
          <ChevronRight className="size-3" />
          <Link to="/loja">Loja</Link>
          <ChevronRight className="size-3" />
          <span>{product.name}</span>
        </nav>
      </div>
      <section className="site-shell grid gap-10 pb-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20">
        <div className="product-detail__image-wrap">
          <img
            src={product.image_url}
            alt={product.image_alt || product.name}
            className="product-detail__image"
          />
          {product.image_is_provisional && (
            <span className="photo-provisional">
              <ImageIcon className="size-3" /> Foto provisória
            </span>
          )}
        </div>
        <div className="py-2 lg:py-8">
          <div className="flex flex-wrap gap-2">
            {product.is_new && <Badge className="badge-gold">Lançamento</Badge>}
            {product.best_seller && <Badge variant="secondary">Mais vendido</Badge>}
          </div>
          <p className="eyebrow mt-5">{CATEGORY_LABELS[product.category]}</p>
          <h1 className="font-serif text-4xl leading-tight text-emerald-deep md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 text-2xl font-medium text-emerald-deep">
            {formatCurrency(product.price_cents)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Preço provisório até a integração com o Butterfly Gestão
          </p>
          <div className="my-7 h-px bg-emerald-900/10" />
          <p className="leading-8 text-muted-foreground">{product.description}</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-[1fr_130px]">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-emerald-deep">
                Variação
              </label>
              <Select value={variation} onValueChange={setVariation}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Escolha" />
                </SelectTrigger>
                <SelectContent>
                  {product.variations.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-emerald-deep">
                Quantidade
              </label>
              <div className="flex h-12 items-center justify-between rounded-md border px-2">
                <button
                  aria-label="Diminuir quantidade"
                  className="p-2"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                >
                  <Minus className="size-4" />
                </button>
                <span className="text-sm font-medium">{quantity}</span>
                <button
                  aria-label="Aumentar quantidade"
                  className="p-2"
                  onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
          </div>
          <p className="mt-3 inline-flex items-center gap-2 text-xs text-emerald-700">
            <Check className="size-3.5" /> Disponível • estoque provisório: {product.stock} un.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Button size="lg" className="h-13" onClick={() => handleAdd(false)}>
              <ShoppingBag className="mr-2 size-4" /> Adicionar ao carrinho
            </Button>
            <Button size="lg" variant="outline" className="h-13" onClick={() => handleAdd(true)}>
              Comprar agora
            </Button>
          </div>
          <div className="mt-8 grid gap-4 border-y border-emerald-900/10 py-5 sm:grid-cols-3">
            <div className="product-benefit">
              <ShieldCheck />
              <span>
                <strong>Ambiente seguro</strong>
                <small>Dados protegidos</small>
              </span>
            </div>
            <div className="product-benefit">
              <Truck />
              <span>
                <strong>Frete transparente</strong>
                <small>Valor provisório sinalizado</small>
              </span>
            </div>
            <div className="product-benefit">
              <Sparkles />
              <span>
                <strong>Curadoria</strong>
                <small>Seleção Butterfly</small>
              </span>
            </div>
          </div>
        </div>
      </section>
      {related.length > 0 && (
        <section className="section-block bg-ivory">
          <div className="site-shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Complete sua composição</p>
                <h2>Você também pode gostar</h2>
              </div>
            </div>
            <div className="product-grid">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
