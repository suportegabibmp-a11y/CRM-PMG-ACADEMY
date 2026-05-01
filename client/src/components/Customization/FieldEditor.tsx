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
  GripVertical,
  ArrowUp,
  ArrowDown,
  Settings,
  Type,
  Calendar,
  Phone,
  Mail,
  DollarSign,
  FileText,
  MapPin,
  Users,
  Building,
  Tag,
  Link,
  Image,
  Video,
  Music,
  Star,
  CheckSquare,
  Radio,
  ToggleLeft as Toggle,
  Hash,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Palette,
  Layout,
  Layers,
  Package,
  Archive,
  Download,
  Upload,
  Copy,
  Clipboard,
  RefreshCw,
  Zap,
  Target,
  BarChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Bell,
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
  FlipVertical
} from 'lucide-react'

interface CustomField {
  id: string
  name: string
  label: string
  type: 'text' | 'email' | 'phone' | 'number' | 'date' | 'datetime' | 'url' | 'textarea' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'toggle' | 'file' | 'image' | 'video' | 'color' | 'range' | 'rating' | 'currency' | 'address' | 'signature'
  required: boolean
  visible: boolean
  order: number
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  appearance?: {
    width: 'full' | 'half' | 'third' | 'quarter'
    alignment: 'left' | 'center' | 'right'
    style: 'default' | 'bordered' | 'filled' | 'underlined'
    color?: string
    icon?: string
  }
  defaultValue?: any
  description?: string
  placeholder?: string
  category: 'basic' | 'contact' | 'business' | 'custom' | 'system'
  module: 'leads' | 'customers' | 'deals' | 'activities' | 'all'
}

interface FieldTemplate {
  id: string
  name: string
  description: string
  fields: Omit<CustomField, 'id' | 'order'>[]
  category: 'industry' | 'size' | 'purpose' | 'custom'
}

const fieldTypes = [
  { value: 'text', label: 'Texto', icon: Type, description: 'Campo de texto simples' },
  { value: 'email', label: 'Email', icon: Mail, description: 'Campo de email com validação' },
  { value: 'phone', label: 'Telefone', icon: Phone, description: 'Campo de telefone com máscara' },
  { value: 'number', label: 'Número', icon: Hash, description: 'Campo numérico' },
  { value: 'date', label: 'Data', icon: Calendar, description: 'Seletor de data' },
  { value: 'datetime', label: 'Data/Hora', icon: Clock, description: 'Seletor de data e hora' },
  { value: 'url', label: 'URL', icon: Link, description: 'Campo de link/URL' },
  { value: 'textarea', label: 'Área de Texto', icon: FileText, description: 'Campo de texto multilinha' },
  { value: 'select', label: 'Seleção Única', icon: CheckSquare, description: 'Dropdown com uma opção' },
  { value: 'multiselect', label: 'Múltipla Seleção', icon: List, description: 'Dropdown com múltiplas opções' },
  { value: 'radio', label: 'Radio', icon: Radio, description: 'Botões de rádio' },
  { value: 'checkbox', label: 'Checkbox', icon: CheckSquare, description: 'Caixas de seleção' },
  { value: 'toggle', label: 'Toggle', icon: Toggle, description: 'Interruptor on/off' },
  { value: 'file', label: 'Arquivo', icon: Upload, description: 'Upload de arquivos' },
  { value: 'image', label: 'Imagem', icon: Image, description: 'Upload de imagens' },
  { value: 'video', label: 'Vídeo', icon: Video, description: 'Upload de vídeos' },
  { value: 'color', label: 'Cor', icon: Palette, description: 'Seletor de cores' },
  { value: 'range', label: 'Range', icon: Activity, description: 'Controle deslizante' },
  { value: 'rating', label: 'Avaliação', icon: Star, description: 'Campo de estrelas' },
  { value: 'currency', label: 'Moeda', icon: DollarSign, description: 'Campo monetário' },
  { value: 'address', label: 'Endereço', icon: MapPin, description: 'Campo de endereço completo' },
  { value: 'signature', label: 'Assinatura', icon: FileText, description: 'Campo de assinatura digital' }
]

const fieldTemplates: FieldTemplate[] = [
  {
    id: 'basic-lead',
    name: 'Lead Básico',
    description: 'Campos essenciais para captura de leads',
    category: 'purpose',
    fields: [
      {
        name: 'lead_source',
        label: 'Origem do Lead',
        type: 'select',
        required: true,
        visible: true,
        options: ['Website', 'LinkedIn', 'Indicação', 'Email', 'Telefone', 'Evento', 'Outro'],
        category: 'basic',
        module: 'leads'
      },
      {
        name: 'interest_level',
        label: 'Nível de Interesse',
        type: 'rating',
        required: true,
        visible: true,
        category: 'basic',
        module: 'leads'
      },
      {
        name: 'budget',
        label: 'Orçamento',
        type: 'currency',
        required: false,
        visible: true,
        validation: { min: 0 },
        category: 'business',
        module: 'leads'
      }
    ]
  },
  {
    id: 'enterprise-customer',
    name: 'Cliente Enterprise',
    description: 'Campos para clientes empresariais',
    category: 'industry',
    fields: [
      {
        name: 'company_size',
        label: 'Porte da Empresa',
        type: 'select',
        required: true,
        visible: true,
        options: ['1-10', '11-50', '51-200', '201-500', '500+'],
        category: 'business',
        module: 'customers'
      },
      {
        name: 'industry',
        label: 'Setor',
        type: 'select',
        required: true,
        visible: true,
        options: ['Tecnologia', 'Varejo', 'Saúde', 'Educação', 'Finanças', 'Manufatura', 'Serviços'],
        category: 'business',
        module: 'customers'
      },
      {
        name: 'annual_revenue',
        label: 'Faturamento Anual',
        type: 'currency',
        required: false,
        visible: true,
        category: 'business',
        module: 'customers'
      }
    ]
  }
]

export default function FieldEditor() {
  const [fields, setFields] = useState<CustomField[]>([
    {
      id: '1',
      name: 'full_name',
      label: 'Nome Completo',
      type: 'text',
      required: true,
      visible: true,
      order: 1,
      validation: { min: 2, message: 'Nome deve ter pelo menos 2 caracteres' },
      category: 'basic',
      module: 'leads'
    },
    {
      id: '2',
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      visible: true,
      order: 2,
      category: 'contact',
      module: 'leads'
    },
    {
      id: '3',
      name: 'phone',
      label: 'Telefone',
      type: 'phone',
      required: false,
      visible: true,
      order: 3,
      category: 'contact',
      module: 'leads'
    }
  ])

  const [selectedField, setSelectedField] = useState<CustomField | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'fields' | 'templates' | 'preview'>('fields')
  const [selectedModule, setSelectedModule] = useState<'leads' | 'customers' | 'deals' | 'activities' | 'all'>('leads')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'basic' | 'contact' | 'business' | 'custom' | 'system'>('all')

  const addField = (type: string) => {
    const newField: CustomField = {
      id: Date.now().toString(),
      name: `field_${Date.now()}`,
      label: 'Novo Campo',
      type: type as CustomField['type'],
      required: false,
      visible: true,
      order: fields.length + 1,
      category: 'custom',
      module: selectedModule
    }

    setFields([...fields, newField])
    setSelectedField(newField)
    setIsEditing(true)
  }

  const updateField = (fieldId: string, updates: Partial<CustomField>) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ))
    
    if (selectedField?.id === fieldId) {
      setSelectedField({ ...selectedField, ...updates })
    }
  }

  const deleteField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId))
    if (selectedField?.id === fieldId) {
      setSelectedField(null)
      setIsEditing(false)
    }
  }

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const fieldIndex = fields.findIndex(f => f.id === fieldId)
    if (fieldIndex === -1) return

    const newFields = [...fields]
    const targetIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1

    if (targetIndex >= 0 && targetIndex < fields.length) {
      [newFields[fieldIndex], newFields[targetIndex]] = [newFields[targetIndex], newFields[fieldIndex]]
      
      // Update order
      newFields.forEach((field, index) => {
        field.order = index + 1
      })
      
      setFields(newFields)
    }
  }

  const duplicateField = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId)
    if (!field) return

    const duplicatedField: CustomField = {
      ...field,
      id: Date.now().toString(),
      name: `${field.name}_copy`,
      label: `${field.label} (Cópia)`,
      order: fields.length + 1
    }

    setFields([...fields, duplicatedField])
  }

  const applyTemplate = (template: FieldTemplate) => {
    const newFields = template.fields.map((field, index) => ({
      ...field,
      id: Date.now().toString() + index,
      order: fields.length + index + 1
    }))

    setFields([...fields, ...newFields])
  }

  const filteredFields = fields.filter(field => {
    const moduleMatch = selectedModule === 'all' || field.module === selectedModule || field.module === 'all'
    const categoryMatch = selectedCategory === 'all' || field.category === selectedCategory
    return moduleMatch && categoryMatch
  }).sort((a, b) => a.order - b.order)

  const FieldCard = ({ field }: { field: CustomField }) => {
    const fieldType = fieldTypes.find(t => t.value === field.type)
    const Icon = fieldType?.icon || Type

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className={`bg-white rounded-xl p-4 shadow-soft border-2 transition-all cursor-pointer ${
          selectedField?.id === field.id ? 'border-primary-500 shadow-medium' : 'border-transparent'
        }`}
        onClick={() => setSelectedField(field)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg mr-3">
              <Icon className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">{field.label}</h3>
              <p className="text-sm text-neutral-600">{fieldType?.label}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                moveField(field.id, 'up')
              }}
              className="p-1 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                moveField(field.id, 'down')
              }}
              className="p-1 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                duplicateField(field.id)
              }}
              className="p-1 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                deleteField(field.id)
              }}
              className="p-1 text-danger-600 hover:text-danger-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className={`px-2 py-1 rounded-full ${
            field.required ? 'bg-danger-100 text-danger-700' : 'bg-neutral-100 text-neutral-600'
          }`}>
            {field.required ? 'Obrigatório' : 'Opcional'}
          </span>
          <span className={`px-2 py-1 rounded-full ${
            field.visible ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-600'
          }`}>
            {field.visible ? 'Visível' : 'Oculto'}
          </span>
          <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full">
            {field.category}
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
              <h1 className="text-2xl font-bold text-neutral-900">Editor de Campos</h1>
              <p className="ml-4 text-neutral-600">Personalize os campos do seu CRM</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value as any)}
                className="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todos Módulos</option>
                <option value="leads">Leads</option>
                <option value="customers">Clientes</option>
                <option value="deals">Negócios</option>
                <option value="activities">Atividades</option>
              </select>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todas Categorias</option>
                <option value="basic">Básico</option>
                <option value="contact">Contato</option>
                <option value="business">Negócio</option>
                <option value="custom">Custom</option>
                <option value="system">Sistema</option>
              </select>

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
          {['fields', 'templates', 'preview'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-neutral-900 shadow-soft'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab === 'fields' && 'Campos'}
              {tab === 'templates' && 'Templates'}
              {tab === 'preview' && 'Visualizar'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'fields' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Field Types */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Adicionar Campo</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {fieldTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.value}
                        onClick={() => addField(type.value)}
                        className="w-full flex items-center p-3 rounded-lg hover:bg-neutral-50 transition-colors text-left"
                      >
                        <div className="p-2 bg-primary-100 rounded-lg mr-3">
                          <Icon className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">{type.label}</p>
                          <p className="text-xs text-neutral-600">{type.description}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Fields List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-neutral-900">Campos Configurados</h2>
                  <span className="text-sm text-neutral-600">{filteredFields.length} campos</span>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredFields.map((field) => (
                    <FieldCard key={field.id} field={field} />
                  ))}
                </div>
              </div>
            </div>

            {/* Field Editor */}
            <div className="lg:col-span-1">
              {selectedField ? (
                <div className="bg-white rounded-xl p-6 shadow-soft">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-neutral-900">Editar Campo</h2>
                    <button
                      onClick={() => {
                        setSelectedField(null)
                        setIsEditing(false)
                      }}
                      className="p-1 text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Nome do Campo</label>
                      <input
                        type="text"
                        value={selectedField.name}
                        onChange={(e) => updateField(selectedField.id, { name: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Label</label>
                      <input
                        type="text"
                        value={selectedField.label}
                        onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Tipo</label>
                      <select
                        value={selectedField.type}
                        onChange={(e) => updateField(selectedField.id, { type: e.target.value as any })}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {fieldTypes.map((type) => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Placeholder</label>
                      <input
                        type="text"
                        value={selectedField.placeholder || ''}
                        onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Descrição</label>
                      <textarea
                        value={selectedField.description || ''}
                        onChange={(e) => updateField(selectedField.id, { description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    {(selectedField.type === 'select' || selectedField.type === 'multiselect' || selectedField.type === 'radio') && (
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Opções</label>
                        <textarea
                          value={selectedField.options?.join('\n') || ''}
                          onChange={(e) => updateField(selectedField.id, { 
                            options: e.target.value.split('\n').filter(o => o.trim()) 
                          })}
                          rows={4}
                          placeholder="Uma opção por linha"
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    )}

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedField.required}
                          onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm text-neutral-700">Obrigatório</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedField.visible}
                          onChange={(e) => updateField(selectedField.id, { visible: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm text-neutral-700">Visível</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Módulo</label>
                      <select
                        value={selectedField.module}
                        onChange={(e) => updateField(selectedField.id, { module: e.target.value as any })}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="all">Todos</option>
                        <option value="leads">Leads</option>
                        <option value="customers">Clientes</option>
                        <option value="deals">Negócios</option>
                        <option value="activities">Atividades</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Categoria</label>
                      <select
                        value={selectedField.category}
                        onChange={(e) => updateField(selectedField.id, { category: e.target.value as any })}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="basic">Básico</option>
                        <option value="contact">Contato</option>
                        <option value="business">Negócio</option>
                        <option value="custom">Custom</option>
                        <option value="system">Sistema</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-6 shadow-soft text-center">
                  <Settings className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">Selecione um Campo</h3>
                  <p className="text-neutral-600">Clique em um campo para editar suas propriedades</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fieldTemplates.map((template) => (
              <div key={template.id} className="bg-white rounded-xl p-6 shadow-soft hover:shadow-medium transition-all">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{template.name}</h3>
                <p className="text-neutral-600 mb-4">{template.description}</p>
                <div className="mb-4">
                  <p className="text-sm font-medium text-neutral-700 mb-2">Campos incluídos:</p>
                  <div className="flex flex-wrap gap-2">
                    {template.fields.map((field, index) => (
                      <span key={index} className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs">
                        {field.label}
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
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Visualização do Formulário</h2>
            <div className="max-w-2xl mx-auto">
              <div className="space-y-4">
                {filteredFields.filter(field => field.visible).map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700">
                      {field.label}
                      {field.required && <span className="text-danger-600 ml-1">*</span>}
                    </label>
                    
                    {field.type === 'text' && (
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    )}
                    
                    {field.type === 'email' && (
                      <input
                        type="email"
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    )}
                    
                    {field.type === 'phone' && (
                      <input
                        type="tel"
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    )}
                    
                    {field.type === 'textarea' && (
                      <textarea
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    )}
                    
                    {field.type === 'select' && (
                      <select className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="">Selecione...</option>
                        {field.options?.map((option, index) => (
                          <option key={index} value={option}>{option}</option>
                        ))}
                      </select>
                    )}
                    
                    {field.type === 'checkbox' && (
                      <div className="space-y-2">
                        {field.options?.map((option, index) => (
                          <label key={index} className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm text-neutral-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    
                    {field.type === 'radio' && (
                      <div className="space-y-2">
                        {field.options?.map((option, index) => (
                          <label key={index} className="flex items-center">
                            <input type="radio" name={field.name} className="mr-2" />
                            <span className="text-sm text-neutral-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    
                    {field.type === 'date' && (
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    )}
                    
                    {field.type === 'currency' && (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600">R$</span>
                        <input
                          type="number"
                          placeholder="0,00"
                          className="w-full pl-8 pr-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    )}
                    
                    {field.description && (
                      <p className="text-xs text-neutral-600">{field.description}</p>
                    )}
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
