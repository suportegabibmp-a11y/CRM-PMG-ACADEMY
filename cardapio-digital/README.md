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

## Deploy na Netlify + Supabase

As páginas são servidas como arquivos estáticos, a API roda como Netlify Function (`netlify/functions/api.js`) e o banco é o Postgres do Supabase. As tabelas são criadas sozinhas no primeiro acesso, no schema `cardapio`, sem mexer em outras tabelas do projeto.

**1. Supabase**
- Crie um projeto em https://supabase.com (ou use um existente)
- Clique em **Connect** → **Transaction pooler** e copie a URI (porta **6543**), trocando `[YOUR-PASSWORD]` pela senha do banco:
  `postgresql://postgres.xxxx:SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`

**2. Netlify** → *Site configuration*
- **Build & deploy → Build settings**:
  - Base directory: `cardapio-digital`
  - Build command: `npm install` (já vem do `netlify.toml`)
  - Publish directory: `cardapio-digital/public` (já vem do `netlify.toml`)
  - Branch: a branch onde está este código
- **Environment variables**:
  - `DATABASE_URL` = a URI do passo 1 (obrigatório)
  - `SUPERADMIN_EMAILS` = seu e-mail, para ver a aba "Clientes do SaaS"
  - `ALLOW_DEMO_PAYMENTS` = `true` só se quiser testar o PIX/cartão simulado sem Mercado Pago
- Faça um novo deploy (**Deploys → Trigger deploy → Clear cache and deploy site**)

**3. (Opcional) Loja de demonstração no Supabase**: rode `DATABASE_URL="..." npm run seed` no seu computador.

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Conexão Postgres (Supabase, pooler porta 6543). Sem ela, usa o PGlite local |
| `DATABASE_PASSWORD` | (Opcional) Senha do banco separada. Com ela, a `DATABASE_URL` pode ficar exatamente como o Supabase mostra, com `[YOUR-PASSWORD]` |
| `PUBLIC_URL` | URL pública do site. Na Netlify é detectada sozinha; defina se usar domínio próprio |
| `SUPERADMIN_EMAILS` | E-mails (separados por vírgula) com acesso à aba de clientes do SaaS |
| `MP_WEBHOOK_SECRET` | (Opcional) Assinatura secreta dos webhooks do Mercado Pago, para validar o `x-signature` |
| `ALLOW_DEMO_PAYMENTS` | `true` libera o pagamento simulado em produção (só para testes) |
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe (`sk_live_…` ou `sk_test_…`) |
| `STRIPE_WEBHOOK_SECRET` | Segredo do webhook do Stripe (`whsec_…`) |
| `STRIPE_PRICE_ID` | ID do preço mensal da assinatura (`price_…`) |
| `APP_TIMEZONE` | Fuso dos relatórios (padrão `America/Sao_Paulo`) |
| `PORT`, `DB_PATH` | Só para rodar localmente |

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
5. Coloque as 3 variáveis (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`) na Netlify e faça um novo deploy

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
│   ├── billing.js    # Assinatura do SaaS no Stripe (checkout, portal, webhook)
│   └── seed.js       # Dados de demonstração
├── netlify/functions/api.js  # API como Netlify Function
├── netlify.toml              # Build, função e rotas na Netlify
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
