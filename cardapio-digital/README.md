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
- **Mensalidade cobrada pelo Stripe** (plano único de R$ 49,90/mês), com cobrança recorrente automática e bloqueio automático quando a assinatura é cancelada ou fica sem pagamento. Veja a seção "Assinaturas (Stripe)"
- Aba "Clientes do SaaS" (para e-mails em `SUPERADMIN_EMAILS`): lista de restaurantes, mudança de plano (`trial`, `paid`, `suspended`) e extensão do teste

## Como rodar localmente

Requisito: **Node.js 20+**. Sem `DATABASE_URL`, o app usa um Postgres embutido (PGlite) em `./data/pglite`, sem instalar nada.

```bash
cd cardapio-digital
npm install
npm run seed      # opcional: cria a "Burger House" de demonstração
npm start         # http://localhost:3000
```

- Landing page e cadastro: `http://localhost:3000`
- Demonstração: `http://localhost:3000/m/burger-house`. Painel: login `demo@cardapio.app` / senha `demo12345`
- Testes: `npm test`

## Como está publicado (Netlify + Supabase)

```
navegador ──► Netlify (cardapiodigitalpmg.netlify.app)
               ├─ páginas estáticas (public/)
               ├─ /api/webhooks/stripe ─► função "stripe" da Netlify (chaves do Stripe)
               └─ /api/*  ─► Edge Function "api" do Supabase (server/, banco via SUPABASE_DB_URL)
                               └─ operações do Stripe ─► função "stripe" da Netlify
```

- **API**: Edge Function `api` no projeto Supabase "PROJETO AULA PMG". O Supabase injeta a conexão com o banco (`SUPABASE_DB_URL`), então **não existe senha de banco para configurar**. As tabelas ficam no schema `cardapio` e são criadas sozinhas.
- **Stripe**: fica na função `netlify/functions/stripe.js`, porque as chaves estão nas variáveis da Netlify. O servidor pede cada operação entregando um código de uso único (2 minutos), que a função confirma chamando o servidor de volta antes de agir.
- **Superadmin**: e-mails na tabela `cardapio.settings` (chave `superadmin_emails`) ou na variável `SUPERADMIN_EMAILS`.

**Publicar mudanças no servidor**: a Edge Function carrega `server/index.js` do GitHub fixado num commit (veja `edge/index.ts`). Depois de enviar código novo, publique a função de novo apontando para o novo commit (`supabase functions deploy api --no-verify-jwt`, ou pelo painel). As páginas e a função do Stripe a Netlify publica sozinha a cada push.

## Variáveis de ambiente

| Variável | Onde | Descrição |
|---|---|---|
| `STRIPE_SECRET_KEY` | Netlify | Chave secreta do Stripe (`sk_live_…` ou `sk_test_…`) |
| `STRIPE_WEBHOOK_SECRET` | Netlify | Segredo do webhook do Stripe (`whsec_…`) |
| `STRIPE_PRICE_ID` | Netlify | ID do preço mensal da assinatura (`price_…`) |
| `SUPERADMIN_EMAILS` | Supabase (opcional) | Alternativa à tabela `cardapio.settings` |
| `ALLOW_DEMO_PAYMENTS` | Supabase (opcional) | `true` libera o pagamento simulado (só para testes) |
| `APP_TIMEZONE` | Supabase (opcional) | Fuso dos relatórios (padrão `America/Sao_Paulo`) |
| `DATABASE_URL`, `PORT`, `DB_PATH` | local | Só para rodar fora do Supabase; sem `DATABASE_URL` usa PGlite |

## Assinaturas (Stripe)

Os restaurantes pagam a mensalidade do SaaS para você pelo Stripe: **um plano único de R$ 49,90/mês com tudo incluído**. O painel tem a aba **Assinatura**, com o botão "Assinar agora" e o "Gerenciar assinatura", que abre o Portal do Cliente do Stripe (trocar cartão, ver faturas, cancelar).

O cardápio para de aceitar pedidos quando o teste de 14 dias acaba sem assinatura, ou quando a assinatura fica `canceled`, `unpaid` ou `incomplete_expired`. Com pagamento atrasado (`past_due`), o acesso continua enquanto o Stripe tenta cobrar de novo, e o painel pede para atualizar o cartão. Contas liberadas manualmente pelo superadmin (plano `paid` sem assinatura no Stripe) continuam funcionando.

**Configuração no Stripe** (https://dashboard.stripe.com). Faça primeiro em modo de teste:
1. **Product catalog → Add product**: crie o produto "Cardápio Digital" com preço recorrente mensal de R$ 49,90. Copie o ID do preço (`price_…`) para `STRIPE_PRICE_ID`
2. **Developers → API keys**: copie a Secret key para `STRIPE_SECRET_KEY`
3. **Developers → Webhooks → Add destination**:
   - URL: `https://SEU-SITE.netlify.app/api/webhooks/stripe`
   - Eventos: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `customer.subscription.paused`, `customer.subscription.resumed`, `invoice.paid`, `invoice.payment_failed`
   - Copie o Signing secret (`whsec_…`) para `STRIPE_WEBHOOK_SECRET`
4. **Settings → Billing → Customer portal**: ative o portal e permita atualizar forma de pagamento e cancelar
5. Coloque as 3 variáveis (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`) na Netlify

Para testar, use o cartão `4242 4242 4242 4242`, qualquer data futura e qualquer CVC.

## Pagamentos dos pedidos (Mercado Pago)

1. O restaurante cria uma aplicação em https://www.mercadopago.com.br/developers/panel/app
2. Copia o **Access Token de produção** (`APP_USR-…`) e cola no painel, em **Configurações → Pagamentos**
3. Pronto: PIX e cartão passam a ser cobrados na conta dele

Como a confirmação funciona:
- O pedido online nasce como **Aguardando pagamento** e só aparece em "Novos" depois de aprovado
- O Mercado Pago chama `POST /api/webhooks/mercadopago/:restaurantId`. O servidor **não confia no corpo**: consulta o pagamento na API com o token do restaurante e confere se o valor bate com o do pedido
- Como reserva, a página do pedido consulta o status a cada 4 segundos enquanto aguarda
- Os preços são sempre **recalculados no servidor**. O cliente não consegue alterar valores

Sem token configurado, localmente o sistema usa o **modo demonstração** (PIX fictício + botão "Simular pagamento aprovado"). Em produção, sem token, só aparece o pagamento na entrega.

## Estrutura

```
cardapio-digital/
├── server/
│   ├── index.js      # API REST + rotas das páginas
│   ├── db.js         # Schema e conexão (Supabase/Postgres ou PGlite)
│   ├── auth.js       # Senhas (scrypt) e sessões por cookie
│   ├── payments.js   # Mercado Pago (PIX, Checkout, webhook) + modo demo
│   ├── billing.js    # Assinatura: pede checkout/portal/status à função do Stripe
│   ├── config.js     # Endereços públicos (site, função do Stripe)
│   ├── start.js      # Servidor local (npm start)
│   └── seed.js       # Dados de demonstração
├── edge/                     # Edge Function "api" do Supabase
├── netlify/functions/stripe.js  # Stripe (checkout, portal, status, webhook)
├── netlify.toml              # Rotas: /api → Supabase, webhook → Stripe
├── public/
│   ├── index.html    # Landing page + cadastro/login
│   ├── admin.*       # Painel do restaurante
│   ├── menu.*        # Cardápio público + carrinho + checkout
│   ├── order.*       # Pagamento PIX e acompanhamento do pedido
│   └── common.js, styles.css
└── test/api.test.js
```

## Próximos passos sugeridos
- Upload de imagens (hoje as fotos são por URL)
- Recuperação de senha por e-mail
- Horário de funcionamento automático (abrir e fechar sozinho)
