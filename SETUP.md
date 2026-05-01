# 🚀 CRM PMG - Guia de Instalação e Configuração

Este guia irá ajudá-lo a configurar e executar o CRM PMG em seu ambiente local.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter as seguintes ferramentas instaladas:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn** (gerenciador de pacotes)
- **PostgreSQL** (versão 13 ou superior)
- **Git** (para controle de versão)

## 🛠️ Estrutura do Projeto

```
CRM PMG/
├── client/          # Frontend React + TypeScript
├── server/          # Backend Node.js + Express + TypeScript
├── package.json     # Configuração principal
└── README.md        # Documentação
```

## 🔧 Passo a Passo de Instalação

### 1. Clonar o Projeto

```bash
git clone <repositório-do-crm-pmg>
cd "CRM PMG"
```

### 2. Instalar Dependências

```bash
# Instalar dependências de todos os projetos
npm run install:all

# Ou manualmente:
npm install
cd client && npm install
cd ../server && npm install
```

### 3. Configurar Banco de Dados

#### 3.1. Criar Database PostgreSQL

```sql
-- Conecte-se ao PostgreSQL e execute:
CREATE DATABASE crm_pmg;
CREATE USER crm_user WITH PASSWORD 'sua_senha';
GRANT ALL PRIVILEGES ON DATABASE crm_pmg TO crm_user;
```

#### 3.2. Configurar Variáveis de Ambiente

No diretório `server/`, crie o arquivo `.env`:

```bash
cd server
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database
DATABASE_URL="postgresql://crm_user:sua_senha@localhost:5432/crm_pmg"

# JWT Secret (use uma string segura e longa)
JWT_SECRET="sua-chave-secreta-super-segura-aqui"

# Server Port
PORT=3001

# CORS
FRONTEND_URL="http://localhost:3000"
```

### 4. Configurar Banco de Dados com Prisma

```bash
cd server

# Gerar client Prisma
npx prisma generate

# Executar migrações
npx prisma db push

# (Opcional) Visualizar dados
npx prisma studio
```

### 5. Iniciar Aplicação

#### 5.1. Iniciar Backend

```bash
cd server
npm run dev
```

O backend estará rodando em: `http://localhost:3001`

#### 5.2. Iniciar Frontend (em outro terminal)

```bash
cd client
npm start
```

O frontend estará rodando em: `http://localhost:3000`

### 6. Acessar a Aplicação

1. Abra seu navegador e acesse: `http://localhost:3000`
2. Você verá a tela de login
3. Para criar o primeiro usuário, você pode usar o endpoint de registro diretamente:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pmg.com",
    "name": "Administrador",
    "password": "senha123",
    "role": "ADMIN"
  }'
```

## 📊 Funcionalidades Implementadas

### ✅ Módulos Principais

- **Autenticação**: Login, registro, gestão de sessão
- **Dashboard**: Métricas em tempo real, gráficos, KPIs
- **Clientes**: CRUD completo, filtros, busca
- **Negócios**: Pipeline de vendas, gestão de oportunidades
- **Atividades**: Follow-up, tarefas, histórico

### ✅ Métricas e Dashboard

- **KPIs Principais**: Total clientes, negócios fechados, faturamento
- **Pipeline de Vendas**: Visualização por estágio com valores
- **Performance da Equipe**: Métricas por vendedor
- **Gráficos Interativos**: Barras, pizza, linhas
- **Comparativos**: Crescimento mês a mês

### ✅ Recursos Técnicos

- **TypeScript**: Type safety em todo o projeto
- **Tailwind CSS**: Estilização moderna e responsiva
- **Prisma ORM**: Banco de dados type-safe
- **JWT Authentication**: Segurança na autenticação
- **React Hooks**: Estado moderno e reativo

## 🔧 Desenvolvimento

### Scripts Disponíveis

```bash
# No diretório principal:
npm run dev              # Inicia frontend e backend juntos
npm run server:dev        # Apenas backend em modo dev
npm run client:dev        # Apenas frontend em modo dev
npm run build             # Build para produção
npm start                 # Inicia aplicação de produção

# No diretório server:
npm run dev              # Modo desenvolvimento com hot-reload
npm run build            # Compila TypeScript
npm start                # Inicia servidor de produção
npm run db:generate     # Gera client Prisma
npm run db:migrate       # Executa migrações
npm run db:push          # Push schema para database
npm run db:studio        # Abre Prisma Studio

# No diretório client:
npm start                # Inicia servidor de desenvolvimento
npm run build            # Build para produção
npm test                 # Executa testes
```

### Estrutura de API

```
GET    /api/auth/profile
POST   /api/auth/login
POST   /api/auth/register

GET    /api/customers
POST   /api/customers
PUT    /api/customers/:id
DELETE /api/customers/:id

GET    /api/deals
POST   /api/deals
PUT    /api/deals/:id
DELETE /api/deals/:id
GET    /api/deals/pipeline/summary

GET    /api/activities
POST   /api/activities
PUT    /api/activities/:id
DELETE /api/activities/:id
GET    /api/activities/pending/my-activities

GET    /api/metrics/dashboard
GET    /api/metrics/pipeline
GET    /api/metrics/sales-performance
GET    /api/metrics/conversion-funnel
GET    /api/metrics/activities
```

## 🚀 Deploy em Produção

### Backend (Ex: Railway/Heroku)

1. Configure as variáveis de ambiente no serviço de hosting
2. Execute as migrações do banco de dados
3. Faça o build do projeto: `npm run build`
4. Inicie o servidor: `npm start`

### Frontend (Ex: Vercel/Netlify)

1. Configure as variáveis de ambiente
2. Faça o build: `npm run build`
3. Faça o deploy da pasta `build`

## 🐛 Solução de Problemas

### Problemas Comuns

**Erro: "Cannot find module"**
```bash
# Verifique se instalou as dependências:
npm run install:all
```

**Erro: "Connection refused"**
```bash
# Verifique se o PostgreSQL está rodando
# Verifique as credenciais no arquivo .env
# Verifique se a porta está disponível
```

**Erro: "Database connection failed"**
```bash
# Verifique se o database existe
# Teste a conexão com psql
psql -h localhost -U crm_user -d crm_pmg
```

### Logs e Debug

```bash
# Logs do backend
cd server && npm run dev

# Verificar conexão com database
npx prisma db pull
```

## 📝️ Próximos Passos

### Melhorias Planejadas

- [ ] Formulários completos para CRUD
- [ ] Upload de arquivos e documentos
- [ ] Sistema de notificações
- [ ] Relatórios exportáveis (PDF/Excel)
- [ ] Integração com email marketing
- [ ] API para integrações externas
- [ ] Testes automatizados
- [ ] Docker containerização

### Novas Funcionalidades

- [ ] Gestão de produtos/serviços
- [ ] Calendário integrado
- [ ] Chat interno entre usuários
- [ ] Mobile app (React Native)
- [ ] Dashboard personalizado por usuário

## 📞 Suporte

Caso encontre problemas durante a instalação:

1. Verifique os logs de erro no terminal
2. Consulte a documentação oficial das tecnologias utilizadas
3. Abra uma issue no repositório do projeto

## 📄 Licença

Este projeto está licenciado sob MIT License.

---

**CRM PMG** - Sistema moderno de gestão de relacionamento com clientes desenvolvido com as melhores práticas do mercado.
