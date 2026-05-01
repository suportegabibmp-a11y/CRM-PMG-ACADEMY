import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast'; // Removido para evitar erro de listener
import { useAuth } from './hooks/useAuth';
import { Login } from './components/Auth/Login';
import { SignUp } from './components/Auth/SignUp';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { VendasPage } from './components/Vendas/VendasPage';
import { Dashboard } from './components/Dashboard/Dashboard';
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
        <Dashboard />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
