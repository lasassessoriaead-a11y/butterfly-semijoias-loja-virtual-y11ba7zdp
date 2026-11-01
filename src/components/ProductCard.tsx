import { Link } from 'react-router-dom'
import { ArrowRight, ImageIcon, ShoppingBag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, type Product } from '@/types/store'

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="product-card group overflow-hidden border-0 bg-white shadow-none">
      <Link
        to={`/produto/${product.slug}`}
        className="product-card__image-wrap"
        aria-label={`Ver ${product.name}`}
      >
        <img
          src={product.image_url}
          alt={product.image_alt || product.name}
          className="product-card__image"
          loading="lazy"
        />
        <div className="product-card__badges">
          {product.is_new && <Badge className="badge-gold">Lançamento</Badge>}
          {product.best_seller && <Badge variant="secondary">Mais vendido</Badge>}
        </div>
        <span className="product-card__quick">
          <ShoppingBag className="size-4" /> Ver detalhes
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
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            {product.image_is_provisional && <ImageIcon className="size-3" />}
            Catálogo de pré-lançamento
          </span>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-auto px-1 text-emerald-deep hover:bg-transparent hover:text-gold-deep"
          >
            <Link to={`/produto/${product.slug}`}>
              Ver <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
