import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const sections = [
  {
    id: 'privacidade',
    title: 'Privacidade e LGPD',
    content: [
      'A Butterfly coleta apenas os dados necessários para cadastro, atendimento, análise de candidaturas, entrega e acompanhamento de pedidos.',
      'Os dados de clientes são protegidos por regras de acesso: cada pessoa autenticada visualiza somente seus próprios endereços e pedidos. Candidaturas e informações administrativas são restritas à equipe autorizada.',
      'Você poderá solicitar correção ou exclusão de dados pelos canais oficiais quando forem ativados. Alguns registros poderão ser mantidos pelo prazo exigido por obrigações legais.',
    ],
  },
  {
    id: 'trocas',
    title: 'Trocas e devoluções',
    content: [
      'A política definitiva será revisada antes da publicação oficial da loja, respeitando o Código de Defesa do Consumidor e o direito de arrependimento aplicável às compras online.',
      'Não envie produtos sem orientação prévia. Entre em contato informando o número do pedido, motivo e condições da peça para receber as instruções corretas.',
      'Prazos, condições de embalagem e análise serão comunicados com clareza no atendimento oficial.',
    ],
  },
  {
    id: 'entregas',
    title: 'Entregas e frete',
    content: [
      'A loja utiliza nesta fase uma tabela provisória por faixa de CEP. Todo valor exibido é claramente identificado como provisório e sujeito à confirmação antes do envio.',
      'Nenhum valor da tabela é apresentado como cotação real de Correios ou transportadora. A arquitetura está preparada para substituição futura por uma integração de logística.',
      'Prazos provisórios começam a contar após a confirmação segura do pagamento e podem ser ajustados antes da publicação definitiva.',
    ],
  },
  {
    id: 'pagamento',
    title: 'Pagamento Pix em testes',
    content: [
      'Cobranças reais estão desativadas. O QR Code e o Pix Copia e Cola mostrados no checkout são uma simulação de teste, claramente identificada.',
      'Um pedido nunca é marcado como pago pela tela do cliente. A mudança para pago só pode ocorrer no servidor, após webhook Woovi com assinatura válida, correlationID correspondente e valor conferido.',
      'Enquanto o segredo do webhook e as credenciais de teste não estiverem configurados, nenhuma confirmação de pagamento será aceita.',
    ],
  },
]

export default function PoliciesPage() {
  return (
    <div>
      <section className="page-hero">
        <div className="site-shell py-20 text-center">
          <p className="eyebrow text-gold">Transparência em primeiro lugar</p>
          <h1>Políticas da loja</h1>
          <p>
            Informações desta fase de pré-lançamento, sujeitas à revisão jurídica antes da
            publicação definitiva.
          </p>
        </div>
      </section>
      <section className="section-block bg-white">
        <div className="site-shell max-w-4xl">
          <div className="mb-8 rounded-sm border border-gold/30 bg-gold/10 p-5 text-sm leading-7 text-emerald-deep">
            <strong>Importante:</strong> esta versão organiza as práticas técnicas e os princípios
            de atendimento da loja, mas não substitui revisão jurídica profissional antes da
            publicação.
          </div>
          <Accordion
            type="multiple"
            defaultValue={sections.map((section) => section.id)}
            className="space-y-3"
          >
            {sections.map((section) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                id={section.id}
                className="rounded-sm border px-5"
              >
                <AccordionTrigger className="font-serif text-xl text-emerald-deep hover:no-underline">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-6 text-sm leading-7 text-muted-foreground">
                  {section.content.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  )
}
