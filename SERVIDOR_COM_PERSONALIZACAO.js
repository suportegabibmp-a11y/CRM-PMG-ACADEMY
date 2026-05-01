const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Session configuration
app.use(session({
  secret: 'crm-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Mock database data
const users = [
  {
    id: 1,
    email: 'admin@crmpmg.com',
    password: bcrypt.hashSync('Admin@2024!', 10),
    name: 'Administrador',
    role: 'admin'
  },
  {
    id: 2,
    email: 'joao@exemplo.com',
    password: bcrypt.hashSync('123456', 10),
    name: 'João Silva',
    role: 'user'
  }
];

// Mock CRM data
let customers = [
  { id: 1, name: 'Empresa ABC', email: 'contato@abc.com', phone: '(11) 9999-8888', status: 'active', value: 50000 },
  { id: 2, name: 'Comercial XYZ', email: 'vendas@xyz.com.br', phone: '(21) 7777-6666', status: 'lead', value: 25000 },
  { id: 3, name: 'Serviços Tech', email: 'info@tech.com', phone: '(31) 5555-4444', status: 'active', value: 75000 },
  { id: 4, name: 'Distribuidora Central', email: 'contato@central.com', phone: '(41) 3333-2222', status: 'inactive', value: 100000 },
  { id: 5, name: 'Startup Digital', email: 'hello@startup.digital', phone: '(51) 8888-9999', status: 'lead', value: 15000 }
];

let deals = [
  { id: 1, title: 'Projeto ERP', customer: 'Empresa ABC', stage: 'proposal', value: 50000, probability: 70 },
  { id: 2, title: 'Consultoria Marketing', customer: 'Comercial XYZ', stage: 'contact', value: 25000, probability: 30 },
  { id: 3, title: 'Desenvolvimento App', customer: 'Serviços Tech', stage: 'negotiation', value: 75000, probability: 85 },
  { id: 4, title: 'Integração Sistemas', customer: 'Distribuidora Central', stage: 'won', value: 100000, probability: 100 },
  { id: 5, title: 'Site Corporativo', customer: 'Startup Digital', stage: 'lost', value: 15000, probability: 0 }
];

let activities = [
  { id: 1, type: 'call', title: 'Ligação com Empresa ABC', customer: 'Empresa ABC', date: '2024-01-15', completed: true },
  { id: 2, type: 'email', title: 'Enviar proposta para XYZ', customer: 'Comercial XYZ', date: '2024-01-16', completed: false },
  { id: 3, type: 'meeting', title: 'Reunião de alinhamento', customer: 'Serviços Tech', date: '2024-01-17', completed: true },
  { id: 4, type: 'task', title: 'Preparar apresentação', customer: 'Distribuidora Central', date: '2024-01-18', completed: false },
  { id: 5, type: 'call', title: 'Follow-up Startup', customer: 'Startup Digital', date: '2024-01-19', completed: false }
];

// Mock customization data
let customFields = [
  { id: 1, name: 'WhatsApp', type: 'phone', required: false, module: 'customers', category: 'contact' },
  { id: 2, name: 'CNPJ', type: 'text', required: true, module: 'customers', category: 'business' },
  { id: 3, name: 'Origem do Lead', type: 'select', required: false, module: 'customers', category: 'marketing' },
  { id: 4, name: 'Nota Fiscal', type: 'file', required: false, module: 'customers', category: 'document' }
];

let layouts = [
  { id: 1, name: 'Dashboard Padrão', module: 'dashboard', components: ['stats', 'chart', 'recent-deals', 'activities'], active: true },
  { id: 2, name: 'Dashboard Simplificado', module: 'dashboard', components: ['stats', 'recent-deals'], active: false },
  { id: 3, name: 'Layout Clientes', module: 'customers', components: ['list', 'filters', 'search', 'actions'], active: true }
];

let modules = [
  { id: 1, name: 'Clientes', description: 'Gestão de clientes e contatos', category: 'core', enabled: true, features: ['list', 'create', 'edit', 'delete'] },
  { id: 2, name: 'Negócios', description: 'Pipeline de vendas e oportunidades', category: 'sales', enabled: true, features: ['pipeline', 'create', 'edit', 'reports'] },
  { id: 3, name: 'Atividades', description: 'Tarefas e acompanhamento', category: 'productivity', enabled: true, features: ['tasks', 'calendar', 'reminders'] },
  { id: 4, name: 'Relatórios', description: 'Análises e métricas', category: 'analytics', enabled: true, features: ['dashboard', 'charts', 'export'] },
  { id: 5, name: 'Financeiro', description: 'Gestão financeira', category: 'finance', enabled: false, features: ['invoices', 'payments', 'reports'] },
  { id: 6, name: 'Equipes', description: 'Gestão de equipes e permissões', category: 'management', enabled: false, features: ['users', 'roles', 'permissions'] }
];

let themes = [
  { id: 1, name: 'Default Light', category: 'light', colors: { primary: '#3b82f6', secondary: '#6b7280', success: '#10b981', warning: '#f59e0b', danger: '#ef4444' }, active: true },
  { id: 2, name: 'Default Dark', category: 'dark', colors: { primary: '#60a5fa', secondary: '#9ca3af', success: '#34d399', warning: '#fbbf24', danger: '#f87171' }, active: false },
  { id: 3, name: 'Blue Corporate', category: 'custom', colors: { primary: '#1e40af', secondary: '#64748b', success: '#059669', warning: '#d97706', danger: '#dc2626' }, active: false }
];

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

// Routes
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  
  req.session.userId = user.id;
  req.session.userEmail = user.email;
  req.session.userName = user.name;
  req.session.userRole = user.role;
  
  res.json({ 
    success: true, 
    user: { 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role 
    } 
  });
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao fazer logout' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// Check authentication
app.get('/api/auth/check', (req, res) => {
  if (req.session.userId) {
    res.json({
      authenticated: true,
      user: {
        id: req.session.userId,
        email: req.session.userEmail,
        name: req.session.userName,
        role: req.session.userRole
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// CRM API Routes
app.get('/api/customers', (req, res) => {
  res.json(customers);
});

app.post('/api/customers', (req, res) => {
  const newCustomer = {
    id: Math.max(...customers.map(c => c.id), 0) + 1,
    ...req.body
  };
  customers.push(newCustomer);
  res.json(newCustomer);
});

app.put('/api/customers/:id', (req, res) => {
  const index = customers.findIndex(c => c.id == req.params.id);
  if (index !== -1) {
    customers[index] = { ...customers[index], ...req.body };
    res.json(customers[index]);
  } else {
    res.status(404).json({ error: 'Cliente não encontrado' });
  }
});

app.delete('/api/customers/:id', (req, res) => {
  const index = customers.findIndex(c => c.id == req.params.id);
  if (index !== -1) {
    customers.splice(index, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Cliente não encontrado' });
  }
});

app.get('/api/deals', (req, res) => {
  res.json(deals);
});

app.post('/api/deals', (req, res) => {
  const newDeal = {
    id: Math.max(...deals.map(d => d.id), 0) + 1,
    ...req.body
  };
  deals.push(newDeal);
  res.json(newDeal);
});

app.put('/api/deals/:id', (req, res) => {
  const index = deals.findIndex(d => d.id == req.params.id);
  if (index !== -1) {
    deals[index] = { ...deals[index], ...req.body };
    res.json(deals[index]);
  } else {
    res.status(404).json({ error: 'Negócio não encontrado' });
  }
});

app.delete('/api/deals/:id', (req, res) => {
  const index = deals.findIndex(d => d.id == req.params.id);
  if (index !== -1) {
    deals.splice(index, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Negócio não encontrado' });
  }
});

app.get('/api/activities', (req, res) => {
  res.json(activities);
});

app.post('/api/activities', (req, res) => {
  const newActivity = {
    id: Math.max(...activities.map(a => a.id), 0) + 1,
    ...req.body
  };
  activities.push(newActivity);
  res.json(newActivity);
});

app.put('/api/activities/:id', (req, res) => {
  const index = activities.findIndex(a => a.id == req.params.id);
  if (index !== -1) {
    activities[index] = { ...activities[index], ...req.body };
    res.json(activities[index]);
  } else {
    res.status(404).json({ error: 'Atividade não encontrada' });
  }
});

app.delete('/api/activities/:id', (req, res) => {
  const index = activities.findIndex(a => a.id == req.params.id);
  if (index !== -1) {
    activities.splice(index, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Atividade não encontrada' });
  }
});

app.get('/api/metrics', (req, res) => {
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const totalDeals = deals.length;
  const wonDeals = deals.filter(d => d.stage === 'won').length;
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const pipelineValue = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').reduce((sum, deal) => sum + deal.value, 0);
  
  res.json({
    totalCustomers,
    activeCustomers,
    totalDeals,
    wonDeals,
    totalValue,
    pipelineValue,
    conversionRate: totalDeals > 0 ? (wonDeals / totalDeals * 100).toFixed(1) : 0
  });
});

// Customization API Routes
app.get('/api/customization/fields', (req, res) => {
  res.json(customFields);
});

app.get('/api/customization/layouts', (req, res) => {
  res.json(layouts);
});

app.get('/api/customization/modules', (req, res) => {
  res.json(modules);
});

app.get('/api/customization/themes', (req, res) => {
  res.json(themes);
});

app.post('/api/customization/fields', (req, res) => {
  const newField = {
    id: Date.now(),
    ...req.body
  };
  customFields.push(newField);
  res.json(newField);
});

app.put('/api/customization/fields/:id', (req, res) => {
  const index = customFields.findIndex(f => f.id == req.params.id);
  if (index !== -1) {
    customFields[index] = { ...customFields[index], ...req.body };
    res.json(customFields[index]);
  } else {
    res.status(404).json({ error: 'Campo não encontrado' });
  }
});

app.delete('/api/customization/fields/:id', (req, res) => {
  const index = customFields.findIndex(f => f.id == req.params.id);
  if (index !== -1) {
    customFields.splice(index, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Campo não encontrado' });
  }
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'CRM_PERSONALIZACAO_NOVO.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'CRM_PERSONALIZACAO_NOVO.html'));
});

// Protected routes
app.get('/dashboard', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'CRM_PERSONALIZACAO_NOVO.html'));
});

app.get('/customers', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'CRM_PERSONALIZACAO_NOVO.html'));
});

app.get('/deals', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'CRM_PERSONALIZACAO_NOVO.html'));
});

app.get('/activities', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'CRM_PERSONALIZACAO_NOVO.html'));
});

app.get('/customization', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'CRM_PERSONALIZACAO_NOVO.html'));
});

// Sales page
app.get('/vendas', (req, res) => {
  res.sendFile(path.join(__dirname, 'vendas.html'));
});

app.get('/sales', (req, res) => {
  res.sendFile(path.join(__dirname, 'vendas.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor CRM PMG rodando em http://localhost:${PORT}`);
  console.log(`📊 Acesse o dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`⚙️ Centro de personalização: http://localhost:${PORT}/customization`);
  console.log(`� Página de vendas: http://localhost:${PORT}/vendas`);
  console.log(`�👤 Login: admin@crmpmg.com / Admin@2024!`);
  console.log(`🌐 Servidor disponível na rede local!`);
  
  // Get local IP for network access
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  const results = Object.create(null);
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }
  
  console.log('\n📍 IPs para acesso na rede:');
  Object.keys(results).forEach(name => {
    results[name].forEach(ip => {
      console.log(`   http://${ip}:${PORT}`);
    });
  });
});
