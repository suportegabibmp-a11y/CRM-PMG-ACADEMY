import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  List as ListIcon,
  Grid3X3 as GridIcon,
  Settings,
  ToggleLeft,
  ToggleRight,
  Shield,
  Lock,
  Unlock,
  Users,
  Building,
  Users as HandshakeIcon,
  Calendar,
  Phone,
  Mail,
  DollarSign,
  BarChart,
  PieChart,
  TrendingUp,
  FileText,
  Target,
  Zap,
  Globe,
  Database,
  Cloud,
  Wifi,
  CreditCard,
  Calculator,
  Receipt,
  ShoppingCart,
  Package,
  Truck,
  Factory,
  Store,
  Building as Building2Icon,
  Home,
  TreePine,
  Heart,
  Brain,
  Cpu,
  Code,
  Palette,
  Layout,
  Layers,
  Archive,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
  Star,
  Flag,
  Bookmark,
  Bell,
  Search,
  Filter,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Move,
  Copy,
  Clipboard,
  Trash,
  Edit,
  Save as SaveIcon,
  Settings as SettingsIcon,
  User,
  UserPlus,
  UserMinus,
  Key,
  Fingerprint,
  Mail as MailIcon,
  Phone as PhoneIcon,
  MessageSquare,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Image,
  File,
  Folder,
  FolderOpen,
  HardDrive,
  Server,
  Cloud as CloudIcon,
  Sun,
  Moon,
  Zap as ZapIcon,
  Activity,
  TrendingDown,
  AlertTriangle,
  CheckSquare,
  Square,
  Radio,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Wifi as WifiIcon,
  Bluetooth,
  Battery,
  Signal,
  Globe as GlobeIcon,
  Map,
  MapPin,
  Navigation,
  Compass,
  Route,
  Clock,
  Timer,
  Hourglass,
  Calendar as CalendarIcon,
  CalendarRange,
  Repeat,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Maximize,
  Minimize,
  PictureInPicture,
  PictureInPicture2,
  Monitor,
  Smartphone as SmartphoneIcon,
  Tablet as TabletIcon,
  Watch,
  Headphones,
  Speaker,
  Tv,
  Gamepad2,
  Coffee,
  Pizza,
  Cake,
  Gift,
  Trophy,
  Medal,
  Crown,
  Diamond,
  Gem,
  Coins,
  Banknote,
  Wallet,
  CreditCard as CreditCardIcon,
  Building2,
  Home as HomeIcon,
  TreePine as TreePineIcon,
  Trees,
  Flower,
  Leaf,
  Bug,
  Fish,
  Bird as BirdIcon,
  Egg,
  Milk,
  Sandwich,
  Apple,
  Carrot,
  Grape,
  Pizza as PizzaIcon,
  Sandwich as HamburgerIcon,
  Popcorn,
  IceCream,
  Cookie,
  Candy as CandyIcon,
  Lollipop,
  Candy,
  Cake as CakeIcon
} from 'lucide-react'

interface Module {
  id: string
  name: string
  description: string
  icon: string
  category: 'core' | 'sales' | 'marketing' | 'support' | 'finance' | 'operations' | 'analytics' | 'communication' | 'custom'
  enabled: boolean
  required: boolean
  premium: boolean
  beta: boolean
  features: Feature[]
  permissions: string[]
  dependencies: string[]
  settings: ModuleSettings
  order: number
  createdAt: string
  updatedAt: string
}

interface Feature {
  id: string
  name: string
  description: string
  enabled: boolean
  required: boolean
  settings: Record<string, any>
}

interface ModuleSettings {
  visibility: 'all' | 'admin' | 'manager' | 'user' | 'custom'
  access: 'read' | 'write' | 'admin' | 'custom'
  customization: boolean
  api: boolean
  webhooks: boolean
  integrations: string[]
  notifications: boolean
  automation: boolean
  reporting: boolean
  export: boolean
  import: boolean
}

const defaultModules: Module[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Painel principal com métricas e KPIs',
    icon: 'Layout',
    category: 'core',
    enabled: true,
    required: true,
    premium: false,
    beta: false,
    features: [
      {
        id: 'metrics',
        name: 'Métricas em Tempo Real',
        description: 'Visualização de métricas em tempo real',
        enabled: true,
        required: false,
        settings: { refreshInterval: 30 }
      },
      {
        id: 'charts',
        name: 'Gráficos Interativos',
        description: 'Gráficos e visualizações de dados',
        enabled: true,
        required: false,
        settings: { animations: true, responsive: true }
      },
      {
        id: 'widgets',
        name: 'Widgets Personalizáveis',
        description: 'Widgets arrastáveis e configuráveis',
        enabled: true,
        required: false,
        settings: { dragAndDrop: true, customWidgets: false }
      }
    ],
    permissions: ['read'],
    dependencies: [],
    settings: {
      visibility: 'all',
      access: 'read',
      customization: true,
      api: true,
      webhooks: false,
      integrations: [],
      notifications: true,
      automation: false,
      reporting: true,
      export: true,
      import: false
    },
    order: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'leads',
    name: 'Gestão de Leads',
    description: 'Captura e qualificação de leads',
    icon: 'Users',
    category: 'sales',
    enabled: true,
    required: false,
    premium: false,
    beta: false,
    features: [
      {
        id: 'lead-scoring',
        name: 'Lead Scoring',
        description: 'Sistema de pontuação automática de leads',
        enabled: true,
        required: false,
        settings: { algorithm: 'basic', threshold: 50 }
      },
      {
        id: 'custom-fields',
        name: 'Campos Customizáveis',
        description: 'Campos personalizados para leads',
        enabled: true,
        required: false,
        settings: { maxFields: 20, validation: true }
      },
      {
        id: 'duplicate-detection',
        name: 'Detecção de Duplicados',
        description: 'Identificação automática de leads duplicados',
        enabled: true,
        required: false,
        settings: { sensitivity: 'medium', autoMerge: false }
      }
    ],
    permissions: ['read', 'write'],
    dependencies: ['dashboard'],
    settings: {
      visibility: 'all',
      access: 'write',
      customization: true,
      api: true,
      webhooks: true,
      integrations: ['mailchimp', 'hubspot'],
      notifications: true,
      automation: true,
      reporting: true,
      export: true,
      import: true
    },
    order: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'customers',
    name: 'Gestão de Clientes',
    description: 'Cadastro e gestão de clientes',
    icon: 'Building',
    category: 'core',
    enabled: true,
    required: false,
    premium: false,
    beta: false,
    features: [
      {
        id: 'customer-profile',
        name: 'Perfil Completo',
        description: 'Informações detalhadas dos clientes',
        enabled: true,
        required: false,
        settings: { socialMedia: false, customFields: true }
      },
      {
        id: 'segmentation',
        name: 'Segmentação',
        description: 'Segmentação avançada de clientes',
        enabled: true,
        required: false,
        settings: { dynamicSegments: true, autoUpdate: false }
      },
      {
        id: 'communication-history',
        name: 'Histórico de Comunicação',
        description: 'Registro de todas as interações',
        enabled: true,
        required: false,
        settings: { emailTracking: true, callRecording: false }
      }
    ],
    permissions: ['read', 'write'],
    dependencies: ['dashboard'],
    settings: {
      visibility: 'all',
      access: 'write',
      customization: true,
      api: true,
      webhooks: true,
      integrations: ['salesforce', 'pipedrive'],
      notifications: true,
      automation: true,
      reporting: true,
      export: true,
      import: true
    },
    order: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pipeline',
    name: 'Pipeline de Vendas',
    description: 'Gestão visual do pipeline de vendas',
    icon: 'Target',
    category: 'sales',
    enabled: true,
    required: false,
    premium: false,
    beta: false,
    features: [
      {
        id: 'kanban-board',
        name: 'Quadro Kanban',
        description: 'Visualização kanban do pipeline',
        enabled: true,
        required: false,
        settings: { dragAndDrop: true, swimlanes: false }
      },
      {
        id: 'deal-tracking',
        name: 'Acompanhamento de Negócios',
        description: 'Tracking detalhado de oportunidades',
        enabled: true,
        required: false,
        settings: { probabilityTracking: true, valueTracking: true }
      },
      {
        id: 'forecasting',
        name: 'Previsão de Vendas',
        description: 'Previsões baseadas em histórico',
        enabled: true,
        required: false,
        settings: { algorithm: 'weighted', timeHorizon: 'quarterly' }
      }
    ],
    permissions: ['read', 'write'],
    dependencies: ['leads', 'customers'],
    settings: {
      visibility: 'all',
      access: 'write',
      customization: true,
      api: true,
      webhooks: true,
      integrations: ['hubspot', 'pipedrive'],
      notifications: true,
      automation: true,
      reporting: true,
      export: true,
      import: false
    },
    order: 4,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'activities',
    name: 'Gestão de Atividades',
    description: 'Controle de tarefas e compromissos',
    icon: 'Calendar',
    category: 'operations',
    enabled: true,
    required: false,
    premium: false,
    beta: false,
    features: [
      {
        id: 'task-management',
        name: 'Gerenciamento de Tarefas',
        description: 'Criação e acompanhamento de tarefas',
        enabled: true,
        required: false,
        settings: { subtasks: true, dependencies: false }
      },
      {
        id: 'calendar-integration',
        name: 'Integração com Calendário',
        description: 'Sincronização com calendários externos',
        enabled: true,
        required: false,
        settings: { googleCalendar: true, outlook: false }
      },
      {
        id: 'reminders',
        name: 'Lembretes e Notificações',
        description: 'Sistema de lembretes automáticos',
        enabled: true,
        required: false,
        settings: { emailReminders: true, pushNotifications: true }
      }
    ],
    permissions: ['read', 'write'],
    dependencies: ['dashboard'],
    settings: {
      visibility: 'all',
      access: 'write',
      customization: true,
      api: true,
      webhooks: true,
      integrations: ['google-calendar', 'outlook'],
      notifications: true,
      automation: true,
      reporting: true,
      export: true,
      import: true
    },
    order: 5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'analytics',
    name: 'Analytics e Relatórios',
    description: 'Análises avançadas e relatórios',
    icon: 'BarChart',
    category: 'analytics',
    enabled: true,
    required: false,
    premium: true,
    beta: false,
    features: [
      {
        id: 'custom-reports',
        name: 'Relatórios Customizados',
        description: 'Criação de relatórios personalizados',
        enabled: true,
        required: false,
        settings: { scheduledReports: true, exportFormats: ['pdf', 'excel'] }
      },
      {
        id: 'advanced-analytics',
        name: 'Análises Avançadas',
        description: 'Análises preditivas e machine learning',
        enabled: true,
        required: false,
        settings: { predictiveModels: true, anomalyDetection: false }
      },
      {
        id: 'real-time-dashboard',
        name: 'Dashboard em Tempo Real',
        description: 'Atualizações em tempo real',
        enabled: true,
        required: false,
        settings: { websocket: true, refreshInterval: 5 }
      }
    ],
    permissions: ['read', 'write'],
    dependencies: ['dashboard', 'leads', 'customers', 'pipeline'],
    settings: {
      visibility: 'manager',
      access: 'read',
      customization: true,
      api: true,
      webhooks: true,
      integrations: ['tableau', 'powerbi'],
      notifications: true,
      automation: false,
      reporting: true,
      export: true,
      import: false
    },
    order: 6,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'automation',
    name: 'Automação e Workflows',
    description: 'Automação de processos e workflows',
    icon: 'Zap',
    category: 'operations',
    enabled: false,
    required: false,
    premium: true,
    beta: true,
    features: [
      {
        id: 'workflow-builder',
        name: 'Construtor de Workflows',
        description: 'Editor visual de workflows',
        enabled: true,
        required: false,
        settings: { dragAndDrop: true, conditionalLogic: true }
      },
      {
        id: 'trigger-actions',
        name: 'Gatilhos e Ações',
        description: 'Configuração de gatilhos e ações',
        enabled: true,
        required: false,
        settings: { webhooks: true, scheduledTriggers: true }
      },
      {
        id: 'ai-automation',
        name: 'Automação com IA',
        description: 'Automação inteligente com machine learning',
        enabled: true,
        required: false,
        settings: { nlpProcessing: true, predictiveActions: false }
      }
    ],
    permissions: ['read', 'write', 'admin'],
    dependencies: ['dashboard', 'leads', 'customers', 'pipeline'],
    settings: {
      visibility: 'admin',
      access: 'admin',
      customization: true,
      api: true,
      webhooks: true,
      integrations: ['zapier', 'integromat'],
      notifications: true,
      automation: true,
      reporting: true,
      export: true,
      import: true
    },
    order: 7,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'finance',
    name: 'Financeiro',
    description: 'Gestão financeira e faturamento',
    icon: 'DollarSign',
    category: 'finance',
    enabled: false,
    required: false,
    premium: true,
    beta: false,
    features: [
      {
        id: 'invoicing',
        name: 'Faturamento',
        description: 'Criação e gestão de faturas',
        enabled: true,
        required: false,
        settings: { recurringInvoices: true, taxCalculation: true }
      },
      {
        id: 'payment-processing',
        name: 'Processamento de Pagamentos',
        description: 'Integração com gateways de pagamento',
        enabled: true,
        required: false,
        settings: { stripe: true, paypal: false }
      },
      {
        id: 'financial-reports',
        name: 'Relatórios Financeiros',
        description: 'Relatórios financeiros detalhados',
        enabled: true,
        required: false,
        settings: { cashFlow: true, profitLoss: true }
      }
    ],
    permissions: ['read', 'write', 'admin'],
    dependencies: ['dashboard', 'customers'],
    settings: {
      visibility: 'admin',
      access: 'admin',
      customization: false,
      api: true,
      webhooks: true,
      integrations: ['stripe', 'quickbooks'],
      notifications: true,
      automation: true,
      reporting: true,
      export: true,
      import: true
    },
    order: 8,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'communication',
    name: 'Comunicação',
    description: 'Comunicação integrada com clientes',
    icon: 'MessageSquare',
    category: 'communication',
    enabled: false,
    required: false,
    premium: true,
    beta: false,
    features: [
      {
        id: 'email-marketing',
        name: 'Email Marketing',
        description: 'Campanhas de email marketing',
        enabled: true,
        required: false,
        settings: { templates: true, automation: true }
      },
      {
        id: 'whatsapp-integration',
        name: 'Integração WhatsApp',
        description: 'Comunicação via WhatsApp',
        enabled: true,
        required: false,
        settings: { businessApi: true, qrCode: true }
      },
      {
        id: 'sms-marketing',
        name: 'SMS Marketing',
        description: 'Campanhas de SMS',
        enabled: true,
        required: false,
        settings: { twilio: true, scheduling: true }
      }
    ],
    permissions: ['read', 'write'],
    dependencies: ['leads', 'customers'],
    settings: {
      visibility: 'all',
      access: 'write',
      customization: true,
      api: true,
      webhooks: true,
      integrations: ['mailchimp', 'twilio'],
      notifications: true,
      automation: true,
      reporting: true,
      export: true,
      import: false
    },
    order: 9,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'team',
    name: 'Gestão de Equipe',
    description: 'Gestão de equipe e permissões',
    icon: 'Users',
    category: 'core',
    enabled: true,
    required: false,
    premium: false,
    beta: false,
    features: [
      {
        id: 'user-management',
        name: 'Gestão de Usuários',
        description: 'Cadastro e gestão de usuários',
        enabled: true,
        required: false,
        settings: { ldap: false, sso: false }
      },
      {
        id: 'rbac',
        name: 'RBAC (Role-Based Access Control)',
        description: 'Controle de acesso baseado em funções',
        enabled: true,
        required: false,
        settings: { customRoles: true, permissions: true }
      },
      {
        id: 'team-performance',
        name: 'Performance da Equipe',
        description: 'Métricas de performance da equipe',
        enabled: true,
        required: false,
        settings: { leaderboards: true, kpis: true }
      }
    ],
    permissions: ['read', 'write', 'admin'],
    dependencies: ['dashboard'],
    settings: {
      visibility: 'admin',
      access: 'admin',
      customization: true,
      api: true,
      webhooks: false,
      integrations: [],
      notifications: true,
      automation: false,
      reporting: true,
      export: true,
      import: true
    },
    order: 10,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

const moduleCategories = [
  { value: 'core', label: 'Core', icon: Layout, description: 'Módulos essenciais do sistema' },
  { value: 'sales', label: 'Vendas', icon: HandshakeIcon, description: 'Módulos de vendas e negócios' },
  { value: 'marketing', label: 'Marketing', icon: Target, description: 'Módulos de marketing e comunicação' },
  { value: 'support', label: 'Suporte', icon: MessageSquare, description: 'Módulos de suporte ao cliente' },
  { value: 'finance', label: 'Financeiro', icon: DollarSign, description: 'Módulos financeiros' },
  { value: 'operations', label: 'Operações', icon: Settings, description: 'Módulos operacionais' },
  { value: 'analytics', label: 'Analytics', icon: BarChart, description: 'Módulos de análise e relatórios' },
  { value: 'communication', label: 'Comunicação', icon: MessageSquare, description: 'Módulos de comunicação' },
  { value: 'custom', label: 'Custom', icon: Edit2, description: 'Módulos personalizados' }
]

export default function ModuleConfigurator() {
  const [modules, setModules] = useState<Module[]>(defaultModules)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'features' | 'settings'>('modules')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showOnlyEnabled, setShowOnlyEnabled] = useState(false)

  const toggleModule = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId)
    if (module?.required) return

    setModules(modules.map(m => 
      m.id === moduleId ? { ...m, enabled: !m.enabled } : m
    ))
  }

  const toggleFeature = (moduleId: string, featureId: string) => {
    setModules(modules.map(module => {
      if (module.id === moduleId) {
        return {
          ...module,
          features: module.features.map(feature =>
            feature.id === featureId ? { ...feature, enabled: !feature.enabled } : feature
          )
        }
      }
      return module
    }))
  }

  const updateModuleSettings = (moduleId: string, settings: Partial<ModuleSettings>) => {
    setModules(modules.map(module =>
      module.id === moduleId 
        ? { ...module, settings: { ...module.settings, ...settings }, updatedAt: new Date().toISOString() }
        : module
    ))
  }

  const filteredModules = modules.filter(module => {
    const categoryMatch = selectedCategory === 'all' || module.category === selectedCategory
    const enabledMatch = !showOnlyEnabled || module.enabled
    return categoryMatch && enabledMatch
  }).sort((a, b) => a.order - b.order)

  const getModuleIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      'Layout': Layout,
      'Users': Users,
      'Building2': Building2,
      'Target': Target,
      'Calendar': Calendar,
      'BarChart': BarChart,
      'Zap': Zap,
      'DollarSign': DollarSign,
      'MessageSquare': MessageSquare,
      'Settings': Settings,
      'Edit2': Edit2
    }
    return iconMap[iconName] || Layout
  }

  const ModuleCard = ({ module }: { module: Module }) => {
    const Icon = getModuleIcon(module.icon)
    const enabledCount = module.features.filter(f => f.enabled).length
    const totalCount = module.features.length

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className={`bg-white rounded-xl p-6 shadow-soft hover:shadow-medium transition-all cursor-pointer ${
          selectedModule?.id === module.id ? 'border-2 border-primary-500' : 'border-2 border-transparent'
        }`}
        onClick={() => setSelectedModule(module)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg mr-4 ${
              module.enabled ? 'bg-primary-100' : 'bg-neutral-100'
            }`}>
              <Icon className={`w-6 h-6 ${
                module.enabled ? 'text-primary-600' : 'text-neutral-600'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">{module.name}</h3>
              <p className="text-sm text-neutral-600">{module.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {module.premium && (
              <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full">
                PREMIUM
              </span>
            )}
            {module.beta && (
              <span className="px-2 py-1 bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xs font-bold rounded-full">
                BETA
              </span>
            )}
            {module.required && (
              <span className="px-2 py-1 bg-neutral-800 text-white text-xs font-bold rounded-full">
                OBRIGATÓRIO
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleModule(module.id)
              }}
              disabled={module.required}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                module.enabled ? 'bg-primary-600' : 'bg-neutral-200'
              } ${module.required ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  module.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="ml-3 text-sm font-medium text-neutral-700">
              {module.enabled ? 'Ativado' : 'Desativado'}
            </span>
          </div>
          <div className="text-sm text-neutral-600">
            {enabledCount}/{totalCount} recursos
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {module.features.slice(0, 3).map((feature) => (
            <span
              key={feature.id}
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                feature.enabled 
                  ? 'bg-success-100 text-success-700' 
                  : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              {feature.name}
            </span>
          ))}
          {module.features.length > 3 && (
            <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs">
              +{module.features.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-600">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Shield className="w-3 h-3 mr-1" />
              {module.permissions.join(', ')}
            </span>
            <span className="flex items-center">
              <Database className="w-3 h-3 mr-1" />
              {module.dependencies.length > 0 ? module.dependencies.join(', ') : 'Nenhuma'}
            </span>
          </div>
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {new Date(module.updatedAt).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-neutral-900">Configurador de Módulos</h1>
              <p className="ml-4 text-neutral-600">Personalize os módulos e funcionalidades do CRM</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowOnlyEnabled(!showOnlyEnabled)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showOnlyEnabled 
                    ? 'bg-success-100 text-success-700' 
                    : 'bg-neutral-100 text-neutral-700'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-2" />
                {showOnlyEnabled ? 'Apenas Ativados' : 'Todos'}
              </button>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todas Categorias</option>
                {moduleCategories.map((category) => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>

              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="px-4 py-2 border border-neutral-200 rounded-lg text-sm hover:bg-neutral-50 transition-colors"
              >
                {viewMode === 'grid' ? <ListIcon className="w-4 h-4 inline mr-2" /> : <GridIcon className="w-4 h-4 inline mr-2" />}
                {viewMode === 'grid' ? 'Lista' : 'Grade'}
              </button>

              <button className="px-4 py-2 bg-gradient-to-r from-primary-600 to-brand-600 text-white rounded-lg text-sm hover:from-primary-700 hover:to-brand-700 transition-all flex items-center shadow-soft">
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex bg-neutral-100 rounded-lg p-1">
          {['overview', 'modules', 'features', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-neutral-900 shadow-soft'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab === 'overview' && 'Visão Geral'}
              {tab === 'modules' && 'Módulos'}
              {tab === 'features' && 'Recursos'}
              {tab === 'settings' && 'Configurações'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'modules' && (
          <div>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Total de Módulos</p>
                    <p className="text-2xl font-bold text-neutral-900 mt-2">{modules.length}</p>
                  </div>
                  <div className="p-3 bg-primary-100 rounded-xl">
                    <Package className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Módulos Ativos</p>
                    <p className="text-2xl font-bold text-neutral-900 mt-2">
                      {modules.filter(m => m.enabled).length}
                    </p>
                  </div>
                  <div className="p-3 bg-success-100 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-success-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Módulos Premium</p>
                    <p className="text-2xl font-bold text-neutral-900 mt-2">
                      {modules.filter(m => m.premium).length}
                    </p>
                  </div>
                  <div className="p-3 bg-warning-100 rounded-xl">
                    <Crown className="w-6 h-6 text-warning-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Módulos Beta</p>
                    <p className="text-2xl font-bold text-neutral-900 mt-2">
                      {modules.filter(m => m.beta).length}
                    </p>
                  </div>
                  <div className="p-3 bg-accent.purple-100 rounded-xl">
                    <Zap className="w-6 h-6 text-accent.purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Module Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredModules.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Visão Geral dos Módulos</h2>
              <div className="space-y-4">
                {moduleCategories.map((category) => {
                  const categoryModules = modules.filter(m => m.category === category.value)
                  const Icon = category.icon
                  return (
                    <div key={category.value} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-2 bg-white rounded-lg mr-3">
                          <Icon className="w-5 h-5 text-neutral-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-neutral-900">{category.label}</h3>
                          <p className="text-sm text-neutral-600">{category.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-neutral-900">{categoryModules.length}</p>
                        <p className="text-xs text-neutral-600">
                          {categoryModules.filter(m => m.enabled).length} ativos
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Status do Sistema</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-success-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-success-600 mr-3" />
                    <span className="font-medium text-success-900">Sistema Operacional</span>
                  </div>
                  <span className="text-sm text-success-700">100% funcional</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-warning-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-warning-600 mr-3" />
                    <span className="font-medium text-warning-900">Módulos Premium</span>
                  </div>
                  <span className="text-sm text-warning-700">
                    {modules.filter(m => m.premium && m.enabled).length}/{modules.filter(m => m.premium).length} ativos
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-info-50 rounded-lg">
                  <div className="flex items-center">
                    <Info className="w-5 h-5 text-info-600 mr-3" />
                    <span className="font-medium text-info-900">Módulos Beta</span>
                  </div>
                  <span className="text-sm text-info-700">
                    {modules.filter(m => m.beta && m.enabled).length}/{modules.filter(m => m.beta).length} ativos
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'features' && selectedModule && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Recursos do Módulo: {selectedModule.name}
                  </h2>
                  <button
                    onClick={() => setSelectedModule(null)}
                    className="p-1 text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {selectedModule.features.map((feature) => (
                    <div key={feature.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleFeature(selectedModule.id, feature.id)}
                          disabled={feature.required}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors mr-3 ${
                            feature.enabled ? 'bg-success-600' : 'bg-neutral-200'
                          } ${feature.required ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              feature.enabled ? 'translate-x-5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                        <div>
                          <h3 className="font-medium text-neutral-900">{feature.name}</h3>
                          <p className="text-sm text-neutral-600">{feature.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {feature.required && (
                          <span className="px-2 py-1 bg-neutral-800 text-white text-xs font-bold rounded-full">
                            OBRIGATÓRIO
                          </span>
                        )}
                        <button className="p-1 text-neutral-600 hover:text-neutral-900 transition-colors">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Estatísticas do Módulo</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-700">Recursos Ativados</p>
                    <div className="mt-2">
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div 
                          className="bg-success-500 h-2 rounded-full"
                          style={{ 
                            width: `${(selectedModule.features.filter(f => f.enabled).length / selectedModule.features.length) * 100}%` 
                          }}
                        />
                      </div>
                      <p className="text-sm text-neutral-600 mt-1">
                        {selectedModule.features.filter(f => f.enabled).length} de {selectedModule.features.length}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-neutral-700">Categoria</p>
                    <p className="text-neutral-900 mt-1">
                      {moduleCategories.find(c => c.value === selectedModule.category)?.label}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-neutral-700">Permissões</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedModule.permissions.map((permission) => (
                        <span key={permission} className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs">
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-neutral-700">Dependências</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedModule.dependencies.length > 0 ? (
                        selectedModule.dependencies.map((dep) => (
                          <span key={dep} className="px-2 py-1 bg-warning-100 text-warning-700 rounded-full text-xs">
                            {dep}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-neutral-600">Nenhuma dependência</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-neutral-900 mb-6">Configurações Globais</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-md font-medium text-neutral-900 mb-4">Configurações do Sistema</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Modo de Manutenção</label>
                    <select className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option>Desativado</option>
                      <option>Ativado - Somente Leitura</option>
                      <option>Ativado - Completo</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Nível de Log</label>
                    <select className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option>Error</option>
                      <option>Warning</option>
                      <option>Info</option>
                      <option>Debug</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Cache</label>
                    <select className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option>Desativado</option>
                  </select>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-neutral-900 mb-4">Configurações de Segurança</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Política de Senhas</label>
                    <select className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option>Básica</option>
                      <option>Média</option>
                      <option>Forte</option>
                      <option>Muito Forte</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Autenticação em Dois Fatores</label>
                    <select className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option>Desativado</option>
                      <option>Opcional</option>
                      <option>Obrigatório para Admin</option>
                      <option>Obrigatório para Todos</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Sessão Expira em</label>
                    <select className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option>30 minutos</option>
                      <option>1 hora</option>
                      <option>4 horas</option>
                      <option>8 horas</option>
                      <option>24 horas</option>
                      <option>7 dias</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button className="px-6 py-2 bg-gradient-to-r from-primary-600 to-brand-600 text-white rounded-lg text-sm hover:from-primary-700 hover:to-brand-700 transition-all">
                Salvar Configurações Globais
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
