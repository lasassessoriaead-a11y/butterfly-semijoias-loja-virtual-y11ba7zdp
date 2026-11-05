import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useStore } from '@/contexts/StoreContext'
import { productGalleryImages } from '@/lib/gallery'
import { formatCurrency, type Product } from '@/types/store'

export function ProductCard({ product }: { product: Product }) {
  const { buyNow } = useStore()
  // Galeria: usa somente as fotos do próprio produto/finish (images/photos);
  // a segunda foto aparece no hover no desktop, nunca a foto de outro acabamento.
  const gallery = productGalleryImages(product)
  const hoverImage = gallery.length > 1 ? gallery[1] : undefined

  return (
    <Card className="product-card group overflow-hidden border-0 bg-white shadow-none">
      <Link
        to={`/produto/${product.slug}`}
        className="product-card__image-wrap"
        aria-label={`Ver ${product.name}`}
      >
        <img
          src={product.image_url || gallery[0]?.url || ''}
          alt={product.image_alt || product.name}
          className="product-card__image"
          loading="lazy"
        />
        {hoverImage && (
          <img
            src={hoverImage.url}
            alt=""
            aria-hidden="true"
            className="product-card__image product-card__image--hover"
            loading="lazy"
          />
        )}
        <div className="product-card__badges">
          {product.is_new && <Badge className="badge-gold">Lançamento</Badge>}
          {product.best_seller && <Badge variant="secondary">Mais vendido</Badge>}
        </div>
        <span className="product-card__quick">
          <ArrowRight className="size-4" /> Ver detalhes
        </span>
      </Link>
      <CardContent className="px-1 pb-2 pt-4">
        <p className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold-deep">
          {product.category === 'aneis' ? 'Anéis' : product.category}
        </p>
        <Link to={`/produto/${product.slug}`} className="block">
          <h3 className="font-serif text-xl leading-tight text-emerald-deep transition-colors group-hover:text-gold-deep">
            {product.name}
          </h3>
        </Link>
        <p className="mt-2 font-medium text-emerald-deep">{formatCurrency(product.price_cents)}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <Button
            type="button"
            size="sm"
            className="h-8 px-3 text-xs bg-emerald-deep text-white hover:bg-emerald-900 shadow-sm"
            onClick={(e) => {
              e.preventDefault()
              buyNow(product)
            }}
          >
            Adicionar à sacola
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-auto px-1 text-emerald-deep hover:bg-transparent hover:text-gold-deep"
          >
            <Link to={`/produto/${product.slug}`}>
              Detalhes <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
