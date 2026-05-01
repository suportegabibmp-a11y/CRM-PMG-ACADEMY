# 🚀 SOLUÇÃO RÁPIDA - CRM PMG

## PROBLEMA: Não está abrindo em localhost

Siga estes passos na ORDEM exata:

### 1️⃣ VERIFICAR NODE.js
```bash
node --version
# Se não tiver Node.js ou versão < 18, baixe de: https://nodejs.org
```

### 2️⃣ INSTALAR DEPENDÊNCIAS
```bash
cd "c:\Users\user\Desktop\CRM PMG"
npm install
cd client && npm install
cd ../server && npm install
```

### 3️⃣ CONFIGURAR BANCO DE DADOS (PostgreSQL)

#### Opção A: Usar SQLite (Mais fácil)
Se não quer instalar PostgreSQL, altere temporariamente para SQLite:

1. Edite `server/prisma/schema.prisma`
2. Mude a linha 2 de:
   ```
   provider = "postgresql"
   ```
   Para:
   ```
   provider = "sqlite"
   ```

3. Mude a linha 4 de:
   ```
   url      = env("DATABASE_URL")
   ```
   Para:
   ```
   url      = "file:./dev.db"
   ```

4. Edite `server/.env`:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="chave-secreta-temporaria"
   PORT=3001
   FRONTEND_URL="http://localhost:3000"
   ```

#### Opção B: Instalar PostgreSQL
1. Baixe PostgreSQL: https://www.postgresql.org/download/windows/
2. Durante instalação, crie usuário `postgres` com senha `postgres123`
3. Após instalar, abra pgAdmin ou psql e execute:
   ```sql
   CREATE DATABASE crm_pmg;
   CREATE USER crm_user WITH PASSWORD 'crm123';
   GRANT ALL PRIVILEGES ON DATABASE crm_pmg TO crm_user;
   ```

### 4️⃣ CONFIGURAR PRISMA
```bash
cd "c:\Users\user\Desktop\CRM PMG\server"
npx prisma generate
npx prisma db push
```

### 5️⃣ INICIAR APLICAÇÃO

#### Terminal 1 - Backend:
```bash
cd "c:\Users\user\Desktop\CRM PMG\server"
npm run dev
```

#### Terminal 2 - Frontend:
```bash
cd "c:\Users\user\Desktop\CRM PMG\client"
npm start
```

### 6️⃣ ACESSAR
Abra navegador: http://localhost:3000

---

## 🔥 SOLUÇÃO MAIS SIMPLES AINDA

Se nada funcionar, use esta versão ultra-simplificada:

### 1. Crie arquivo `server/simple.js`:
```javascript
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend funcionando!', timestamp: new Date() });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
```

### 2. Crie arquivo `client/public/index.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <title>CRM PMG Test</title>
</head>
<body>
    <h1>🎯 CRM PMG - Teste Rápido</h1>
    <button onclick="testBackend()">Testar Backend</button>
    <div id="result"></div>
    
    <script>
        async function testBackend() {
            try {
                const response = await fetch('http://localhost:3001/api/test');
                const data = await response.json();
                document.getElementById('result').innerHTML = 
                    '<h3>✅ Backend OK!</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
                document.getElementById('result').innerHTML = 
                    '<h3>❌ Erro: ' + error.message + '</h3>';
            }
        }
    </script>
</body>
</html>
```

### 3. Instale dependências mínimas:
```bash
cd server && npm install express cors
cd ../client && npx serve .
```

### 4. Teste:
- Backend: http://localhost:3001/api/test
- Frontend: http://localhost:3000

---

## 🆘 Se ainda não funcionar:

1. **Reinicie o computador** (resolve 90% dos casos)
2. **Desabilite antivírus/firewall** temporariamente
3. **Use outro navegador** (Chrome/Firefox)
4. **Verifique se as portas 3000 e 3001 estão livres**

**COMANDO PARA VER PORTAS EM USO:**
```bash
netstat -ano | findstr :3000
netstat -ano | findstr :3001
```

**COMANDO PARA MATAR PROCESSOS:**
```bash
taskkill /PID <PID_DO_PROCESSO> /F
```

---

## 📞 AJUDA IMEDIATA

Se precisar de ajuda imediata:
1. Tire um print do erro
2. Copie exatamente o que aparece no terminal
3. Me diga qual passo deu erro

**O problema mais comum é esquecer de instalar as dependências!**
