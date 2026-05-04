import React, { useState, useEffect } from 'react';
import { Building, Users, DollarSign, TrendingUp, Plus, Edit, Trash2, X } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive';
  createdAt: string;
  totalSpent: number;
}

interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  icon: string;
  color: string;
}

interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
}

export const Dashboard: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([
    { id: '1', name: 'Total de Clientes', value: 0, unit: '', icon: 'users', color: 'blue' },
    { id: '2', name: 'Faturamento Mensal', value: 0, unit: 'R$', icon: 'dollar', color: 'green' },
    { id: '3', name: 'Leads Ativos', value: 0, unit: '', icon: 'trending', color: 'yellow' },
    { id: '4', name: 'Taxa de Conversão', value: 0, unit: '%', icon: 'chart', color: 'purple' }
  ]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingMetric, setEditingMetric] = useState<Metric | null>(null);
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'active',
    totalSpent: 0
  });
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    clientId: '',
    amount: 0,
    dueDate: '',
    status: 'pending',
    description: ''
  });

  // Carregar dados do localStorage
  useEffect(() => {
    const savedClients = localStorage.getItem('crm_clients');
    const savedMetrics = localStorage.getItem('crm_metrics');
    const savedInvoices = localStorage.getItem('crm_invoices');

    if (savedClients) setClients(JSON.parse(savedClients));
    if (savedMetrics) setMetrics(JSON.parse(savedMetrics));
    if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
  }, []);

  // Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem('crm_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('crm_metrics', JSON.stringify(metrics));
  }, [metrics]);

  useEffect(() => {
    localStorage.setItem('crm_invoices', JSON.stringify(invoices));
  }, [invoices]);

  // Atualizar métricas automaticamente
  useEffect(() => {
    const updatedMetrics = metrics.map(metric => {
      if (metric.id === '1') {
        return { ...metric, value: clients.length };
      }
      if (metric.id === '2') {
        const monthlyRevenue = invoices
          .filter(inv => inv.status === 'paid')
          .reduce((sum, inv) => sum + inv.amount, 0);
        return { ...metric, value: monthlyRevenue };
      }
      if (metric.id === '3') {
        return { ...metric, value: clients.filter(c => c.status === 'active').length };
      }
      return metric;
    });
    setMetrics(updatedMetrics);
  }, [clients, invoices]);

  const handleAddClient = () => {
    if (newClient.name && newClient.email) {
      const client: Client = {
        id: Date.now().toString(),
        name: newClient.name || '',
        email: newClient.email || '',
        phone: newClient.phone || '',
        company: newClient.company || '',
        status: newClient.status || 'active',
        createdAt: new Date().toISOString(),
        totalSpent: newClient.totalSpent || 0
      };
      setClients([...clients, client]);
      setNewClient({ name: '', email: '', phone: '', company: '', status: 'active', totalSpent: 0 });
      setShowClientForm(false);
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setNewClient(client);
    setShowClientForm(true);
  };

  const handleUpdateClient = () => {
    if (editingClient && newClient.name && newClient.email) {
      setClients(clients.map(c => c.id === editingClient.id ? { ...c, ...newClient } as Client : c));
      setEditingClient(null);
      setNewClient({ name: '', email: '', phone: '', company: '', status: 'active', totalSpent: 0 });
      setShowClientForm(false);
    }
  };

  const handleDeleteClient = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      setClients(clients.filter(c => c.id !== id));
    }
  };

  const handleAddInvoice = () => {
    if (newInvoice.clientId && newInvoice.amount && newInvoice.dueDate) {
      const client = clients.find(c => c.id === newInvoice.clientId);
      const invoice: Invoice = {
        id: Date.now().toString(),
        clientId: newInvoice.clientId || '',
        clientName: client?.name || '',
        amount: newInvoice.amount || 0,
        dueDate: newInvoice.dueDate || '',
        status: newInvoice.status || 'pending',
        description: newInvoice.description || ''
      };
      setInvoices([...invoices, invoice]);
      setNewInvoice({ clientId: '', amount: 0, dueDate: '', status: 'pending', description: '' });
      setShowInvoiceForm(false);
    }
  };

  const handleUpdateMetric = (metric: Metric) => {
    setMetrics(metrics.map(m => m.id === metric.id ? metric : m));
    setEditingMetric(null);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'users': return <Users className="w-6 h-6" />;
      case 'dollar': return <DollarSign className="w-6 h-6" />;
      case 'trending': return <TrendingUp className="w-6 h-6" />;
      default: return <Building className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard CRM PMG</h1>
          <p className="text-gray-600 mt-2">Gerencie seus clientes e faturamento</p>
        </div>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Sair
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => (
          <div key={metric.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{metric.name}</p>
                <div className="flex items-center mt-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.unit === 'R$' ? metric.unit : ''}{metric.value.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === 'R$' ? '' : metric.unit}
                  </p>
                  <button
                    onClick={() => setEditingMetric(metric)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className={`p-3 bg-${metric.color}-100 rounded-full`}>
                {getIcon(metric.icon)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Edição de Métrica */}
      {editingMetric && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Editar Métrica</h3>
              <button onClick={() => setEditingMetric(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  value={editingMetric.name}
                  onChange={(e) => setEditingMetric({ ...editingMetric, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Valor</label>
                <input
                  type="number"
                  value={editingMetric.value}
                  onChange={(e) => setEditingMetric({ ...editingMetric, value: parseFloat(e.target.value) || 0 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setEditingMetric(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleUpdateMetric(editingMetric)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setShowClientForm(true)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Cliente
        </button>
        <button
          onClick={() => setShowInvoiceForm(true)}
          className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Fatura
        </button>
        <button
          onClick={() => window.location.href = '/vendas'}
          className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Página de Vendas
        </button>
      </div>

      {/* Modal de Cliente */}
      {showClientForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>
              <button onClick={() => {
                setShowClientForm(false);
                setEditingClient(null);
                setNewClient({ name: '', email: '', phone: '', company: '', status: 'active', totalSpent: 0 });
              }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Empresa</label>
                <input
                  type="text"
                  value={newClient.company}
                  onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowClientForm(false);
                    setEditingClient(null);
                    setNewClient({ name: '', email: '', phone: '', company: '', status: 'active', totalSpent: 0 });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={editingClient ? handleUpdateClient : handleAddClient}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingClient ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Fatura */}
      {showInvoiceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Nova Fatura</h3>
              <button onClick={() => {
                setShowInvoiceForm(false);
                setNewInvoice({ clientId: '', amount: 0, dueDate: '', status: 'pending', description: '' });
              }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Cliente</label>
                <select
                  value={newInvoice.clientId}
                  onChange={(e) => setNewInvoice({ ...newInvoice, clientId: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Valor</label>
                <input
                  type="number"
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({ ...newInvoice, amount: parseFloat(e.target.value) || 0 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Vencimento</label>
                <input
                  type="date"
                  value={newInvoice.dueDate}
                  onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  value={newInvoice.description}
                  onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowInvoiceForm(false);
                    setNewInvoice({ clientId: '', amount: 0, dueDate: '', status: 'pending', description: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddInvoice}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Criar Fatura
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Clientes */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Clientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.company}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {client.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditClient(client)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {clients.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum cliente cadastrado ainda
            </div>
          )}
        </div>
      </div>

      {/* Tabela de Faturas */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Faturas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.clientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ {invoice.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.dueDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {invoice.status === 'paid' ? 'Pago' : invoice.status === 'pending' ? 'Pendente' : 'Vencido'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {invoices.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma fatura criada ainda
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
