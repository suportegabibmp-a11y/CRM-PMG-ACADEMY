import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import {
  Plus,
  MoreHorizontal,
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
  PieChart
} from 'lucide-react'

interface Deal {
  id: string
  title: string
  company: string
  value: number
  probability: number
  stage: string
  nextAction: string
  dueDate: string
  assignedTo: string
  tags: string[]
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  lastActivity: string
  contacts: Array<{
    name: string
    email: string
    phone: string
  }>
  activities: Array<{
    type: string
    description: string
    date: string
    user: string
  }>
}

interface Stage {
  id: string
  name: string
  color: string
  deals: Deal[]
  probability: number
  value: number
}

const mockDeals: Deal[] = [
  {
    id: '1',
    title: 'Implementação CRM Enterprise',
    company: 'Tech Solutions Ltda',
    value: 75000,
    probability: 85,
    stage: 'negotiation',
    nextAction: 'Reunião de fechamento',
    dueDate: '2024-06-30',
    assignedTo: 'Maria Santos',
    tags: ['enterprise', 'crm', 'priority'],
    priority: 'high',
    createdAt: '2024-05-01',
    lastActivity: '2024-06-01',
    contacts: [
      { name: 'João Silva', email: 'joao@techsolutions.com', phone: '(11) 98765-4321' }
    ],
    activities: [
      { type: 'call', description: 'Discussão sobre proposta', date: '2024-06-01', user: 'Maria Santos' },
      { type: 'email', description: 'Envio de proposta detalhada', date: '2024-05-28', user: 'Maria Santos' }
    ]
  },
  {
    id: '2',
    title: 'E-commerce Pro',
    company: 'Comércio Digital SA',
    value: 45000,
    probability: 60,
    stage: 'proposal',
    nextAction: 'Follow-up telefônico',
    dueDate: '2024-07-15',
    assignedTo: 'João Silva',
    tags: ['e-commerce', 'web', 'medium'],
    priority: 'medium',
    createdAt: '2024-05-15',
    lastActivity: '2024-06-02',
    contacts: [
      { name: 'Maria Fernanda', email: 'maria@comerciodigital.com', phone: '(11) 91234-5678' }
    ],
    activities: [
      { type: 'meeting', description: 'Apresentação do sistema', date: '2024-06-02', user: 'João Silva' }
    ]
  },
  {
    id: '3',
    title: 'Consultoria Digital',
    company: 'Serviços Online ME',
    value: 38000,
    probability: 90,
    stage: 'qualified',
    nextAction: 'Enviar proposta',
    dueDate: '2024-06-15',
    assignedTo: 'Carlos Oliveira',
    tags: ['consultoria', 'digital', 'low'],
    priority: 'low',
    createdAt: '2024-05-20',
    lastActivity: '2024-06-03',
    contacts: [
      { name: 'Carlos Alberto', email: 'carlos@servicosonline.com', phone: '(11) 92345-6789' }
    ],
    activities: [
      { type: 'call', description: 'Qualificação inicial', date: '2024-06-03', user: 'Carlos Oliveira' }
    ]
  }
]

const initialStages: Stage[] = [
  {
    id: 'lead',
    name: 'Lead',
    color: 'neutral',
    deals: mockDeals.filter(deal => deal.stage === 'lead'),
    probability: 10,
    value: 0
  },
  {
    id: 'qualified',
    name: 'Qualificado',
    color: 'brand',
    deals: mockDeals.filter(deal => deal.stage === 'qualified'),
    probability: 25,
    value: 38000
  },
  {
    id: 'proposal',
    name: 'Proposta',
    color: 'warning',
    deals: mockDeals.filter(deal => deal.stage === 'proposal'),
    probability: 50,
    value: 45000
  },
  {
    id: 'negotiation',
    name: 'Negociação',
    color: 'accent.orange',
    deals: mockDeals.filter(deal => deal.stage === 'negotiation'),
    probability: 75,
    value: 75000
  },
  {
    id: 'closed_won',
    name: 'Fechado (Ganho)',
    color: 'success',
    deals: mockDeals.filter(deal => deal.stage === 'closed_won'),
    probability: 100,
    value: 0
  },
  {
    id: 'closed_lost',
    name: 'Fechado (Perdido)',
    color: 'danger',
    deals: mockDeals.filter(deal => deal.stage === 'closed_lost'),
    probability: 0,
    value: 0
  }
]

export default function PipelineKanban() {
  const [stages, setStages] = useState<Stage[]>(initialStages)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStage, setFilterStage] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'analytics'>('kanban')

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination } = result
    const sourceStage = stages.find(stage => stage.id === source.droppableId)
    const destStage = stages.find(stage => stage.id === destination.droppableId)

    if (!sourceStage || !destStage) return

    const [movedDeal] = sourceStage.deals.splice(source.index, 1)
    movedDeal.stage = destStage.id
    destStage.deals.splice(destination.index, 1, movedDeal)

    setStages([...stages])
  }

  const DealCard = ({ deal, index }: { deal: Deal; index: number }) => (
    <Draggable draggableId={deal.id} index={index}>
      {(provided: any, snapshot: any) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-xl p-4 shadow-soft cursor-pointer border-2 ${
            snapshot.isDragging ? 'shadow-medium border-primary-300' : 'border-transparent'
          }`}
          onClick={() => setSelectedDeal(deal)}
        >
          {/* Priority Indicator */}
          <div className={`w-1 h-full absolute left-0 top-0 rounded-l-xl ${
            deal.priority === 'high' ? 'bg-danger-500' :
            deal.priority === 'medium' ? 'bg-warning-500' : 'bg-success-500'
          }`} />

          <div className="ml-2">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-neutral-900 truncate">{deal.title}</h3>
                <p className="text-sm text-neutral-600 truncate">{deal.company}</p>
              </div>
              <button className="p-1 hover:bg-neutral-100 rounded-lg transition-colors">
                <MoreHorizontal className="w-4 h-4 text-neutral-400" />
              </button>
            </div>

            {/* Value and Probability */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-lg font-bold text-neutral-900">
                  R$ {deal.value.toLocaleString('pt-BR')}
                </p>
                <div className="flex items-center">
                  <div className="w-12 bg-neutral-200 rounded-full h-1.5 mr-2">
                    <div 
                      className="bg-success-500 h-1.5 rounded-full"
                      style={{ width: `${deal.probability}%` }}
                    />
                  </div>
                  <span className="text-xs text-neutral-600">{deal.probability}%</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-500">Próxima ação</p>
                <p className="text-sm font-medium text-neutral-900">{deal.nextAction}</p>
              </div>
            </div>

            {/* Tags */}
            {deal.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {deal.tags.map((tag, index) => (
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
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <div className="flex items-center">
                <Users className="w-3 h-3 mr-1" />
                {deal.assignedTo}
              </div>
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {deal.dueDate}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )

  const StageColumn = ({ stage }: { stage: Stage }) => (
    <div className="flex-1 min-w-0 bg-neutral-50 rounded-xl p-4">
      {/* Stage Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full bg-${stage.color}-500 mr-2`} />
          <h3 className="font-semibold text-neutral-900">{stage.name}</h3>
          <span className="ml-2 px-2 py-1 bg-neutral-200 text-neutral-600 rounded-full text-xs">
            {stage.deals.length}
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-500">Valor</p>
          <p className="text-sm font-semibold text-neutral-900">
            R$ {stage.value.toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Deals */}
      <Droppable droppableId={stage.id}>
        {(provided: any, snapshot: any) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[400px] space-y-3 ${
              snapshot.isDraggingOver ? 'bg-neutral-100 rounded-lg' : ''
            }`}
          >
            {stage.deals.map((deal, index) => (
              <DealCard key={deal.id} deal={deal} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add Deal Button */}
      <button className="w-full mt-4 p-3 border-2 border-dashed border-neutral-300 rounded-xl text-neutral-600 hover:border-neutral-400 hover:text-neutral-700 transition-colors flex items-center justify-center">
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Negócio
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-neutral-900">Pipeline de Vendas</h1>
              <div className="ml-8 flex items-center space-x-4">
                <div className="flex bg-neutral-100 rounded-lg p-1">
                  {['kanban', 'list', 'analytics'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode as any)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        viewMode === mode
                          ? 'bg-white text-neutral-900 shadow-soft'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {mode === 'kanban' && 'Kanban'}
                      {mode === 'list' && 'Lista'}
                      {mode === 'analytics' && 'Analytics'}
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
                  placeholder="Buscar negócios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <button className="px-4 py-2 border border-neutral-200 rounded-lg text-sm hover:bg-neutral-50 transition-colors flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filtrar
              </button>
              
              <button className="px-4 py-2 border border-neutral-200 rounded-lg text-sm hover:bg-neutral-50 transition-colors flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
              
              <button className="px-4 py-2 bg-gradient-to-r from-primary-600 to-brand-600 text-white rounded-lg text-sm hover:from-primary-700 hover:to-brand-700 transition-all flex items-center shadow-soft">
                <Plus className="w-4 h-4 mr-2" />
                Novo Negócio
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'kanban' && (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex space-x-6 overflow-x-auto pb-4">
              {stages.map((stage) => (
                <StageColumn key={stage.id} stage={stage} />
              ))}
            </div>
          </DragDropContext>
        )}

        {viewMode === 'list' && (
          <div className="bg-white rounded-xl shadow-soft">
            {/* List view implementation */}
            <div className="p-8 text-center">
              <BarChart3 className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">Visualização em Lista</h3>
              <p className="text-neutral-600">Visualização detalhada em desenvolvimento</p>
            </div>
          </div>
        )}

        {viewMode === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Funil de Vendas</h3>
              <div className="h-64 flex items-center justify-center bg-gradient-to-br from-primary-50 to-brand-50 rounded-xl">
                <PieChart className="w-12 h-12 text-primary-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Métricas do Pipeline</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Taxa de Conversão</span>
                  <span className="font-semibold text-neutral-900">68.4%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Valor Total do Pipeline</span>
                  <span className="font-semibold text-neutral-900">R$ 158.000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Tempo Médio de Ciclo</span>
                  <span className="font-semibold text-neutral-900">45 dias</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Deal Detail Modal */}
      <AnimatePresence>
        {selectedDeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDeal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-neutral-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">{selectedDeal.title}</h2>
                    <p className="text-neutral-600">{selectedDeal.company}</p>
                  </div>
                  <button
                    onClick={() => setSelectedDeal(null)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-600" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Deal Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Valor</label>
                    <p className="text-lg font-bold text-neutral-900">
                      R$ {selectedDeal.value.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Probabilidade</label>
                    <div className="flex items-center">
                      <div className="w-20 bg-neutral-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-success-500 h-2 rounded-full"
                          style={{ width: `${selectedDeal.probability}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-neutral-900">
                        {selectedDeal.probability}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Próxima Ação</label>
                    <p className="text-neutral-900">{selectedDeal.nextAction}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Data Limite</label>
                    <p className="text-neutral-900">{selectedDeal.dueDate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Responsável</label>
                    <p className="text-neutral-900">{selectedDeal.assignedTo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Prioridade</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedDeal.priority === 'high' ? 'bg-danger-100 text-danger-800' :
                      selectedDeal.priority === 'medium' ? 'bg-warning-100 text-warning-800' :
                      'bg-success-100 text-success-800'
                    }`}>
                      {selectedDeal.priority === 'high' ? 'Alta' :
                       selectedDeal.priority === 'medium' ? 'Média' : 'Baixa'}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-sm font-medium text-neutral-700">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedDeal.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contacts */}
                <div>
                  <label className="text-sm font-medium text-neutral-700">Contatos</label>
                  <div className="space-y-3 mt-2">
                    {selectedDeal.contacts.map((contact, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <div>
                          <p className="font-medium text-neutral-900">{contact.name}</p>
                          <div className="flex items-center space-x-4 text-sm text-neutral-600">
                            <span className="flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {contact.email}
                            </span>
                            <span className="flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {contact.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activities */}
                <div>
                  <label className="text-sm font-medium text-neutral-700">Atividades Recentes</label>
                  <div className="space-y-3 mt-2">
                    {selectedDeal.activities.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
                        <div className="p-2 bg-white rounded-lg">
                          {activity.type === 'call' && <Phone className="w-4 h-4 text-primary-600" />}
                          {activity.type === 'email' && <Mail className="w-4 h-4 text-success-600" />}
                          {activity.type === 'meeting' && <Calendar className="w-4 h-4 text-warning-600" />}
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
                      <Eye className="w-4 h-4" />
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
                      Cancelar
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
