import { BrandLogo } from '@/components/BrandLogo'
import { Gem, Heart, Leaf, Sparkles } from 'lucide-react'

export default function AboutPage() {
  return (
    <div>
      <section className="page-hero">
        <div className="site-shell py-20 text-center">
          <p className="eyebrow text-gold">Nossa essência</p>
          <h1>Sobre a Butterfly</h1>
          <p>Uma marca inspirada na beleza de transformar, florescer e ocupar novos espaços.</p>
        </div>
      </section>
      <section className="section-block bg-white">
        <div className="site-shell grid items-center gap-14 lg:grid-cols-2">
          <div className="rounded-t-[13rem] bg-emerald-deep p-10 md:p-16">
            <BrandLogo
              variant="dark"
              className="mx-auto aspect-square w-full max-w-md object-cover"
            />
          </div>
          <div>
            <p className="eyebrow">Mais que um símbolo</p>
            <h2 className="font-serif text-4xl leading-tight text-emerald-deep md:text-5xl">
              A borboleta traduz aquilo que nos move.
            </h2>
            <p className="mt-6 leading-8 text-muted-foreground">
              A Butterfly SEMIJOIAS nasce do desejo de celebrar fases, escolhas e conquistas.
              Acreditamos que cada peça pode guardar uma lembrança, marcar uma passagem e revelar
              uma nova versão de quem a usa.
            </p>
            <p className="mt-4 leading-8 text-muted-foreground">
              Esta primeira loja está em pré-lançamento. O catálogo profissional e mais detalhes da
              história da marca serão complementados pelo cliente antes da publicação definitiva.
            </p>
          </div>
        </div>
      </section>
      <section className="section-block">
        <div className="site-shell">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Valores que guiam</p>
            <h2>Elegância com significado</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [Sparkles, 'Delicadeza', 'Cuidado em cada escolha visual e experiência.'],
              [Gem, 'Presença', 'Peças que valorizam identidade, não excessos.'],
              [Heart, 'Proximidade', 'Relações construídas com escuta e transparência.'],
              [Leaf, 'Transformação', 'Espaço para novas fases e possibilidades.'],
            ].map(([Icon, title, text]) => {
              const C = Icon as typeof Sparkles
              return (
                <div key={String(title)} className="value-card">
                  <C />
                  <h3>{String(title)}</h3>
                  <p>{String(text)}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
