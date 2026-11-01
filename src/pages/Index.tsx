import { ArrowRight, Gem, Leaf, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '@/components/BrandLogo'
import { ErrorState, LoadingGrid } from '@/components/LoadingState'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { useStore } from '@/contexts/StoreContext'
import { CATEGORY_LABELS, type ProductCategory } from '@/types/store'

const categoryImages: Record<ProductCategory, string> = {
  brincos: 'https://img.usecurling.com/p/720/840?q=gold%20earrings&color=white',
  colares: 'https://img.usecurling.com/p/720/840?q=gold%20necklace&color=white',
  pulseiras: 'https://img.usecurling.com/p/720/840?q=gold%20bracelet&color=white',
  aneis: 'https://img.usecurling.com/p/720/840?q=gold%20rings&color=white',
  conjuntos: 'https://img.usecurling.com/p/720/840?q=gold%20jewelry&color=white',
  outras: 'https://img.usecurling.com/p/720/840?q=gold%20brooch&color=white',
}

export default function Index() {
  const { products, productsLoading, productsError, refreshProducts } = useStore()
  const featured = products.filter((product) => product.featured).slice(0, 4)
  const categories = Object.keys(CATEGORY_LABELS) as ProductCategory[]

  return (
    <>
      <section className="hero-home">
        <BrandLogo variant="banner" className="hero-home__image" eager />
        <div className="hero-home__overlay" />
        <div className="site-shell hero-home__content">
          <p className="eyebrow text-gold-light">Nova coleção • pré-lançamento</p>
          <h1>O brilho da sua transformação</h1>
          <p>
            Semijoias delicadas, marcantes e escolhidas para acompanhar cada nova versão de você.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg" className="btn-gold">
              <Link to="/loja">
                Descobrir a coleção <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/50 bg-white/5 text-white hover:bg-white hover:text-emerald-deep"
            >
              <Link to="/lancamentos">Ver lançamentos</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="site-shell grid gap-5 py-5 sm:grid-cols-3">
          <div>
            <ShieldCheck />{' '}
            <span>
              <strong>Compra segura</strong>
              <small>Ambiente protegido</small>
            </span>
          </div>
          <div>
            <Sparkles />{' '}
            <span>
              <strong>Curadoria Butterfly</strong>
              <small>Peças com presença</small>
            </span>
          </div>
          <div>
            <Leaf />{' '}
            <span>
              <strong>Transparência</strong>
              <small>Pré-lançamento sinalizado</small>
            </span>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="site-shell">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Encontre a sua</p>
            <h2>Coleções em destaque</h2>
            <p>
              Uma curadoria para cada expressão, do detalhe delicado à composição que transforma o
              look.
            </p>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <Link key={category} to={`/categoria/${category}`} className="category-tile">
                <img
                  src={categoryImages[category]}
                  alt={`${CATEGORY_LABELS[category]} — foto provisória`}
                  loading="lazy"
                />
                <div className="category-tile__overlay" />
                <div className="category-tile__label">
                  <span>Explorar</span>
                  <h3>{CATEGORY_LABELS[category]}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block bg-white">
        <div className="site-shell">
          <div className="section-heading flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Escolhas Butterfly</p>
              <h2>Peças que encantam</h2>
            </div>
            <Button asChild variant="link" className="px-0 text-emerald-deep">
              <Link to="/loja">
                Ver toda a loja <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
          {productsLoading ? (
            <LoadingGrid />
          ) : productsError ? (
            <div className="rounded-sm border border-amber-200 bg-amber-50 p-8 text-center">
              <h3 className="font-serif text-2xl text-emerald-deep">
                Catálogo ao vivo indisponível
              </h3>
              <p className="mt-2 text-sm text-amber-900 max-w-xl mx-auto">{productsError}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Em respeito à transparência, nenhum produto fictício é exibido nesta loja.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => void refreshProducts()}>
                Tentar novamente
              </Button>
            </div>
          ) : featured.length > 0 ? (
            <div className="product-grid">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-sm bg-ivory p-12 text-center">
              <h3 className="font-serif text-2xl text-emerald-deep">Catálogo em preparação</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                Nenhuma peça cadastrada no momento no catálogo. Novas semijoias serão exibidas aqui
                assim que publicadas.
              </p>
              <Button asChild variant="outline" className="mt-5">
                <Link to="/sobre">Conhecer a Butterfly</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="brand-story">
        <div className="site-shell grid items-center gap-10 py-20 lg:grid-cols-2 lg:gap-20">
          <div className="brand-story__visual">
            <BrandLogo variant="dark" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="eyebrow text-gold">A essência Butterfly</p>
            <h2 className="font-serif text-4xl text-white md:text-5xl">
              Toda transformação merece ser celebrada.
            </h2>
            <p className="mt-6 max-w-xl leading-8 text-white/70">
              A borboleta representa movimento, beleza e novas fases. A Butterfly nasce para
              traduzir essa essência em semijoias que fazem parte da sua história — com delicadeza,
              elegância e personalidade.
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-8 border-gold/60 bg-transparent text-gold hover:bg-gold hover:text-emerald-deep"
            >
              <Link to="/sobre">Conhecer a Butterfly</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="reseller-callout">
        <div className="site-shell grid items-center gap-10 py-20 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <div className="inline-flex size-12 items-center justify-center rounded-full bg-gold/15 text-gold-deep">
              <Gem />
            </div>
            <p className="eyebrow mt-6">Faça parte</p>
            <h2 className="max-w-2xl font-serif text-4xl text-emerald-deep md:text-5xl">
              Leve a experiência Butterfly mais longe.
            </h2>
            <p className="mt-5 max-w-2xl leading-8 text-muted-foreground">
              Conheça nosso programa de consignação para revendedoras: suporte próximo, curadoria de
              peças e um processo transparente, sem promessas de ganhos não definidos.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link to="/revendedora">
                Quero ser Revendedora <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
          <div className="relative hidden lg:block">
            <img
              src="https://img.usecurling.com/p/800/860?q=jewelry%20woman&color=green"
              alt="Mulher usando semijoias — foto provisória"
              className="aspect-[4/5] w-full rounded-t-[12rem] object-cover"
              loading="lazy"
            />
            <span className="photo-provisional">Foto provisória</span>
          </div>
        </div>
      </section>
    </>
  )
}
