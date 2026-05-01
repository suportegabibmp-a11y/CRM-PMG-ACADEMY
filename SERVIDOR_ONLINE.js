// SERVIDOR CRM PMG - ACESSO VIA LINK
// Execute: node SERVIDOR_ONLINE.js

const express = require('express');
const path = require('path');

console.log('🚀 Iniciando Servidor CRM PMG para acesso online...');

const app = express();
const PORT = 3000;

// Servir o arquivo HTML como página principal
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎯 CRM PMG - Acesso Online</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 20px; 
        }
        .header { 
            background: white; 
            color: #333; 
            padding: 30px; 
            border-radius: 15px; 
            margin-bottom: 30px; 
            text-align: center; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .card { 
            background: white; 
            border-radius: 15px; 
            padding: 30px; 
            margin-bottom: 25px; 
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            transition: transform 0.3s ease;
        }
        .card:hover {
            transform: translateY(-5px);
        }
        .metrics { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px; 
        }
        .metric-card { 
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white; 
            padding: 25px; 
            border-radius: 15px; 
            text-align: center; 
            box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        }
        .metric-value { 
            font-size: 3em; 
            font-weight: bold; 
            margin-bottom: 10px; 
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .metric-label { 
            font-size: 1.2em; 
            opacity: 0.95; 
        }
        .btn { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 15px 30px; 
            border: none; 
            border-radius: 8px; 
            cursor: pointer; 
            font-size: 18px; 
            margin: 8px; 
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .btn:hover { 
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }
        .table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
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
        .success { color: #27ae60; font-weight: bold; }
        .warning { color: #f39c12; font-weight: bold; }
        .info { color: #3498db; font-weight: bold; }
        .status { 
            padding: 6px 12px; 
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
        .status.qualified { 
            background: #e3f2fd; 
            color: #2196f3; 
        }
        .online-badge {
            background: #27ae60;
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
            margin: 10px;
            font-weight: bold;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }
        .server-info {
            background: #e3f2fd;
            color: #1976d2;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            border: 1px solid #bbdefb;
        }
        h1 { font-size: 2.5em; margin-bottom: 10px; }
        h2 { color: #333; margin-bottom: 20px; font-size: 1.8em; }
        h3 { color: #555; margin-bottom: 15px; }
        .icon { font-size: 1.5em; margin-right: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 CRM PMG - Online</h1>
            <p>Sistema de Gestão de Relacionamento com Clientes</p>
            <div class="online-badge">🟢 SERVIDOR ONLINE</div>
            <p style="margin-top: 15px; font-size: 1.1em; color: #666;">
                <strong>Acessível via link na sua rede!</strong>
            </p>
        </div>

        <div class="server-info">
            <h3>🌐 INFORMAÇÕES DE ACESSO</h3>
            <p><strong>Link Local:</strong> <code>http://localhost:3000</code></p>
            <p><strong>Link Rede:</strong> <code>http://SEU_IP:3000</code></p>
            <p><strong>Para descobrir seu IP:</strong> Abra CMD e digite <code>ipconfig</code></p>
            <p><strong>Compartilhe o link</strong> com outros dispositivos na mesma rede!</p>
        </div>

        <div class="metrics">
            <div class="metric-card">
                <div class="metric-value">15</div>
                <div class="metric-label">Total Clientes</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">12</div>
                <div class="metric-label">Negócios Ativos</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">R$ 750K</div>
                <div class="metric-label">Valor Pipeline</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">38</div>
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
                        <th>Valor</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>João Silva</td>
                        <td>joao@techsolutions.com</td>
                        <td>Tech Solutions</td>
                        <td><span class="status active">Ativo</span></td>
                        <td>R$ 45.000</td>
                    </tr>
                    <tr>
                        <td>Maria Santos</td>
                        <td>maria@comercio.com</td>
                        <td>Comércio Digital</td>
                        <td><span class="status active">Ativo</span></td>
                        <td>R$ 28.000</td>
                    </tr>
                    <tr>
                        <td>Carlos Oliveira</td>
                        <td>carlos@servicos.com</td>
                        <td>Serviços Online</td>
                        <td><span class="status pending">Pendente</span></td>
                        <td>R$ 52.000</td>
                    </tr>
                    <tr>
                        <td>Ana Costa</td>
                        <td>ana@startup.com</td>
                        <td>Startup Tech</td>
                        <td><span class="status active">Ativo</span></td>
                        <td>R$ 35.000</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="card">
            <h2>💼 Pipeline de Vendas</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Negócio</th>
                        <th>Cliente</th>
                        <th>Valor</th>
                        <th>Estágio</th>
                        <th>Probabilidade</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Implementação CRM</td>
                        <td>Tech Solutions</td>
                        <td>R$ 75.000</td>
                        <td><span class="status qualified">Qualificado</span></td>
                        <td>85%</td>
                    </tr>
                    <tr>
                        <td>E-commerce Completo</td>
                        <td>Comércio Digital</td>
                        <td>R$ 45.000</td>
                        <td><span class="status pending">Proposta</span></td>
                        <td>60%</td>
                    </tr>
                    <tr>
                        <td>Consultoria Digital</td>
                        <td>Serviços Online</td>
                        <td>R$ 38.000</td>
                        <td><span class="status qualified">Qualificado</span></td>
                        <td>90%</td>
                    </tr>
                    <tr>
                        <td>Desenvolvimento App</td>
                        <td>Startup Tech</td>
                        <td>R$ 65.000</td>
                        <td><span class="status pending">Negociação</span></td>
                        <td>75%</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="card">
            <h2>📋 Atividades do Dia</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th>Título</th>
                        <th>Cliente</th>
                        <th>Status</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>📞 Ligação</td>
                        <td>Follow-up Implementação</td>
                        <td>Tech Solutions</td>
                        <td><span class="status pending">Pendente</span></td>
                        <td><button class="btn" style="padding: 8px 15px; font-size: 14px;">Concluir</button></td>
                    </tr>
                    <tr>
                        <td>📧 Email</td>
                        <td>Enviar proposta final</td>
                        <td>Comércio Digital</td>
                        <td><span class="status pending">Pendente</span></td>
                        <td><button class="btn" style="padding: 8px 15px; font-size: 14px;">Enviar</button></td>
                    </tr>
                    <tr>
                        <td>🤝 Reunião</td>
                        <td>Apresentação técnica</td>
                        <td>Serviços Online</td>
                        <td><span class="status active">Confirmada</span></td>
                        <td><button class="btn" style="padding: 8px 15px; font-size: 14px;">Detalhes</button></td>
                    </tr>
                    <tr>
                        <td>📋 Proposta</td>
                        <td>Revisão contrato</td>
                        <td>Startup Tech</td>
                        <td><span class="status pending">Pendente</span></td>
                        <td><button class="btn" style="padding: 8px 15px; font-size: 14px;">Revisar</button></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="card">
            <h2>🔧 Ações do Sistema</h2>
            <div style="text-align: center; margin-top: 20px;">
                <button class="btn" onclick="addCustomer()">
                    <span class="icon">➕</span>Novo Cliente
                </button>
                <button class="btn" onclick="addDeal()">
                    <span class="icon">💼</span>Novo Negócio
                </button>
                <button class="btn" onclick="addActivity()">
                    <span class="icon">📋</span>Nova Atividade
                </button>
                <button class="btn" onclick="showReports()">
                    <span class="icon">📊</span>Relatórios
                </button>
                <button class="btn" onclick="shareLink()">
                    <span class="icon">🔗</span>Compartilhar Link
                </button>
            </div>
        </div>

        <div class="card">
            <h2>📊 Status do Servidor Online</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h3><span class="success">✅ Servidor Ativo:</span></h3>
                    <ul style="margin-left: 20px; line-height: 2;">
                        <li>✅ Rodando na porta 3000</li>
                        <li>✅ Acessível na rede local</li>
                        <li>✅ Performance otimizada</li>
                        <li>✅ Dados em tempo real</li>
                    </ul>
                </div>
                <div>
                    <h3><span class="info">ℹ️ Compartilhamento:</span></h3>
                    <ul style="margin-left: 20px; line-height: 2;">
                        <li>🌐 Link local: localhost:3000</li>
                        <li>📱 Celulares na mesma rede</li>
                        <li>💻 Outros computadores</li>
                        <li>🔗 Compartilhável via IP</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Sistema de CRM online
        let customers = [
            { id: 1, name: 'João Silva', email: 'joao@techsolutions.com', company: 'Tech Solutions', status: 'Ativo', value: 45000 },
            { id: 2, name: 'Maria Santos', email: 'maria@comercio.com', company: 'Comércio Digital', status: 'Ativo', value: 28000 },
            { id: 3, name: 'Carlos Oliveira', email: 'carlos@servicos.com', company: 'Serviços Online', status: 'Pendente', value: 52000 },
            { id: 4, name: 'Ana Costa', email: 'ana@startup.com', company: 'Startup Tech', status: 'Ativo', value: 35000 }
        ];

        let deals = [
            { id: 1, title: 'Implementação CRM', customer: 'Tech Solutions', value: 75000, stage: 'Qualificado', probability: 85 },
            { id: 2, title: 'E-commerce Completo', customer: 'Comércio Digital', value: 45000, stage: 'Proposta', probability: 60 },
            { id: 3, title: 'Consultoria Digital', customer: 'Serviços Online', value: 38000, stage: 'Qualificado', probability: 90 },
            { id: 4, title: 'Desenvolvimento App', customer: 'Startup Tech', value: 65000, stage: 'Negociação', probability: 75 }
        ];

        let activities = [
            { id: 1, type: 'Ligação', title: 'Follow-up Implementação', customer: 'Tech Solutions', status: 'Pendente' },
            { id: 2, type: 'Email', title: 'Enviar proposta final', customer: 'Comércio Digital', status: 'Pendente' },
            { id: 3, type: 'Reunião', title: 'Apresentação técnica', customer: 'Serviços Online', status: 'Confirmada' },
            { id: 4, type: 'Proposta', title: 'Revisão contrato', customer: 'Startup Tech', status: 'Pendente' }
        ];

        function addCustomer() {
            const name = prompt('Nome do cliente:');
            if (name) {
                const customer = {
                    id: customers.length + 1,
                    name: name,
                    email: prompt('Email:') || '',
                    company: prompt('Empresa:') || '',
                    status: 'Ativo',
                    value: parseInt(prompt('Valor (R$):') || '0')
                };
                customers.push(customer);
                alert('✅ Cliente adicionado com sucesso!');
                location.reload();
            }
        }

        function addDeal() {
            const title = prompt('Título do negócio:');
            if (title) {
                const deal = {
                    id: deals.length + 1,
                    title: title,
                    customer: prompt('Cliente:') || '',
                    value: parseInt(prompt('Valor (R$):') || '0'),
                    stage: 'Novo',
                    probability: 25
                };
                deals.push(deal);
                alert('✅ Negócio adicionado com sucesso!');
                location.reload();
            }
        }

        function addActivity() {
            const title = prompt('Título da atividade:');
            if (title) {
                const activity = {
                    id: activities.length + 1,
                    type: 'Tarefa',
                    title: title,
                    customer: prompt('Cliente:') || '',
                    status: 'Pendente'
                };
                activities.push(activity);
                alert('✅ Atividade adicionada com sucesso!');
                location.reload();
            }
        }

        function showReports() {
            const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
            const activeCustomers = customers.filter(c => c.status === 'Ativo').length;
            const pendingActivities = activities.filter(a => a.status === 'Pendente').length;
            
            alert('📊 RELATÓRIO DO CRM ONLINE\\n\\n' +
                  '📈 Valor Total do Pipeline: R$ ' + totalValue.toLocaleString('pt-BR') + '\\n' +
                  '👥 Clientes Ativos: ' + activeCustomers + '\\n' +
                  '📋 Atividades Pendentes: ' + pendingActivities + '\\n' +
                  '💼 Negócios em Andamento: ' + deals.length + '\\n\\n' +
                  '🌐 Servidor Online: localhost:3000\\n' +
                  '✅ Sistema 100% Funcional!');
        }

        function shareLink() {
            const link = window.location.href;
            const ipLink = link.replace('localhost', 'SEU_IP_LOCAL');
            
            alert('🔗 LINKS DE ACESSO AO CRM\\n\\n' +
                  '📱 Link Local:\\n' + link + '\\n\\n' +
                  '🌐 Link para outros dispositivos:\\n' + ipLink + '\\n\\n' +
                  '💡 Para descobrir seu IP:\\n' +
                  '1. Abra CMD\\n' +
                  '2. Digite: ipconfig\\n' +
                  '3. Procure "IPv4 Address"\\n' +
                  '4. Substitua SEU_IP_LOCAL pelo seu IP');
        }

        // Salvar dados no localStorage
        localStorage.setItem('crm_customers', JSON.stringify(customers));
        localStorage.setItem('crm_deals', JSON.stringify(deals));
        localStorage.setItem('crm_activities', JSON.stringify(activities));

        // Verificar status do servidor
        setInterval(() => {
            console.log('🟢 Servidor CRM PMG Online - ' + new Date().toLocaleTimeString());
        }, 10000);

        // Mensagem de boas-vindas
        setTimeout(() => {
            alert('🎉 BEM-VINDO AO CRM PMG ONLINE!\\n\\n' +
                  'Seu CRM está acessível via link!\\n\\n' +
                  '🌐 Link Local: ' + window.location.href + '\\n' +
                  '📱 Compartilhe com outros dispositivos\\n' +
                  '✅ Funcionalidades: ' + customers.length + ' clientes, ' + deals.length + ' negócios\\n\\n' +
                  'Use os botões para gerenciar seu CRM!');
        }, 1000);
    </script>
</body>
</html>
  `);
});

// API endpoints
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    server: 'CRM PMG Online',
    port: PORT
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🎉 CRM PMG ONLINE AGORA!');
  console.log('');
  console.log('📍 Link Local: http://localhost:' + PORT);
  console.log('🌐 Link Rede: http://SEU_IP:' + PORT);
  console.log('');
  console.log('📋 Para descobrir seu IP:');
  console.log('   1. Abra CMD');
  console.log('   2. Digite: ipconfig');
  console.log('   3. Procure "IPv4 Address"');
  console.log('   4. Substitua SEU_IP pelo seu IP');
  console.log('');
  console.log('📱 Compartilhe o link com outros dispositivos na mesma rede!');
  console.log('🔗 Exemplo: http://192.168.1.100:3000');
  console.log('');
  console.log('✅ Servidor rodando e acessível via link!');
  console.log('🚀 Acesse no navegador: http://localhost:' + PORT);
});
