# Butterfly SEMIJOIAS

Loja virtual em pré-lançamento.

- Publicação definitiva: desativada
- Cobranças reais: desativadas
- Produtos, preços, fotos e estoque: provisórios até integração com Butterfly Gestão
- Frete: tabela provisória por CEP, sempre identificada ao cliente
- Pix: modo de teste; pedido só pode virar pago via webhook Woovi validado

## Desenvolvimento

```sh
npm run dev
```

## Webhook Woovi

Endpoint preparado no backend Skip Cloud:

`/backend/v1/butterfly/v1/webhooks/woovi`

A confirmação fica bloqueada enquanto o segredo de servidor `WOOVI_WEBHOOK_SECRET` não estiver configurado. Nunca use credenciais no frontend.
