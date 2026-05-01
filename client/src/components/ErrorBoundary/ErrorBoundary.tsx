import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log error details for debugging
    const errorDetails = {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Store error details in localStorage for debugging
    const existingErrors = JSON.parse(localStorage.getItem('app_errors') || '[]');
    existingErrors.push(errorDetails);
    
    // Keep only last 50 errors
    if (existingErrors.length > 50) {
      existingErrors.splice(0, existingErrors.length - 50);
    }
    
    localStorage.setItem('app_errors', JSON.stringify(existingErrors));
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleClearErrors = () => {
    localStorage.removeItem('app_errors');
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Ops! Algo deu errado
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Ocorreu um erro inesperado na aplicação.
              </p>
            </div>

            <div className="bg-white shadow-sm rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">O que aconteceu?</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {this.state.error?.message || 'Ocorreu um erro ao carregar esta página.'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Informações técnicas:</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>• URL: {window.location.href}</p>
                    <p>• Horário: {new Date().toLocaleString()}</p>
                    <p>• Erro: {this.state.error?.name || 'Desconhecido'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={this.handleReload}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Recarregar página
                  </button>

                  <button
                    onClick={this.handleGoHome}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Ir para página inicial
                  </button>

                  {process.env.NODE_ENV === 'development' && (
                    <button
                      onClick={this.handleClearErrors}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Limpar erros (Desenvolvimento)
                    </button>
                  )}
                </div>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4">
                    <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                      Ver detalhes do erro (Desenvolvimento)
                    </summary>
                    <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-800 overflow-auto max-h-40">
                      <pre>{this.state.error.stack}</pre>
                    </div>
                  </details>
                )}
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Se o problema persistir, contate o suporte técnico.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
