# 🔑 COMO OBTER A ANON KEY DO SUPABASE

## 📍 ONDE ENCONTRAR A ANON KEY

### **MÉTODO 1: Dashboard Supabase (Recomendado)**

1. **Acesse o Dashboard:**
   ```
   https://supabase.com/dashboard/project/xmvebvicyqneswedgwna
   ```

2. **Navegue para Settings:**
   - No menu lateral esquerdo, clique em **"Settings"** (ícone de engrenagem ⚙️)

3. **Vá para API:**
   - No menu de configurações, clique em **"API"**

4. **Encontre a ANON KEY:**
   - Role para **"Project API keys"**
   - Copie a chave **"anon public"**
   - Deve parecer com: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

### **MÉTODO 2: URL Direta**

1. **Acesse diretamente:**
   ```
   https://supabase.com/dashboard/project/xmvebvicyqneswedgwna/settings/api
   ```

2. **Copie a "anon public" key**

---

## 🔍 COMO IDENTIFICAR A ANON KEY CORRETA

### **Características da ANON KEY:**
- ✅ **Role:** `"role": "anon"`
- ✅ **Inicia com:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
- ✅ **Contém:** `"pc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdmVidmljeXFuZXN3ZWRnd25h"`
- ❌ **NÃO contém:** `"role": "service_role"`

### **Exemplo de ANON KEY:**
```javascript
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdmVidmljeXFuZXN3ZWRnd25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjU5OTQsImV4cCI6MjA5MzE0MTk5NH0.ABC123...
```

### **NÃO USE SERVICE ROLE KEY:**
```javascript
// ❌ ERRADO - Esta é SERVICE ROLE KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdmVidmljeXFuZXN3ZWRnd25hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzU2NTk5NCwiZXhwIjoyMDkzMTQxOTk0fQ.Z1ath3lCQI4_VIQgabbFbPjI3xKLhvwWSKUC1boOCK4
```

---

## 📱 PASSO A PASSO COM IMAGENS

### **Passo 1: Dashboard**
```
┌─────────────────────────────────────┐
│  🏠 Dashboard                       │
│  ├─ 📊 Database                     │
│  ├─ 🔧 Functions                    │
│  ├─ ⚙️ Settings ← CLIQUE AQUI       │
│  └─ 👥 Authentication               │
└─────────────────────────────────────┘
```

### **Passo 2: Settings**
```
┌─────────────────────────────────────┐
│  ⚙️ Settings                        │
│  ├─ 🏢 General                      │
│  ├─ 🔑 API ← CLIQUE AQUI            │
│  ├─ 🔐 Authentication               │
│  └─ 🌐 URL Configuration           │
└─────────────────────────────────────┘
```

### **Passo 3: API Keys**
```
┌─────────────────────────────────────┐
│  🔑 API Settings                    │
│                                     │
│  Project API keys                   │
│  ┌─────────────────────────────────┐ │
│  │ 🔓 anon public ← COPIE ESTA    │ │
│  │ eyJhbGciOiJIUzI1NiIsInR5cCI... │ │
│  │                               │ │
│  │ 🔒 service_role (NÃO USE)     │ │
│  │ eyJhbGciOiJIUzI1NiIsInR5cCI... │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## ⚠️ IMPORTANTE

### **Segurança:**
- ✅ **ANON KEY** é pública e segura para frontend
- ❌ **SERVICE ROLE** é privada e apenas para backend
- 🔒 **Nunca** exponha SERVICE ROLE no frontend

### **Verificação:**
- ✅ **Teste com curl** após copiar
- ✅ **Verifique** se não dá erro 401
- ✅ **Confirme** se contém `"role": "anon"`

---

## 🧪 TESTE APÓS COPIAR

### **Teste a nova ANON KEY:**
```bash
curl -X POST "https://xmvebvicyqneswedgwna.supabase.co/auth/v1/signup" \
  -H "apikey: SUA_NOVA_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```

### **Resposta esperada:**
- ✅ **200 ou 201** (funcionando)
- ❌ **401** (chave ainda inválida)

---

## 🔄 APLIQUE A CHAVE

### **1. Atualize .env:**
```bash
REACT_APP_SUPABASE_ANON_KEY=SUA_NOVA_ANON_KEY_AQUI
```

### **2. Atualize supabase.ts:**
```typescript
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'SUA_NOVA_ANON_KEY_AQUI';
```

### **3. Reinicie o servidor:**
```bash
npm start
```

---

## 🎯 RESUMO

**A ANON KEY está em:**
```
Dashboard → Settings → API → Project API keys → anon public
```

**URL direta:**
```
https://supabase.com/dashboard/project/xmvebvicyqneswedgwna/settings/api
```

**Copie a chave que começa com `eyJ...` e contém `"role": "anon"`!** 🔑
