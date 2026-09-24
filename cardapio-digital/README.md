# 🍔 Cardápio Digital — SaaS de pedidos e pagamento online

SaaS multi-restaurante: cada estabelecimento (restaurante, hamburgueria, pizzaria…) cria a conta, monta o cardápio e recebe pedidos **com pagamento online por PIX e cartão** (Mercado Pago), ou pagamento na entrega.

## Funcionalidades

**Para o cliente final** (`/m/<slug-do-restaurante>`)
- Cardápio mobile com capa, logo, cor da marca, categorias, busca e fotos
- Adicionais por produto (bacon extra, queijo…) e observações ("sem cebola")
- Carrinho salvo no navegador
- Entrega (com taxa e pedido mínimo), retirada ou pedido na mesa (QR Code por mesa já informa o número)
- Pagamento: **PIX com QR Code** e confirmação automática, **cartão em até 12x** (Checkout do Mercado Pago), dinheiro com troco ou cartão na entrega
- Página de acompanhamento do pedido em tempo real + botão para o WhatsApp da loja

**Para o restaurante** (`/admin`)
- Painel de pedidos em colunas (Novos → Em preparo → Prontos → Finalizados), atualização a cada 5s e **alerta sonoro** para pedidos novos
- Impressão do pedido (cupom 80mm) ao aceitar
- Cadastro de categorias, produtos, adicionais e pausa de itens em falta
- Botão para abrir e fechar a loja
- Relatórios: faturamento do dia, da semana e do mês, ticket médio, gráfico diário e mais vendidos
- Link do cardápio + QR Code para download + impressão de QR Codes por mesa
- Configurações de marca, entrega, formas de pagamento e **Access Token do Mercado Pago** (o dinheiro cai direto na conta do restaurante)

**Para você (dono do SaaS)**
- Teste grátis de 14 dias por conta. Com o teste vencido, o cardápio para de aceitar pedidos
- Aba "Clientes do SaaS" (para e-mails em `SUPERADMIN_EMAILS`): lista de restaurantes, mudança de plano (`trial`, `basic`, `pro`, `suspended`) e extensão do teste

## Como rodar

Requisito: **Node.js 22.13+** (usa o SQLite embutido do Node, sem banco externo).

```bash
cd cardapio-digital
npm install
npm run seed      # opcional: cria a "Burger House" de demonstração
npm start         # http://localhost:3000
```

- Landing page e cadastro: `http://localhost:3000`
- Demonstração: `http://localhost:3000/m/burger-house`. Painel: login `demo@cardapio.app` / senha `demo12345`
- Testes: `npm test`

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `PORT` | Porta HTTP (padrão 3000) |
| `NODE_ENV` | Use `production` em produção (cookies `secure` e pagamentos de demonstração desligados) |
| `PUBLIC_URL` | URL pública, ex.: `https://meucardapio.com.br`. Necessária para o webhook e o retorno do Mercado Pago |
| `DB_PATH` | Caminho do arquivo SQLite (padrão `./data/cardapio.db`). Em produção, aponte para um **volume persistente** |
| `SUPERADMIN_EMAILS` | E-mails (separados por vírgula) com acesso à aba de clientes do SaaS |
| `MP_WEBHOOK_SECRET` | (Opcional) Assinatura secreta dos webhooks do Mercado Pago, para validar o `x-signature` |
| `ALLOW_DEMO_PAYMENTS` | `true` libera o pagamento simulado mesmo em produção (não recomendado) |

## Pagamentos (Mercado Pago)

1. O restaurante cria uma aplicação em https://www.mercadopago.com.br/developers/panel/app
2. Copia o **Access Token de produção** (`APP_USR-…`) e cola no painel, em **Configurações → Pagamentos**
3. Pronto: PIX e cartão passam a ser cobrados na conta dele

Como a confirmação funciona:
- O pedido online nasce como **Aguardando pagamento** e só aparece em "Novos" depois de aprovado
- O Mercado Pago chama `POST /api/webhooks/mercadopago/:restaurantId`. O servidor **não confia no corpo**: consulta o pagamento na API com o token do restaurante e confere se o valor bate com o do pedido
- Como reserva, a página do pedido consulta o status a cada 4 segundos enquanto aguarda (funciona até sem webhook)
- Os preços são sempre **recalculados no servidor**. O cliente não consegue alterar valores

Sem token configurado (fora de produção), o sistema usa o **modo demonstração**: gera um PIX fictício e mostra um botão "Simular pagamento aprovado".

## Deploy (Railway, Render, VPS…)

- Comando de start: `npm start`, com diretório raiz `cardapio-digital`
- Configure `NODE_ENV=production`, `PUBLIC_URL` e `DB_PATH` apontando para um volume persistente (ex.: `/data/cardapio.db`)
- Use HTTPS (obrigatório para os webhooks do Mercado Pago)

## Estrutura

```
cardapio-digital/
├── server/
│   ├── index.js      # API REST + rotas das páginas
│   ├── db.js         # Schema SQLite
│   ├── auth.js       # Senhas (scrypt) e sessões por cookie
│   ├── payments.js   # Mercado Pago (PIX, Checkout, webhook) + modo demo
│   └── seed.js       # Dados de demonstração
├── public/
│   ├── index.html    # Landing page + cadastro/login
│   ├── admin.*       # Painel do restaurante
│   ├── menu.*        # Cardápio público + carrinho + checkout
│   ├── order.*       # Pagamento PIX e acompanhamento do pedido
│   └── common.js, styles.css
└── test/api.test.js
```

## Próximos passos sugeridos
- Cobrança automática da assinatura do SaaS (ex.: webhook da Cakto/Stripe atualizando o `plan`)
- Upload de imagens (hoje as fotos são por URL)
- Recuperação de senha por e-mail
- Horário de funcionamento automático (abrir e fechar sozinho)
