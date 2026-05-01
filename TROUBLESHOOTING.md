# 🔧 CRM PMG - Guia de Solução de Problemas

## 🚨 Problema: Não está abrindo em localhost

### 📋 Verificação Rápida

Antes de tudo, verifique:

1. **Node.js instalado?**
   ```bash
   node --version
   # Deve ser v18 ou superior
   ```

2. **PostgreSQL rodando?**
   ```bash
   # Windows
   netstat -an | findstr :5432
   
   # Ou verifique serviços do Windows
   services.msc -> procure por "postgresql"
   ```

3. **Portas disponíveis?**
   ```bash
   # Verificar se as portas 3000 e 3001 estão livres
   netstat -an | findstr :3000
   netstat -an | findstr :3001
   ```

## 🔍 Diagnóstico Passo a Passo

### 1. Verificar Estrutura de Pastas

```bash
cd "c:\Users\user\Desktop\CRM PMG"
dir
```

Estrutura esperada:
```
CRM PMG/
├── client/
├── server/
├── package.json
├── README.md
└── SETUP.md
```

### 2. Instalar Dependências (se ainda não instalou)

```bash
cd "c:\Users\user\Desktop\CRM PMG"
npm install
cd client && npm install
cd ../server && npm install
```

### 3. Configurar Banco de Dados

#### 3.1. Instalar PostgreSQL (Windows)

**Opção A: Download Oficial**
1. Acesse: https://www.postgresql.org/download/windows/
2. Baixe e instale o PostgreSQL 15+
3. Durante instalação, defina senha para usuário `postgres`
4. Marque para iniciar o serviço automaticamente

**Opção B: Chocolatey**
```bash
# Se tiver Chocolatey
choco install postgresql
```

#### 3.2. Criar Database

```bash
# Abra psql (linha de comando do PostgreSQL)
psql -U postgres

# Ou use pgAdmin (interface gráfica)
```

Execute no psql:
```sql
CREATE DATABASE crm_pmg;
CREATE USER crm_user WITH PASSWORD 'crm123';
GRANT ALL PRIVILEGES ON DATABASE crm_pmg TO crm_user;
\q
```

#### 3.3. Configurar Arquivo .env

Crie o arquivo `server/.env`:
```env
DATABASE_URL="postgresql://crm_user:crm123@localhost:5432/crm_pmg"
JWT_SECRET="chave-secreta-super-forte-para-jwt-123456"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### 4. Configurar Prisma

```bash
cd "c:\Users\user\Desktop\CRM PMG\server"
npx prisma generate
npx prisma db push
```

### 5. Iniciar Serviços

#### 5.1. Iniciar Backend (Terminal 1)

```bash
cd "c:\Users\user\Desktop\CRM PMG\server"
npm run dev
```

**Saída esperada:**
```
🚀 CRM PMG Server running on port 3001
📊 Health check: http://localhost:3001/health
```

#### 5.2. Iniciar Frontend (Terminal 2)

```bash
cd "c:\Users\user\Desktop\CRM PMG\client"
npm start
```

**Saída esperada:**
```
Starting the development server...
Compiled successfully!
You can now view crm-pmg-client in the browser.
  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

## 🐛 Problemas Comuns e Soluções

### Problema 1: "Module not found" ou erros de TypeScript

**Causa:** Dependências não instaladas

**Solução:**
```bash
cd "c:\Users\user\Desktop\CRM PMG"
npm run install:all
```

### Problema 2: "Connection refused" na porta 3001

**Causa:** Backend não iniciado ou PostgreSQL rodando em porta diferente

**Solução:**
1. Verifique se o PostgreSQL está rodando
2. Verifique a porta no arquivo .env
3. Teste conexão com banco:
   ```bash
   cd server
   npx prisma db pull
   ```

### Problema 3: "EADDRINUSE: address already in use"

**Causa:** Porta já em uso

**Solução:**
```bash
# Descobrir processo usando a porta
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Matar processo (substitua PID pelo ID do processo)
taskkill /PID <PID> /F
```

### Problema 4: Frontend não carrega ou fica em branco

**Causa:** Backend não respondendo ou CORS

**Solução:**
1. Verifique se backend está rodando
2. Teste endpoint: http://localhost:3001/health
3. Verifique console do navegador (F12)

### Problema 5: Erros de permissão no Windows

**Causa:** Restrições de execução de scripts

**Solução:**
```powershell
# Execute como Administrador no PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 🚀 Teste Rápido de Funcionamento

### 1. Testar Backend

```bash
curl http://localhost:3001/health
```

**Resposta esperada:**
```json
{"status": "OK", "timestamp": "2024-01-01T00:00:00.000Z"}
```

### 2. Testar Frontend

Abra no navegador: http://localhost:3000

**Deve aparecer:** Tela de login do CRM PMG

### 3. Criar Primeiro Usuário

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@pmg.com\",\"name\":\"Admin\",\"password\":\"admin123\",\"role\":\"ADMIN\"}"
```

## 📱 Alternativas se o Problema Persistir

### Opção 1: Usar Docker

Crie `docker-compose.yml`:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: crm_pmg
      POSTGRES_USER: crm_user
      POSTGRES_PASSWORD: crm123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  server:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://crm_user:crm123@postgres:5432/crm_pmg
      JWT_SECRET: chave-secreta-super-forte
    depends_on:
      - postgres

  client:
    build: ./client
    ports:
      - "3000:3000"
    depends_on:
      - server

volumes:
  postgres_data:
```

Execute:
```bash
docker-compose up -d
```

### Opção 2: Versão Simplificada

Se estiver com muitos problemas, crie uma versão mais simples:

1. **Apenas frontend estático** (sem backend)
2. **Usar SQLite** em vez de PostgreSQL
3. **Deploy online** (Vercel + Railway)

## 🆘 Ajuda Adicional

Se nada disso funcionar:

1. **Reinicie o computador** (resolve muitos problemas)
2. **Desabilite firewall/antivírus** temporariamente
3. **Use outro navegador** (Chrome, Firefox, Edge)
4. **Limpe cache** do navegador

## 📞 Contato

Se precisar de ajuda adicional:
1. Verifique os logs de erro nos terminais
2. Tire print dos erros do console do navegador
3. Anote exatamente o que está acontecendo

---

**Lembre-se:** O problema mais comum é esquecer de configurar o banco de dados PostgreSQL!
