# Setup do Webhook Cakto para CRM PMG

## 📋 Overview

Este guia configura a integração entre o CRM PMG e o Cakto através de uma Supabase Function que processa webhooks de pagamento.

## 🚀 Passos para Configuração

### 1. Preparar o Ambiente Supabase

```bash
# Instalar Supabase CLI
npm install -g supabase

# Fazer login no Supabase
supabase login

# Linkar com seu projeto
supabase link --project-ref seu-projeto-id
```

### 2. Criar a Tabela de Subscriptions

Execute o SQL do arquivo `SQL_SUBSCRIPTIONS_SUPABASE.sql` no seu projeto Supabase:

1. Acesse o Dashboard Supabase
2. Vá para SQL Editor
3. Cole e execute o conteúdo do arquivo `SQL_SUBSCRIPTIONS_SUPABASE.sql`

### 3. Deploy da Supabase Function

```bash
# Deploy da função
supabase functions deploy cakto-webhook

# Setar variáveis de ambiente
supabase secrets set SUPABASE_URL=sua-url-supabase
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

### 4. Configurar o Webhook no Cakto

1. Acesse seu painel do Cakto
2. Vá para Configurações > Webhooks
3. Adicione a URL: `https://seu-projeto-id.supabase.co/functions/v1/cakto-webhook`
4. Configure os eventos:
   - `purchase_approved`
   - `purchase_cancelled`
   - `subscription_created`
   - `subscription_cancelled`

### 5. Testar a Integração

Use curl para testar o webhook:

```bash
curl -X POST https://seu-projeto-id.supabase.co/functions/v1/cakto-webhook \
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

## 📁 Estrutura de Arquivos

```
supabase/
└── functions/
    └── cakto-webhook/
        ├── index.ts          # Código principal da função
        └── deno.json         # Configuração de dependências
```

## 🔧 Configuração de Variáveis de Ambiente

A função requer as seguintes variáveis de ambiente:

```bash
SUPABASE_URL=https://seu-projeto-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

## 📊 Eventos Suportados

### purchase_approved
- **Descrição**: Disparado quando um pagamento é aprovado
- **Ação**: Cria/atualiza subscription como "active"

### purchase_cancelled
- **Descrição**: Disparado quando um pagamento é cancelado
- **Ação**: Atualiza subscription como "cancelled"

### subscription_created
- **Descrição**: Disparado quando uma assinatura é criada
- **Ação**: Cria nova subscription recorrente

### subscription_cancelled
- **Descrição**: Disparado quando uma assinatura é cancelada
- **Ação**: Cancela subscription existente

## 🗄️ Schema da Tabela subscriptions

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | BIGINT | ID auto-incremento |
| email | VARCHAR(255) | Email do cliente |
| customer_id | VARCHAR(255) | ID no Cakto |
| plan | VARCHAR(50) | Plano (premium, enterprise) |
| status | VARCHAR(20) | Status (active, cancelled) |
| subscription_id | VARCHAR(255) | ID da assinatura |
| purchase_id | VARCHAR(255) | ID da compra |
| amount | DECIMAL(10,2) | Valor |
| currency | VARCHAR(3) | Moeda |
| payment_method | VARCHAR(50) | Método pagamento |
| interval | VARCHAR(20) | Intervalo (monthly, yearly) |
| created_at | TIMESTAMP | Data criação |
| updated_at | TIMESTAMP | Última atualização |
| cancelled_at | TIMESTAMP | Data cancelamento |
| expires_at | TIMESTAMP | Data expiração |

## 🔍 Monitoramento e Logs

A função inclui logging detalhado. Para verificar logs:

```bash
# Verificar logs da função
supabase functions logs cakto-webhook

# Logs em tempo real
supabase functions logs cakto-webhook --follow
```

## 🛡️ Segurança

- A função usa Row Level Security (RLS)
- Apenas requisições POST são aceitas
- Validação de dados de entrada
- Tratamento de erros adequado

## 🚨 Solução de Problemas

### Erro Comum: "Método não permitido"
- **Causa**: Requisição com método diferente de POST
- **Solução**: Configure o Cakto para enviar apenas POST

### Erro Comum: "Campo 'event' é obrigatório"
- **Causa**: Payload sem campo event
- **Solução**: Verifique configuração do webhook no Cakto

### Erro Comum: "Erro ao inserir subscription"
- **Causa**: Tabela não existe ou permissões negadas
- **Solução**: Execute o SQL de criação da tabela

## 📞 Suporte

Para problemas técnicos:

1. Verifique os logs da função
2. Confirme as variáveis de ambiente
3. Teste com curl manualmente
4. Verifique a configuração do webhook no Cakto

## 🔄 Fluxo Completo

1. Cliente faz pagamento no Cakto
2. Cakto envia webhook para Supabase Function
3. Function processa o evento
4. Dados salvos na tabela subscriptions
5. Perfil do usuário atualizado para premium
6. CRM reconhece usuário premium

## 📈 Métricas Disponíveis

- Total de subscriptions ativas
- Receita mensal recorrente (MRR)
- Taxa de cancelamento (churn)
- Novos assinantes por período
- Retenção de clientes
