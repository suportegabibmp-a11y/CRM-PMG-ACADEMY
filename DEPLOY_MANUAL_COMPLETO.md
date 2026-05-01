# 🚀 DEPLOY MANUAL GITHUB PAGES - PASSO A PASSO

## 📋 **ANTES DE COMEÇAR**

### **Arquivos que você precisa ter:**
- ✅ `.github/workflows/deploy.yml` (já corrigido)
- ✅ `.env` (com variáveis locais)
- ✅ `package.json` (com homepage: ".")
- ✅ `_redirects` (na pasta public)
- ✅ `netlify.toml` (se usar Netlify)
- ✅ `vercel.json` (se usar Vercel)

---

## 🔧 **PASSO 1 - CONFIGURAR GITHUB PAGES**

### **1.1 Ativar GitHub Pages:**
1. **Acesse:** https://github.com/suportegabibmp/CRM-PMG-ACADEMY
2. **Clique em:** Settings
3. **Vá para:** Pages (menu lateral esquerdo)
4. **Source:** Selecione "GitHub Actions"
5. **Clique em:** Save

### **1.2 Configurar Secrets:**
1. **Em Settings → Secrets and variables → Actions**
2. **Clique em:** "New repository secret"
3. **Adicione os 2 secrets:**

#### **Secret 1: REACT_APP_SUPABASE_URL**
- **Name:** `REACT_APP_SUPABASE_URL`
- **Value:** `https://xmvebvicyqneswedgwna.supabase.co`

#### **Secret 2: REACT_APP_SUPABASE_ANON_KEY**
- **Name:** `REACT_APP_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdmVidmljeXFuZXN3ZWRnd25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjU1OTQsImV4cCI6MjA5MzE0MTk5NH0.7Lt0tGn-BO5aed8MBvFu3AHsaN7utFxvszxydm7d9ks`

---

## 🚀 **PASSO 2 - FAZER DEPLOY MANUAL**

### **2.1 Usando GitHub CLI (se tiver instalado):**
```bash
# Abra o terminal na pasta do projeto
cd "c:/Users/user/Desktop/CRM PMG/client"

# Faça login no GitHub
gh auth login

# Configure as secrets
gh secret set REACT_APP_SUPABASE_URL --body "https://xmvebvicyqneswedgwna.supabase.co"
gh secret set REACT_APP_SUPABASE_ANON_KEY --body "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdmVidmljeXFuZXN3ZWRnd25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjU1OTQsImV4cCI6MjA5MzE0MTk5NH0.7Lt0tGn-BO5aed8MBvFu3AHsaN7utFxvszxydm7d9ks"

# Faça commit e push
git add .
git commit -m "Fix GitHub Pages deploy - update workflow and secrets"
git push origin main
```

### **2.2 Manualmente (sem GitHub CLI):**
```bash
# Abra o terminal na pasta do projeto
cd "c:/Users/user/Desktop/CRM PMG/client"

# Faça commit e push
git add .
git commit -m "Fix GitHub Pages deploy - update workflow and secrets"
git push origin main
```

---

## 🔍 **PASSO 3 - MONITORAR DEPLOY**

### **3.1 Verificar Actions:**
1. **Acesse:** https://github.com/suportegabibmp/CRM-PMG-ACADEMY/actions
2. **Veja o workflow:** "Deploy to GitHub Pages"
3. **Monitore o progresso**

### **3.2 Se houver erro:**
1. **Clique no workflow** com erro
2. **Veja os logs** detalhados
3. **Verifique se as secrets** estão configuradas

---

## 🌐 **PASSO 4 - ACESSAR SITE**

### **4.1 URL do Site:**
```
https://suportegabibmp.github.io/CRM-PMG-ACADEMY/
```

### **4.2 Testar Funcionalidades:**
- ✅ Login
- ✅ Cadastro
- ✅ Recuperação de senha
- ✅ Dashboard

---

## 🚨 **SOLUÇÃO ALTERNATIVA - VERCEL**

### **Se GitHub Pages não funcionar:**

#### **1. Acesse:** https://vercel.com
#### **2. Importe o repositório:**
- **Clique em:** Add New... → Project
- **Conecte:** GitHub
- **Selecione:** CRM-PMG-ACADEMY

#### **3. Configure Environment Variables:**
```
REACT_APP_SUPABASE_URL = https://xmvebvicyqneswedgwna.supabase.co
REACT_APP_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdmVidmljeXFuZXN3ZWRnd25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjU1OTQsImV4cCI6MjA5MzE0MTk5NH0.7Lt0tGn-BO5aed8MBvFu3AHsaN7utFxvszxydm7d9ks
```

#### **4. Deploy:**
- **Clique em:** Deploy
- **Aguarde o build**
- **Acesse a URL** fornecida

---

## 🚨 **SOLUÇÃO ALTERNATIVA - NETLIFY**

### **Se GitHub Pages não funcionar:**

#### **1. Acesse:** https://netlify.com
#### **2. Conecte o GitHub:**
- **Clique em:** Add new site → Import an existing project
- **Conecte:** GitHub
- **Selecione:** CRM-PMG-ACADEMY

#### **3. Configure Build Settings:**
- **Build command:** `npm run build`
- **Publish directory:** `build`

#### **4. Configure Environment Variables:**
```
REACT_APP_SUPABASE_URL = https://xmvebvicyqneswedgwna.supabase.co
REACT_APP_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdmVidmljeXFuZXN3ZWRnd25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjU1OTQsImV4cCI6MjA5MzE0MTk5NH0.7Lt0tGn-BO5aed8MBvFu3AHsaN7utFxvszxydm7d9ks
```

#### **5. Deploy:**
- **Clique em:** Deploy site
- **Aguarde o build**
- **Acesse a URL** fornecida

---

## 🔧 **VERIFICAÇÃO FINAL**

### **Antes de fazer deploy:**
- [ ] Secrets configuradas no GitHub
- [ ] GitHub Pages ativado
- [ ] Workflow atualizado
- [ ] Build local funcionando

### **Após o deploy:**
- [ ] Acessar URL do site
- [ ] Testar login/cadastro
- [ ] Verificar console para erros
- [ ] Testar Supabase Auth

---

## 📞 **SUPORTE**

### **Se precisar ajuda:**
1. **Verifique os logs** do GitHub Actions
2. **Confirme as secrets** estão corretas
3. **Teste o build local** antes do deploy
4. **Use Vercel/Netlify** como alternativa

---

## 🏆 **RESULTADO ESPERADO**

**Com as configurações corretas, o deploy funcionará automaticamente!**

**Seu CRM PMG estará online e funcional!** 🚀
