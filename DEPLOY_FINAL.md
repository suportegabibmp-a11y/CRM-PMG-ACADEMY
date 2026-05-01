# 🚀 Deploy Final da Webhook Function

## Problema
O comando `npx supabase functions deploy bright-service --no-verify-jwt` falha por causa do formato do token.

## ✅ Solução: Deploy via Dashboard (Recomendado)

### Passo 1: Acessar o Dashboard
1. **URL:** https://supabase.com/dashboard/project/xmvebvicyqneswedgwna/functions
2. **Login** com sua conta Supabase

### Passo 2: Editar a Function `bright-service`
1. **Clique** na function `bright-service`
2. **Clique** em "Edit" ou "Settings"
3. **Cole o código** do arquivo `index_public.ts`
4. **Configure variáveis de ambiente:**
   ```
   SUPABASE_URL = https://xmvebvicyqneswedgwna.supabase.co
   SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdmVidmljeXFuZXN3ZWRnd25hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzU2NTk5NCwiZXhwIjoyMDkzMTQxOTk0fQ.Z1ath3lCQI4_VIQgabbFbPjI3xKLhvwWSKUC1boOCK4
   ```

### Passo 3: Configurar como Pública
1. **Vá para Settings** da function
2. **Desative** "Require Authentication" ou "JWT Verification"
3. **Ative** "Allow public access" (se disponível)
4. **Salve** as configurações

### Passo 4: Deploy
1. **Clique** em "Deploy" ou "Save"
2. **Aguarde** o deploy finalizar
3. **Verifique** se aparece como "Active"

## 🧪 Testar a Function

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

## 📊 Expected Response
```json
{
  "success": true,
  "message": "Webhook processado com sucesso",
  "event": "purchase_approved"
}
```

## 🔧 Configurar Webhook no Cakto

### URL do Webhook:
```
https://xmvebvicyqneswedgwna.supabase.co/functions/v1/bright-service
```

### Eventos:
- `purchase_approved`
- `purchase_cancelled`
- `subscription_created`
- `subscription_cancelled`

### Headers:
```
Content-Type: application/json
```

## 📋 Checklist Final

- [ ] Acessar dashboard Supabase
- [ ] Editar function `bright-service`
- [ ] Colar código do `index_public.ts`
- [ ] Configurar variáveis de ambiente
- [ ] Desativar autenticação
- [ ] Fazer deploy
- [ ] Testar com curl
- [ ] Configurar webhook no Cakto
- [ ] Testar integração completa

## 🚀 Sistema Completo Após Deploy

- ✅ **CRM PMG:** http://localhost:3000
- ✅ **Página de Vendas:** http://localhost:3000/vendas
- ✅ **Link Cakto:** https://pay.cakto.com.br/re967su
- ✅ **Webhook URL:** https://xmvebvicyqneswedgwna.supabase.co/functions/v1/bright-service

## 🎯 Próximo Passo

1. **Faça o deploy via dashboard** usando o guia acima
2. **Teste com curl** para confirmar funcionamento
3. **Configure o webhook** no painel Cakto
4. **Teste a integração** completa

O sistema estará 100% funcional após essas configurações!
