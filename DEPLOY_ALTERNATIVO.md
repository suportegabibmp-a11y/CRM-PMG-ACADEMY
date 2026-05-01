# Deploy Alternativo da Supabase Function

## 🚨 Problema: Formato do Token

O Supabase CLI espera um token de acesso no formato `sbp_0102...1920`, mas você forneceu um Service Role Key.

## 🎯 Soluções Alternativas

### Solução 1: Obter Token de Acesso Correto

1. **Acesse o Dashboard Supabase:** https://supabase.com/dashboard/project/xmvebvicyqneswedgwna
2. **Vá para Account Settings:** https://supabase.com/account/tokens
3. **Crie um novo Access Token:**
   - Clique em "New Token"
   - Dê um nome (ex: "CRM PMG CLI")
   - Copie o token gerado (formato: `sbp_0102...1920`)

4. **Use o token correto:**
```bash
npx supabase login --token "sbp_0102...1920"
```

### Solução 2: Deploy via Dashboard Supabase

1. **Acesse o Dashboard:** https://supabase.com/dashboard/project/xmvebvicyqneswedgwna
2. **Vá para Edge Functions:** https://supabase.com/dashboard/project/xmvebvicyqneswedgwna/functions
3. **Crie a Function Manualmente:**
   - Clique em "Create Function"
   - Nome: `cakto-webhook`
   - Cole o código do arquivo `supabase/functions/cakto-webhook/index.ts`
   - Configure as variáveis de ambiente:
     - `SUPABASE_URL`: `https://xmvebvicyqneswedgwna.supabase.co`
     - `SUPABASE_SERVICE_ROLE_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdmVidmljeXFuZXN3ZWRnd25hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzU2NTk5NCwiZXhwIjoyMDkzMTQxOTk0fQ.Z1ath3lCQI4_VIQgabbFbPjI3xKLhvwWSKUC1boOCK4`

### Solução 3: Upload Manual via API

Se precisar de uma solução programática:

```bash
# Instalar Supabase JS client
npm install @supabase/supabase-js

# Script de deploy
node deploy-function.js
```

## 📋 Código para Deploy Manual

### Arquivo: deploy-function.js
```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xmvebvicyqneswedgwna.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdmVidmljeXFuZXN3ZWRnd25hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzU2NTk5NCwiZXhwIjoyMDkzMTQxOTk0fQ.Z1ath3lCQI4_VIQgabbFbPjI3xKLhvwWSKUC1boOCK4'
);

async function deployFunction() {
  try {
    // Ler o código da função
    const fs = require('fs');
    const functionCode = fs.readFileSync('./supabase/functions/cakto-webhook/index.ts', 'utf8');
    
    // Deploy via API (se disponível)
    console.log('Deploy da função cakto-webhook...');
    console.log('Código:', functionCode.substring(0, 100) + '...');
    
    // Nota: Esta é uma abordagem conceitual
    // O deploy real precisa ser feito via dashboard ou CLI
    
  } catch (error) {
    console.error('Erro no deploy:', error);
  }
}

deployFunction();
```

## 🎯 Recomendação

**Use a Solução 1 (Dashboard):** É a mais confiável e não depende de tokens CLI.

### Passos Rápidos:

1. **Acesse:** https://supabase.com/dashboard/project/xmvebvicyqneswedgwna/functions
2. **Clique:** "Create Function"
3. **Nome:** `cakto-webhook`
4. **Cole:** O código do arquivo `index.ts`
5. **Configure:** Variáveis de ambiente
6. **Deploy:** Clique em "Deploy"

## 📊 URLs Importantes

- **Dashboard:** https://supabase.com/dashboard/project/xmvebvicyqneswedgwna
- **Functions:** https://supabase.com/dashboard/project/xmvebvicyqneswedgwna/functions
- **Tokens:** https://supabase.com/account/tokens
- **Function URL:** https://xmvebvicyqneswedgwna.supabase.co/functions/v1/bright-service

## 🧪 Testar Após Deploy

```bash
curl -X POST https://xmvebvicyqneswedgwna.supabase.co/functions/v1/bright-service \
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

## 📋 Checklist

- [ ] Acessar dashboard Supabase
- [ ] Ir para Edge Functions
- [ ] Criar function `cakto-webhook`
- [ ] Colar código do `index.ts`
- [ ] Configurar variáveis de ambiente
- [ ] Fazer deploy
- [ ] Testar com curl
- [ ] Configurar webhook no Cakto

## 🚀 Após Deploy

1. **Configure o Webhook no Cakto:**
   - URL: `https://xmvebvicyqneswedgwna.supabase.co/functions/v1/bright-service`
   - Eventos: `purchase_approved`, `purchase_cancelled`, `subscription_created`, `subscription_cancelled`

2. **Teste a Página de Vendas:**
   - Acesse: http://localhost:3000/vendas
   - Link Cakto: https://pay.cakto.com.br/re967su

O sistema estará pronto para processar pagamentos automaticamente!
