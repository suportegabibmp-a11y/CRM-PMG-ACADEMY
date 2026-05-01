import React, { useState, useEffect } from 'react';
import { activitiesAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  Calendar, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Phone,
  Mail,
  Users,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Activity {
  id: string;
  type: string;
  title: string;
  description?: string;
  customerId: string;
  dealId?: string;
  userId: string;
  completed: boolean;
  scheduledAt: string;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    company?: string;
  };
  deal?: {
    id: string;
    title: string;
    stage: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const Activities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [completedFilter, setCompletedFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  useEffect(() => {
    loadActivities();
  }, [currentPage, searchTerm, typeFilter, completedFilter]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        type: typeFilter,
        completed: completedFilter === '' ? undefined : completedFilter === 'true'
      };
      
      const response = await activitiesAPI.getAll(params);
      setActivities(response.data.activities);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      toast.error('Erro ao carregar atividades');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta atividade?')) return;
    
    try {
      await activitiesAPI.delete(id);
      toast.success('Atividade excluída com sucesso');
      loadActivities();
    } catch (error) {
      toast.error('Erro ao excluir atividade');
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      await activitiesAPI.update(id, { completed: !completed });
      toast.success('Atividade atualizada com sucesso');
      loadActivities();
    } catch (error) {
      toast.error('Erro ao atualizar atividade');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CALL': return Phone;
      case 'EMAIL': return Mail;
      case 'MEETING': return Users;
      case 'TASK': return CheckCircle;
      default: return Clock;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CALL': return 'bg-blue-100 text-blue-800';
      case 'EMAIL': return 'bg-green-100 text-green-800';
      case 'MEETING': return 'bg-purple-100 text-purple-800';
      case 'TASK': return 'bg-yellow-100 text-yellow-800';
      case 'NOTE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (scheduledAt: string, completed: boolean) => {
    return !completed && new Date(scheduledAt) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Atividades</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Atividade
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar atividades..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="input"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Todos os tipos</option>
              <option value="CALL">Ligação</option>
              <option value="EMAIL">Email</option>
              <option value="MEETING">Reunião</option>
              <option value="TASK">Tarefa</option>
              <option value="NOTE">Nota</option>
            </select>
            
            <select
              className="input"
              value={completedFilter}
              onChange={(e) => setCompletedFilter(e.target.value)}
            >
              <option value="">Todos os status</option>
              <option value="false">Pendentes</option>
              <option value="true">Concluídas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activities Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Atividade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Nenhuma atividade encontrada
                  </td>
                </tr>
              ) : (
                activities.map((activity) => {
                  const Icon = getTypeIcon(activity.type);
                  const overdue = isOverdue(activity.scheduledAt, activity.completed);
                  
                  return (
                    <tr 
                      key={activity.id} 
                      className={`hover:bg-gray-50 ${overdue ? 'bg-red-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                          {activity.description && (
                            <div className="text-sm text-gray-500">{activity.description}</div>
                          )}
                          {activity.deal && (
                            <div className="text-xs text-gray-400">
                              Negócio: {activity.deal.title}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{activity.customer.name}</div>
                        <div className="text-sm text-gray-500">{activity.customer.company || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-400" />
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(activity.type)}`}>
                            {activity.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(activity.scheduledAt)}
                        </div>
                        {overdue && (
                          <div className="text-xs text-red-600 font-medium">
                            Atrasada
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          activity.completed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {activity.completed ? 'Concluída' : 'Pendente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleComplete(activity.id, activity.completed)}
                            className={`${
                              activity.completed 
                                ? 'text-yellow-600 hover:text-yellow-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={activity.completed ? 'Marcar como pendente' : 'Marcar como concluída'}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingActivity(activity);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(activity.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-secondary disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal placeholder */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingActivity ? 'Editar Atividade' : 'Nova Atividade'}
            </h2>
            <p className="text-gray-600">
              Formulário de atividade será implementado na próxima etapa.
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingActivity(null);
                }}
                className="btn btn-secondary"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
