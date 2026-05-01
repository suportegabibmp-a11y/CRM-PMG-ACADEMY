import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  GripVertical,
  Grid3X3 as Grid,
  Minus as MinusIcon,
  ToggleLeft as Toggle,
  ArrowUp,
  ArrowDown,
  Settings,
  Layout,
  Grid3X3,
  Columns,
  Square,
  Circle,
  Triangle,
  Type,
  Image,
  Video,
  Music,
  FileText,
  BarChart,
  PieChart,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Tag,
  Star,
  Heart,
  ThumbsUp,
  MessageSquare,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  Copy,
  Clipboard,
  RefreshCw,
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
  VideoOff,
  Camera,
  CameraOff,
  Maximize,
  Minimize,
  Move,
  RotateCw,
  RotateCcw,
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
  Heading3,
  Palette,
  Layers,
  Package,
  Archive,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  MoreVertical,
  Check,
  AlertCircle,
  Info,
  HelpCircle,
  Home,
  User,
  ShoppingCart,
  Package as PackageIcon,
  Truck,
  CreditCard,
  Receipt,
  Calculator,
  TrendingDown,
  ZapOff,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  CloudDrizzle,
  Wind,
  Thermometer,
  Droplet,
  Flame,
  Zap as ZapIcon,
  Radio,
  Smartphone,
  Tablet,
  Monitor,
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
  Factory,
  Store,
  Home as HomeIcon,
  TreePine,
  Trees,
  Flower,
  Leaf,
  Bug,
  Fish,
  Bird as BirdIcon,
  Cat,
  Dog,
  Rabbit,
  Beef,
  Beef as BeefIcon,
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

interface LayoutComponent {
  id: string
  type: 'header' | 'sidebar' | 'main' | 'footer' | 'card' | 'chart' | 'table' | 'form' | 'button' | 'text' | 'image' | 'video' | 'icon' | 'divider' | 'spacer' | 'badge' | 'avatar' | 'progress' | 'toggle' | 'dropdown' | 'modal' | 'tooltip' | 'tabs' | 'accordion' | 'carousel' | 'timeline' | 'kanban' | 'calendar' | 'map' | 'social' | 'notification' | 'search' | 'filter' | 'pagination' | 'breadcrumb' | 'steps' | 'rating' | 'slider' | 'color-picker' | 'date-picker' | 'time-picker' | 'file-upload' | 'code-editor' | 'markdown' | 'rich-text'
  name: string
  label: string
  icon: string
  props: Record<string, any>
  styles: {
    width?: string
    height?: string
    padding?: string
    margin?: string
    marginLeft?: string
    backgroundColor?: string
    color?: string
    border?: string
    borderBottom?: string
    borderRight?: string
    borderRadius?: string
    fontSize?: string
    fontWeight?: string
    textAlign?: 'left' | 'center' | 'right' | 'justify'
    display?: 'block' | 'inline' | 'flex' | 'grid' | 'none'
    position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'
    top?: string
    left?: string
    right?: string
    bottom?: string
    zIndex?: number
    opacity?: number
    transform?: string
    transition?: string
    animation?: string
    boxShadow?: string
    backdropFilter?: string
    cursor?: string
    gap?: string
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'
    justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | 'stretch'
    minHeight?: string
    overflowX?: 'auto' | 'hidden' | 'scroll' | 'visible'
  }
  children?: LayoutComponent[]
  visible: boolean
  locked: boolean
  order: number
  category: 'layout' | 'navigation' | 'content' | 'form' | 'data' | 'media' | 'feedback' | 'social' | 'utility'
  module: 'dashboard' | 'leads' | 'customers' | 'deals' | 'activities' | 'settings' | 'all'
}

interface LayoutTemplate {
  id: string
  name: string
  description: string
  category: 'dashboard' | 'crm' | 'ecommerce' | 'blog' | 'portfolio' | 'landing' | 'admin' | 'custom'
  components: Omit<LayoutComponent, 'id' | 'order'>[]
  preview: string
  tags: string[]
}

const componentTypes = [
  { value: 'header', label: 'Cabeçalho', icon: Layout, category: 'layout' },
  { value: 'sidebar', label: 'Barra Lateral', icon: Layout, category: 'layout' },
  { value: 'main', label: 'Conteúdo Principal', icon: Layout, category: 'layout' },
  { value: 'footer', label: 'Rodapé', icon: Layout, category: 'layout' },
  { value: 'card', label: 'Card', icon: Square, category: 'content' },
  { value: 'chart', label: 'Gráfico', icon: BarChart, category: 'data' },
  { value: 'table', label: 'Tabela', icon: Grid, category: 'data' },
  { value: 'form', label: 'Formulário', icon: FileText, category: 'form' },
  { value: 'button', label: 'Botão', icon: Square, category: 'utility' },
  { value: 'text', label: 'Texto', icon: Type, category: 'content' },
  { value: 'image', label: 'Imagem', icon: Image, category: 'media' },
  { value: 'video', label: 'Vídeo', icon: Video, category: 'media' },
  { value: 'icon', label: 'Ícone', icon: Star, category: 'utility' },
  { value: 'divider', label: 'Divisor', icon: MinusIcon, category: 'layout' },
  { value: 'spacer', label: 'Espaçador', icon: Square, category: 'layout' },
  { value: 'badge', label: 'Badge', icon: Tag, category: 'feedback' },
  { value: 'avatar', label: 'Avatar', icon: User, category: 'content' },
  { value: 'progress', label: 'Progresso', icon: Activity, category: 'feedback' },
  { value: 'toggle', label: 'Toggle', icon: Toggle, category: 'form' },
  { value: 'dropdown', label: 'Dropdown', icon: ChevronDown, category: 'form' },
  { value: 'modal', label: 'Modal', icon: Square, category: 'feedback' },
  { value: 'tooltip', label: 'Tooltip', icon: Info, category: 'feedback' },
  { value: 'tabs', label: 'Abas', icon: Layers, category: 'navigation' },
  { value: 'accordion', label: 'Acordeão', icon: ChevronDown, category: 'content' },
  { value: 'carousel', label: 'Carrossel', icon: RefreshCw, category: 'content' },
  { value: 'timeline', label: 'Timeline', icon: Clock, category: 'content' },
  { value: 'kanban', label: 'Kanban', icon: Grid, category: 'data' },
  { value: 'calendar', label: 'Calendário', icon: Calendar, category: 'form' },
  { value: 'map', label: 'Mapa', icon: MapPin, category: 'content' },
  { value: 'social', label: 'Social', icon: MessageSquare, category: 'social' },
  { value: 'notification', label: 'Notificação', icon: Bell, category: 'feedback' },
  { value: 'search', label: 'Busca', icon: Search, category: 'utility' },
  { value: 'filter', label: 'Filtro', icon: Filter, category: 'utility' },
  { value: 'pagination', label: 'Paginação', icon: ChevronLeft, category: 'utility' },
  { value: 'breadcrumb', label: 'Breadcrumb', icon: ChevronRight, category: 'navigation' },
  { value: 'steps', label: 'Etapas', icon: ChevronRight, category: 'navigation' },
  { value: 'rating', label: 'Avaliação', icon: Star, category: 'form' },
  { value: 'slider', label: 'Slider', icon: Activity, category: 'form' },
  { value: 'color-picker', label: 'Seletor de Cor', icon: Palette, category: 'form' },
  { value: 'date-picker', label: 'Seletor de Data', icon: Calendar, category: 'form' },
  { value: 'time-picker', label: 'Seletor de Hora', icon: Clock, category: 'form' },
  { value: 'file-upload', label: 'Upload de Arquivo', icon: Upload, category: 'form' },
  { value: 'code-editor', label: 'Editor de Código', icon: Code, category: 'content' },
  { value: 'markdown', label: 'Markdown', icon: FileText, category: 'content' },
  { value: 'rich-text', label: 'Texto Rico', icon: FileText, category: 'content' }
]

const layoutTemplates: LayoutTemplate[] = [
  {
    id: 'dashboard-crm',
    name: 'Dashboard CRM',
    description: 'Layout completo para dashboard de CRM',
    category: 'crm',
    components: [
      {
        type: 'header',
        name: 'main-header',
        label: 'Cabeçalho Principal',
        icon: 'Layout',
        props: { title: 'CRM Dashboard', subtitle: 'Bem-vindo ao seu sistema' },
        styles: {
          height: '64px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        },
        visible: true,
        locked: true,
        category: 'layout',
        module: 'dashboard'
      },
      {
        type: 'sidebar',
        name: 'main-sidebar',
        label: 'Barra Lateral',
        icon: 'Layout',
        props: { width: '256px', collapsible: true },
        styles: {
          width: '256px',
          height: '100vh',
          backgroundColor: '#f9fafb',
          borderRight: '1px solid #e5e7eb',
          position: 'fixed',
          left: '0',
          top: '0',
          zIndex: 1000
        },
        visible: true,
        locked: true,
        category: 'layout',
        module: 'dashboard'
      },
      {
        type: 'main',
        name: 'main-content',
        label: 'Conteúdo Principal',
        icon: 'Layout',
        props: { padding: '24px' },
        styles: {
          marginLeft: '256px',
          padding: '24px',
          minHeight: '100vh',
          backgroundColor: '#ffffff'
        },
        visible: true,
        locked: true,
        category: 'layout',
        module: 'dashboard'
      }
    ],
    preview: '/templates/dashboard-crm.png',
    tags: ['dashboard', 'crm', 'admin']
  },
  {
    id: 'kanban-board',
    name: 'Quadro Kanban',
    description: 'Layout para quadro kanban de projetos',
    category: 'crm',
    components: [
      {
        type: 'header',
        name: 'kanban-header',
        label: 'Cabeçalho Kanban',
        icon: 'Layout',
        props: { title: 'Quadro Kanban', subtitle: 'Gerencie suas tarefas' },
        styles: {
          height: '64px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        },
        visible: true,
        locked: true,
        category: 'layout',
        module: 'deals'
      },
      {
        type: 'main',
        name: 'kanban-content',
        label: 'Conteúdo Kanban',
        icon: 'Layout',
        props: { columns: 4 },
        styles: {
          padding: '24px',
          backgroundColor: '#f9fafb',
          display: 'flex',
          gap: '16px',
          overflowX: 'auto'
        },
        visible: true,
        locked: true,
        category: 'layout',
        module: 'deals'
      }
    ],
    preview: '/templates/kanban-board.png',
    tags: ['kanban', 'projects', 'tasks']
  }
]

export default function LayoutEditor() {
  const [components, setComponents] = useState<LayoutComponent[]>([
    {
      id: '1',
      type: 'header',
      name: 'main-header',
      label: 'Cabeçalho Principal',
      icon: 'Layout',
      props: { title: 'CRM PMG Premium', subtitle: 'Sistema de Gestão' },
      styles: {
        height: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      },
      visible: true,
      locked: false,
      order: 1,
      category: 'layout',
      module: 'all'
    },
    {
      id: '2',
      type: 'sidebar',
      name: 'main-sidebar',
      label: 'Barra Lateral',
      icon: 'Layout',
      props: { width: '256px', collapsible: true },
      styles: {
        width: '256px',
        height: '100vh',
        backgroundColor: '#f9fafb',
        borderRight: '1px solid #e5e7eb',
        position: 'fixed',
        left: '0',
        top: '0',
        zIndex: 40
      },
      visible: true,
      locked: false,
      order: 2,
      category: 'layout',
      module: 'all'
    },
    {
      id: '3',
      type: 'main',
      name: 'main-content',
      label: 'Conteúdo Principal',
      icon: 'Layout',
      props: { padding: '24px' },
      styles: {
        marginLeft: '256px',
        padding: '24px',
        minHeight: '100vh',
        backgroundColor: '#ffffff'
      },
      visible: true,
      locked: false,
      order: 3,
      category: 'layout',
      module: 'all'
    },
    {
      id: '4',
      type: 'card',
      name: 'stats-card',
      label: 'Card de Estatísticas',
      icon: 'BarChart',
      props: { title: 'Receita Mensal', value: 'R$ 458.290', change: '+12.5%' },
      styles: {
        width: '300px',
        height: '120px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      },
      visible: true,
      locked: false,
      order: 4,
      category: 'content',
      module: 'dashboard'
    }
  ])

  const [selectedComponent, setSelectedComponent] = useState<LayoutComponent | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'components' | 'templates' | 'preview'>('components')
  const [selectedModule, setSelectedModule] = useState<'dashboard' | 'leads' | 'customers' | 'deals' | 'activities' | 'settings' | 'all'>('all')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'layout' | 'navigation' | 'content' | 'form' | 'data' | 'media' | 'feedback' | 'social' | 'utility'>('all')
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [draggedComponent, setDraggedComponent] = useState<LayoutComponent | null>(null)

  const addComponent = (type: string) => {
    const componentType = componentTypes.find(t => t.value === type)
    const newComponent: LayoutComponent = {
      id: Date.now().toString(),
      type: type as LayoutComponent['type'],
      name: `${type}_${Date.now()}`,
      label: `Novo ${componentType?.label}`,
      icon: typeof componentType?.icon === 'string' ? componentType.icon : 'Square',
      props: {},
      styles: {
        width: 'auto',
        height: 'auto',
        padding: '16px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      },
      visible: true,
      locked: false,
      order: components.length + 1,
      category: componentType?.category as any,
      module: selectedModule
    }

    setComponents([...components, newComponent])
    setSelectedComponent(newComponent)
    setIsEditing(true)
  }

  const updateComponent = (componentId: string, updates: Partial<LayoutComponent>) => {
    setComponents(components.map(component => 
      component.id === componentId ? { ...component, ...updates } : component
    ))
    
    if (selectedComponent?.id === componentId) {
      setSelectedComponent({ ...selectedComponent, ...updates })
    }
  }

  const deleteComponent = (componentId: string) => {
    setComponents(components.filter(component => component.id !== componentId))
    if (selectedComponent?.id === componentId) {
      setSelectedComponent(null)
      setIsEditing(false)
    }
  }

  const moveComponent = (componentId: string, direction: 'up' | 'down') => {
    const componentIndex = components.findIndex(c => c.id === componentId)
    if (componentIndex === -1) return

    const newComponents = [...components]
    const targetIndex = direction === 'up' ? componentIndex - 1 : componentIndex + 1

    if (targetIndex >= 0 && targetIndex < components.length) {
      [newComponents[componentIndex], newComponents[targetIndex]] = [newComponents[targetIndex], newComponents[componentIndex]]
      
      // Update order
      newComponents.forEach((component, index) => {
        component.order = index + 1
      })
      
      setComponents(newComponents)
    }
  }

  const duplicateComponent = (componentId: string) => {
    const component = components.find(c => c.id === componentId)
    if (!component) return

    const duplicatedComponent: LayoutComponent = {
      ...component,
      id: Date.now().toString(),
      name: `${component.name}_copy`,
      label: `${component.label} (Cópia)`,
      order: components.length + 1
    }

    setComponents([...components, duplicatedComponent])
  }

  const applyTemplate = (template: LayoutTemplate) => {
    const newComponents = template.components.map((component, index) => ({
      ...component,
      id: Date.now().toString() + index,
      order: components.length + index + 1
    }))

    setComponents([...components, ...newComponents])
  }

  const filteredComponents = components.filter(component => {
    const moduleMatch = selectedModule === 'all' || component.module === selectedModule || component.module === 'all'
    const categoryMatch = selectedCategory === 'all' || component.category === selectedCategory
    return moduleMatch && categoryMatch
  }).sort((a, b) => a.order - b.order)

  const renderComponent = (component: LayoutComponent) => {
    const ComponentIcon = componentTypes.find(t => t.value === component.type)?.icon || Square

    switch (component.type) {
      case 'header':
        return (
          <div style={component.styles} className="border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">{component.props.title || 'Header'}</h1>
              <p className="text-sm text-gray-600">{component.props.subtitle || 'Subtitle'}</p>
            </div>
          </div>
        )
      case 'sidebar':
        return (
          <div style={component.styles} className="border border-gray-200 rounded-lg">
            <div className="p-4">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-blue-500 rounded"></div>
                <div className="w-8 h-8 bg-green-500 rounded"></div>
                <div className="w-8 h-8 bg-purple-500 rounded"></div>
              </div>
            </div>
          </div>
        )
      case 'main':
        return (
          <div style={component.styles} className="border border-gray-200 rounded-lg">
            <div className="p-4">
              <p className="text-gray-600">Conteúdo Principal</p>
            </div>
          </div>
        )
      case 'card':
        return (
          <div style={component.styles} className="border border-gray-200 rounded-lg">
            <div className="p-4">
              <h3 className="font-semibold">{component.props.title || 'Card Title'}</h3>
              <p className="text-2xl font-bold mt-2">{component.props.value || 'Value'}</p>
              <p className="text-sm text-green-600 mt-1">{component.props.change || '+0%'}</p>
            </div>
          </div>
        )
      case 'chart':
        return (
          <div style={component.styles} className="border border-gray-200 rounded-lg">
            <div className="p-4">
              <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded flex items-center justify-center">
                <ComponentIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        )
      case 'table':
        return (
          <div style={component.styles} className="border border-gray-200 rounded-lg">
            <div className="p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Coluna 1</th>
                    <th className="text-left py-2">Coluna 2</th>
                    <th className="text-left py-2">Coluna 3</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Dado 1</td>
                    <td className="py-2">Dado 2</td>
                    <td className="py-2">Dado 3</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      case 'form':
        return (
          <div style={component.styles} className="border border-gray-200 rounded-lg">
            <div className="p-4 space-y-3">
              <input type="text" placeholder="Campo 1" className="w-full p-2 border rounded" />
              <input type="email" placeholder="Campo 2" className="w-full p-2 border rounded" />
              <button className="w-full p-2 bg-blue-500 text-white rounded">Enviar</button>
            </div>
          </div>
        )
      case 'button':
        return (
          <div style={component.styles} className="border border-gray-200 rounded-lg">
            <button className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600">
              {component.props.label || 'Botão'}
            </button>
          </div>
        )
      case 'text':
        return (
          <div style={component.styles} className="border border-gray-200 rounded-lg">
            <p className="p-4">{component.props.text || 'Texto de exemplo'}</p>
          </div>
        )
      case 'image':
        return (
          <div style={component.styles} className="border border-gray-200 rounded-lg">
            <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
              <Image className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        )
      case 'icon':
        return (
          <div style={component.styles} className="border border-gray-200 rounded-lg flex items-center justify-center">
            <ComponentIcon className="w-8 h-8 text-blue-500" />
          </div>
        )
      default:
        return (
          <div style={component.styles} className="border border-gray-200 rounded-lg">
            <div className="p-4 text-center">
              <ComponentIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">{component.label}</p>
            </div>
          </div>
        )
    }
  }

  const ComponentCard = ({ component }: { component: LayoutComponent }) => {
    const componentType = componentTypes.find(t => t.value === component.type)
    const Icon = componentType?.icon || Square

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className={`bg-white rounded-xl p-4 shadow-soft border-2 transition-all cursor-pointer ${
          selectedComponent?.id === component.id ? 'border-primary-500 shadow-medium' : 'border-transparent'
        }`}
        onClick={() => setSelectedComponent(component)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg mr-3">
              <Icon className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">{component.label}</h3>
              <p className="text-sm text-neutral-600">{componentType?.label}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                moveComponent(component.id, 'up')
              }}
              className="p-1 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                moveComponent(component.id, 'down')
              }}
              className="p-1 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                duplicateComponent(component.id)
              }}
              className="p-1 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                deleteComponent(component.id)
              }}
              className="p-1 text-danger-600 hover:text-danger-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className={`px-2 py-1 rounded-full ${
            component.visible ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-600'
          }`}>
            {component.visible ? 'Visível' : 'Oculto'}
          </span>
          <span className={`px-2 py-1 rounded-full ${
            component.locked ? 'bg-warning-100 text-warning-700' : 'bg-neutral-100 text-neutral-600'
          }`}>
            {component.locked ? 'Bloqueado' : 'Editável'}
          </span>
          <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full">
            {component.category}
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
              <h1 className="text-2xl font-bold text-neutral-900">Editor de Layout</h1>
              <p className="ml-4 text-neutral-600">Personalize a interface do seu CRM</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isPreviewMode 
                    ? 'bg-success-100 text-success-700' 
                    : 'bg-neutral-100 text-neutral-700'
                }`}
              >
                {isPreviewMode ? <Eye className="w-4 h-4 inline mr-2" /> : <EyeOff className="w-4 h-4 inline mr-2" />}
                {isPreviewMode ? 'Modo Visualização' : 'Modo Edição'}
              </button>

              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value as any)}
                className="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todos Módulos</option>
                <option value="dashboard">Dashboard</option>
                <option value="leads">Leads</option>
                <option value="customers">Clientes</option>
                <option value="deals">Negócios</option>
                <option value="activities">Atividades</option>
                <option value="settings">Configurações</option>
              </select>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todas Categorias</option>
                <option value="layout">Layout</option>
                <option value="navigation">Navegação</option>
                <option value="content">Conteúdo</option>
                <option value="form">Formulários</option>
                <option value="data">Dados</option>
                <option value="media">Mídia</option>
                <option value="feedback">Feedback</option>
                <option value="social">Social</option>
                <option value="utility">Utilitários</option>
              </select>

              <button className="px-4 py-2 bg-gradient-to-r from-primary-600 to-brand-600 text-white rounded-lg text-sm hover:from-primary-700 hover:to-brand-700 transition-all flex items-center shadow-soft">
                <Save className="w-4 h-4 mr-2" />
                Salvar Layout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex bg-neutral-100 rounded-lg p-1">
          {['components', 'templates', 'preview'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-neutral-900 shadow-soft'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab === 'components' && 'Componentes'}
              {tab === 'templates' && 'Templates'}
              {tab === 'preview' && 'Visualizar'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'components' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Component Types */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Adicionar Componente</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {componentTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.value}
                        onClick={() => addComponent(type.value)}
                        className="w-full flex items-center p-3 rounded-lg hover:bg-neutral-50 transition-colors text-left"
                      >
                        <div className="p-2 bg-primary-100 rounded-lg mr-3">
                          <Icon className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">{type.label}</p>
                          <p className="text-xs text-neutral-600">{type.category}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Components List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-neutral-900">Componentes Configurados</h2>
                  <span className="text-sm text-neutral-600">{filteredComponents.length} componentes</span>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredComponents.map((component) => (
                    <ComponentCard key={component.id} component={component} />
                  ))}
                </div>
              </div>
            </div>

            {/* Component Editor */}
            <div className="lg:col-span-1">
              {selectedComponent ? (
                <div className="bg-white rounded-xl p-6 shadow-soft">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-neutral-900">Editar Componente</h2>
                    <button
                      onClick={() => {
                        setSelectedComponent(null)
                        setIsEditing(false)
                      }}
                      className="p-1 text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Nome</label>
                      <input
                        type="text"
                        value={selectedComponent.name}
                        onChange={(e) => updateComponent(selectedComponent.id, { name: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Label</label>
                      <input
                        type="text"
                        value={selectedComponent.label}
                        onChange={(e) => updateComponent(selectedComponent.id, { label: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Tipo</label>
                      <select
                        value={selectedComponent.type}
                        onChange={(e) => updateComponent(selectedComponent.id, { type: e.target.value as any })}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {componentTypes.map((type) => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Largura</label>
                        <input
                          type="text"
                          value={selectedComponent.styles.width || ''}
                          onChange={(e) => updateComponent(selectedComponent.id, { 
                            styles: { ...selectedComponent.styles, width: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="auto"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Altura</label>
                        <input
                          type="text"
                          value={selectedComponent.styles.height || ''}
                          onChange={(e) => updateComponent(selectedComponent.id, { 
                            styles: { ...selectedComponent.styles, height: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="auto"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Padding</label>
                        <input
                          type="text"
                          value={selectedComponent.styles.padding || ''}
                          onChange={(e) => updateComponent(selectedComponent.id, { 
                            styles: { ...selectedComponent.styles, padding: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="16px"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Margin</label>
                        <input
                          type="text"
                          value={selectedComponent.styles.margin || ''}
                          onChange={(e) => updateComponent(selectedComponent.id, { 
                            styles: { ...selectedComponent.styles, margin: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Cor de Fundo</label>
                        <input
                          type="color"
                          value={selectedComponent.styles.backgroundColor || '#ffffff'}
                          onChange={(e) => updateComponent(selectedComponent.id, { 
                            styles: { ...selectedComponent.styles, backgroundColor: e.target.value }
                          })}
                          className="w-full h-10 border border-neutral-200 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Cor do Texto</label>
                        <input
                          type="color"
                          value={selectedComponent.styles.color || '#000000'}
                          onChange={(e) => updateComponent(selectedComponent.id, { 
                            styles: { ...selectedComponent.styles, color: e.target.value }
                          })}
                          className="w-full h-10 border border-neutral-200 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Border Radius</label>
                      <input
                        type="text"
                        value={selectedComponent.styles.borderRadius || ''}
                        onChange={(e) => updateComponent(selectedComponent.id, { 
                          styles: { ...selectedComponent.styles, borderRadius: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="8px"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Border</label>
                      <input
                        type="text"
                        value={selectedComponent.styles.border || ''}
                        onChange={(e) => updateComponent(selectedComponent.id, { 
                          styles: { ...selectedComponent.styles, border: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="1px solid #e5e7eb"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedComponent.visible}
                          onChange={(e) => updateComponent(selectedComponent.id, { visible: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm text-neutral-700">Visível</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedComponent.locked}
                          onChange={(e) => updateComponent(selectedComponent.id, { locked: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm text-neutral-700">Bloqueado</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Módulo</label>
                      <select
                        value={selectedComponent.module}
                        onChange={(e) => updateComponent(selectedComponent.id, { module: e.target.value as any })}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="all">Todos</option>
                        <option value="dashboard">Dashboard</option>
                        <option value="leads">Leads</option>
                        <option value="customers">Clientes</option>
                        <option value="deals">Negócios</option>
                        <option value="activities">Atividades</option>
                        <option value="settings">Configurações</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Categoria</label>
                      <select
                        value={selectedComponent.category}
                        onChange={(e) => updateComponent(selectedComponent.id, { category: e.target.value as any })}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="layout">Layout</option>
                        <option value="navigation">Navegação</option>
                        <option value="content">Conteúdo</option>
                        <option value="form">Formulários</option>
                        <option value="data">Dados</option>
                        <option value="media">Mídia</option>
                        <option value="feedback">Feedback</option>
                        <option value="social">Social</option>
                        <option value="utility">Utilitários</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-6 shadow-soft text-center">
                  <Settings className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">Selecione um Componente</h3>
                  <p className="text-neutral-600">Clique em um componente para editar suas propriedades</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {layoutTemplates.map((template) => (
              <div key={template.id} className="bg-white rounded-xl p-6 shadow-soft hover:shadow-medium transition-all">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{template.name}</h3>
                <p className="text-neutral-600 mb-4">{template.description}</p>
                <div className="mb-4">
                  <p className="text-sm font-medium text-neutral-700 mb-2">Componentes incluídos:</p>
                  <div className="flex flex-wrap gap-2">
                    {template.components.map((component, index) => (
                      <span key={index} className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs">
                        {component.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-neutral-700 mb-2">Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-primary-100 text-primary-600 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => applyTemplate(template)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-primary-600 to-brand-600 text-white rounded-lg text-sm hover:from-primary-700 hover:to-brand-700 transition-all"
                >
                  Aplicar Template
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="bg-white rounded-xl p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Visualização do Layout</h2>
            <div className="border-2 border-dashed border-neutral-300 rounded-lg min-h-[600px] p-4">
              <div className="space-y-4">
                {filteredComponents.filter(component => component.visible).map((component) => (
                  <div key={component.id}>
                    {renderComponent(component)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
