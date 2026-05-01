import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader, Crown, Lock } from 'lucide-react';

interface PlanData {
  isActive: boolean;
  planType: 'free' | 'basic' | 'premium' | 'enterprise';
  expiresAt?: string;
  features: string[];
}

export function PlanVerification({ children }: { children: React.ReactNode }) {
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkUserPlan = async () => {
      try {
        // Simular verificação de plano (em produção, viria da API)
        const userPlanData: PlanData = {
          isActive: false, // Inicialmente false para teste
          planType: 'free',
          features: ['Acesso básico', 'Até 10 contatos', 'Suporte por email']
        };

        // Simular delay de verificação
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setPlanData(userPlanData);
      } catch (err) {
        setError('Erro ao verificar plano do usuário');
      } finally {
        setIsLoading(false);
      }
    };

    checkUserPlan();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando seu plano...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro na Verificação</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!planData?.isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full mb-4">
                <Lock className="h-10 w-10 text-gray-500" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Plano Inativo
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Você precisa de um plano ativo para acessar as ferramentas do CRM
              </p>
            </div>

            {/* Current Plan Info */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Seu Plano Atual</h2>
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold">
                  Grátis
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Acesso básico ao sistema</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Até 10 contatos</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Suporte por email</span>
                </div>
              </div>

              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-yellow-800 font-semibold mb-2">⚠️ Limitações do Plano Gratuito</h3>
                <ul className="text-yellow-700 space-y-1">
                  <li>• Sem acesso ao dashboard completo</li>
                  <li>• Sem gestão de pipeline de vendas</li>
                  <li>• Sem relatórios avançados</li>
                  <li>• Sem integrações com outras ferramentas</li>
                </ul>
              </div>
            </div>

            {/* Plan Options */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Basic Plan */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Plano Basic</h3>
                  <div className="text-3xl font-bold text-blue-600">
                    R$ 29<span className="text-lg text-gray-600">/mês</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Até 100 contatos</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Dashboard básico</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Pipeline simples</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Suporte prioritário</span>
                  </div>
                </ul>
                
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Assinar Plano Basic
                </button>
              </div>

              {/* Premium Plan */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-500 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    MAIS POPULAR
                  </span>
                </div>
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <Crown className="h-8 w-8 text-yellow-500 mr-2" />
                    <h3 className="text-2xl font-bold text-gray-900">Plano Premium</h3>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    R$ 79<span className="text-lg text-gray-600">/mês</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Contatos ilimitados</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Dashboard completo</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Pipeline avançado</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Relatórios detalhados</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Integrações</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Suporte dedicado</span>
                  </div>
                </ul>
                
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Assinar Plano Premium
                </button>
              </div>
            </div>

            {/* Contact Support */}
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Precisa de ajuda? Entre em contato com nossa equipe comercial.
              </p>
              <button className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                Falar com Vendedor
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se o plano estiver ativo, renderizar os filhos normalmente
  return <>{children}</>;
}
