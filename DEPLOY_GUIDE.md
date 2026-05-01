# Guia de Deploy da Supabase Function - Cakto Webhook

## 🚀 Passo a Passo para Deploy

### 1. Instalar Supabase CLI

#### Windows (Recomendado):
```bash
# Usar npm localmente
npm install supabase --save-dev

# Ou instalar globalmente via outro método
# Verificar: https://github.com/supabase/cli#install-the-cli
```

### 2. Fazer Login no Supabase

```bash
# Método 1: Login interativo
npx supabase login

# Método 2: Com token de acesso
npx supabase login --token <seu-access-token>

# Método 3: Usar variável de ambiente
set SUPABASE_ACCESS_TOKEN=<seu-access-token>
```

### 3. Conectar ao Projeto

```bash
# Linkar com seu projeto
npx supabase link --project-ref <seu-projeto-id>

# Exemplo:
npx supabase link --project-ref abcdefghijklmnopqrstuvwxyz
```

### 4. Configurar Variáveis de Ambiente

```bash
# Setar variáveis de ambiente
npx supabase secrets set SUPABASE_URL=https://<seu-projeto-id>.supabase.co
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<sua-service-role-key>

# Verificar variáveis configuradas
npx supabase secrets list
```

### 5. Deploy da Function

```bash
# Deploy da função cakto-webhook
npx supabase functions deploy cakto-webhook

# Deploy com logs detalhados
npx supabase functions deploy cakto-webhook --debug
```

### 6. Verificar Deploy

```bash
# Listar functions deployadas
npx supabase functions list

# Verificar logs da função
npx supabase functions logs cakto-webhook

# Logs em tempo real
npx supabase functions logs cakto-webhook --follow
```

## 🔧 Configuração do Webhook no Cakto

### URL do Webhook:
```
https://<seu-projeto-id>.supabase.co/functions/v1/cakto-webhook
```

### Eventos para Configurar:
- `purchase_approved`
- `purchase_cancelled`
- `subscription_created`
- `subscription_cancelled`

### Headers (se necessário):
```
Content-Type: application/json
```

## 🧪 Testar a Function

### Teste com curl:
```bash
curl -X POST https://<seu-projeto-id>.supabase.co/functions/v1/cakto-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "purchase_approved",
    "customer": {
      "id": "cus_test_123",
      "email": "test@example.com"
    },
    "purchase": {
      "id": "pur_test_123",
      "amount": 99.90,
      "currency": "BRL",
      "payment_method": "credit_card"
    }
  }'
```

### Teste de subscription:
```bash
curl -X POST https://<seu-projeto-id>.supabase.co/functions/v1/cakto-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "subscription_created",
    "customer": {
      "id": "cus_test_456",
      "email": "premium@example.com"
    },
    "subscription": {
      "id": "sub_test_789",
      "plan": "premium",
      "amount": 99.90,
      "currency": "BRL",
      "interval": "monthly"
    }
  }'
```

## 📋 Estrutura de Arquivos Necessária

Certifique-se que você tem esta estrutura:
```
CRM PMG/
├── supabase/
│   └── functions/
│       └── cakto-webhook/
│           ├── index.ts
│           └── deno.json
├── SQL_SUBSCRIPTIONS_SUPABASE.sql
├── CAKTO_WEBHOOK_SETUP.md
└── DEPLOY_GUIDE.md
```

## 🚨 Solução de Problemas Comuns

### Erro: "Access token not provided"
**Solução**: Faça login primeiro
```bash
npx supabase login
```

### Erro: "Project not linked"
**Solução**: Link com seu projeto
```bash
npx supabase link --project-ref <seu-projeto-id>
```

### Erro: "Function not found"
**Solução**: Verifique estrutura de arquivos
```bash
# Verificar se a pasta existe
dir supabase\functions\cakto-webhook
```

### Erro: "Permission denied"
**Solução**: Verifique permissões e chaves de API
```bash
# Verificar secrets
npx supabase secrets list
```

### Erro: "Build failed"
**Solução**: Verifique sintaxe TypeScript
```bash
# Testar localmente
npx supabase functions serve cakto-webhook
```

## 📊 Verificar Funcionamento

### 1. No Dashboard Supabase:
- Vá para Edge Functions
- Confirme que `cakto-webhook` aparece na lista
- Verifique logs de execução

### 2. No SQL Editor:
```sql
-- Verificar se tabela foi criada
SELECT * FROM subscriptions LIMIT 5;

-- Verificar subscriptions ativas
SELECT * FROM active_subscriptions;
```

### 3. Teste Manual:
- Execute os comandos curl acima
- Verifique resposta: `{"success": true, "message": "Webhook processado com sucesso"}`
- Confirme dados na tabela subscriptions

## 🔄 Fluxo Completo de Teste

1. **Setup inicial** (SQL + Function deploy)
2. **Teste com curl** (simular webhook Cakto)
3. **Verificar dados** (tabela subscriptions)
4. **Configurar Cakto** (URL real do webhook)
5. **Teste produção** (pagamento real no Cakto)

## 📞 Suporte e Debug

### Logs Detalhados:
```bash
# Logs com debug
npx supabase functions logs cakto-webhook --debug

# Logs em tempo real
npx supabase functions logs cakto-webhook --follow --debug
```

### Verificar Status:
```bash
# Status da function
npx supabase functions status cakto-webhook

# Listar todas
npx supabase functions list
```

### Teste Local:
```bash
# Servir localmente para testes
npx supabase functions serve cakto-webhook
# Acesse: http://localhost:54321/functions/v1/cakto-webhook
```

## ✅ Checklist Final

- [ ] Supabase CLI instalado
- [ ] Login realizado
- [ ] Projeto linkado
- [ ] Variáveis de ambiente configuradas
- [ ] Tabela subscriptions criada (SQL)
- [ ] Function deployada
- [ ] Webhook configurado no Cakto
- [ ] Testes realizados com curl
- [ ] Logs verificados
- [ ] Produção testada

## 🎯 Próximo Passo

Após concluir o deploy, configure o webhook no painel do Cakto com a URL:
```
https://<seu-projeto-id>.supabase.co/functions/v1/cakto-webhook
```

E configure os eventos mencionados acima.
