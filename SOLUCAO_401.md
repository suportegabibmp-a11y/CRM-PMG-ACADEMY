# 🚨 Solução para Erro 401 - Webhook Cakto

## Problema
```
30 Apr 26 19:30:44
401
POST
96ms
https://xmvebvicyqneswedgwna.supabase.co/functions/v1/bright-service
```

## Causa
A Supabase Function está exigindo autenticação, mas o webhook do Cakto não pode fornecer credenciais.

## 🎯 Soluções Rápidas

### Solução 1: Configurar Function como Pública (Recomendado)

1. **Acesse o Dashboard Supabase:** https://supabase.com/dashboard/project/xmvebvicyqneswedgwna/functions
2. **Clique na function `bright-service`**
3. **Vá para Settings/Configuration**
4. **Desative "Require Authentication"** ou configure como pública
5. **Salve as configurações**

### Solução 2: Atualizar Código da Function

Use o código do arquivo `index_public.ts` que já tem:
- CORS headers configurados
- Tratamento para requisições OPTIONS (preflight)
- Acesso público permitido

### Solução 3: Criar Nova Function Pública

1. **No Dashboard:** Create Function
2. **Nome:** `cakto-webhook-public`
3. **Cole o código:** `index_public.ts`
4. **Configure como pública**
5. **Nova URL:** `https://xmvebvicyqneswedgwna.supabase.co/functions/v1/cakto-webhook-public`

## 🔧 Configuração de Variáveis de Ambiente

Na function, configure:
```
SUPABASE_URL = https://xmvebvicyqneswedgwna.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdmVidmljeXFuZXN3ZWRnd25hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzU2NTk5NCwiZXhwIjoyMDkzMTQxOTk0fQ.Z1ath3lCQI4_VIQgabbFbPjI3xKLhvwWSKUC1boOCK4
```

## 🧪 Testar Após Configuração

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

## 📋 Expected Response (Sucesso)
```json
{
  "success": true,
  "message": "Webhook processado com sucesso",
  "event": "purchase_approved"
}
```

## 🚨 Se Continuar com Erro 401

1. **Verifique se a tabela `subscriptions` existe** no Supabase
2. **Execute o SQL** do arquivo `SQL_SUBSCRIPTIONS_SUPABASE.sql`
3. **Verifique as permissões RLS** na tabela
4. **Confirme as variáveis de ambiente** estão configuradas

## 📊 Checklist Final

- [ ] Configurar function como pública
- [ ] Adicionar variáveis de ambiente
- [ ] Testar com curl
- [ ] Verificar logs no dashboard
- [ ] Atualizar webhook no Cakto (se mudou URL)
- [ ] Testar integração completa

## 🎯 URLs Importantes

- **Dashboard Functions:** https://supabase.com/dashboard/project/xmvebvicyqneswedgwna/functions
- **Function URL:** https://xmvebvicyqneswedgwna.supabase.co/functions/v1/bright-service
- **Logs:** https://supabase.com/dashboard/project/xmvebvicyqneswedgwna/logs

## ⚡ Comando Rápido

Se preferir usar o código atualizado:
```bash
# Copie o conteúdo de index_public.ts
# Cole no dashboard da function bright-service
# Salve e teste
```

A Solução 1 é a mais rápida e recomendada!
