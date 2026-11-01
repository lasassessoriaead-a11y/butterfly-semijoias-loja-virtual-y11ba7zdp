import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  ExternalLink,
  Instagram,
  LockKeyhole,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useStore } from '@/contexts/StoreContext'
import { cn } from '@/lib/utils'

export const GESTAO_ACCOUNT_URL =
  'https://butterfly-semijoias-gestao.luka251083739205.chatgpt.site/conta'
export const GESTAO_RESELLER_URL =
  'https://butterfly-semijoias-gestao.luka251083739205.chatgpt.site/conta?returnTo=%2Fvendedora'

const mainLinks = [
  ['Início', '/'],
  ['Loja', '/loja'],
  ['Lançamentos', '/lancamentos'],
  ['Mais vendidos', '/mais-vendidos'],
  ['Seja revendedora', '/revendedora'],
  ['Sobre', '/sobre'],
  ['Contato', '/contato'],
]

function NavigationLinks({
  onNavigate,
  mobile = false,
}: {
  onNavigate?: () => void
  mobile?: boolean
}) {
  return (
    <nav
      className={cn(mobile ? 'flex flex-col' : 'hidden items-center gap-6 xl:flex')}
      aria-label="Navegação principal"
    >
      {mainLinks.map(([label, path]) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'nav-link',
              mobile && 'border-b border-emerald-900/10 py-4 text-lg',
              isActive && 'nav-link--active',
            )
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { user, isAdmin } = useStore()
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    setMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-ivory text-foreground">
      <div className="prelaunch-bar">
        <span className="inline-flex items-center gap-2">
          <LockKeyhole className="size-3.5" /> Pré-lançamento • cobranças reais e publicação
          definitiva desativadas
        </span>
      </div>

      <header className="site-header">
        <div className="site-shell flex h-[4.75rem] items-center justify-between gap-4">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="xl:hidden" aria-label="Abrir menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[88vw] max-w-sm bg-ivory p-0">
              <SheetHeader className="border-b border-emerald-900/10 px-6 py-4 text-left">
                <SheetTitle className="sr-only">Menu Butterfly</SheetTitle>
                <BrandLogo variant="light" className="h-16 w-auto object-contain object-left" />
              </SheetHeader>
              <div className="px-6 py-5">
                <NavigationLinks mobile onNavigate={() => setMenuOpen(false)} />
                <div className="mt-6 grid gap-2">
                  <Button asChild variant="outline" className="justify-start">
                    <a
                      href={GESTAO_ACCOUNT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMenuOpen(false)}
                    >
                      <UserRound className="mr-2 size-4 text-emerald-deep" /> Minha conta
                      <ExternalLink className="ml-auto size-3.5 text-muted-foreground" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="justify-start border-gold/40 bg-gold/5 text-emerald-deep hover:bg-gold/10"
                  >
                    <a
                      href={GESTAO_RESELLER_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Sparkles className="mr-2 size-4 text-gold-deep" /> Área da revendedora
                      <ExternalLink className="ml-auto size-3.5 text-muted-foreground" />
                    </a>
                  </Button>
                  {isAdmin && (
                    <Button asChild className="justify-start">
                      <Link to="/admin" onClick={() => setMenuOpen(false)}>
                        <ShieldCheck className="mr-2 size-4" /> Administração
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/" className="shrink-0" aria-label="Butterfly Semijoias — Início">
            <BrandLogo
              variant="light"
              className="h-[3.7rem] w-[10.5rem] object-contain md:w-[12rem]"
              eager
            />
          </Link>

          <NavigationLinks />

          <div className="flex items-center gap-1 md:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen((open) => !open)}
              aria-label="Pesquisar produtos"
            >
              {searchOpen ? <X className="size-5" /> : <Search className="size-5" />}
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden lg:inline-flex text-xs text-emerald-deep hover:text-gold-deep"
              title="Área da revendedora Butterfly Gestão"
            >
              <a href={GESTAO_RESELLER_URL} target="_blank" rel="noopener noreferrer">
                <Sparkles className="mr-1.5 size-3.5 text-gold-deep" /> Área da revendedora
              </a>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex text-xs text-emerald-deep hover:text-gold-deep"
              title="Minha conta Butterfly Gestão"
            >
              <a
                href={GESTAO_ACCOUNT_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Minha conta"
              >
                <UserRound className="mr-1.5 size-4" /> Minha conta
              </a>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="sm:hidden"
              aria-label="Minha conta"
            >
              <a
                href={GESTAO_ACCOUNT_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Minha conta"
              >
                <UserRound className="size-5" />
              </a>
            </Button>
          </div>
        </div>
        {searchOpen && (
          <form action="/loja" className="search-strip">
            <div className="site-shell flex items-center gap-3 py-3">
              <Search className="size-4 text-gold-deep" />
              <input
                name="busca"
                autoFocus
                placeholder="Busque por anel, colar, brinco..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <Button type="submit" size="sm">
                Buscar
              </Button>
            </div>
          </form>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="site-shell grid gap-10 py-14 md:grid-cols-[1.25fr_1fr_1fr_1fr]">
          <div>
            <BrandLogo variant="dark" className="h-24 w-24 rounded-full object-cover" />
            <p className="mt-5 max-w-xs text-sm leading-7 text-white/70">
              Semijoias que celebram transformação, delicadeza e presença. Loja em pré-lançamento,
              com dados sinalizados com transparência.
            </p>
          </div>
          <div>
            <h3 className="footer-title">Descubra</h3>
            <div className="footer-links">
              <Link to="/loja">Todas as peças</Link>
              <Link to="/lancamentos">Lançamentos</Link>
              <Link to="/mais-vendidos">Mais vendidos</Link>
              <Link to="/revendedora">Seja revendedora</Link>
            </div>
          </div>
          <div>
            <h3 className="footer-title">Atendimento</h3>
            <div className="footer-links">
              <Link to="/contato">Fale conosco</Link>
              <a
                href={GESTAO_ACCOUNT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5"
              >
                Minha conta <ExternalLink className="size-3 text-white/50" />
              </a>
              <a
                href={GESTAO_RESELLER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-gold-light hover:text-white"
              >
                Área da revendedora <ExternalLink className="size-3 text-gold-light/60" />
              </a>
              <Link to="/politicas#entregas">Entregas</Link>
              <Link to="/politicas#trocas">Trocas e devoluções</Link>
            </div>
          </div>
          <div>
            <h3 className="footer-title">Informações</h3>
            <div className="footer-links">
              <Link to="/sobre">Sobre a Butterfly</Link>
              <Link to="/politicas">Privacidade e LGPD</Link>
              {isAdmin && <Link to="/admin">Administração</Link>}
              <span className="mt-3 inline-flex items-center gap-2 text-xs text-white/50">
                <Instagram className="size-4" /> Redes sociais: links provisórios
              </span>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="site-shell flex flex-col gap-2 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Butterfly SEMIJOIAS.</span>
            <span>Ambiente de pré-lançamento • nenhuma cobrança real ativa</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
