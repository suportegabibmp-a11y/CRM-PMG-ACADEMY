// SERVIDOR CRM PMG PREMIUM - INTEGRADO COM NOVOS COMPONENTES
// Execute: node SERVIDOR_CRM_PREMIUM.js

const express = require('express');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 Iniciando Servidor CRM PMG Premium...');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'client/build')));

// Cookie parser middleware
app.use((req, res, next) => {
    const cookies = {};
    req.cookies = cookies;
    
    if (req.headers.cookie) {
        req.headers.cookie.split(';').forEach(cookie => {
            const parts = cookie.trim().split('=');
            if (parts.length === 2) {
                cookies[parts[0].trim()] = parts[1].trim();
            }
        });
    }
    
    const originalCookie = res.cookie;
    res.cookie = function(name, value, options = {}) {
        let cookieString = `${name}=${value}`;
        if (options.maxAge) {
            cookieString += `; Max-Age=${options.maxAge}`;
        }
        if (options.httpOnly) {
            cookieString += `; HttpOnly`;
        }
        if (options.path) {
            cookieString += `; Path=${options.path}`;
        }
        res.setHeader('Set-Cookie', cookieString);
    };
    
    const originalClearCookie = res.clearCookie;
    res.clearCookie = function(name, options = {}) {
        let cookieString = `${name}=; Max-Age=0`;
        if (options.path) {
            cookieString += `; Path=${options.path}`;
        }
        res.setHeader('Set-Cookie', cookieString);
    };
    
    next();
});

// Armazenamento em memória para sessões
const sessions = new Map();

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
    
    console.log('Verificando autenticação:', sessionId);
    console.log('Sessões existentes:', Array.from(sessions.keys()));
    
    if (!sessionId || !sessions.has(sessionId)) {
        console.log('Sessão não encontrada, redirecionando para login');
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        return res.redirect('/login');
    }
    
    const session = sessions.get(sessionId);
    req.user = session.user;
    console.log('Usuário autenticado:', req.user.name);
    next();
}

// Middleware para verificar se já está logado
function checkAuth(req, res, next) {
    const sessionId = req.cookies?.sessionId;
    
    console.log('CheckAuth - Verificando se já está logado:', sessionId);
    
    if (sessionId && sessions.has(sessionId)) {
        console.log('Usuário já logado, redirecionando para dashboard');
        return res.redirect('/dashboard');
    }
    
    console.log('Usuário não está logado, continuando');
    next();
}

// Página de Login Premium
app.get('/login', checkAuth, (req, res) => {
    console.log('Servindo página de login premium');
    res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - CRM PMG Premium</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: {
                            50: '#eff6ff',
                            100: '#dbeafe',
                            200: '#bfdbfe',
                            300: '#93c5fd',
                            400: '#60a5fa',
                            500: '#3b82f6',
                            600: '#2563eb',
                            700: '#1d4ed8',
                            800: '#1e40af',
                            900: '#1e3a8a',
                        },
                        brand: {
                            50: '#f0f9ff',
                            100: '#e0f2fe',
                            200: '#bae6fd',
                            300: '#7dd3fc',
                            400: '#38bdf8',
                            500: '#0ea5e9',
                            600: '#0284c7',
                            700: '#0369a1',
                            800: '#075985',
                            900: '#0c4a6e',
                        }
                    },
                    animation: {
                        'fade-in': 'fadeIn 0.5s ease-in-out',
                        'slide-up': 'slideUp 0.3s ease-out',
                        'scale-in': 'scaleIn 0.2s ease-out',
                        'float': 'float 3s ease-in-out infinite',
                    },
                    keyframes: {
                        fadeIn: {
                            '0%': { opacity: '0' },
                            '100%': { opacity: '1' },
                        },
                        slideUp: {
                            '0%': { transform: 'translateY(10px)', opacity: '0' },
                            '100%': { transform: 'translateY(0)', opacity: '1' },
                        },
                        scaleIn: {
                            '0%': { transform: 'scale(0.95)', opacity: '0' },
                            '100%': { transform: 'scale(1)', opacity: '1' },
                        },
                        float: {
                            '0%, 100%': { transform: 'translateY(0px)' },
                            '50%': { transform: 'translateY(-10px)' },
                        }
                    }
                }
            }
        }
    </script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-brand-50">
    <div class="min-h-screen flex items-center justify-center p-4">
        <div class="w-full max-w-md">
            <!-- Logo e Título -->
            <div class="text-center mb-8">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-brand-500 rounded-2xl mb-4 animate-float">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                </div>
                <h1 class="text-3xl font-bold text-gray-900 mb-2">CRM PMG Premium</h1>
                <p class="text-gray-600">Sistema de Gestão de Relacionamento</p>
            </div>

            <!-- Formulário de Login -->
            <div class="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
                <form id="loginForm" class="space-y-6">
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                                </svg>
                            </div>
                            <input id="email" name="email" type="email" required 
                                class="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="seu@email.com">
                        </div>
                    </div>

                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                </svg>
                            </div>
                            <input id="password" name="password" type="password" required 
                                class="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="••••••••">
                        </div>
                    </div>

                    <div id="message" class="hidden"></div>

                    <button type="submit" id="loginBtn" 
                        class="w-full bg-gradient-to-r from-primary-600 to-brand-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-primary-700 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all transform hover:scale-105">
                        <span id="btnText">Entrar no Sistema</span>
                    </button>

                    <div class="text-center">
                        <button type="button" onclick="quickLogin('admin')" 
                            class="text-sm text-primary-600 hover:text-primary-700 font-medium">
                            Login Rápido como Admin
                        </button>
                    </div>
                </form>

                <!-- Credenciais de Teste -->
                <div class="mt-6 p-4 bg-gray-50 rounded-xl">
                    <h3 class="text-sm font-medium text-gray-700 mb-2">🔐 Credenciais de Teste</h3>
                    <div class="space-y-1 text-xs text-gray-600">
                        <div><strong>Admin:</strong> admin@crmpmg.com / Admin@2024!</div>
                        <div><strong>Usuário:</strong> usuario@crmpmg.com / Usuario@2024!</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const loginBtn = document.getElementById('loginBtn');
            const btnText = document.getElementById('btnText');
            const message = document.getElementById('message');
            
            console.log('Tentando login com:', email);
            
            // Mostrar loading
            loginBtn.disabled = true;
            btnText.textContent = 'Entrando...';
            message.className = 'hidden';
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password }),
                    credentials: 'include'
                });
                
                console.log('Status da resposta:', response.status);
                
                const data = await response.json();
                console.log('Resposta do servidor:', data);
                
                if (response.ok) {
                    message.className = 'block p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg mb-4';
                    message.innerHTML = '✅ Login realizado com sucesso! Redirecionando...';
                    console.log('Login bem-sucedido, redirecionando...');
                    
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 1500);
                } else {
                    message.className = 'block p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-4';
                    message.innerHTML = '❌ ' + data.error;
                    console.error('Erro no login:', data.error);
                }
            } catch (error) {
                console.error('Erro na requisição:', error);
                message.className = 'block p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-4';
                message.innerHTML = '❌ Erro de conexão. Tente novamente.';
            } finally {
                loginBtn.disabled = false;
                btnText.textContent = 'Entrar no Sistema';
            }
        });
        
        function quickLogin(type) {
            if (type === 'admin') {
                document.getElementById('email').value = 'admin@crmpmg.com';
                document.getElementById('password').value = 'Admin@2024!';
                document.getElementById('loginForm').dispatchEvent(new Event('submit'));
            }
        }
    </script>
</body>
</html>
  `);
});

// API de Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    console.log('API Login - Recebido:', { email, password: '***' });
    
    // Validar entrada
    if (!email || !password) {
        console.log('Email ou senha ausentes');
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    
    // Buscar usuário
    const user = users.find(u => u.email === email && u.password === hashPassword(password));
    
    console.log('Usuário encontrado:', user ? 'Sim' : 'Não');
    
    if (!user) {
        console.log('Credenciais inválidas');
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
    
    console.log('Sessão criada:', sessionId);
    console.log('Total de sessões:', sessions.size);
    
    // Definir cookie
    res.cookie('sessionId', sessionId, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        path: '/'
    });
    
    console.log('Cookie definido');
    
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
    
    console.log('Logout - Sessão ID:', sessionId);
    
    if (sessionId) {
        sessions.delete(sessionId);
        res.clearCookie('sessionId', { path: '/' });
        console.log('Sessão removida e cookie limpo');
    }
    
    res.json({ success: true });
});

// Dashboard Premium (protegido)
app.get('/dashboard', requireAuth, (req, res) => {
    const user = req.user;
    console.log('Servindo dashboard premium para:', user.name);
    
    res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - CRM PMG Premium</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: {
                            50: '#eff6ff',
                            100: '#dbeafe',
                            200: '#bfdbfe',
                            300: '#93c5fd',
                            400: '#60a5fa',
                            500: '#3b82f6',
                            600: '#2563eb',
                            700: '#1d4ed8',
                            800: '#1e40af',
                            900: '#1e3a8a',
                        },
                        brand: {
                            50: '#f0f9ff',
                            100: '#e0f2fe',
                            200: '#bae6fd',
                            300: '#7dd3fc',
                            400: '#38bdf8',
                            500: '#0ea5e9',
                            600: '#0284c7',
                            700: '#0369a1',
                            800: '#075985',
                            900: '#0c4a6e',
                        },
                        success: {
                            50: '#f0fdf4',
                            100: '#dcfce7',
                            200: '#bbf7d0',
                            300: '#86efac',
                            400: '#4ade80',
                            500: '#22c55e',
                            600: '#16a34a',
                            700: '#15803d',
                            800: '#166534',
                            900: '#14532d',
                        }
                    },
                    animation: {
                        'fade-in': 'fadeIn 0.5s ease-in-out',
                        'slide-up': 'slideUp 0.3s ease-out',
                        'scale-in': 'scaleIn 0.2s ease-out',
                        'float': 'float 3s ease-in-out infinite',
                        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
                    },
                    keyframes: {
                        fadeIn: {
                            '0%': { opacity: '0' },
                            '100%': { opacity: '1' },
                        },
                        slideUp: {
                            '0%': { transform: 'translateY(10px)', opacity: '0' },
                            '100%': { transform: 'translateY(0)', opacity: '1' },
                        },
                        scaleIn: {
                            '0%': { transform: 'scale(0.95)', opacity: '0' },
                            '100%': { transform: 'scale(1)', opacity: '1' },
                        },
                        float: {
                            '0%, 100%': { transform: 'translateY(0px)' },
                            '50%': { transform: 'translateY(-10px)' },
                        },
                        pulseSoft: {
                            '0%, 100%': { opacity: '1' },
                            '50%': { opacity: '0.8' },
                        }
                    }
                }
            }
        }
    </script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-brand-50">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <div class="flex items-center">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-brand-500 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                        </div>
                        <h1 class="text-xl font-bold text-gray-900">CRM PMG Premium</h1>
                    </div>
                    <div class="ml-8 flex items-center space-x-4">
                        <select class="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <option>Este Mês</option>
                            <option>Esta Semana</option>
                            <option>Hoje</option>
                        </select>
                    </div>
                </div>
                
                <div class="flex items-center space-x-4">
                    <div class="relative">
                        <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        <input type="text" placeholder="Buscar..." class="pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    </div>
                    
                    <button class="p-2 text-neutral-600 hover:text-neutral-900 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                        </svg>
                    </button>
                    
                    <button class="p-2 text-neutral-600 hover:text-neutral-900 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </button>
                    
                    <div class="flex items-center space-x-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl border border-neutral-200/50">
                        <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-brand-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            ${user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <div class="font-medium text-neutral-900">${user.name}</div>
                            <div class="text-xs text-neutral-600">${user.role} - ${user.department}</div>
                        </div>
                        <button onclick="logout()" class="p-1 text-neutral-600 hover:text-danger-600 transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Welcome Section -->
        <div class="mb-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">👋 Bem-vindo, ${user.name}!</h2>
            <p class="text-gray-600">Sistema de Gestão de Relacionamento com Clientes Premium</p>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-neutral-600">Receita Mensal</p>
                        <p class="text-2xl font-bold text-neutral-900 mt-2">R$ 458.290</p>
                        <div class="flex items-center mt-2">
                            <svg class="w-4 h-4 text-success-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                            <span class="text-sm font-medium text-success-600">+12.5%</span>
                        </div>
                    </div>
                    <div class="p-3 bg-success-100 rounded-xl">
                        <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-neutral-600">Novos Clientes</p>
                        <p class="text-2xl font-bold text-neutral-900 mt-2">142</p>
                        <div class="flex items-center mt-2">
                            <svg class="w-4 h-4 text-brand-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                            <span class="text-sm font-medium text-brand-600">+8.2%</span>
                        </div>
                    </div>
                    <div class="p-3 bg-brand-100 rounded-xl">
                        <svg class="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-neutral-600">Taxa de Conversão</p>
                        <p class="text-2xl font-bold text-neutral-900 mt-2">68.4%</p>
                        <div class="flex items-center mt-2">
                            <svg class="w-4 h-4 text-warning-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                            </svg>
                            <span class="text-sm font-medium text-warning-600">-2.1%</span>
                        </div>
                    </div>
                    <div class="p-3 bg-warning-100 rounded-xl">
                        <svg class="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-neutral-600">Atividades Hoje</p>
                        <p class="text-2xl font-bold text-neutral-900 mt-2">28</p>
                        <div class="flex items-center mt-2">
                            <svg class="w-4 h-4 text-primary-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                            <span class="text-sm font-medium text-primary-600">+15.3%</span>
                        </div>
                    </div>
                    <div class="p-3 bg-primary-100 rounded-xl">
                        <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Deals -->
        <div class="bg-white rounded-2xl p-6 shadow-soft">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-lg font-semibold text-neutral-900">📋 Negócios Recentes</h2>
                <div class="flex items-center space-x-2">
                    <button class="px-4 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                        <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 01-.707.293h-2a1 1 0 01-1-1v-2a1 1 0 01.293-.707L6.586 4H4a1 1 0 01-1-1z"></path>
                        </svg>
                        Filtrar
                    </button>
                    <button class="px-4 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                        <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        Exportar
                    </button>
                </div>
            </div>
            
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-neutral-200">
                            <th class="text-left py-3 px-4 font-medium text-neutral-700">Negócio</th>
                            <th class="text-left py-3 px-4 font-medium text-neutral-700">Empresa</th>
                            <th class="text-left py-3 px-4 font-medium text-neutral-700">Valor</th>
                            <th class="text-left py-3 px-4 font-medium text-neutral-700">Estágio</th>
                            <th class="text-left py-3 px-4 font-medium text-neutral-700">Prob.</th>
                            <th class="text-left py-3 px-4 font-medium text-neutral-700">Próxima Ação</th>
                            <th class="text-left py-3 px-4 font-medium text-neutral-700">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                            <td class="py-3 px-4">
                                <div>
                                    <p class="font-medium text-neutral-900">Implementação CRM Enterprise</p>
                                    <p class="text-sm text-neutral-600">ID: #1</p>
                                </div>
                            </td>
                            <td class="py-3 px-4">
                                <p class="text-neutral-900">Tech Solutions Ltda</p>
                            </td>
                            <td class="py-3 px-4">
                                <p class="font-semibold text-neutral-900">R$ 75.000</p>
                            </td>
                            <td class="py-3 px-4">
                                <span class="px-3 py-1 bg-brand-100 text-brand-800 rounded-full text-sm font-medium">
                                    Negociação
                                </span>
                            </td>
                            <td class="py-3 px-4">
                                <div class="flex items-center">
                                    <div class="w-16 bg-neutral-200 rounded-full h-2 mr-2">
                                        <div class="bg-success-500 h-2 rounded-full" style="width: 85%"></div>
                                    </div>
                                    <span class="text-sm text-neutral-600">85%</span>
                                </div>
                            </td>
                            <td class="py-3 px-4">
                                <div>
                                    <p class="text-sm text-neutral-900">Reunião de fechamento</p>
                                    <p class="text-xs text-neutral-600">2024-06-30</p>
                                </div>
                            </td>
                            <td class="py-3 px-4">
                                <div class="flex items-center space-x-2">
                                    <button class="p-1 text-neutral-600 hover:text-primary-600 transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    </button>
                                    <button class="p-1 text-neutral-600 hover:text-primary-600 transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                        </svg>
                                    </button>
                                    <button class="p-1 text-neutral-600 hover:text-danger-600 transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr class="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                            <td class="py-3 px-4">
                                <div>
                                    <p class="font-medium text-neutral-900">E-commerce Pro</p>
                                    <p class="text-sm text-neutral-600">ID: #2</p>
                                </div>
                            </td>
                            <td class="py-3 px-4">
                                <p class="text-neutral-900">Comércio Digital SA</p>
                            </td>
                            <td class="py-3 px-4">
                                <p class="font-semibold text-neutral-900">R$ 45.000</p>
                            </td>
                            <td class="py-3 px-4">
                                <span class="px-3 py-1 bg-warning-100 text-warning-800 rounded-full text-sm font-medium">
                                    Proposta
                                </span>
                            </td>
                            <td class="py-3 px-4">
                                <div class="flex items-center">
                                    <div class="w-16 bg-neutral-200 rounded-full h-2 mr-2">
                                        <div class="bg-success-500 h-2 rounded-full" style="width: 60%"></div>
                                    </div>
                                    <span class="text-sm text-neutral-600">60%</span>
                                </div>
                            </td>
                            <td class="py-3 px-4">
                                <div>
                                    <p class="text-sm text-neutral-900">Follow-up telefônico</p>
                                    <p class="text-xs text-neutral-600">2024-07-15</p>
                                </div>
                            </td>
                            <td class="py-3 px-4">
                                <div class="flex items-center space-x-2">
                                    <button class="p-1 text-neutral-600 hover:text-primary-600 transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    </button>
                                    <button class="p-1 text-neutral-600 hover:text-primary-600 transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                        </svg>
                                    </button>
                                    <button class="p-1 text-neutral-600 hover:text-danger-600 transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Navigation Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div class="bg-gradient-to-br from-primary-500 to-brand-500 rounded-2xl p-6 text-white shadow-medium hover:shadow-lg transition-all cursor-pointer">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold">📋 Pipeline de Vendas</h3>
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                </div>
                <p class="text-white/90 mb-4">Gerencie seu pipeline de vendas com arrastar e soltar</p>
                <button class="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-white font-medium hover:bg-white/30 transition-colors">
                    Acessar Pipeline
                </button>
            </div>

            <div class="bg-gradient-to-br from-success-500 to-emerald-500 rounded-2xl p-6 text-white shadow-medium hover:shadow-lg transition-all cursor-pointer">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold">👥 Gestão de Leads</h3>
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                </div>
                <p class="text-white/90 mb-4">Capture e qualifique leads com scoring inteligente</p>
                <button class="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-white font-medium hover:bg-white/30 transition-colors">
                    Gerenciar Leads
                </button>
            </div>

            <div class="bg-gradient-to-br from-warning-500 to-orange-500 rounded-2xl p-6 text-white shadow-medium hover:shadow-lg transition-all cursor-pointer">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold">📊 Analytics</h3>
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                </div>
                <p class="text-white/90 mb-4">Visualize métricas e KPIs em tempo real</p>
                <button class="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-white font-medium hover:bg-white/30 transition-colors">
                    Ver Analytics
                </button>
            </div>
        </div>
    </main>

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
    console.log('🎉 CRM PMG PREMIUM ESTÁ ONLINE!');
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
    console.log('✅ Sistema Premium com design moderno!');
    console.log('🚀 Acesse e experimente o novo CRM!');
});
