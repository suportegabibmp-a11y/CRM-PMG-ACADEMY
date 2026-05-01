import React from 'react';
import { Toaster } from 'react-hot-toast';
import { CheckCircle, Star, Zap, Shield, TrendingUp, Users, BarChart, Target, Crown, Sparkles } from 'lucide-react';

export function VendasPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-16 pt-8">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-full">
              <Crown className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            CRM PMG Academy
          </h1>
          <p className="text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Sistema Completo de Gestão de Relacionamento com Clientes
          </p>
          
          {/* Pricing Card */}
          <div className="max-w-md mx-auto mb-12">
            <div className="bg-gradient-to-r from-purple-800 to-indigo-800 rounded-3xl shadow-2xl p-8 border border-purple-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-yellow-400 text-purple-900 px-4 py-2 rounded-bl-2xl font-bold text-sm">
                OFERTA LIMITADA
              </div>
              
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-white mb-2">
                  R$ 39,90
                </div>
                <div className="text-gray-300 text-lg">
                  por mês
                </div>
              </div>
              
              <div className="mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="flex -space-x-2">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="ml-3 text-white font-semibold">4.9/5</span>
                </div>
                <p className="text-gray-300 text-center">
                  Mais de 1.000 empresas já transformaram suas vendas
                </p>
              </div>
              
              <a 
                href="https://pay.cakto.com.br/re967su" 
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-purple-900 py-4 rounded-xl text-lg font-bold hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center justify-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Garantir Minha Vaga Agora
                </div>
              </a>
              
              <p className="text-center text-gray-400 text-sm mt-4">
                🎯 7 dias de garantia • Cancelamento a qualquer momento
              </p>
            </div>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            🚀 Transforme Suas Vendas
          </h2>
          <p className="text-xl text-gray-300 text-center mb-12 max-w-3xl mx-auto">
            Tenha controle total do seu funil de vendas, gestão de leads e acompanhamento de clientes em uma única plataforma poderosa.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-2xl p-6 border border-purple-700 hover:border-purple-600 transition-all hover:transform hover:scale-105">
              <div className="bg-gradient-to-r from-blue-400 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <BarChart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Dashboard Completo</h3>
              <p className="text-gray-300">Visualize métricas e KPIs em tempo real com gráficos interativos</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-2xl p-6 border border-purple-700 hover:border-purple-600 transition-all hover:transform hover:scale-105">
              <div className="bg-gradient-to-r from-green-400 to-green-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Gestão de Leads</h3>
              <p className="text-gray-300">Capture e qualifique leads automaticamente com IA</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-2xl p-6 border border-purple-700 hover:border-purple-600 transition-all hover:transform hover:scale-105">
              <div className="bg-gradient-to-r from-purple-400 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Pipeline de Vendas</h3>
              <p className="text-gray-300">Acompanhe cada etapa do funil com visualização Kanban</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-2xl p-6 border border-purple-700 hover:border-purple-600 transition-all hover:transform hover:scale-105">
              <div className="bg-gradient-to-r from-orange-400 to-orange-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Gestão de Clientes</h3>
              <p className="text-gray-300">CRM completo com histórico e follow-up automatizado</p>
            </div>
          </div>
        </div>
        
        {/* Detailed Features */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-gradient-to-br from-purple-800 to-indigo-800 rounded-3xl shadow-2xl p-10 border border-purple-700">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              🌟 Recursos Exclusivos
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="bg-green-500 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Autenticação Segura</h4>
                  <p className="text-gray-300">Login com Supabase e recuperação de senha avançada</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-green-500 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Dashboard Analítico</h4>
                  <p className="text-gray-300">Métricas detalhadas e relatórios em tempo real</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-green-500 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Pipeline Kanban</h4>
                  <p className="text-gray-300">Visualização e gestão do funil de vendas intuitiva</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-green-500 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Integrações</h4>
                  <p className="text-gray-300">Conecte com WhatsApp, Email e outras ferramentas</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-green-500 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Automação</h4>
                  <p className="text-gray-300">Follow-up automático e nutrição de leads</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-green-500 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Suporte Premium</h4>
                  <p className="text-gray-300">Atendimento dedicado e treinamento inclusos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-purple-900 mb-4">
              🎯 Comece Hoje Mesmo!
            </h2>
            <p className="text-purple-800 text-lg mb-6">
              Transforme sua gestão de vendas e aumente seus resultados em até 300%
            </p>
            <a 
              href="https://pay.cakto.com.br/re967su" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-purple-900 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-purple-800 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Comprar Agora por R$ 39,90/mês
              </div>
            </a>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center border-t border-purple-800 pt-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-5 w-5 text-gray-400 mr-2" />
            <p className="text-gray-400 text-sm">
              Pagamento 100% seguro • 7 dias de garantia • Suporte 24/7
            </p>
          </div>
          <p className="text-gray-500">
            © 2024 CRM PMG Academy. Todos os direitos reservados.
          </p>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
