import { Link } from 'react-router-dom'
import { ArrowRight, HeartHandshake, PackageCheck, Sparkles, UsersRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { readableError, storeApi } from '@/services/store'
import { useState, type FormEvent } from 'react'

const steps = [
  [
    '01',
    'Envie sua candidatura',
    'Conte como podemos falar com você. O envio não representa aprovação automática.',
  ],
  [
    '02',
    'Conversa e análise',
    'Nossa equipe entra em contato para apresentar critérios e alinhar os próximos passos.',
  ],
  [
    '03',
    'Início acompanhado',
    'Quando aprovada, você recebe orientações sobre consignação e apresentação das peças.',
  ],
]

export default function ResellerPage() {
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', city: '', phone: '', whatsapp: '', email: '' })

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      await storeApi.submitResellerApplication(form)
      setSubmitted(true)
      setForm({ name: '', city: '', phone: '', whatsapp: '', email: '' })
      toast({
        title: 'Candidatura recebida',
        description: 'Seus dados foram salvos para análise da equipe Butterfly.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Não foi possível enviar',
        description: readableError(error),
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <section className="reseller-hero">
        <div className="reseller-hero__image" />
        <div className="reseller-hero__overlay" />
        <div className="site-shell relative z-10 py-24 text-white md:py-32">
          <p className="eyebrow text-gold">Programa de consignação</p>
          <h1 className="max-w-3xl font-serif text-5xl leading-tight md:text-7xl">
            Seja uma Revendedora Butterfly
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
            Leve semijoias com identidade para perto das suas clientes, com um relacionamento
            transparente e suporte próximo.
          </p>
          <Button asChild size="lg" className="btn-gold mt-8">
            <a href="#candidatura">
              Quero ser Revendedora <ArrowRight className="ml-2 size-4" />
            </a>
          </Button>
        </div>
      </section>

      <section className="section-block bg-white">
        <div className="site-shell">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Uma parceria com propósito</p>
            <h2>Por que caminhar com a Butterfly?</h2>
            <p>
              O programa está em estruturação. Benefícios, condições e critérios serão apresentados
              com clareza durante a análise.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              [
                Sparkles,
                'Curadoria de peças',
                'Seleção alinhada à identidade elegante e versátil da Butterfly.',
              ],
              [
                HeartHandshake,
                'Acompanhamento próximo',
                'Contato humano para orientar cada etapa do relacionamento.',
              ],
              [
                PackageCheck,
                'Modelo de consignação',
                'Funcionamento explicado antes de qualquer aceite, sem promessas de ganhos ou comissões ainda não definidas.',
              ],
            ].map(([Icon, title, text]) => {
              const IconComponent = Icon as typeof Sparkles
              return (
                <div key={String(title)} className="benefit-card">
                  <IconComponent />
                  <h3>{String(title)}</h3>
                  <p>{String(text)}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="site-shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="eyebrow">Como funciona</p>
            <h2 className="font-serif text-4xl text-emerald-deep md:text-5xl">
              Um começo simples e transparente.
            </h2>
            <p className="mt-5 leading-8 text-muted-foreground">
              A candidatura é o primeiro contato. Não há promessa de aprovação, renda, comissão ou
              disponibilidade territorial.
            </p>
          </div>
          <div className="grid gap-4">
            {steps.map(([number, title, text]) => (
              <div key={number} className="process-step">
                <span>{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="candidatura" className="bg-emerald-deep py-20 text-white">
        <div className="site-shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <UsersRound className="size-10 text-gold" />
            <p className="eyebrow mt-6 text-gold">Seu próximo passo</p>
            <h2 className="font-serif text-4xl md:text-5xl">Conte um pouco sobre você.</h2>
            <p className="mt-5 max-w-md leading-8 text-white/65">
              Seus dados serão usados apenas para analisar a candidatura e entrar em contato,
              conforme nossa Política de Privacidade.
            </p>
            <Link
              to="/politicas"
              className="mt-4 inline-block text-sm text-gold underline underline-offset-4"
            >
              Ler Política de Privacidade
            </Link>
          </div>
          <div className="rounded-sm bg-ivory p-6 text-foreground shadow-2xl md:p-10">
            {submitted && (
              <div className="mb-6 rounded-sm border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                Candidatura salva com sucesso. A equipe Butterfly poderá entrar em contato pelos
                canais informados.
              </div>
            )}
            <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="res-name">Nome completo</Label>
                <Input
                  id="res-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  minLength={3}
                  className="mt-2 h-12"
                />
              </div>
              <div>
                <Label htmlFor="res-city">Cidade</Label>
                <Input
                  id="res-city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                  className="mt-2 h-12"
                />
              </div>
              <div>
                <Label htmlFor="res-phone">Telefone</Label>
                <Input
                  id="res-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(00) 0000-0000"
                  required
                  className="mt-2 h-12"
                />
              </div>
              <div>
                <Label htmlFor="res-whatsapp">WhatsApp</Label>
                <Input
                  id="res-whatsapp"
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="(00) 00000-0000"
                  required
                  className="mt-2 h-12"
                />
              </div>
              <div>
                <Label htmlFor="res-email">E-mail</Label>
                <Input
                  id="res-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="mt-2 h-12"
                />
              </div>
              <p className="text-xs leading-5 text-muted-foreground sm:col-span-2">
                Ao enviar, você declara que os dados são verdadeiros e concorda com o contato da
                equipe para análise. A candidatura não garante aprovação.
              </p>
              <Button type="submit" size="lg" disabled={submitting} className="sm:col-span-2">
                {submitting ? 'Enviando...' : 'Quero ser Revendedora'}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
