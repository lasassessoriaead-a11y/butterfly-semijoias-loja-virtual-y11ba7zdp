import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useLocation, useParams } from 'react-router-dom'
import { ErrorState, LoadingGrid } from '@/components/LoadingState'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useStore } from '@/contexts/StoreContext'
import { CATEGORY_LABELS, type ProductCategory } from '@/types/store'

function Filters({ selected, onSelect }: { selected: string; onSelect: (value: string) => void }) {
  return (
    <div className="grid gap-2">
      <button
        className={`catalog-filter ${selected === 'todos' ? 'catalog-filter--active' : ''}`}
        onClick={() => onSelect('todos')}
      >
        Todas as peças
      </button>
      {(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map((category) => (
        <button
          key={category}
          className={`catalog-filter ${selected === category ? 'catalog-filter--active' : ''}`}
          onClick={() => onSelect(category)}
        >
          {CATEGORY_LABELS[category]}
        </button>
      ))}
    </div>
  )
}

export default function CatalogPage({ mode = 'all' }: { mode?: 'all' | 'new' | 'best' }) {
  const { category } = useParams()
  const location = useLocation()
  const initialSearch = new URLSearchParams(location.search).get('busca') || ''
  const validCategory = category && category in CATEGORY_LABELS ? category : 'todos'
  const [selectedCategory, setSelectedCategory] = useState(validCategory)
  const [search, setSearch] = useState(initialSearch)
  const [sort, setSort] = useState('featured')
  const { products, productsLoading, productsError, refreshProducts } = useStore()

  const filtered = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase('pt-BR')
    const result = products.filter((product) => {
      if (selectedCategory !== 'todos' && product.category !== selectedCategory) return false
      if (mode === 'new' && !product.is_new) return false
      if (mode === 'best' && !product.best_seller) return false
      if (
        normalized &&
        !`${product.name} ${product.description} ${CATEGORY_LABELS[product.category]}`
          .toLocaleLowerCase('pt-BR')
          .includes(normalized)
      )
        return false
      return true
    })
    return [...result].sort((a, b) => {
      if (sort === 'price-asc') return a.price_cents - b.price_cents
      if (sort === 'price-desc') return b.price_cents - a.price_cents
      if (sort === 'name') return a.name.localeCompare(b.name, 'pt-BR')
      return Number(b.featured) - Number(a.featured) || Number(b.is_new) - Number(a.is_new)
    })
  }, [products, selectedCategory, search, sort, mode])

  const title =
    mode === 'new'
      ? 'Lançamentos'
      : mode === 'best'
        ? 'Mais vendidos'
        : selectedCategory === 'todos'
          ? 'Loja'
          : CATEGORY_LABELS[selectedCategory as ProductCategory]
  const subtitle =
    mode === 'new'
      ? 'Novidades escolhidas para marcar seus próximos momentos.'
      : mode === 'best'
        ? 'As peças preferidas da curadoria Butterfly.'
        : 'Explore nossa curadoria de semijoias e encontre a peça que traduz o seu momento.'

  return (
    <div>
      <section className="page-hero page-hero--catalog">
        <div className="site-shell relative z-10 py-16 text-center md:py-20">
          <p className="eyebrow text-gold">Butterfly SEMIJOIAS</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </section>
      <section className="section-block bg-white">
        <div className="site-shell">
          <div className="mb-8 flex flex-col gap-4 border-b border-emerald-900/10 pb-6 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar no catálogo"
                className="h-12 pl-11 pr-10"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  aria-label="Limpar busca"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="mr-2 size-4" /> Filtrar
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-ivory">
                  <SheetHeader>
                    <SheetTitle className="font-serif text-2xl text-emerald-deep">
                      Categorias
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <Filters selected={selectedCategory} onSelect={setSelectedCategory} />
                  </div>
                </SheetContent>
              </Sheet>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {filtered.length} {filtered.length === 1 ? 'peça' : 'peças'}
              </span>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-11 w-[170px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Destaques</SelectItem>
                  <SelectItem value="price-asc">Menor preço</SelectItem>
                  <SelectItem value="price-desc">Maior preço</SelectItem>
                  <SelectItem value="name">Nome A–Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
            <aside className="hidden lg:block">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-deep">
                Categorias
              </p>
              <Filters selected={selectedCategory} onSelect={setSelectedCategory} />
              <div className="mt-8 rounded-sm bg-ivory p-5 text-xs leading-6 text-muted-foreground">
                <strong className="block text-emerald-deep">Catálogo ao vivo</strong>
                Produtos, fotos, preços e estoque são carregados diretamente do Butterfly Gestão.
                Nenhuma peça fictícia é exibida.
              </div>
            </aside>
            <div>
              {productsLoading ? (
                <LoadingGrid />
              ) : productsError ? (
                <div className="rounded-sm border border-amber-200 bg-amber-50 p-10 text-center">
                  <h2 className="font-serif text-2xl text-emerald-deep">
                    Catálogo ao vivo indisponível
                  </h2>
                  <p className="mt-3 text-sm text-amber-900 max-w-lg mx-auto">{productsError}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Conforme as diretrizes de transparência da Butterfly, produtos fictícios não são
                    exibidos quando a API está fora do ar.
                  </p>
                  <Button variant="outline" className="mt-5" onClick={() => void refreshProducts()}>
                    Tentar novamente
                  </Button>
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-sm bg-ivory p-14 text-center">
                  <h2 className="font-serif text-3xl text-emerald-deep">Catálogo em preparação</h2>
                  <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
                    Não há produtos disponíveis no Butterfly Gestão no momento. Assim que o estoque
                    for adicionado lá, o catálogo será atualizado automaticamente aqui.
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Nenhum produto fictício é exibido.
                  </p>
                </div>
              ) : filtered.length ? (
                <div className="product-grid product-grid--catalog">
                  {filtered.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="rounded-sm bg-ivory p-12 text-center">
                  <h2 className="font-serif text-2xl text-emerald-deep">Nenhuma peça encontrada</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Tente outra busca ou remova os filtros selecionados.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-5"
                    onClick={() => {
                      setSearch('')
                      setSelectedCategory('todos')
                    }}
                  >
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
