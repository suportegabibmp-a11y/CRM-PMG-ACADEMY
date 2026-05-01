# Configuração de Email do Supabase - CORREÇÕES NECESSÁRIAS

## 🚨 Problemas Identificados:

### 1. URLs de Redirect Incorretas
Atualmente você tem:
- ❌ `http://localhost:3000/vendas` (ERRADO)
- ✅ `https://commercialorganizer.up.railway.app/reset-password` (CORRETO)

### 2. Template de Email
O template está usando `{{ .ConfirmationURL }}` que é variável correta.

## 🔧 Soluções:

### A. Corrigir Redirect URLs no Supabase

**Adicione estas URLs no painel do Supabase > Authentication > URL Configuration:**

1. **Para desenvolvimento local:**
   ```
   http://localhost:3000/*
   http://localhost:3000/reset-password
   ```

2. **Para produção:**
   ```
   https://commercialorganizer.up.railway.app/*
   https://commercialorganizer.up.railway.app/reset-password
   ```

3. **Remova ou corrija:**
   ```
   http://localhost:3000/vendas  ← REMOVER ESTA
   ```

### B. Verificar Template de Email

No painel do Supabase > Authentication > Email Templates > "Reset your password":

**Template atual (está correto):**
```html
<h2>Redefinir senha</h2>

<p>Clique no botão abaixo para criar uma nova senha:</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="
    background-color:#000;
    color:#fff;
    padding:12px 20px;
    text-decoration:none;
    border-radius:6px;
    display:inline-block;
  ">
    Redefinir senha
  </a>
</p>

<p>Se você não solicitou isso, ignore este email.</p>
```

### C. Verificar Configuração de Email

**No painel do Supabase > Authentication > Email:**
- ✅ Enable email confirmations: ON
- ✅ Enable password recovery: ON
- ✅ Site URL: `https://commercialorganizer.up.railway.app`
- ✅ Email templates configurados

## 🧪 Teste Após Correções:

1. **Tente enviar email de recuperação**
2. **Verifique console do navegador para logs**
3. **Se email chegar, clique no link**
4. **Deve redirecionar para página de reset**

## 📋 Checklist:

- [ ] Adicionar `http://localhost:3000/reset-password` nos Redirect URLs
- [ ] Remover `http://localhost:3000/vendas` dos Redirect URLs  
- [ ] Confirmar template de reset password está ativo
- [ ] Verificar se serviço de email está habilitado
- [ ] Testar fluxo completo

## 🔍 Debug:

Se ainda não funcionar, verifique no console do navegador:
- 🔍 Logs de "Iniciando processo de recuperação"
- ✅ "Email de recuperação enviado com sucesso"
- ❌ Mensagens de erro específicas

## ⚠️ Importante:

O problema principal é que `http://localhost:3000/vendas` está nos Redirect URLs mas o código está tentando redirecionar para `/reset-password`.
