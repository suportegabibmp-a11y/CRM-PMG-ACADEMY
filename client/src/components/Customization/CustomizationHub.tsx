import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings,
  Palette,
  Layout,
  Grid3X3 as Grid,
  Eye,
  Save,
  RefreshCw,
  Download,
  Upload,
  Copy,
  Check,
  X,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  MoreHorizontal,
  MoreVertical,
  HelpCircle,
  Info,
  AlertCircle,
  Zap,
  Target,
  Activity,
  Clock,
  Shield,
  Lock,
  Unlock,
  Globe,
  Database,
  Cloud,
  Wifi,
  Bluetooth,
  Battery,
  Signal,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Camera,
  CameraOff,
  Maximize,
  Minimize,
  PictureInPicture,
  PictureInPicture2,
  Home,
  User,
  Users,
  Building,
  Users as Handshake,
  Calendar,
  Phone,
  Mail,
  DollarSign,
  BarChart,
  PieChart,
  TrendingUp,
  FileText,
  Star,
  Heart,
  ThumbsUp,
  MessageSquare,
  Bell,
  Archive,
  Package,
  ShoppingBag,
  ShoppingCart,
  CreditCard,
  Receipt,
  Calculator,
  TrendingDown,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Tablet,
  Layers,
  Type,
  Move,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react'

// Import the customization components
import FieldEditor from './FieldEditor'
import LayoutEditor from './LayoutEditor'
import ModuleConfigurator from './ModuleConfigurator'
import ThemeCustomizer from './ThemeCustomizer'

type CustomizationTab = 'fields' | 'layout' | 'modules' | 'themes' | 'overview'

interface CustomizationStats {
  totalFields: number
  customFields: number
  totalLayouts: number
  customLayouts: number
  activeModules: number
  totalModules: number
  customThemes: number
  activeTheme: string
}

export default function CustomizationHub() {
  const [activeTab, setActiveTab] = useState<CustomizationTab>('overview')
  const [showPreview, setShowPreview] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Mock stats - in real app, these would come from API
  const [stats, setStats] = useState<CustomizationStats>({
    totalFields: 45,
    customFields: 12,
    totalLayouts: 8,
    customLayouts: 3,
    activeModules: 6,
    totalModules: 8,
    customThemes: 2,
    activeTheme: 'Default Light'
  })

  const tabs = [
    {
      id: 'overview' as CustomizationTab,
      label: 'Visão Geral',
      icon: Grid,
      description: 'Resumo das personalizações'
    },
    {
      id: 'fields' as CustomizationTab,
      label: 'Campos',
      icon: Edit2,
      description: 'Customizar campos do sistema'
    },
    {
      id: 'layout' as CustomizationTab,
      label: 'Layout',
      icon: Layout,
      description: 'Editor visual de layout'
    },
    {
      id: 'modules' as CustomizationTab,
      label: 'Módulos',
      icon: Layers,
      description: 'Configurar módulos e recursos'
    },
    {
      id: 'themes' as CustomizationTab,
      label: 'Temas',
      icon: Palette,
      description: 'Personalizar aparência visual'
    }
  ]

  const recentChanges = [
    {
      id: '1',
      type: 'field',
      action: 'created',
      target: 'Campo "WhatsApp" em Clientes',
      timestamp: '2 horas atrás',
      user: 'João Silva'
    },
    {
      id: '2',
      type: 'layout',
      action: 'modified',
      target: 'Layout do Dashboard',
      timestamp: '5 horas atrás',
      user: 'Maria Santos'
    },
    {
      id: '3',
      type: 'theme',
      action: 'activated',
      target: 'Tema "Blue Corporate"',
      timestamp: '1 dia atrás',
      user: 'Carlos Pereira'
    },
    {
      id: '4',
      type: 'module',
      action: 'disabled',
      target: 'Módulo "Financeiro"',
      timestamp: '2 dias atrás',
      user: 'Ana Oliveira'
    }
  ]

  const quickActions = [
    {
      id: '1',
      title: 'Novo Campo Customizado',
      description: 'Adicionar um novo campo ao sistema',
      icon: Plus,
      action: () => setActiveTab('fields')
    },
    {
      id: '2',
      title: 'Editar Layout do Dashboard',
      description: 'Personalizar o layout principal',
      icon: Layout,
      action: () => setActiveTab('layout')
    },
    {
      id: '3',
      title: 'Criar Novo Tema',
      description: 'Design um tema personalizado',
      icon: Palette,
      action: () => setActiveTab('themes')
    },
    {
      id: '4',
      title: 'Configurar Módulos',
      description: 'Habilitar ou desabilitar recursos',
      icon: Settings,
      action: () => setActiveTab('modules')
    }
  ]

  const StatCard = ({ title, value, subtitle, icon: Icon, color }: {
    title: string
    value: string | number
    subtitle: string
    icon: any
    color: string
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl p-6 shadow-soft hover:shadow-medium transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-neutral-900">{value}</p>
          <p className="text-sm text-neutral-600">{subtitle}</p>
        </div>
      </div>
      <h3 className="font-semibold text-neutral-900">{title}</h3>
    </motion.div>
  )

  const ChangeItem = ({ change }: { change: any }) => {
    const getIcon = (type: string) => {
      switch (type) {
        case 'field': return Edit2
        case 'layout': return Layout
        case 'theme': return Palette
        case 'module': return Layers
        default: return Settings
      }
    }

    const getActionColor = (action: string) => {
      switch (action) {
        case 'created': return 'text-success-600 bg-success-100'
        case 'modified': return 'text-warning-600 bg-warning-100'
        case 'activated': return 'text-primary-600 bg-primary-100'
        case 'disabled': return 'text-danger-600 bg-danger-100'
        default: return 'text-neutral-600 bg-neutral-100'
      }
    }

    const Icon = getIcon(change.type)

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-neutral-50 transition-colors"
      >
        <div className="p-2 bg-neutral-100 rounded-lg">
          <Icon className="w-4 h-4 text-neutral-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-900">{change.target}</p>
          <div className="flex items-center space-x-2 text-xs text-neutral-600">
            <span className={`px-2 py-0.5 rounded-full ${getActionColor(change.action)}`}>
              {change.action === 'created' && 'Criado'}
              {change.action === 'modified' && 'Modificado'}
              {change.action === 'activated' && 'Ativado'}
              {change.action === 'disabled' && 'Desativado'}
            </span>
            <span>•</span>
            <span>{change.timestamp}</span>
            <span>•</span>
            <span>{change.user}</span>
          </div>
        </div>
      </motion.div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Campos Customizados"
                value={stats.customFields}
                subtitle={`de ${stats.totalFields} totais`}
                icon={Edit2}
                color="bg-primary-500"
              />
              <StatCard
                title="Layouts Personalizados"
                value={stats.customLayouts}
                subtitle={`de ${stats.totalLayouts} totais`}
                icon={Layout}
                color="bg-success-500"
              />
              <StatCard
                title="Módulos Ativos"
                value={stats.activeModules}
                subtitle={`de ${stats.totalModules} disponíveis`}
                icon={Layers}
                color="bg-warning-500"
              />
              <StatCard
                title="Temas Customizados"
                value={stats.customThemes}
                subtitle={`Tema atual: ${stats.activeTheme}`}
                icon={Palette}
                color="bg-purple-500"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Ações Rápidas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                  <motion.button
                    key={action.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={action.action}
                    className="p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors text-left"
                  >
                    <action.icon className="w-6 h-6 text-primary-600 mb-2" />
                    <h3 className="font-medium text-neutral-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-neutral-600">{action.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Recent Changes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Alterações Recentes</h2>
                <div className="space-y-2">
                  {recentChanges.map((change) => (
                    <ChangeItem key={change.id} change={change} />
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-soft">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Dicas de Personalização</h2>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Campos Customizados</p>
                        <p className="text-xs text-blue-700">
                          Crie campos específicos para seu negócio como CPF, CNPJ, ou informações customizadas de clientes.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start space-x-2">
                      <Zap className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Layout Inteligente</p>
                        <p className="text-xs text-green-700">
                          Arraste e solte componentes para criar o layout perfeito para sua equipe.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-start space-x-2">
                      <Palette className="w-4 h-4 text-purple-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-purple-900">Temas Personalizados</p>
                        <p className="text-xs text-purple-700">
                          Crie temas que reflitam a identidade visual da sua marca.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'fields':
        return <FieldEditor />

      case 'layout':
        return <LayoutEditor />

      case 'modules':
        return <ModuleConfigurator />

      case 'themes':
        return <ThemeCustomizer />

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-neutral-900">Centro de Personalização</h1>
              <p className="ml-4 text-neutral-600">Configure seu CRM do seu jeito</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                  showPreview 
                    ? 'bg-success-100 text-success-700' 
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? 'Ocultar Preview' : 'Ver Preview'}
              </button>

              <button className="px-4 py-2 bg-gradient-to-r from-primary-600 to-brand-600 text-white rounded-lg text-sm hover:from-primary-700 hover:to-brand-700 transition-all flex items-center shadow-soft">
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </button>

              <button className="px-4 py-2 bg-gradient-to-r from-success-600 to-emerald-600 text-white rounded-lg text-sm hover:from-success-700 hover:to-emerald-700 transition-all flex items-center shadow-soft">
                <RefreshCw className="w-4 h-4 mr-2" />
                Aplicar Tudo
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex bg-neutral-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-neutral-900 shadow-soft'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Preview Panel */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-16 bottom-0 w-96 bg-white shadow-2xl border-l border-neutral-200 z-40"
          >
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-neutral-200">
                <h3 className="font-semibold text-neutral-900">Preview ao Vivo</h3>
                <p className="text-sm text-neutral-600">Veja as alterações em tempo real</p>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <h4 className="font-medium text-neutral-900 mb-2">Exemplo de Card</h4>
                    <div className="bg-white p-3 rounded-lg border border-neutral-200">
                      <p className="text-sm text-neutral-600">Conteúdo de exemplo com as personalizações aplicadas</p>
                    </div>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <h4 className="font-medium text-neutral-900 mb-2">Formulário de Exemplo</h4>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Campo personalizado"
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                      />
                      <button className="w-full px-3 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
                        Botão Personalizado
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
