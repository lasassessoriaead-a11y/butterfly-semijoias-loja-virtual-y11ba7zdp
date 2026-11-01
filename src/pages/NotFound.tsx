import { BrandLogo } from '@/components/BrandLogo'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="section-block bg-white">
      <div className="site-shell max-w-xl text-center">
        <BrandLogo variant="light" className="mx-auto h-40 w-56 object-contain" />
        <p className="eyebrow mt-5">Erro 404</p>
        <h1 className="font-serif text-4xl text-emerald-deep">
          Esta página voou para outro lugar.
        </h1>
        <p className="mt-4 text-muted-foreground">
          O endereço não existe ou foi movido durante a transformação da loja.
        </p>
        <Button asChild className="mt-7">
          <Link to="/">Voltar ao início</Link>
        </Button>
      </div>
    </section>
  )
}
