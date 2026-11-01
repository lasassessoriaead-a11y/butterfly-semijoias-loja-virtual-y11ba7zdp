import { Facebook, Instagram, Mail, MapPin, MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function ContactPage() {
  const contacts = [
    [MessageCircle, 'WhatsApp', 'Atendimento em configuração', '#'],
    [Instagram, 'Instagram', 'Perfil oficial a confirmar', '#'],
    [Facebook, 'Facebook', 'Página oficial a confirmar', '#'],
    [Mail, 'E-mail', 'Canal oficial a confirmar', '#'],
  ]
  return (
    <div>
      <section className="page-hero">
        <div className="site-shell py-20 text-center">
          <p className="eyebrow text-gold">Estamos por perto</p>
          <h1>Contato</h1>
          <p>
            Escolha o canal que preferir. Nesta fase, os links de atendimento ainda são provisórios.
          </p>
        </div>
      </section>
      <section className="section-block bg-white">
        <div className="site-shell grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="eyebrow">Fale com a gente</p>
            <h2 className="font-serif text-4xl text-emerald-deep">Será um prazer ouvir você.</h2>
            <p className="mt-5 leading-8 text-muted-foreground">
              Dúvidas sobre peças, pedidos, entregas ou o programa de revendedoras? Os canais
              oficiais serão ativados após confirmação do cliente.
            </p>
            <div className="mt-8 flex items-start gap-3 text-sm text-muted-foreground">
              <MapPin className="mt-1 size-5 text-gold-deep" />
              <div>
                <strong className="block text-emerald-deep">Atendimento online</strong>Endereço
                comercial ainda não divulgado.
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {contacts.map(([Icon, title, description, href]) => {
              const IconComponent = Icon as typeof MessageCircle
              return (
                <div key={String(title)} className="contact-card">
                  <div className="flex items-start justify-between gap-3">
                    <IconComponent className="size-6 text-gold-deep" />
                    <Badge variant="outline">Provisório</Badge>
                  </div>
                  <h3>{String(title)}</h3>
                  <p>{String(description)}</p>
                  <Button asChild variant="outline" className="mt-5 w-full">
                    <a
                      href={String(href)}
                      onClick={(event) => event.preventDefault()}
                      aria-disabled="true"
                    >
                      Aguardando confirmação
                    </a>
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
