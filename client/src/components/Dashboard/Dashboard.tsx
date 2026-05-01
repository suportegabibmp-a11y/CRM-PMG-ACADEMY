import React, { useState, useEffect } from 'react';
import { metricsAPI } from '../../services/api';
import { 
  Users, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface DashboardMetrics {
  customers: {
    total: number;
    newThisMonth: number;
  };
  deals: {
    total: number;
    newThisMonth: number;
    wonThisMonth: number;
    conversionRate: number;
  };
  value: {
    totalPipeline: number;
    wonThisMonth: number;
    wonLastMonth: number;
    growth: number;
  };
  activities: {
    completedThisMonth: number;
  };
  comparison: {
    dealsGrowth: number;
  };
}

interface PipelineData {
  stage: string;
  count: number;
  value: number;
}

interface SalesPerformance {
  user: {
    id: string;
    name: string;
    email: string;
  };
  metrics: {
    totalDeals: number;
    wonDeals: number;
    totalValue: number;
    conversionRate: number;
    avgDealValue: number;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [pipeline, setPipeline] = useState<PipelineData[]>([]);
  const [salesPerformance, setSalesPerformance] = useState<SalesPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [metricsRes, pipelineRes, performanceRes] = await Promise.all([
        metricsAPI.getDashboard(),
        metricsAPI.getPipeline(),
        metricsAPI.getSalesPerformance()
      ]);

      setMetrics(metricsRes.data);
      setPipeline(pipelineRes.data);
      setSalesPerformance(performanceRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const pipelineChartData = pipeline.map(item => ({
    name: item.stage.replace('_', ' '),
    value: item.value,
    count: item.count
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button className="btn btn-primary">Novo Relatório</button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{metrics?.customers.total}</p>
              <p className="text-sm text-green-600">+{metrics?.customers.newThisMonth} este mês</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Negócios Fechados</p>
              <p className="text-2xl font-bold text-gray-900">{metrics?.deals.wonThisMonth}</p>
              <p className="text-sm text-green-600">{metrics?.deals.conversionRate}% conversão</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Faturamento Mês</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics?.value.wonThisMonth || 0)}</p>
              <p className={`text-sm ${(metrics?.value.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(metrics?.value.growth || 0) >= 0 ? '+' : ''}{metrics?.value.growth || 0}% vs mês passado
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Atividades Concluídas</p>
              <p className="text-2xl font-bold text-gray-900">{metrics?.activities.completedThisMonth}</p>
              <p className="text-sm text-blue-600">Este mês</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline de Vendas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pipelineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição do Pipeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pipelineChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, count }) => `${name}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {pipelineChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sales Performance Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance da Equipe</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Negócios
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Negócios Ganhos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taxa Conversão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket Médio
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesPerformance.map((sales) => (
                <tr key={sales.user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{sales.user.name}</div>
                      <div className="text-sm text-gray-500">{sales.user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sales.metrics.totalDeals}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sales.metrics.wonDeals}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sales.metrics.conversionRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(sales.metrics.totalValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(sales.metrics.avgDealValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
