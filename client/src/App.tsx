import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast'; // Removido para evitar erro de listener
import { useAuth } from './hooks/useAuth';
import { Login } from './components/Auth/Login';
import { SignUp } from './components/Auth/SignUp';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { VendasPage } from './components/Vendas/VendasPage';
import { PlanVerification } from './components/Plan/PlanVerification';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { RouteFallback } from './components/ErrorBoundary/RouteFallback';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        {/* <Toaster position="top-right" /> // Removido para evitar erro de listener */}
      </div>
    );
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <Router>
          <div className="min-h-screen bg-gray-50">
            {/* <Toaster position="top-right" /> // Removido para evitar erro de listener */}
            <Routes>
              <Route path="/" element={<VendasPage />} />
              <Route 
                path="/login" 
                element={
                  <ErrorBoundary fallback={<RouteFallback message="Erro ao carregar página de login" />}>
                    <Login />
                  </ErrorBoundary>
                } 
              />
              <Route 
                path="/signup" 
                element={
                  <ErrorBoundary fallback={<RouteFallback message="Erro ao carregar página de cadastro" />}>
                    <SignUp />
                  </ErrorBoundary>
                } 
              />
              <Route 
                path="/forgot-password" 
                element={
                  <ErrorBoundary fallback={<RouteFallback message="Erro ao carregar página de recuperação de senha" />}>
                    <ForgotPasswordPage />
                  </ErrorBoundary>
                } 
              />
              <Route 
                path="/reset-password" 
                element={
                  <ErrorBoundary fallback={<RouteFallback message="Erro ao carregar página de redefinição de senha" />}>
                    <ResetPasswordPage />
                  </ErrorBoundary>
                } 
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <PlanVerification>
          <div className="min-h-screen bg-gray-50">
            {/* <Toaster position="top-right" /> // Removido para evitar erro de listener */}
            <div className="p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard CRM PMG</h1>
              <p className="text-gray-600">Bem-vindo ao sistema! O fluxo de recuperação de senha está funcionando.</p>
              <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h2 className="text-green-800 font-semibold">✅ Fluxo de Recuperação de Senha Implementado</h2>
                <ul className="mt-2 text-green-700 space-y-1">
                  <li>• Botão "Esqueci minha senha" na tela de login</li>
                  <li>• Página /forgot-password funcional</li>
                  <li>• Página /reset-password com validação de token</li>
                  <li>• Integração completa com Supabase Auth</li>
                  <li>• Validação de senha forte</li>
                  <li>• Tratamento de erros e feedback visual</li>
                </ul>
              </div>
            </div>
          </div>
        </PlanVerification>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
