import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Users,
  Phone,
  Calendar,
  BarChart3,
  Settings,
  FileText,
  Mail,
  MessageSquare,
  Target,
  TrendingUp,
  DollarSign,
  Briefcase,
  Clock,
  Star,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Zap,
  Shield,
  Globe,
  Cpu,
  Database,
  Cloud,
  Lock,
  CreditCard,
  HelpCircle,
  BookOpen,
  MessageCircle,
  Palette,
  Layout,
  Layers,
  Package,
  Archive,
  Trash2,
  Edit3,
  Eye,
  Download,
  Upload,
  Filter,
  ChevronLeft,
  ChevronUp
} from 'lucide-react'

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  href?: string
  badge?: number
  children?: NavItem[]
  isActive?: boolean
}

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard'
  },
  {
    id: 'sales',
    label: 'Vendas',
    icon: Briefcase,
    children: [
      {
        id: 'leads',
        label: 'Leads',
        icon: Users,
        href: '/leads',
        badge: 12
      },
      {
        id: 'deals',
        label: 'Negócios',
        icon: Briefcase,
        href: '/deals',
        badge: 8
      },
      {
        id: 'pipeline',
        label: 'Pipeline',
        icon: Target,
        href: '/pipeline'
      }
    ]
  },
  {
    id: 'customers',
    label: 'Clientes',
    icon: Users,
    children: [
      {
        id: 'all-customers',
        label: 'Todos Clientes',
        icon: Users,
        href: '/customers'
      },
      {
        id: 'segments',
        label: 'Segmentos',
        icon: Layers,
        href: '/segments'
      },
      {
        id: 'companies',
        label: 'Empresas',
        icon: Globe,
        href: '/companies'
      }
    ]
  },
  {
    id: 'activities',
    label: 'Atividades',
    icon: Calendar,
    children: [
      {
        id: 'tasks',
        label: 'Tarefas',
        icon: Clock,
        href: '/tasks',
        badge: 5
      },
      {
        id: 'events',
        label: 'Eventos',
        icon: Calendar,
        href: '/events'
      },
      {
        id: 'calls',
        label: 'Ligações',
        icon: Phone,
        href: '/calls'
      },
      {
        id: 'emails',
        label: 'Emails',
        icon: Mail,
        href: '/emails'
      }
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    children: [
      {
        id: 'reports',
        label: 'Relatórios',
        icon: FileText,
        href: '/reports'
      },
      {
        id: 'metrics',
        label: 'Métricas',
        icon: TrendingUp,
        href: '/metrics'
      },
      {
        id: 'forecasts',
        label: 'Previsões',
        icon: Target,
        href: '/forecasts'
      }
    ]
  },
  {
    id: 'communication',
    label: 'Comunicação',
    icon: MessageSquare,
    children: [
      {
        id: 'whatsapp',
        label: 'WhatsApp',
        icon: MessageSquare,
        href: '/whatsapp'
      },
      {
        id: 'chat',
        label: 'Chat Interno',
        icon: MessageCircle,
        href: '/chat'
      },
      {
        id: 'notifications',
        label: 'Notificações',
        icon: Bell,
        href: '/notifications',
        badge: 3
      }
    ]
  },
  {
    id: 'automation',
    label: 'Automação',
    icon: Zap,
    children: [
      {
        id: 'workflows',
        label: 'Workflows',
        icon: Cpu,
        href: '/workflows'
      },
      {
        id: 'rules',
        label: 'Regras',
        icon: Shield,
        href: '/rules'
      },
      {
        id: 'integrations',
        label: 'Integrações',
        icon: Cloud,
        href: '/integrations'
      }
    ]
  },
  {
    id: 'finance',
    label: 'Financeiro',
    icon: DollarSign,
    children: [
      {
        id: 'revenue',
        label: 'Receitas',
        icon: TrendingUp,
        href: '/revenue'
      },
      {
        id: 'expenses',
        label: 'Despesas',
        icon: CreditCard,
        href: '/expenses'
      },
      {
        id: 'invoices',
        label: 'Faturas',
        icon: FileText,
        href: '/invoices'
      },
      {
        id: 'commissions',
        label: 'Comissões',
        icon: DollarSign,
        href: '/commissions'
      }
    ]
  }
]

const bottomItems: NavItem[] = [
  {
    id: 'settings',
    label: 'Configurações',
    icon: Settings,
    children: [
      {
        id: 'general',
        label: 'Geral',
        icon: Settings,
        href: '/settings/general'
      },
      {
        id: 'appearance',
        label: 'Aparência',
        icon: Palette,
        href: '/settings/appearance'
      },
      {
        id: 'security',
        label: 'Segurança',
        icon: Lock,
        href: '/settings/security'
      },
      {
        id: 'database',
        label: 'Banco de Dados',
        icon: Database,
        href: '/settings/database'
      }
    ]
  },
  {
    id: 'help',
    label: 'Ajuda',
    icon: HelpCircle,
    children: [
      {
        id: 'documentation',
        label: 'Documentação',
        icon: BookOpen,
        href: '/help/documentation'
      },
      {
        id: 'support',
        label: 'Suporte',
        icon: MessageCircle,
        href: '/help/support'
      }
    ]
  }
]

export default function SidebarPremium() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(['sales', 'customers'])
  const [searchTerm, setSearchTerm] = useState('')
  const location = useLocation()

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const isActive = (href?: string) => {
    if (!href) return false
    return location.pathname === href
  }

  const isParentActive = (item: NavItem): boolean => {
    if (item.href && isActive(item.href)) return true
    if (item.children) {
      return item.children.some(child => isActive(child.href))
    }
    return false
  }

  const filteredItems = navigationItems.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.children && item.children.some(child =>
      child.label.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  )

  const NavItemComponent = ({ item, level = 0 }: { item: NavItem; level?: number }) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.id)
    const active = isParentActive(item)

    return (
      <div className="w-full">
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id)
            } else if (item.href) {
              // Navigate to href
            }
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
            active
              ? 'bg-gradient-to-r from-primary-500 to-brand-500 text-white shadow-medium'
              : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
          } ${isCollapsed && level === 0 ? 'justify-center' : ''}`}
        >
          <div className="flex items-center min-w-0">
            <item.icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed && level === 0 ? '' : 'mr-3'}`} />
            {!isCollapsed && (
              <>
                <span className="font-medium truncate">{item.label}</span>
                {item.badge && (
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    active ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </div>
          
          {!isCollapsed && hasChildren && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          )}
        </button>

        <AnimatePresence>
          {hasChildren && !isCollapsed && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-1 space-y-1">
                {item.children?.map(child => (
                  <NavItemComponent key={child.id} item={child} level={level + 1} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative bg-white border-r border-neutral-200 shadow-sidebar h-screen flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <motion.div
            animate={{ opacity: isCollapsed ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-brand-500 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <span className="ml-3 text-lg font-bold text-neutral-900">CRM PMG</span>
            )}
          </motion.div>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-neutral-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-neutral-600" />
            )}
          </button>
        </div>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-4 border-b border-neutral-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 space-y-2">
          {filteredItems.map(item => (
            <NavItemComponent key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-neutral-200 p-4 space-y-2">
        {bottomItems.map(item => (
          <NavItemComponent key={item.id} item={item} />
        ))}
        
        {/* User Profile */}
        <div className="flex items-center p-3 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-brand-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            JD
          </div>
          {!isCollapsed && (
            <div className="ml-3 flex-1 min-w-0">
              <p className="font-medium text-neutral-900 truncate">John Doe</p>
              <p className="text-xs text-neutral-600 truncate">Administrator</p>
            </div>
          )}
        </div>
      </div>

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full top-0 ml-2 pointer-events-none">
          {/* Tooltip content would go here */}
        </div>
      )}
    </motion.div>
  )
}
