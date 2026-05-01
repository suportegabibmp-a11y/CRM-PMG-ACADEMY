import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity,
  Calendar,
  Phone,
  Mail,
  Target,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Search,
  Bell,
  Settings,
  Moon,
  Sun,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'

// Mock data para o dashboard
const metrics = [
  {
    title: "Receita Mensal",
    value: "R$ 458.290",
    change: 12.5,
    icon: DollarSign,
    color: "success",
    trend: "up"
  },
  {
    title: "Novos Clientes",
    value: "142",
    change: 8.2,
    icon: Users,
    color: "brand",
    trend: "up"
  },
  {
    title: "Taxa de Conversão",
    value: "68.4%",
    change: -2.1,
    icon: Target,
    color: "warning",
    trend: "down"
  },
  {
    title: "Atividades Hoje",
    value: "28",
    change: 15.3,
    icon: Activity,
    color: "primary",
    trend: "up"
  }
]

const recentDeals = [
  {
    id: 1,
    title: "Implementação CRM Enterprise",
    company: "Tech Solutions Ltda",
    value: 75000,
    stage: "Negociação",
    probability: 85,
    nextAction: "Reunião de fechamento",
    dueDate: "2024-06-30"
  },
  {
    id: 2,
    title: "E-commerce Pro",
    company: "Comércio Digital SA",
    value: 45000,
    stage: "Proposta",
    probability: 60,
    nextAction: "Follow-up telefônico",
    dueDate: "2024-07-15"
  },
  {
    id: 3,
    title: "Consultoria Digital",
    company: "Serviços Online ME",
    value: 38000,
    stage: "Qualificado",
    probability: 90,
    nextAction: "Enviar proposta",
    dueDate: "2024-06-15"
  }
]

const recentActivities = [
  {
    id: 1,
    type: "call",
    title: "Ligação com João Silva",
    description: "Discussão sobre proposta do CRM Enterprise",
    time: "há 2 horas",
    user: "Maria Santos",
    status: "completed"
  },
  {
    id: 2,
    type: "email",
    title: "Email enviado para Tech Solutions",
    description: "Proposta comercial detalhada",
    time: "há 4 horas",
    user: "João Silva",
    status: "completed"
  },
  {
    id: 3,
    type: "meeting",
    title: "Reunião com Comércio Digital",
    description: "Apresentação do sistema",
    time: "há 6 horas",
    user: "Carlos Oliveira",
    status: "scheduled"
  }
]

const topPerformers = [
  {
    name: "Maria Santos",
    role: "Vendedora Sênior",
    deals: 12,
    revenue: 285000,
    conversion: 78,
    avatar: "MS"
  },
  {
    name: "João Silva",
    role: "Vendedor",
    deals: 8,
    revenue: 195000,
    conversion: 65,
    avatar: "JS"
  },
  {
    name: "Carlos Oliveira",
    role: "Vendedor Júnior",
    deals: 6,
    revenue: 125000,
    conversion: 72,
    avatar: "CO"
  }
]

export default function DashboardPremium() {
  const [darkMode, setDarkMode] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [searchTerm, setSearchTerm] = useState('')

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  const MetricCard = ({ metric, index }: { metric: any, index: number }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-soft hover:shadow-medium transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600">{metric.title}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-2">{metric.value}</p>
          <div className="flex items-center mt-2">
            {metric.trend === 'up' ? (
              <ArrowUp className="w-4 h-4 text-success-600 mr-1" />
            ) : (
              <ArrowDown className="w-4 h-4 text-danger-600 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              metric.trend === 'up' ? 'text-success-600' : 'text-danger-600'
            }`}>
              {metric.change > 0 ? '+' : ''}{metric.change}%
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-xl bg-${metric.color}-100`}>
          <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
        </div>
      </div>
      
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-${metric.color}-50 to-transparent rounded-full -mr-16 -mt-16 opacity-50`} />
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
              <div className="ml-8 flex items-center space-x-4">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="today">Hoje</option>
                  <option value="week">Esta Semana</option>
                  <option value="month">Este Mês</option>
                  <option value="year">Este Ano</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <button className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              
              <button className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <MetricCard key={index} metric={metric} index={index} />
            ))}
          </div>

          {/* Charts and Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Revenue Chart */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-soft"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-neutral-900">Receita Mensal</h2>
                <button className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              
              <div className="h-64 flex items-center justify-center bg-gradient-to-br from-primary-50 to-brand-50 rounded-xl">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                  <p className="text-neutral-600">Gráfico de receita</p>
                  <p className="text-sm text-neutral-500">Visualização de dados em desenvolvimento</p>
                </div>
              </div>
            </motion.div>

            {/* Top Performers */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl p-6 shadow-soft"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-neutral-900">Top Performers</h2>
                <button className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                {topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-brand-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {performer.avatar}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-neutral-900">{performer.name}</p>
                        <p className="text-sm text-neutral-600">{performer.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-neutral-900">{performer.deals} deals</p>
                      <p className="text-sm text-neutral-600">{performer.conversion}% conv.</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent Deals */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl p-6 shadow-soft"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-neutral-900">Negócios Recentes</h2>
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                  <Filter className="w-4 h-4 inline mr-2" />
                  Filtrar
                </button>
                <button className="px-4 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                  <Download className="w-4 h-4 inline mr-2" />
                  Exportar
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 font-medium text-neutral-700">Negócio</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-700">Empresa</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-700">Valor</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-700">Estágio</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-700">Prob.</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-700">Próxima Ação</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDeals.map((deal) => (
                    <tr key={deal.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-neutral-900">{deal.title}</p>
                          <p className="text-sm text-neutral-600">ID: #{deal.id}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-neutral-900">{deal.company}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-neutral-900">R$ {deal.value.toLocaleString('pt-BR')}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 bg-brand-100 text-brand-800 rounded-full text-sm font-medium">
                          {deal.stage}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-16 bg-neutral-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-success-500 h-2 rounded-full"
                              style={{ width: `${deal.probability}%` }}
                            />
                          </div>
                          <span className="text-sm text-neutral-600">{deal.probability}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm text-neutral-900">{deal.nextAction}</p>
                          <p className="text-xs text-neutral-600">{deal.dueDate}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-1 text-neutral-600 hover:text-primary-600 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-neutral-600 hover:text-primary-600 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-neutral-600 hover:text-danger-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Recent Activities */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl p-6 shadow-soft"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-neutral-900">Atividades Recentes</h2>
              <button className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start p-4 rounded-xl hover:bg-neutral-50 transition-colors">
                  <div className={`p-2 rounded-lg mr-4 ${
                    activity.status === 'completed' ? 'bg-success-100' : 'bg-warning-100'
                  }`}>
                    {activity.type === 'call' && <Phone className={`w-4 h-4 ${
                      activity.status === 'completed' ? 'text-success-600' : 'text-warning-600'
                    }`} />}
                    {activity.type === 'email' && <Mail className={`w-4 h-4 ${
                      activity.status === 'completed' ? 'text-success-600' : 'text-warning-600'
                    }`} />}
                    {activity.type === 'meeting' && <Calendar className={`w-4 h-4 ${
                      activity.status === 'completed' ? 'text-success-600' : 'text-warning-600'
                    }`} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-neutral-900">{activity.title}</h3>
                      <span className="text-sm text-neutral-600">{activity.time}</span>
                    </div>
                    <p className="text-sm text-neutral-600 mt-1">{activity.description}</p>
                    <p className="text-xs text-neutral-500 mt-2">Por {activity.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
