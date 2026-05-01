// API Services - CRM PMG
// MIGRADO 100% PARA SUPABASE AUTH
// Backend local removido - usando apenas Supabase

import axios from 'axios';

// Configuração para APIs futuras (não autenticação)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.crmpmg.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token Supabase
api.interceptors.request.use(
  (config) => {
    // Não usamos mais localStorage para tokens
    // Supabase Auth gerencia sessão automaticamente
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API de Clientes (para uso futuro)
export const customersAPI = {
  getAll: (params?: any) => api.get('/customers', { params }),
  getById: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
};

// API de Negócios (para uso futuro)
export const dealsAPI = {
  getAll: (params?: any) => api.get('/deals', { params }),
  getById: (id: string) => api.get(`/deals/${id}`),
  create: (data: any) => api.post('/deals', data),
  update: (id: string, data: any) => api.put(`/deals/${id}`, data),
  delete: (id: string) => api.delete(`/deals/${id}`),
};

// API de Atividades (para uso futuro)
export const activitiesAPI = {
  getAll: (params?: any) => api.get('/activities', { params }),
  getById: (id: string) => api.get(`/activities/${id}`),
  create: (data: any) => api.post('/activities', data),
  update: (id: string, data: any) => api.put(`/activities/${id}`, data),
  delete: (id: string) => api.delete(`/activities/${id}`),
};

// API de Métricas (para uso futuro)
export const metricsAPI = {
  getDashboard: () => api.get('/metrics/dashboard'),
  getSales: () => api.get('/metrics/sales'),
  getCustomers: () => api.get('/metrics/customers'),
  getPipeline: () => api.get('/metrics/pipeline'),
  getSalesPerformance: () => api.get('/metrics/sales-performance'),
};

export default api;
