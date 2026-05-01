import React from 'react';
import { Toaster } from 'react-hot-toast';

export function VendasPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            CRM PMG Academy
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sistema Completo de Gestão de Relacionamento com Clientes
          </p>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                🚀 Transforme Suas Vendas
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Tenha controle total do seu funil de vendas, gestão de leads e acompanhamento de clientes em uma única plataforma.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="text-blue-600 text-3xl mb-3">📊</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Dashboard Completo</h3>
                  <p className="text-gray-600">Visualize métricas e KPIs em tempo real</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="text-green-600 text-3xl mb-3">🎯</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Gestão de Leads</h3>
                  <p className="text-gray-600">Capture e qualifique leads automaticamente</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="text-purple-600 text-3xl mb-3">💼</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Pipeline de Vendas</h3>
                  <p className="text-gray-600">Acompanhe cada etapa do funil de vendas</p>
                </div>
              </div>
              
              <div className="text-center">
                <a 
                  href="/login" 
                  className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Acessar Sistema CRM
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              🌟 Recursos Principais
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="text-green-500 text-xl mt-1">✓</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Autenticação Segura</h4>
                  <p className="text-gray-600">Login com Supabase e recuperação de senha</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="text-green-500 text-xl mt-1">✓</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Gestão de Clientes</h4>
                  <p className="text-gray-600">CRM completo com histórico e follow-up</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="text-green-500 text-xl mt-1">✓</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Dashboard Analítico</h4>
                  <p className="text-gray-600">Métricas detalhadas e relatórios</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="text-green-500 text-xl mt-1">✓</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Pipeline Kanban</h4>
                  <p className="text-gray-600">Visualização e gestão do funil de vendas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-500">
            © 2024 CRM PMG Academy. Todos os direitos reservados.
          </p>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
