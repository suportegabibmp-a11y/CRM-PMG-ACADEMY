# Deploy Manual da Supabase Function - Cakto Webhook

## 🚀 Passos para Deploy Manual

### 1. Obter Token de Acesso do Supabase

1. Acesse seu dashboard Supabase: https://supabase.com/dashboard
2. Vá para **Settings > API**
3. Copie a **Service Role Key** ou crie um novo token
4. O token começa com: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 2. Fazer Login no CLI

#### Método 1: Com Token
```bash
npx supabase login --token "SEU_TOKEN_AQUI"
```

#### Método 2: Variável de Ambiente
```bash
# Windows PowerShell
$env:SUPABASE_ACCESS_TOKEN = "SEU_TOKEN_AQUI"
npx supabase login

# Windows CMD
set SUPABASE_ACCESS_TOKEN=SEU_TOKEN_AQUI
npx supabase login
```

### 3. Linkar com Projeto

```bash
npx supabase link --project-ref xmvebvicyqneswedgwna
```

### 4. Configurar Variáveis de Ambiente

```bash
npx supabase secrets set SUPABASE_URL=https://xmvebvicyqneswedgwna.supabase.co
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=SEU_SERVICE_ROLE_KEY
```

### 5. Deploy da Function

```bash
npx supabase functions deploy cakto-webhook
```

### 6. Verificar Deploy

```bash
npx supabase functions list
npx supabase functions logs cakto-webhook
```

## 🔧 Configuração do Webhook no Cakto

### URL do Webhook:
```
https://xmvebvicyqneswedgwna.supabase.co/functions/v1/cakto-webhook
```

### Eventos para Configurar:
- `purchase_approved`
- `purchase_cancelled`
- `subscription_created`
- `subscription_cancelled`

## 🧪 Testar a Function

### Teste com curl:
```bash
curl -X POST https://xmvebvicyqneswedgwna.supabase.co/functions/v1/cakto-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "purchase_approved",
    "customer": {
      "id": "cus_test_123",
      "email": "test@example.com"
    },
    "purchase": {
      "id": "pur_test_123",
      "amount": 39.90,
      "currency": "BRL",
      "payment_method": "credit_card"
    }
  }'
```

## 📋 Checklist Final

- [ ] Obter token de acesso do Supabase
- [ ] Fazer login no CLI com o token
- [ ] Linkar com projeto xmvebvicyqneswedgwna
- [ ] Configurar variáveis de ambiente
- [ ] Fazer deploy da function cakto-webhook
- [ ] Verificar deploy com logs
- [ ] Configurar webhook no Cakto
- [ ] Testar integração completa

## 🚨 Solução de Problemas

### Erro: "Access token not provided"
**Solução**: Use `npx supabase login --token "SEU_TOKEN"`

### Erro: "Project not linked"
**Solução**: Use `npx supabase link --project-ref xmvebvicyqneswedgwna`

### Erro: "Function not found"
**Solução**: Verifique se a pasta `supabase/functions/cakto-webhook/` existe

### Erro: "Build failed"
**Solução**: Verifique sintaxe TypeScript em `index.ts`

## 📊 URLs Importantes

- **Dashboard Supabase**: https://supabase.com/dashboard/project/xmvebvicyqneswedgwna
- **Function URL**: https://xmvebvicyqneswedgwna.supabase.co/functions/v1/cakto-webhook
- **Página de Vendas**: http://localhost:3000/vendas
- **Link Cakto**: https://pay.cakto.com.br/re967su

## 🎯 Próximo Passo

Após o deploy bem-sucedido:
1. Configure o webhook no painel Cakto
2. Teste com uma compra real
3. Verifique os dados na tabela `subscriptions`
4. Monitore os logs da function

O sistema estará pronto para processar pagamentos automaticamente!
