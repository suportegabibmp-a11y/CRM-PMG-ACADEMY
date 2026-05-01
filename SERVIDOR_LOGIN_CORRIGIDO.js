// SERVIDOR CRM PMG COM LOGIN CORRIGIDO
// Execute: node SERVIDOR_LOGIN_CORRIGIDO.js

const express = require('express');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 Iniciando Servidor CRM PMG com Sistema de Login Corrigido...');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para cookies
app.use((req, res, next) => {
    // Limpar todos os cookies antigos
    if (req.cookies) {
        Object.keys(req.cookies).forEach(cookie => {
            res.clearCookie(cookie);
        });
    }
    next();
});

// Armazenamento em memória para sessões
const sessions = new Map();
let currentUser = null;

// Usuários pré-cadastrados
const users = [
    {
        id: '1',
        email: 'admin@crmpmg.com',
        name: 'Administrador CRM',
        password: hashPassword('Admin@2024!'),
        role: 'ADMIN',
        avatar: '👨‍💼',
        department: 'TI'
    },
    {
        id: '2',
        email: 'usuario@crmpmg.com',
        name: 'Usuário Teste',
        password: hashPassword('Usuario@2024!'),
        role: 'SALES',
        avatar: '👤',
        department: 'Vendas'
    },
    {
        id: '3',
        email: 'joao.silva@crmpmg.com',
        name: 'João Silva',
        password: hashPassword('Joao@2024!'),
        role: 'SALES',
        avatar: '🧑‍💼',
        department: 'Vendas'
    },
    {
        id: '4',
        email: 'maria.santos@crmpmg.com',
        name: 'Maria Santos',
        password: hashPassword('Maria@2024!'),
        role: 'MANAGER',
        avatar: '👩‍💼',
        department: 'Vendas'
    }
];

// Função para hash de senha
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Middleware de autenticação
function requireAuth(req, res, next) {
    const sessionId = req.cookies?.sessionId;
    
    if (!sessionId || !sessions.has(sessionId)) {
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        return res.redirect('/login');
    }
    
    const session = sessions.get(sessionId);
    currentUser = session.user;
    req.user = session.user;
    next();
}

// Middleware para verificar se já está logado
function checkAuth(req, res, next) {
    const sessionId = req.cookies?.sessionId;
    
    if (sessionId && sessions.has(sessionId)) {
        return res.redirect('/dashboard');
    }
    
    next();
}

// Página de Login
app.get('/login', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - CRM PMG</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .login-container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            width: 100%;
            max-width: 450px;
            text-align: center;
        }
        .logo {
            font-size: 3em;
            margin-bottom: 10px;
        }
        h1 { 
            color: #333; 
            margin-bottom: 10px; 
            font-size: 2em;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 1.1em;
        }
        .form-group {
            margin-bottom: 20px;
            text-align: left;
        }
        label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 500;
        }
        input {
            width: 100%;
            padding: 15px;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .btn {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 10px;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        .error {
            background: #fee;
            color: #c33;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #fcc;
        }
        .success {
            background: #efe;
            color: #3c3;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #cfc;
        }
        .credentials {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-top: 30px;
            text-align: left;
        }
        .credentials h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        .credential-item {
            margin-bottom: 10px;
            padding: 10px;
            background: white;
            border-radius: 6px;
            border-left: 4px solid #667eea;
        }
        .credential-item strong {
            color: #667eea;
        }
        .loading {
            display: none;
            text-align: center;
            margin-top: 20px;
        }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .quick-login {
            margin-top: 15px;
        }
        .quick-login-btn {
            background: #28a745;
            font-size: 14px;
            padding: 10px;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">🎯</div>
        <h1>CRM PMG</h1>
        <p class="subtitle">Sistema de Gestão de Relacionamento</p>
        
        <div id="message"></div>
        
        <form id="loginForm">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required placeholder="Seu email">
            </div>
            
            <div class="form-group">
                <label for="password">Senha</label>
                <input type="password" id="password" name="password" required placeholder="Sua senha">
            </div>
            
            <button type="submit" class="btn" id="loginBtn">
                Entrar no Sistema
            </button>
            
            <div class="loading" id="loading">
                <div class="spinner"></div>
                <p>Autenticando...</p>
            </div>
        </form>
        
        <div class="quick-login">
            <button class="btn quick-login-btn" onclick="quickLogin('admin')">
                Login Rápido como Admin
            </button>
        </div>
        
        <div class="credentials">
            <h3>🔐 Credenciais de Teste</h3>
            <div class="credential-item">
                <strong>Administrador:</strong><br>
                Email: admin@crmpmg.com<br>
                Senha: Admin@2024!
            </div>
            <div class="credential-item">
                <strong>Usuário Teste:</strong><br>
                Email: usuario@crmpmg.com<br>
                Senha: Usuario@2024!
            </div>
            <div class="credential-item">
                <strong>Vendedor:</strong><br>
                Email: joao.silva@crmpmg.com<br>
                Senha: Joao@2024!
            </div>
        </div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const loginBtn = document.getElementById('loginBtn');
            const loading = document.getElementById('loading');
            const message = document.getElementById('message');
            
            // Mostrar loading
            loginBtn.disabled = true;
            loginBtn.textContent = 'Entrando...';
            loading.style.display = 'block';
            message.innerHTML = '';
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password }),
                    credentials: 'include'
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    message.innerHTML = '<div class="success">✅ Login realizado com sucesso! Redirecionando...</div>';
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 1500);
                } else {
                    message.innerHTML = '<div class="error">❌ ' + data.error + '</div>';
                }
            } catch (error) {
                message.innerHTML = '<div class="error">❌ Erro de conexão. Tente novamente.</div>';
            } finally {
                loginBtn.disabled = false;
                loginBtn.textContent = 'Entrar no Sistema';
                loading.style.display = 'none';
            }
        });
        
        function quickLogin(type) {
            if (type === 'admin') {
                document.getElementById('email').value = 'admin@crmpmg.com';
                document.getElementById('password').value = 'Admin@2024!';
                document.getElementById('loginForm').dispatchEvent(new Event('submit'));
            }
        }
        
        // Limpar cookies ao carregar página
        document.addEventListener('DOMContentLoaded', function() {
            document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
            });
        });
    </script>
</body>
</html>
  `);
});

// API de Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    // Validar entrada
    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    
    // Buscar usuário
    const user = users.find(u => u.email === email && u.password === hashPassword(password));
    
    if (!user) {
        return res.status(401).json({ error: 'Email ou senha incorretos' });
    }
    
    // Criar sessão
    const sessionId = crypto.randomBytes(32).toString('hex');
    sessions.set(sessionId, {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            department: user.department
        },
        createdAt: new Date()
    });
    
    // Definir cookie
    res.cookie('sessionId', sessionId, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });
    
    res.json({
        success: true,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            department: user.department
        }
    });
});

// API de Logout
app.post('/api/auth/logout', (req, res) => {
    const sessionId = req.cookies?.sessionId;
    
    if (sessionId) {
        sessions.delete(sessionId);
        res.clearCookie('sessionId');
    }
    
    res.json({ success: true });
});

// Dashboard (protegido)
app.get('/dashboard', requireAuth, (req, res) => {
    const user = req.user;
    
    res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - CRM PMG</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: #f5f5f5;
            min-height: 100vh;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 20px 30px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .logo { 
            font-size: 1.5em; 
            font-weight: bold;
        }
        .user-info { 
            display: flex; 
            align-items: center; 
            gap: 15px;
            background: rgba(255,255,255,0.2);
            padding: 10px 20px;
            border-radius: 25px;
        }
        .user-avatar { 
            font-size: 1.5em; 
        }
        .user-details { 
            text-align: right; 
        }
        .user-name { 
            font-weight: bold; 
            margin-bottom: 2px;
        }
        .user-role { 
            font-size: 0.9em; 
            opacity: 0.9;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 30px; 
        }
        .metrics { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px; 
        }
        .metric-card { 
            background: white; 
            padding: 25px; 
            border-radius: 15px; 
            text-align: center; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        .metric-card:hover {
            transform: translateY(-5px);
        }
        .metric-value { 
            font-size: 2.5em; 
            font-weight: bold; 
            margin-bottom: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .metric-label { 
            color: #666; 
            font-size: 1.1em; 
        }
        .card { 
            background: white; 
            border-radius: 15px; 
            padding: 30px; 
            margin-bottom: 25px; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        h2 { 
            color: #333; 
            margin-bottom: 20px; 
            font-size: 1.8em;
        }
        .table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
        }
        .table th, .table td { 
            padding: 15px; 
            text-align: left; 
            border-bottom: 1px solid #eee; 
        }
        .table th { 
            background: #f8f9fa; 
            font-weight: bold; 
            color: #555;
        }
        .table tr:hover {
            background: #f8f9fa;
        }
        .btn { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 10px 20px; 
            border: none; 
            border-radius: 8px; 
            cursor: pointer; 
            font-size: 14px;
            transition: all 0.3s ease;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .btn-danger {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
        }
        .welcome {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
            text-align: center;
        }
        .welcome h2 {
            color: white;
            margin-bottom: 10px;
        }
        .status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status.active {
            background: #d4edda;
            color: #27ae60;
        }
        .status.pending {
            background: #fef9e7;
            color: #f39c12;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🎯 CRM PMG</div>
        <div class="user-info">
            <div class="user-avatar">${user.avatar}</div>
            <div class="user-details">
                <div class="user-name">${user.name}</div>
                <div class="user-role">${user.role} - ${user.department}</div>
            </div>
            <button class="btn" onclick="logout()">Sair</button>
        </div>
    </div>

    <div class="container">
        <div class="welcome">
            <h2>👋 Bem-vindo, ${user.name}!</h2>
            <p>Sistema de Gestão de Relacionamento com Clientes</p>
        </div>

        <div class="metrics">
            <div class="metric-card">
                <div class="metric-value">12</div>
                <div class="metric-label">Total Clientes</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">8</div>
                <div class="metric-label">Negócios Ativos</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">R$ 450K</div>
                <div class="metric-label">Valor Pipeline</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">24</div>
                <div class="metric-label">Atividades Mês</div>
            </div>
        </div>

        <div class="card">
            <h2>👥 Clientes Recentes</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Empresa</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>João Carlos Silva</td>
                        <td>joao.silva@techsolutions.com</td>
                        <td>Tech Solutions Ltda</td>
                        <td><span class="status active">Ativo</span></td>
                        <td><button class="btn">Ver</button></td>
                    </tr>
                    <tr>
                        <td>Maria Fernanda Santos</td>
                        <td>maria.santos@comerciodigital.com</td>
                        <td>Comércio Digital SA</td>
                        <td><span class="status active">Ativo</span></td>
                        <td><button class="btn">Ver</button></td>
                    </tr>
                    <tr>
                        <td>Carlos Alberto Oliveira</td>
                        <td>carlos.oliveira@servicosonline.com</td>
                        <td>Serviços Online ME</td>
                        <td><span class="status pending">Pendente</span></td>
                        <td><button class="btn">Ver</button></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="card">
            <h2>💼 Negócios em Andamento</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Cliente</th>
                        <th>Valor</th>
                        <th>Estágio</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Implementação CRM Enterprise</td>
                        <td>Tech Solutions Ltda</td>
                        <td>R$ 75.000</td>
                        <td><span class="status pending">Qualificado</span></td>
                        <td><button class="btn">Ver</button></td>
                    </tr>
                    <tr>
                        <td>E-commerce Pro</td>
                        <td>Comércio Digital SA</td>
                        <td>R$ 45.000</td>
                        <td><span class="status pending">Proposta</span></td>
                        <td><button class="btn">Ver</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <script>
        async function logout() {
            try {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });
                
                window.location.href = '/login';
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
                window.location.href = '/login';
            }
        }

        // Verificar sessão periodicamente
        setInterval(async () => {
            try {
                const response = await fetch('/api/auth/status', {
                    credentials: 'include'
                });
                if (!response.ok) {
                    window.location.href = '/login';
                }
            } catch (error) {
                console.error('Erro de sessão:', error);
                window.location.href = '/login';
            }
        }, 30000); // 30 segundos
    </script>
</body>
</html>
  `);
});

// API de verificação de status
app.get('/api/auth/status', requireAuth, (req, res) => {
    res.json({
        authenticated: true,
        user: req.user
    });
});

// Redirecionar raiz para login
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Limpar sessões expiradas (a cada 5 minutos)
setInterval(() => {
    const now = new Date();
    const expiredSessions = [];
    
    for (const [sessionId, session] of sessions.entries()) {
        const sessionAge = now - session.createdAt;
        if (sessionAge > 24 * 60 * 60 * 1000) { // 24 horas
            expiredSessions.push(sessionId);
        }
    }
    
    expiredSessions.forEach(sessionId => {
        sessions.delete(sessionId);
    });
    
    if (expiredSessions.length > 0) {
        console.log(`🧹 Limpadas ${expiredSessions.length} sessões expiradas`);
    }
}, 5 * 60 * 1000);

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('🎉 CRM PMG COM LOGIN CORRIGIDO ESTÁ ONLINE!');
    console.log('');
    console.log('📍 Link de Acesso: http://localhost:' + PORT);
    console.log('🔐 Página de Login: http://localhost:' + PORT + '/login');
    console.log('📊 Dashboard: http://localhost:' + PORT + '/dashboard');
    console.log('');
    console.log('👤 Credenciais de Acesso:');
    console.log('   📧 Email: admin@crmpmg.com');
    console.log('   🔑 Senha: Admin@2024!');
    console.log('');
    console.log('   📧 Email: usuario@crmpmg.com');
    console.log('   🔑 Senha: Usuario@2024!');
    console.log('');
    console.log('✅ Sistema com autenticação corrigido!');
    console.log('🚀 Acesse e faça login para usar o CRM!');
});
