import { Link } from 'react-router-dom'
import { ArrowRight, Check, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, type TshirtModel } from '@/types/store'

export function TshirtModelCard({ model }: { model: TshirtModel }) {
  const availableVariants = model.variants.filter((v) => v.available && v.stock > 0)
  const isAvailable = availableVariants.length > 0
  const totalStock = model.variants.reduce((sum, v) => sum + (v.stock || 0), 0)

  // Calcule o preço a partir de
  let priceFromCents = model.priceFromCents || Math.round((model.priceFrom || 0) * 100)
  if (!priceFromCents && model.variants.length > 0) {
    const prices = model.variants.map((v) => v.price_cents).filter((p) => p > 0)
    if (prices.length > 0) priceFromCents = Math.min(...prices)
  }

  return (
    <Card className="product-card group overflow-hidden border-0 bg-white shadow-none">
      <Link
        to={`/tshirteria/${model.id}`}
        className="product-card__image-wrap"
        aria-label={`Ver modelo ${model.name}`}
      >
        <img
          src={
            model.photo ||
            'https://img.usecurling.com/p/720/840?q=tshirt%20cotton%20fashion&color=white'
          }
          alt={model.name}
          className="product-card__image object-cover"
          loading="lazy"
        />
        <div className="product-card__badges">
          <Badge className="badge-gold">T-shirteria</Badge>
          <Badge
            variant="outline"
            className="bg-white/90 text-emerald-deep border-emerald-900/20 text-[0.68rem]"
          >
            Pronta entrega
          </Badge>
        </div>
        <span className="product-card__quick">
          <ArrowRight className="size-4" /> Escolher cor e tamanho
        </span>
      </Link>
      <CardContent className="px-1 pb-2 pt-4">
        <p className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold-deep flex items-center gap-1.5">
          <Sparkles className="size-3" /> Modelo Exclusivo
        </p>
        <Link to={`/tshirteria/${model.id}`} className="block">
          <h3 className="font-serif text-xl leading-tight text-emerald-deep transition-colors group-hover:text-gold-deep">
            {model.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-xs text-muted-foreground">A partir de</span>
          <span className="font-medium text-emerald-deep">{formatCurrency(priceFromCents)}</span>
        </div>

        {/* Cores e tamanhos disponíveis de relance */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1 text-[0.7rem] text-muted-foreground">
          {model.colors.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded bg-ivory px-1.5 py-0.5 border border-emerald-900/10">
              {model.colors.length === 1 ? model.colors[0] : `${model.colors.length} cores`}
            </span>
          )}
          {model.sizes.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded bg-ivory px-1.5 py-0.5 border border-emerald-900/10">
              {model.sizes.join(', ')}
            </span>
          )}
          {isAvailable && (
            <span className="inline-flex items-center gap-1 text-emerald-700 ml-auto font-medium">
              <Check className="size-3" /> Pronta entrega
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <Button
            asChild
            size="sm"
            className="w-full text-xs bg-emerald-deep text-white hover:bg-emerald-900 shadow-sm"
          >
            <Link to={`/tshirteria/${model.id}`}>Ver modelo e escolher tamanho</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
