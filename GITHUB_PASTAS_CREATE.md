# 📁 COMO CRIAR PASTAS NO GITHUB

## 🎯 **PASSO A PASSO - CRIAR ESTRUTURA CORRETA**

### **Método 1 - Criar Pastas Primeiro**

#### **1. Delete o repositório atual:**
1. **Acesse:** https://github.com/suortegabibmp-a11y/CRM-PMG-ACADEMY
2. **Settings** → **Danger Zone** → **Delete repository**
3. **Digite:** `CRM-PMG-ACADEMY`
4. **Delete repository**

#### **2. Crie novo repositório:**
1. **GitHub** → **New repository**
2. **Name:** `CRM-PMG-ACADEMY`
3. **Visibility:** Public
4. **Create repository**

#### **3. Crie as pastas (em ordem):**

##### **Pasta public/:**
1. **Clique em:** "Add file" → "Create new file"
2. **Nome do arquivo:** `public/.gitkeep`
3. **Commit:** "Create public folder"
4. **Isso cria a pasta public/**

##### **Pasta src/:**
1. **Clique em:** "Add file" → "Create new file"
2. **Nome do arquivo:** `src/.gitkeep`
3. **Commit:** "Create src folder"
4. **Isso cria a pasta src/**

##### **Pasta src/hooks/:**
1. **Clique em:** "Add file" → "Create new file"
2. **Nome do arquivo:** `src/hooks/.gitkeep`
3. **Commit:** "Create hooks folder"

##### **Pasta src/components/Auth/:**
1. **Clique em:** "Add file" → "Create new file"
2. **Nome do arquivo:** `src/components/Auth/.gitkeep`
3. **Commit:** "Create Auth folder"

##### **Pasta src/components/ErrorBoundary/:**
1. **Clique em:** "Add file" → "Create new file"
2. **Nome do arquivo:** `src/components/ErrorBoundary/.gitkeep`
3. **Commit:** "Create ErrorBoundary folder"

##### **Pasta src/services/:**
1. **Clique em:** "Add file" → "Create new file"
2. **Nome do arquivo:** `src/services/.gitkeep`
3. **Commit:** "Create services folder"

---

## 🚀 **Método 2 - Upload com Estrutura Correta**

### **Depois de criar todas as pastas:**

#### **1. Adicione arquivos na pasta public/:**
1. **Clique em:** "Add file" → "Upload files"
2. **Selecione:** `index.html`, `favicon.svg`, `favicon.ico`, `.htaccess`, `_redirects`
3. **Arraste** para a área de upload
4. **Commit:** "Add public files"

#### **2. Adicione arquivos na pasta src/:**
1. **Clique em:** "Add file" → "Upload files"
2. **Selecione:** `App.tsx`, `index.tsx`, `index.css`
3. **Arraste** para a área de upload
4. **Commit:** "Add main src files"

#### **3. Adicione arquivos em src/hooks/:**
1. **Clique em:** "Add file" → "Upload files"
2. **Selecione:** `useAuth.tsx`
3. **Arraste** para a área de upload
4. **Commit:** "Add hooks files"

#### **4. Adicione arquivos em src/components/Auth/:**
1. **Clique em:** "Add file" → "Upload files"
2. **Selecione:** `Login.tsx`, `SignUp.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`
3. **Arraste** para a área de upload
4. **Commit:** "Add Auth components"

#### **5. Adicione arquivos em src/components/:**
1. **Clique em:** "Add file" → "Upload files"
2. **Selecione:** Todos os outros componentes (Dashboard, Activities, etc.)
3. **Arraste** para a área de upload
4. **Commit:** "Add main components"

#### **6. Adicione arquivos em src/services/:**
1. **Clique em:** "Add file" → "Upload files"
2. **Selecione:** `api.ts`, `supabase.ts`, `supabaseAuth.ts`, `emailService.ts`, etc.
3. **Arraste** para a área de upload
4. **Commit:** "Add services files"

#### **7. Adicione arquivos na raiz:**
1. **Clique em:** "Add file" → "Upload files"
2. **Selecione:** `package.json`, `tsconfig.json`, `.env`, `vercel.json`, `netlify.toml`, `Dockerfile`, `nginx.conf`
3. **Arraste** para a área de upload
4. **Commit:** "Add config files"

---

## 🎯 **RESUMO RÁPIDO**

### **Ordem correta:**
1. **Delete** repositório atual
2. **Create** novo repositório
3. **Create pastas** com `.gitkeep`
4. **Upload arquivos** nas pastas corretas
5. **Deploy** no Vercel

---

## 📋 **VERIFICAÇÃO FINAL**

### **Estrutura final no GitHub:**
```
📁 public/
├── index.html
├── favicon.svg
├── favicon.ico
├── .htaccess
└── _redirects

📁 src/
├── index.tsx
├── App.tsx
├── index.css
├── hooks/
│   └── useAuth.tsx
├── components/
│   ├── Auth/
│   │   ├── Login.tsx
│   │   ├── SignUp.tsx
│   │   ├── ForgotPassword.tsx
│   │   └── ResetPassword.tsx
│   └── [todos os outros componentes]
└── services/
    ├── api.ts
    ├── supabase.ts
    ├── supabaseAuth.ts
    └── [todos os outros serviços]

📄 package.json
📄 tsconfig.json
📄 .env
📄 vercel.json
📄 netlify.toml
📄 Dockerfile
📄 nginx.conf
```

---

## 🚀 **DEPOIS DO UPLOAD CORRETO**

### **Deploy no Vercel:**
1. **Acesse:** https://vercel.com
2. **Importe:** `CRM-PMG-ACADEMY`
3. **Configure:** variáveis de ambiente
4. **Deploy** automático

---

**Siga essa ordem e a estrutura ficará perfeita!** 🚀
