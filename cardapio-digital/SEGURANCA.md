# Relatório de auditoria de segurança — Cardápio Digital

Seguindo o "Protocolo Operacional de Auditoria e Hardening de Segurança com IA" (PMG) e o "Guia de Vulnerabilidades Web & Defesas para SaaS".

## A. Resumo executivo

| Item | Valor |
|---|---|
| Projeto | Cardápio Digital (SaaS multi-loja) |
| Data | 24/09/2026 |
| Escopo acessado | Repositório (branch `claude/beautiful-maxwell-am20zw`), banco Supabase "PROJETO AULA PMG", Edge Function `api`, site `cardapiodigitalpmg.netlify.app` (só testes não destrutivos) |
| Resultado | P0: 2 · P1: 2 · P2: 7 · P3: 3 (+ riscos residuais registrados) |
| Status de publicação | **APTO COM RISCOS**: P0/P1 do sistema corrigidos e retestados em produção. Resta a **rotação das chaves antigas do CRM** (SEC-03), que depende do dono da conta. |

**Principais riscos encontrados:** pagamento simulado ligado em produção (pedidos "pagos" sem pagamento), chaves `service_role` e senha real no repositório público, proteção contra força bruta que não valia entre instâncias, conta de demonstração pública com permissão de escrita.

**Principais correções:** pagamento simulado desligado no servidor, limite de tentativas persistente no banco, conta demo só leitura, CSP e cabeçalhos de segurança, tokens e segredos guardados como hash ou cifrados, validação de URLs e de uploads, trilha de auditoria.

**Limitações:** não há acesso à Netlify, ao Stripe nem ao projeto Supabase antigo do CRM (`xmvebvicyqneswedgwna`). Não foi feito pentest externo nem teste de carga.

## B. Escopo e acessos realmente utilizados

- **Código:** leitura e escrita no repositório (cardápio e, só para remover segredos, arquivos do CRM).
- **Banco (Supabase `emowbrpmoofomhzcqpbz`):** SQL somente leitura para inventário. Escritas limitadas a marcar a conta demo como somente leitura e limpar dados de teste.
- **Produção:** requisições não destrutivas ao site, feitas a partir do próprio banco (`pg_net`), com conta de teste criada e removida em seguida.
- **Sem acesso:** painel da Netlify, painel do Stripe, projeto Supabase `xmvebvicyqneswedgwna`, contas GitHub/Netlify/Supabase (MFA, membros).

## C. Arquitetura e superfícies

```
navegador ─► Netlify (páginas estáticas + CSP/headers)
              ├─ /api/webhooks/stripe ─► função Netlify "stripe" (chaves do Stripe)
              └─ /api/* ─► Edge Function "api" no Supabase ─► Postgres (schema cardapio)
                              └─ operações de assinatura ─► função "stripe" (código de uso único + confirmação de volta)
```

| Superfície | Autenticação | Autorização |
|---|---|---|
| `/api/public/*` (cardápio, pedidos, rastreio) | nenhuma | pedido identificado por UUID aleatório; preços recalculados no servidor |
| `/api/auth/*` | e-mail + senha → token Bearer | sessão com hash no banco |
| `/api/admin/*` | token Bearer | todas as consultas filtram por `restaurant_id` da sessão; conta demo só leitura |
| `/api/superadmin/*` | token Bearer | e-mail em `cardapio.settings`/`SUPERADMIN_EMAILS` (servidor) |
| `/api/internal/stripe-*` | código de uso único (256 bits, 2 min) | confirmado pelo servidor |
| `/api/webhooks/mercadopago` | assinatura opcional | pagamento sempre consultado na API do Mercado Pago |
| `/api/webhooks/stripe` (Netlify) | assinatura Stripe verificada no corpo bruto | estado sempre consultado no Stripe |
| Banco `cardapio.*` | não exposto na Data API | RLS ligado em todas as tabelas, sem grants para `anon`/`authenticated` |

**Segredos e onde ficam** (nenhum valor exibido aqui):
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` e `STRIPE_PRICE_ID` ficam nas variáveis da Netlify.
- A conexão com o banco (`SUPABASE_DB_URL`) e a `SUPABASE_SERVICE_ROLE_KEY` são injetadas pelo Supabase na Edge Function.
- O token do Mercado Pago de cada loja fica no banco, cifrado.
- Nenhum desses segredos vai para o navegador nem para o repositório.

## D. Registro de achados

| ID | Sev. | Status | Categoria | Evidência | Impacto | Correção | Reteste |
|---|---|---|---|---|---|---|---|
| SEC-01 | P0 | Corrigido | Pagamento / lógica de negócio | `server/payments.js` `demoPaymentsAllowed()` retornava `true` quando `NODE_ENV` não era `production`, e na Edge Function ele não é definido. Produção respondia `"demo": true` em `/api/public/r/burger-house`. | Qualquer cliente clicava em "Simular pagamento aprovado" e o pedido aparecia **pago** no painel, sem pagamento. | Simulado só com `ALLOW_DEMO_PAYMENTS=true` ou fora do servidor publicado. | Teste `security-edge.test.js` falha com a regra antiga e passa com a nova. Produção agora responde `"demo": false`. Havia 0 pedidos simulados no banco. |
| SEC-02 | P1 | Corrigido | Autenticação / abuso | Limite de tentativas em memória: cada instância da Edge Function tinha o seu, e o IP vinha de `X-Forwarded-For`, que o cliente pode forjar. | Força bruta de senha e cadastro/pedidos em massa. | `rate_limits` no banco. Login: 5 erros por e-mail e 30 por IP a cada 15 min. Também cadastro, pedidos, uploads, pedido de senha e rotas internas. IP pelo cabeçalho da Netlify. | Testes SEC-02. No Deno, o 6º login errado recebe 429. |
| SEC-03 | P0 | **Pendente (rotação)** | Segredos | Repositório **público** continha 2 chaves `service_role` (projeto `xmvebvicyqneswedgwna`) em arquivos `.md`, `server/.env` versionado (com `service_role` e `JWT_SECRET`) e uma senha real em 3 scripts de `server/src`. | Quem tem `service_role` ignora RLS e lê/altera todo o banco daquele projeto. A senha pode dar acesso a contas onde for reutilizada. | Valores removidos dos arquivos, scripts passam a ler variáveis de ambiente, `.env` fora do git. | Busca no repositório: nenhuma `service_role` restante, nenhuma senha literal. **Os valores continuam no histórico do git**: é preciso revogar (ver seção G). |
| SEC-04 | P1 | Corrigido | Controle de acesso | Login da loja de demonstração publicado no README, com permissão de alterar tudo. | Qualquer pessoa desfigurava a loja de exemplo ou enchia o banco de fotos. | Conta com `read_only`: vê o painel, não altera nada (403). | Teste SEC-04. Em produção, criar categoria com a conta demo retornou 403 e nada foi gravado. |
| SEC-05 | P2 | Corrigido | XSS / injeção | Links de logo, capa e foto eram aceitos sem validação e usados em `style="background-image:url('…')"`. | Injeção de CSS e links `javascript:`/`http:` no cardápio público. | Servidor aceita só `https://` sem caracteres perigosos ou fotos enviadas (`/api/img/<uuid>`). | Teste SEC-05 com 4 cargas maliciosas. |
| SEC-06 | P2 | Corrigido | Upload | O tipo da imagem vinha do que o navegador declarava, sem limite de quantidade por loja. | HTML/SVG disfarçado de imagem e abuso de armazenamento. | Tipo conferido pelos bytes (JPEG/PNG/WebP), 500 fotos por loja, 60 uploads/h. Imagem servida com `CSP: sandbox` e `nosniff`. | Teste SEC-06 (HTML com tipo PNG recusado). |
| SEC-07 | P2 | Corrigido | Dados sensíveis | Token do Mercado Pago em texto puro na tabela `restaurants`. | Um vazamento do banco daria acesso às contas Mercado Pago das lojas. | AES-256-GCM, chave derivada de segredo do servidor, formato do token conferido. | Teste SEC-07 (no banco fica `enc:v1:…`). Conferido no Deno. |
| SEC-08 | P2 | Corrigido | Logs | Não havia registro de logins, falhas nem ações de administrador. | Não dava para investigar um incidente. | Tabela `audit_log`: cadastro, login ok/falho/bloqueado, troca e redefinição de senha, token MP, plano, acesso admin negado. Sem senhas nem tokens. | Teste SEC-08. |
| SEC-09 | P2 | Corrigido | Sessão | Tokens de sessão e códigos do Stripe guardados em texto puro. Cookie de sessão também aceito (superfície de CSRF). | Um vazamento do banco daria sessões válidas. | Só o hash SHA-256 no banco. Login apenas por `Authorization: Bearer` (sem cookie, sem CSRF). | Teste SEC-09. |
| SEC-10 | P2 | Corrigido | Configuração | Páginas sem CSP, `X-Frame-Options`, `nosniff` e `Referrer-Policy`. API expunha `X-Powered-By: Express`. `/api/health` mostrava usuário e host do banco nos erros. | Clickjacking, maior impacto de XSS, vazamento de informações internas. | CSP `script-src 'self'` (script da página inicial movido para `index.js`) e demais cabeçalhos no `netlify.toml`. API com `nosniff`/`no-store`/`DENY`. Health só com `ok` e `versao`. Erros 500 com código de rastreio. | Teste SEC-10 e fluxo completo no navegador com a CSP de produção: 0 violações. Em produção, a API já responde com os cabeçalhos novos. |
| SEC-11 | P3 | Corrigido | Validação | Valores em centavos sem teto. | Estouro de inteiro no banco virava erro 500. | Teto de R$ 100 mil por valor, até 30 adicionais por item, teto do total do pedido. | Teste SEC-11. |
| SEC-12 | P2 | Corrigido | Criptografia de senhas | scrypt N=2^14, p=1, abaixo do mínimo do OWASP. Tempo de resposta diferente para e-mail inexistente. Senha sem tamanho máximo. | Força bruta offline mais barata, descoberta de e-mails cadastrados, custo de CPU abusivo. | scrypt N=2^14, r=8, p=5 (equivalente ao mínimo OWASP, ~0,25 s no Deno). Hash antigo atualizado no login. Verificação falsa para e-mail inexistente. Senha de 8 a 128 caracteres. | Teste SEC-12. Login no Deno em 229 ms. |
| SEC-13 | P3 | Corrigido | Superfície | Extensão `pg_net` ativa (usada só para os testes desta auditoria). | Superfície desnecessária no banco. | Removida ao final da auditoria. | Advisor de segurança do Supabase sem o aviso. |
| SEC-14 | P3 | Risco aceito | Enumeração | O cadastro informa "e-mail já cadastrado". | Descobrir quem tem conta. | Mantido por usabilidade. Mitigado pelo limite de 10 cadastros/h por IP. Login e pedido de senha não revelam. | — |

## E. Arquivos alterados

| Arquivo | Motivo |
|---|---|
| `server/security.js` (novo) | Limite de tentativas no banco, IP do cliente, AES-256-GCM, hash de tokens, validação de URL e de imagem, auditoria |
| `server/auth.js` | scrypt reforçado com atualização automática, sessões com hash, só Bearer, verificação falsa, conta somente leitura |
| `server/index.js` | Cabeçalhos, health enxuto, uploads seguros, login com bloqueio, validações, auditoria, erros com código |
| `server/payments.js` | SEC-01 (pagamento simulado) e token MP cifrado |
| `server/billing.js` | Códigos do Stripe guardados como hash |
| `server/db.js` | Tabelas `rate_limits` e `audit_log`, coluna `users.read_only` (migração só aditiva, RLS ligado) |
| `server/seed.js` | Conta demo criada como somente leitura |
| `netlify.toml` | CSP e cabeçalhos de segurança |
| `netlify/functions/stripe.js` | Cabeçalhos `no-store`/`nosniff`, cache do preço |
| `public/index.html`, `public/index.js` | Script inline movido para arquivo (exigência da CSP) |
| `public/admin.js` | Aviso de conta de demonstração |
| `test/security*.test.js` (novos) | 12 testes de segurança |
| CRM: `*.md`, `server/src/*.js`, `.gitignore`, `server/.env` | Remoção de segredos (SEC-03) |

**Banco de produção:** novas tabelas criadas pela própria aplicação, conta demo marcada `read_only`, extensão `pg_net` removida.

## F. Testes executados

- **Suíte automatizada:** 26/26 passando em PGlite e 26/26 em PostgreSQL 16 real, com o pool de produção.
- **Deno:** servidor rodando no Deno (mesmo runtime do Supabase) com Postgres real. Conferidos: pagamento simulado desligado, token MP cifrado, hash novo, bloqueio no 6º login e registros de auditoria.
- **Navegador:** fluxo completo com a CSP de produção (cadastro, upload de foto, todas as telas do painel, cardápio, pedido PIX, esqueci minha senha), sem nenhuma violação nem erro.
- **Dependências:** `npm audit` sem vulnerabilidades (produção e desenvolvimento).
- **Produção:** health (versão nova), `"demo": false` no cardápio, cabeçalhos da API, demo bloqueada para escrita (403), RLS e grants das tabelas novas.
- **Prova de correção:** o teste de SEC-01 falha com a regra antiga e passa com a nova.

## G. Riscos residuais, pendências e itens não verificados

**Pendências que dependem do dono:**
1. **SEC-03 (P0): rotacionar os segredos antigos do CRM.** O repositório é público e o histórico do git ainda contém:
   - duas chaves `service_role` do projeto Supabase `xmvebvicyqneswedgwna`;
   - uma senha real.

   Se esse projeto ainda existir, gere novas chaves em *Project Settings → API → JWT Settings* e troque a senha em todos os lugares onde ela é usada. Para apagar do histórico também, é preciso reescrever o histórico (ex.: `git filter-repo`) ou tornar o repositório privado. Mesmo assim, a rotação é o que resolve.
2. **MFA (P2):** ative a verificação em duas etapas no GitHub, na Netlify, no Supabase e no Stripe. O painel de superadmin deste sistema ainda não tem MFA próprio.
3. **Stripe:** confirme que o webhook usa o evento `checkout.session.completed` e que as chaves de teste e de produção estão separadas.

**Riscos residuais conhecidos:**
- A Edge Function também responde direto pelo endereço do Supabase, sem passar pela Netlify. Por esse caminho, o cabeçalho de IP pode ser forjado, o que enfraquece os limites por IP. Os limites por e-mail e por conta continuam valendo.
- O cadastro não verifica e-mail, porque não há serviço de envio. Uma assinatura paga pelo link **sem login** é associada pelo e-mail, então uma conta criada com o e-mail de outra pessoa poderia receber essa ativação. Pelo botão logado, a loja vai identificada no link e isso não acontece.
- O token de login fica no `localStorage`. Um XSS conseguiria lê-lo, mas isso fica mitigado pela CSP `script-src 'self'` e pelo escape em todas as telas.
- Os pedidos guardam nome, telefone e endereço dos clientes sem prazo de exclusão. Defina uma política de retenção (LGPD).

**Não verificado:** backups e restauração do Supabase (depende do plano), configurações e membros da Netlify e do Stripe, alertas automáticos, projeto Supabase `xmvebvicyqneswedgwna`, o restante do CRM (fora do escopo, exceto a remoção de segredos).

## H. Publicação e rollback

- **Publicado:** Edge Function `api` fixada no commit da auditoria. A Netlify publica sozinha a partir da branch.
- **Rollback do servidor:** publique a Edge Function apontando para o commit anterior (`150ed6c356187adf9941d12756ce1f2707463f58`) e reverta os commits da auditoria no git. A migração do banco é só aditiva (tabelas e coluna novas), então não precisa ser desfeita.
- **Efeitos esperados:**
  - Todos precisam entrar de novo uma vez, porque as sessões antigas foram invalidadas com a troca para hash.
  - Os hashes de senha são atualizados sozinhos no próximo login.
  - Se a `SUPABASE_SERVICE_ROLE_KEY` for trocada, os tokens do Mercado Pago precisam ser cadastrados de novo. Para evitar isso, defina uma `DATA_ENCRYPTION_KEY` própria.
- **Próxima revisão:** repetir esta auditoria a cada mudança grande, e pelo menos uma vez por ano, com pentest independente.

> Esta auditoria reduz o risco dentro do escopo observado. Ela não garante a ausência de vulnerabilidades.
