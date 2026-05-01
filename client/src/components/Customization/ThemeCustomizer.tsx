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
  Settings,
  Palette,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Tablet,
  Layout,
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
  Heading3,
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
  Copy,
  Clipboard,
  Download,
  Upload,
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
  Search,
  Filter,
  Archive,
  Package,
  ShoppingBag,
  ShoppingCart,
  CreditCard,
  Receipt,
  Calculator,
  TrendingDown,
  Sun as SunIcon,
  Moon as MoonIcon,
  CloudRain,
  CloudSnow,
  CloudDrizzle,
  Wind,
  Thermometer,
  Droplet,
  Flame,
  Zap as ZapIcon,
  Radio,
  Smartphone as SmartphoneIcon,
  Tablet as TabletIcon,
  Monitor as MonitorIcon,
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

interface Theme {
  id: string
  name: string
  description: string
  category: 'light' | 'dark' | 'auto' | 'custom'
  colors: {
    primary: string
    secondary: string
    accent: string
    neutral: string
    success: string
    warning: string
    danger: string
    info: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    shadow: string
  }
  typography: {
    fontFamily: string
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
      '4xl': string
    }
    fontWeight: {
      light: number
      normal: number
      medium: number
      semibold: number
      bold: number
      extrabold: number
    }
    lineHeight: {
      tight: number
      normal: number
      relaxed: number
    }
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
  }
  borderRadius: {
    none: string
    sm: string
    md: string
    lg: string
    xl: string
    full: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
  animations: {
    duration: {
      fast: string
      normal: string
      slow: string
    }
    easing: {
      linear: string
      ease: string
      easeIn: string
      easeOut: string
      easeInOut: string
    }
  }
  breakpoints: {
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
  custom: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

const defaultThemes: Theme[] = [
  {
    id: 'default-light',
    name: 'Default Light',
    description: 'Tema claro padrão do sistema',
    category: 'light',
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      accent: '#8b5cf6',
      neutral: '#374151',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#06b6d4',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      shadow: 'rgba(0, 0, 0, 0.1)'
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem'
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    animations: {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms'
      },
      easing: {
        linear: 'linear',
        ease: 'ease',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out'
      }
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },
    custom: false,
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'default-dark',
    name: 'Default Dark',
    description: 'Tema escuro padrão do sistema',
    category: 'dark',
    colors: {
      primary: '#60a5fa',
      secondary: '#9ca3af',
      accent: '#a78bfa',
      neutral: '#d1d5db',
      success: '#34d399',
      warning: '#fbbf24',
      danger: '#f87171',
      info: '#22d3ee',
      background: '#111827',
      surface: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#9ca3af',
      border: '#374151',
      shadow: 'rgba(0, 0, 0, 0.3)'
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem'
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    animations: {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms'
      },
      easing: {
        linear: 'linear',
        ease: 'ease',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out'
      }
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },
    custom: false,
    active: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'blue-corporate',
    name: 'Blue Corporate',
    description: 'Tema corporativo azul profissional',
    category: 'custom',
    colors: {
      primary: '#1e40af',
      secondary: '#64748b',
      accent: '#7c3aed',
      neutral: '#475569',
      success: '#059669',
      warning: '#d97706',
      danger: '#dc2626',
      info: '#0891b2',
      background: '#f8fafc',
      surface: '#f1f5f9',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      shadow: 'rgba(0, 0, 0, 0.1)'
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem'
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.375rem',
      xl: '0.5rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    animations: {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms'
      },
      easing: {
        linear: 'linear',
        ease: 'ease',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out'
      }
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },
    custom: true,
    active: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'green-nature',
    name: 'Green Nature',
    description: 'Tema verde natural e orgânico',
    category: 'custom',
    colors: {
      primary: '#059669',
      secondary: '#6b7280',
      accent: '#10b981',
      neutral: '#374151',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#06b6d4',
      background: '#f0fdf4',
      surface: '#dcfce7',
      text: '#064e3b',
      textSecondary: '#6b7280',
      border: '#bbf7d0',
      shadow: 'rgba(0, 0, 0, 0.1)'
    },
    typography: {
      fontFamily: 'Poppins, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem'
    },
    borderRadius: {
      none: '0',
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    animations: {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms'
      },
      easing: {
        linear: 'linear',
        ease: 'ease',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out'
      }
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },
    custom: true,
    active: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

const fontFamilies = [
  'Inter, sans-serif',
  'Roboto, sans-serif',
  'Poppins, sans-serif',
  'Open Sans, sans-serif',
  'Lato, sans-serif',
  'Montserrat, sans-serif',
  'Raleway, sans-serif',
  'Ubuntu, sans-serif',
  'Playfair Display, serif',
  'Merriweather, serif',
  'Dancing Script, cursive',
  'Pacifico, cursive',
  'Bebas Neue, cursive',
  'Oswald, sans-serif',
  'Nunito, sans-serif',
  'Quicksand, sans-serif',
  'Cabin, sans-serif',
  'Josefin Sans, sans-serif',
  'Arvo, serif',
  'Lora, serif'
]

export default function ThemeCustomizer() {
  const [themes, setThemes] = useState<Theme[]>(defaultThemes)
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(defaultThemes[0])
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'themes' | 'colors' | 'typography' | 'spacing' | 'preview'>('themes')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'light' | 'dark' | 'auto' | 'custom'>('all')

  const updateTheme = (themeId: string, updates: Partial<Theme>) => {
    setThemes(themes.map(theme => 
      theme.id === themeId ? { ...theme, ...updates, updatedAt: new Date().toISOString() } : theme
    ))
    
    if (selectedTheme?.id === themeId) {
      setSelectedTheme({ ...selectedTheme, ...updates, updatedAt: new Date().toISOString() })
    }
  }

  const activateTheme = (themeId: string) => {
    setThemes(themes.map(theme => ({
      ...theme,
      active: theme.id === themeId
    })))
    
    const theme = themes.find(t => t.id === themeId)
    if (theme) {
      setSelectedTheme(theme)
    }
  }

  const duplicateTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId)
    if (!theme) return

    const newTheme: Theme = {
      ...theme,
      id: Date.now().toString(),
      name: `${theme.name} Copy`,
      custom: true,
      active: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setThemes([...themes, newTheme])
  }

  const deleteTheme = (themeId: string) => {
    if (!themes.find(t => t.id === themeId)?.custom) return
    
    setThemes(themes.filter(theme => theme.id !== themeId))
    if (selectedTheme?.id === themeId) {
      setSelectedTheme(null)
      setIsEditing(false)
    }
  }

  const createNewTheme = () => {
    const newTheme: Theme = {
      id: Date.now().toString(),
      name: 'New Theme',
      description: 'Custom theme description',
      category: 'custom',
      colors: {
        primary: '#3b82f6',
        secondary: '#6b7280',
        accent: '#8b5cf6',
        neutral: '#374151',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#06b6d4',
        background: '#ffffff',
        surface: '#f9fafb',
        text: '#111827',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        shadow: 'rgba(0, 0, 0, 0.1)'
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem'
        },
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
          extrabold: 800
        },
        lineHeight: {
          tight: 1.25,
          normal: 1.5,
          relaxed: 1.75
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem'
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      },
      animations: {
        duration: {
          fast: '150ms',
          normal: '300ms',
          slow: '500ms'
        },
        easing: {
          linear: 'linear',
          ease: 'ease',
          easeIn: 'ease-in',
          easeOut: 'ease-out',
          easeInOut: 'ease-in-out'
        }
      },
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      },
      custom: true,
      active: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setThemes([...themes, newTheme])
    setSelectedTheme(newTheme)
    setIsEditing(true)
  }

  const filteredThemes = themes.filter(theme => {
    const categoryMatch = selectedCategory === 'all' || theme.category === selectedCategory
    return categoryMatch
  })

  const ThemeCard = ({ theme }: { theme: Theme }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className={`bg-white rounded-xl p-6 shadow-soft hover:shadow-medium transition-all cursor-pointer ${
          selectedTheme?.id === theme.id ? 'border-2 border-primary-500' : 'border-2 border-transparent'
        }`}
        onClick={() => setSelectedTheme(theme)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900 mb-1">{theme.name}</h3>
            <p className="text-sm text-neutral-600 mb-3">{theme.description}</p>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                theme.category === 'light' ? 'bg-yellow-100 text-yellow-700' :
                theme.category === 'dark' ? 'bg-gray-800 text-white' :
                theme.category === 'auto' ? 'bg-blue-100 text-blue-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {theme.category === 'light' && 'Claro'}
                {theme.category === 'dark' && 'Escuro'}
                {theme.category === 'auto' && 'Auto'}
                {theme.category === 'custom' && 'Custom'}
              </span>
              {theme.custom && (
                <span className="px-2 py-1 bg-success-100 text-success-700 rounded-full text-xs font-medium">
                  Custom
                </span>
              )}
              {theme.active && (
                <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                  Ativo
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={(e) => {
                e.stopPropagation()
                duplicateTheme(theme.id)
              }}
              className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
              title="Duplicar"
            >
              <Copy className="w-4 h-4" />
            </button>
            {theme.custom && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteTheme(theme.id)
                }}
                className="p-2 text-danger-600 hover:text-danger-700 transition-colors"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="grid grid-cols-6 gap-2">
            <div 
              className="h-8 rounded border border-gray-200"
              style={{ backgroundColor: theme.colors.primary }}
              title="Primary"
            />
            <div 
              className="h-8 rounded border border-gray-200"
              style={{ backgroundColor: theme.colors.secondary }}
              title="Secondary"
            />
            <div 
              className="h-8 rounded border border-gray-200"
              style={{ backgroundColor: theme.colors.accent }}
              title="Accent"
            />
            <div 
              className="h-8 rounded border border-gray-200"
              style={{ backgroundColor: theme.colors.success }}
              title="Success"
            />
            <div 
              className="h-8 rounded border border-gray-200"
              style={{ backgroundColor: theme.colors.warning }}
              title="Warning"
            />
            <div 
              className="h-8 rounded border border-gray-200"
              style={{ backgroundColor: theme.colors.danger }}
              title="Danger"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-neutral-600">
            Fonte: {theme.typography.fontFamily.split(',')[0]}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              activateTheme(theme.id)
            }}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              theme.active 
                ? 'bg-success-100 text-success-700' 
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {theme.active ? 'Ativo' : 'Ativar'}
          </button>
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
              <h1 className="text-2xl font-bold text-neutral-900">Personalizador de Temas</h1>
              <p className="ml-4 text-neutral-600">Customize a aparência do seu CRM</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todos</option>
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
                <option value="auto">Auto</option>
                <option value="custom">Custom</option>
              </select>

              <button
                onClick={createNewTheme}
                className="px-4 py-2 bg-gradient-to-r from-primary-600 to-brand-600 text-white rounded-lg text-sm hover:from-primary-700 hover:to-brand-700 transition-all flex items-center shadow-soft"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Tema
              </button>

              <button className="px-4 py-2 bg-gradient-to-r from-success-600 to-emerald-600 text-white rounded-lg text-sm hover:from-success-700 hover:to-emerald-700 transition-all flex items-center shadow-soft">
                <Save className="w-4 h-4 mr-2" />
                Aplicar Tema
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex bg-neutral-100 rounded-lg p-1">
          {['themes', 'colors', 'typography', 'spacing', 'preview'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-neutral-900 shadow-soft'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab === 'themes' && 'Temas'}
              {tab === 'colors' && 'Cores'}
              {tab === 'typography' && 'Tipografia'}
              {tab === 'spacing' && 'Espaçamento'}
              {tab === 'preview' && 'Visualizar'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'themes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredThemes.map((theme) => (
              <ThemeCard key={theme.id} theme={theme} />
            ))}
          </div>
        )}

        {activeTab === 'colors' && selectedTheme && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h2 className="text-lg font-semibold text-neutral-900 mb-6">Cores do Tema</h2>
              <div className="space-y-4">
                {Object.entries(selectedTheme.colors).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-12 h-12 rounded-lg border border-gray-200"
                        style={{ backgroundColor: value }}
                      />
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <p className="text-xs text-neutral-600">{value}</p>
                      </div>
                    </div>
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => updateTheme(selectedTheme.id, {
                        colors: { ...selectedTheme.colors, [key]: e.target.value }
                      })}
                      className="w-20 h-8 border border-neutral-200 rounded cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h2 className="text-lg font-semibold text-neutral-900 mb-6">Shadows</h2>
              <div className="space-y-4">
                {Object.entries(selectedTheme.shadows).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-neutral-700 capitalize mb-1">
                        Shadow {key}
                      </label>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-16 h-16 rounded-lg border border-gray-200"
                          style={{ boxShadow: value }}
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateTheme(selectedTheme.id, {
                            shadows: { ...selectedTheme.shadows, [key]: e.target.value }
                          })}
                          className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'typography' && selectedTheme && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h2 className="text-lg font-semibold text-neutral-900 mb-6">Font Family</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Fonte Principal</label>
                  <select
                    value={selectedTheme.typography.fontFamily}
                    onChange={(e) => updateTheme(selectedTheme.id, {
                      typography: { ...selectedTheme.typography, fontFamily: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {fontFamilies.map((font) => (
                      <option key={font} value={font}>{font.split(',')[0]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Preview</label>
                  <div style={{ fontFamily: selectedTheme.typography.fontFamily }} className="p-4 bg-neutral-50 rounded-lg">
                    <p className="text-2xl font-bold mb-2">Título Exemplo</p>
                    <p className="text-base mb-2">Texto normal para preview da fonte selecionada.</p>
                    <p className="text-sm text-neutral-600">Texto pequeno para verificar legibilidade.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h2 className="text-lg font-semibold text-neutral-900 mb-6">Tamanhos e Pesos</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Tamanhos de Fonte</label>
                  <div className="space-y-2">
                    {Object.entries(selectedTheme.typography.fontSize).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600 capitalize">{key}</span>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateTheme(selectedTheme.id, {
                            typography: {
                              ...selectedTheme.typography,
                              fontSize: { ...selectedTheme.typography.fontSize, [key]: e.target.value }
                            }
                          })}
                          className="w-24 px-2 py-1 border border-neutral-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Pesos da Fonte</label>
                  <div className="space-y-2">
                    {Object.entries(selectedTheme.typography.fontWeight).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600 capitalize">{key}</span>
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => updateTheme(selectedTheme.id, {
                            typography: {
                              ...selectedTheme.typography,
                              fontWeight: { ...selectedTheme.typography.fontWeight, [key]: parseInt(e.target.value) }
                            }
                          })}
                          className="w-24 px-2 py-1 border border-neutral-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'spacing' && selectedTheme && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h2 className="text-lg font-semibold text-neutral-900 mb-6">Espaçamento</h2>
              <div className="space-y-4">
                {Object.entries(selectedTheme.spacing).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700 capitalize">{key}</span>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateTheme(selectedTheme.id, {
                        spacing: { ...selectedTheme.spacing, [key]: e.target.value }
                      })}
                      className="w-24 px-2 py-1 border border-neutral-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h2 className="text-lg font-semibold text-neutral-900 mb-6">Border Radius</h2>
              <div className="space-y-4">
                {Object.entries(selectedTheme.borderRadius).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700 capitalize">{key}</span>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateTheme(selectedTheme.id, {
                        borderRadius: { ...selectedTheme.borderRadius, [key]: e.target.value }
                      })}
                      className="w-24 px-2 py-1 border border-neutral-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && selectedTheme && (
          <div className="bg-white rounded-xl p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-neutral-900 mb-6">Preview do Tema</h2>
            <div 
              className="p-6 rounded-lg border"
              style={{
                backgroundColor: selectedTheme.colors.background,
                borderColor: selectedTheme.colors.border,
                fontFamily: selectedTheme.typography.fontFamily,
                borderRadius: selectedTheme.borderRadius.lg
              }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h1 
                    className="text-2xl font-bold"
                    style={{ 
                      color: selectedTheme.colors.text,
                      fontSize: selectedTheme.typography.fontSize['2xl']
                    }}
                  >
                    Título Principal
                  </h1>
                  <button
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                    style={{ 
                      backgroundColor: selectedTheme.colors.primary,
                      borderRadius: selectedTheme.borderRadius.md
                    }}
                  >
                    Botão Primário
                  </button>
                </div>

                <p style={{ color: selectedTheme.colors.textSecondary }}>
                  Este é um texto secundário para demonstrar a legibilidade e a hierarquia visual do tema.
                </p>

                <div className="grid grid-cols-4 gap-4">
                  <div
                    className="p-4 rounded-lg text-center text-white"
                    style={{ backgroundColor: selectedTheme.colors.primary }}
                  >
                    Primary
                  </div>
                  <div
                    className="p-4 rounded-lg text-center text-white"
                    style={{ backgroundColor: selectedTheme.colors.secondary }}
                  >
                    Secondary
                  </div>
                  <div
                    className="p-4 rounded-lg text-center text-white"
                    style={{ backgroundColor: selectedTheme.colors.success }}
                  >
                    Success
                  </div>
                  <div
                    className="p-4 rounded-lg text-center text-white"
                    style={{ backgroundColor: selectedTheme.colors.danger }}
                  >
                    Danger
                  </div>
                </div>

                <div
                  className="p-4 rounded-lg"
                  style={{ 
                    backgroundColor: selectedTheme.colors.surface,
                    boxShadow: selectedTheme.shadows.md
                  }}
                >
                  <h3 
                    className="font-semibold mb-2"
                    style={{ color: selectedTheme.colors.text }}
                  >
                    Card Component
                  </h3>
                  <p style={{ color: selectedTheme.colors.textSecondary }}>
                    Este é um exemplo de card com as cores e sombras do tema.
                  </p>
                </div>

                <div className="flex space-x-2">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${selectedTheme.colors.primary}20`,
                      color: selectedTheme.colors.primary
                    }}
                  >
                    Tag 1
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${selectedTheme.colors.success}20`,
                      color: selectedTheme.colors.success
                    }}
                  >
                    Tag 2
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${selectedTheme.colors.warning}20`,
                      color: selectedTheme.colors.warning
                    }}
                  >
                    Tag 3
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
