import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Users,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Star,
  MessageSquare,
  FileText,
  ChevronDown,
  ChevronRight,
  X,
  Save,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  User,
  Building,
  MapPin,
  Globe,
  Tag,
  Zap,
  Award,
  Activity,
  PhoneCall,
  Video,
  MessageCircle,
  Send,
  Heart,
  Shield,
  Briefcase,
  GraduationCap,
  Code,
  Palette,
  Music,
  Camera,
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Plane,
  Gamepad2,
  Book,
  Dumbbell,
  Stethoscope,
  Wrench,
  Cpu,
  Smartphone,
  Tablet,
  Monitor,
  Headphones,
  Watch,
  Camera as CameraIcon
} from 'lucide-react'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  position?: string
  source: string
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
  score: number
  priority: 'low' | 'medium' | 'high'
  value: number
  assignedTo: string
  tags: string[]
  notes: string
  createdAt: string
  lastActivity: string
  nextFollowUp?: string
  activities: Array<{
    type: string
    description: string
    date: string
    user: string
  }>
  customFields: Record<string, any>
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  socialMedia?: {
    linkedin?: string
    twitter?: string
    facebook?: string
    instagram?: string
  }
  interests: string[]
  budget?: number
  timeline?: string
  decisionMakers?: string[]
  competitors?: string[]
  painPoints: string[]
}

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'João Carlos Silva',
    email: 'joao.silva@techsolutions.com',
    phone: '(11) 98765-4321',
    company: 'Tech Solutions Ltda',
    position: 'CEO',
    source: 'linkedin',
    status: 'qualified',
    score: 85,
    priority: 'high',
    value: 75000,
    assignedTo: 'Maria Santos',
    tags: ['enterprise', 'crm', 'priority'],
    notes: 'Interessado em sistema CRM para equipe de 50 pessoas. Orçamento aprovado.',
    createdAt: '2024-05-01',
    lastActivity: '2024-06-01',
    nextFollowUp: '2024-06-15',
    activities: [
      { type: 'call', description: 'Chamada inicial - qualificação', date: '2024-06-01', user: 'Maria Santos' },
      { type: 'email', description: 'Envio de proposta comercial', date: '2024-05-28', user: 'Maria Santos' },
      { type: 'meeting', description: 'Reunião de apresentação', date: '2024-05-25', user: 'Maria Santos' }
    ],
    customFields: {
      industry: 'Technology',
      employees: '50-100',
      revenue: '5M-10M'
    },
    address: {
      street: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      country: 'Brasil'
    },
    socialMedia: {
      linkedin: 'linkedin.com/in/joaocarlossilva',
      twitter: '@joaocarlos'
    },
    interests: ['CRM', 'Sales Automation', 'Analytics'],
    budget: 75000,
    timeline: 'Q3 2024',
    decisionMakers: ['João Silva', 'Maria Santos (CFO)'],
    competitors: ['Salesforce', 'HubSpot'],
    painPoints: ['Manual data entry', 'No real-time analytics', 'Poor lead tracking']
  },
  {
    id: '2',
    name: 'Maria Fernanda Santos',
    email: 'maria.santos@comerciodigital.com',
    phone: '(11) 91234-5678',
    company: 'Comércio Digital SA',
    position: 'Marketing Director',
    source: 'website',
    status: 'contacted',
    score: 65,
    priority: 'medium',
    value: 45000,
    assignedTo: 'João Silva',
    tags: ['e-commerce', 'marketing', 'medium'],
    notes: 'Busca solução para automação de marketing digital.',
    createdAt: '2024-05-15',
    lastActivity: '2024-06-02',
    nextFollowUp: '2024-06-10',
    activities: [
      { type: 'form', description: 'Preencheu formulário de contato', date: '2024-06-02', user: 'System' },
      { type: 'email', description: 'Email de boas-vindas enviado', date: '2024-06-02', user: 'System' }
    ],
    customFields: {
      industry: 'E-commerce',
      employees: '100-250',
      revenue: '10M-50M'
    },
    interests: ['Email Marketing', 'CRM Integration', 'Customer Analytics'],
    budget: 45000,
    timeline: 'Q4 2024',
    painPoints: ['Low email open rates', 'Poor customer segmentation']
  },
  {
    id: '3',
    name: 'Carlos Alberto Oliveira',
    email: 'carlos.oliveira@servicosonline.com',
    phone: '(11) 92345-6789',
    company: 'Serviços Online ME',
    position: 'Owner',
    source: 'referral',
    status: 'new',
    score: 45,
    priority: 'low',
    value: 38000,
    assignedTo: 'Carlos Oliveira',
    tags: ['consultoria', 'digital', 'low'],
    notes: 'Indicado por cliente atual. Interessado em consultoria digital.',
    createdAt: '2024-05-20',
    lastActivity: '2024-06-03',
    activities: [
      { type: 'referral', description: 'Indicado por João Silva', date: '2024-06-03', user: 'System' }
    ],
    customFields: {
      industry: 'Consulting',
      employees: '1-10',
      revenue: '1M-5M'
    },
    interests: ['Digital Transformation', 'Process Automation'],
    budget: 38000,
    timeline: 'Q2 2024',
    painPoints: ['Manual processes', 'Lack of digital presence']
  }
]

const leadSources = [
  { value: 'website', label: 'Website', icon: Globe },
  { value: 'linkedin', label: 'LinkedIn', icon: Users },
  { value: 'referral', label: 'Indicação', icon: Users },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Telefone', icon: Phone },
  { value: 'social', label: 'Redes Sociais', icon: MessageSquare },
  { value: 'event', label: 'Evento', icon: Calendar },
  { value: 'advertising', label: 'Publicidade', icon: Target },
  { value: 'partner', label: 'Parceiro', icon: Users },
  { value: 'other', label: 'Outro', icon: FileText }
]

const statusColors = {
  new: 'neutral',
  contacted: 'brand',
  qualified: 'warning',
  converted: 'success',
  lost: 'danger'
}

const priorityColors = {
  low: 'success',
  medium: 'warning',
  high: 'danger'
}

export default function LeadsManagement() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterSource, setFilterSource] = useState('all')
  const [filterAssignedTo, setFilterAssignedTo] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)

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

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus
    const matchesPriority = filterPriority === 'all' || lead.priority === filterPriority
    const matchesSource = filterSource === 'all' || lead.source === filterSource
    const matchesAssignedTo = filterAssignedTo === 'all' || lead.assignedTo === filterAssignedTo
    
    return matchesSearch && matchesStatus && matchesPriority && matchesSource && matchesAssignedTo
  }).sort((a, b) => {
    const aValue = a[sortBy as keyof Lead]
    const bValue = b[sortBy as keyof Lead]
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    return 0
  })

  const LeadCard = ({ lead }: { lead: Lead }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5, boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}
      className="bg-white rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 cursor-pointer"
      onClick={() => setSelectedLead(lead)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-brand-500 rounded-full flex items-center justify-center text-white font-bold">
            {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="ml-3">
            <h3 className="font-semibold text-neutral-900">{lead.name}</h3>
            <p className="text-sm text-neutral-600">{lead.company}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 bg-${statusColors[lead.status]}-100 text-${statusColors[lead.status]}-800 rounded-full text-xs font-medium`}>
            {lead.status === 'new' && 'Novo'}
            {lead.status === 'contacted' && 'Contatado'}
            {lead.status === 'qualified' && 'Qualificado'}
            {lead.status === 'converted' && 'Convertido'}
            {lead.status === 'lost' && 'Perdido'}
          </span>
          <span className={`px-2 py-1 bg-${priorityColors[lead.priority]}-100 text-${priorityColors[lead.priority]}-800 rounded-full text-xs font-medium`}>
            {lead.priority === 'high' && 'Alta'}
            {lead.priority === 'medium' && 'Média'}
            {lead.priority === 'low' && 'Baixa'}
          </span>
        </div>
      </div>

      {/* Lead Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-neutral-700">Lead Score</span>
          <span className="text-sm font-bold text-neutral-900">{lead.score}</span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              lead.score >= 80 ? 'bg-success-500' :
              lead.score >= 60 ? 'bg-warning-500' :
              lead.score >= 40 ? 'bg-brand-500' : 'bg-neutral-400'
            }`}
            style={{ width: `${lead.score}%` }}
          />
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-neutral-600">
          <Mail className="w-4 h-4 mr-2" />
          {lead.email}
        </div>
        <div className="flex items-center text-sm text-neutral-600">
          <Phone className="w-4 h-4 mr-2" />
          {lead.phone}
        </div>
        {lead.position && (
          <div className="flex items-center text-sm text-neutral-600">
            <Briefcase className="w-4 h-4 mr-2" />
            {lead.position}
          </div>
        )}
      </div>

      {/* Tags */}
      {lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {lead.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
        <div className="flex items-center text-sm text-neutral-600">
          <DollarSign className="w-4 h-4 mr-1" />
          R$ {lead.value.toLocaleString('pt-BR')}
        </div>
        <div className="flex items-center text-sm text-neutral-600">
          <Users className="w-4 h-4 mr-1" />
          {lead.assignedTo}
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-neutral-900">Gestão de Leads</h1>
              <div className="ml-8 flex items-center space-x-4">
                <div className="flex bg-neutral-100 rounded-lg p-1">
                  {['grid', 'list', 'kanban'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode as any)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        viewMode === mode
                          ? 'bg-white text-neutral-900 shadow-soft'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {mode === 'grid' && 'Grade'}
                      {mode === 'list' && 'Lista'}
                      {mode === 'kanban' && 'Kanban'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Buscar leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-neutral-200 rounded-lg text-sm hover:bg-neutral-50 transition-colors flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </button>
              
              <button className="px-4 py-2 border border-neutral-200 rounded-lg text-sm hover:bg-neutral-50 transition-colors flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
              
              <button className="px-4 py-2 bg-gradient-to-r from-primary-600 to-brand-600 text-white rounded-lg text-sm hover:from-primary-700 hover:to-brand-700 transition-all flex items-center shadow-soft">
                <Plus className="w-4 h-4 mr-2" />
                Novo Lead
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b border-neutral-200"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">Todos</option>
                    <option value="new">Novo</option>
                    <option value="contacted">Contatado</option>
                    <option value="qualified">Qualificado</option>
                    <option value="converted">Convertido</option>
                    <option value="lost">Perdido</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Prioridade</label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">Todas</option>
                    <option value="high">Alta</option>
                    <option value="medium">Média</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Origem</label>
                  <select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">Todas</option>
                    {leadSources.map(source => (
                      <option key={source.value} value={source.value}>{source.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Responsável</label>
                  <select
                    value={filterAssignedTo}
                    onChange={(e) => setFilterAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">Todos</option>
                    <option value="Maria Santos">Maria Santos</option>
                    <option value="João Silva">João Silva</option>
                    <option value="Carlos Oliveira">Carlos Oliveira</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Leads</p>
                <p className="text-2xl font-bold text-neutral-900">{leads.length}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Novos Leads</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {leads.filter(l => l.status === 'new').length}
                </p>
              </div>
              <div className="p-3 bg-brand-100 rounded-lg">
                <Zap className="w-6 h-6 text-brand-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Qualificados</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {leads.filter(l => l.status === 'qualified').length}
                </p>
              </div>
              <div className="p-3 bg-warning-100 rounded-lg">
                <Star className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Valor Total</p>
                <p className="text-2xl font-bold text-neutral-900">
                  R$ {leads.reduce((sum, lead) => sum + lead.value, 0).toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="p-3 bg-success-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {viewMode === 'grid' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredLeads.map(lead => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </motion.div>
        )}

        {viewMode === 'list' && (
          <div className="bg-white rounded-xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-neutral-700">Lead</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-700">Empresa</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-700">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-700">Telefone</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-700">Score</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-700">Valor</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-700">Responsável</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-brand-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3">
                            {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900">{lead.name}</p>
                            <p className="text-sm text-neutral-600">{lead.position}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-neutral-900">{lead.company}</td>
                      <td className="py-3 px-4 text-neutral-600">{lead.email}</td>
                      <td className="py-3 px-4 text-neutral-600">{lead.phone}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 bg-${statusColors[lead.status]}-100 text-${statusColors[lead.status]}-800 rounded-full text-xs font-medium`}>
                          {lead.status === 'new' && 'Novo'}
                          {lead.status === 'contacted' && 'Contatado'}
                          {lead.status === 'qualified' && 'Qualificado'}
                          {lead.status === 'converted' && 'Convertido'}
                          {lead.status === 'lost' && 'Perdido'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-12 bg-neutral-200 rounded-full h-1.5 mr-2">
                            <div 
                              className={`h-1.5 rounded-full ${
                                lead.score >= 80 ? 'bg-success-500' :
                                lead.score >= 60 ? 'bg-warning-500' :
                                lead.score >= 40 ? 'bg-brand-500' : 'bg-neutral-400'
                              }`}
                              style={{ width: `${lead.score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-neutral-900">{lead.score}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-neutral-900">
                        R$ {lead.value.toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-neutral-600">{lead.assignedTo}</td>
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
          </div>
        )}

        {viewMode === 'kanban' && (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Visualização Kanban</h3>
            <p className="text-neutral-600">Visualização Kanban em desenvolvimento</p>
          </div>
        )}
      </main>

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedLead(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-modal max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-neutral-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-brand-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      {selectedLead.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-neutral-900">{selectedLead.name}</h2>
                      <p className="text-neutral-600">{selectedLead.company} • {selectedLead.position}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-600" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Lead Score and Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-neutral-700">Lead Score</label>
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-2xl font-bold text-neutral-900">{selectedLead.score}</span>
                        <span className="text-sm text-neutral-600">/ 100</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            selectedLead.score >= 80 ? 'bg-success-500' :
                            selectedLead.score >= 60 ? 'bg-warning-500' :
                            selectedLead.score >= 40 ? 'bg-brand-500' : 'bg-neutral-400'
                          }`}
                          style={{ width: `${selectedLead.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-neutral-700">Status</label>
                    <div className="mt-2">
                      <span className={`px-3 py-1 bg-${statusColors[selectedLead.status]}-100 text-${statusColors[selectedLead.status]}-800 rounded-full text-sm font-medium`}>
                        {selectedLead.status === 'new' && 'Novo'}
                        {selectedLead.status === 'contacted' && 'Contatado'}
                        {selectedLead.status === 'qualified' && 'Qualificado'}
                        {selectedLead.status === 'converted' && 'Convertido'}
                        {selectedLead.status === 'lost' && 'Perdido'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-neutral-700">Prioridade</label>
                    <div className="mt-2">
                      <span className={`px-3 py-1 bg-${priorityColors[selectedLead.priority]}-100 text-${priorityColors[selectedLead.priority]}-800 rounded-full text-sm font-medium`}>
                        {selectedLead.priority === 'high' && 'Alta'}
                        {selectedLead.priority === 'medium' && 'Média'}
                        {selectedLead.priority === 'low' && 'Baixa'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-neutral-50 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral-900 mb-4">Informações de Contato</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-700">Email</label>
                      <p className="text-neutral-900">{selectedLead.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-700">Telefone</label>
                      <p className="text-neutral-900">{selectedLead.phone}</p>
                    </div>
                    {selectedLead.address && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-neutral-700">Endereço</label>
                          <p className="text-neutral-900">
                            {selectedLead.address.street}, {selectedLead.address.city} - {selectedLead.address.state}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-neutral-700">CEP</label>
                          <p className="text-neutral-900">{selectedLead.address.zipCode}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Business Information */}
                <div className="bg-neutral-50 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral-900 mb-4">Informações Comerciais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-700">Valor Estimado</label>
                      <p className="text-lg font-bold text-neutral-900">
                        R$ {selectedLead.value.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-700">Orçamento</label>
                      <p className="text-neutral-900">
                        {selectedLead.budget ? `R$ ${selectedLead.budget.toLocaleString('pt-BR')}` : 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-700">Timeline</label>
                      <p className="text-neutral-900">{selectedLead.timeline || 'Não informado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-700">Responsável</label>
                      <p className="text-neutral-900">{selectedLead.assignedTo}</p>
                    </div>
                  </div>
                </div>

                {/* Tags and Interests */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h3 className="font-semibold text-neutral-900 mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedLead.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-neutral-200 text-neutral-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h3 className="font-semibold text-neutral-900 mb-4">Interesses</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedLead.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-neutral-50 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral-900 mb-4">Notas</h3>
                  <p className="text-neutral-900">{selectedLead.notes}</p>
                </div>

                {/* Activities */}
                <div className="bg-neutral-50 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral-900 mb-4">Atividades Recentes</h3>
                  <div className="space-y-3">
                    {selectedLead.activities.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                        <div className="p-2 bg-neutral-100 rounded-lg">
                          {activity.type === 'call' && <Phone className="w-4 h-4 text-primary-600" />}
                          {activity.type === 'email' && <Mail className="w-4 h-4 text-success-600" />}
                          {activity.type === 'meeting' && <Calendar className="w-4 h-4 text-warning-600" />}
                          {activity.type === 'form' && <FileText className="w-4 h-4 text-brand-600" />}
                          {activity.type === 'referral' && <Users className="w-4 h-4 text-accent.purple-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-neutral-900">{activity.description}</p>
                          <p className="text-sm text-neutral-600">{activity.date} • {activity.user}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors">
                      <Mail className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors">
                      <Calendar className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-neutral-600 hover:text-danger-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 border border-neutral-200 rounded-lg text-sm hover:bg-neutral-50 transition-colors">
                      Fechar
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-primary-600 to-brand-600 text-white rounded-lg text-sm hover:from-primary-700 hover:to-brand-700 transition-all">
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
