# 🔧 CORRIGIR ERRO 401 SUPABASE AUTH

## 🚨 PROBLEMA IDENTIFICADO

**Erro:** `401 Unauthorized` nos endpoints `/auth/v1/signup` e `/auth/v1/token`

**Causa:** ANON KEY inválida para o projeto Supabase

---

## 🎯 SOLUÇÃO IMEDIATA

### 1. OBTER ANON KEY CORRETA

**Acesse o Dashboard Supabase:**
1. **URL:** https://supabase.com/dashboard/project/xmvebvicyqneswedgwna
2. **Vá para:** Project Settings → API
3. **Copie a "anon public" key**

### 2. ATUALIZAR VARIÁVEIS DE AMBIENTE

**Arquivo:** `client/.env`
```bash
REACT_APP_SUPABASE_URL=https://xmvebvicyqneswedgwna.supabase.co
REACT_APP_SUPABASE_ANON_KEY=COLE_A_ANON_KEY_AQUI
```

### 3. ATUALIZAR ARQUIVO SUPABASE.TS

**Arquivo:** `client/src/lib/supabase.ts`
```typescript
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'COLE_A_ANON_KEY_AQUI';
```

---

## 🔍 VERIFICAÇÃO

### Teste com curl:
```bash
curl -X POST "https://xmvebvicyqneswedgwna.supabase.co/auth/v1/signup" \
  -H "apikey: SUA_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```

**Resposta esperada:** 200 ou 201 (não 401)

---

## ⚠️ IMPORTANTE

- **NUNCA** use SERVICE ROLE KEY no frontend
- **SEMPRE** use ANON KEY para operações de cliente
- **SERVICE ROLE** é apenas para backend/admin

---

## 🔐 CONFIGURAÇÃO SUPABASE AUTH

### Verifique no Dashboard:

1. **Authentication → Providers**
   - ✅ Email provider: ENABLED
   - ✅ Enable email confirmations: OFF (para teste)

2. **Authentication → URL Configuration**
   - ✅ Site URL: `http://localhost:3000`
   - ✅ Redirect URLs: `http://localhost:3000/*`

---

## 🧪 TESTE FINAL

Após corrigir a ANON KEY:

1. **Reinicie o servidor:** `npm start`
2. **Teste signup:** http://localhost:3003/signup
3. **Teste login:** http://localhost:3003/login
4. **Verifique console:** Sem erros 401

---

## 📋 CHECKLIST FINAL

- [ ] Obter ANON KEY correta do Dashboard
- [ ] Atualizar .env com ANON KEY
- [ ] Atualizar supabase.ts fallback
- [ ] Reiniciar servidor
- [ ] Testar signup/login
- [ ] Verificar logs console
- [ ] Confirmar sem erros 401

---

## 🚀 RESULTADO ESPERADO

**✅ Funcionamento:**
- Signup: 201 Created
- Login: 200 OK
- Sessão: Persistente
- Sem erros 401

**🔗 Links úteis:**
- Dashboard: https://supabase.com/dashboard/project/xmvebvicyqneswedgwna
- API Settings: https://supabase.com/dashboard/project/xmvebvicyqneswedgwna/settings/api
- Auth Settings: https://supabase.com/dashboard/project/xmvebvicyqneswedgwna/auth/providers
