import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { supabaseAuthService } from '../../services/supabaseAuth';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader, Info } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Digite seu email');
      return;
    }

    // Validate email using Supabase service
    const emailValidation = supabaseAuthService.validateEmail(email);
    if (!emailValidation.isValid) {
      toast.error(emailValidation.error || 'Email inválido');
      return;
    }

    setIsLoading(true);
    setIsSubmitted(true);

    try {
      // Use Supabase Auth for password reset
      const result = await supabaseAuthService.resetPasswordForEmail(email);

      if (result.error) {
        toast.error(result.error);
        
        // Handle rate limiting from Supabase
        if (result.isRateLimited) {
          toast.error('Muitas tentativas detectadas. Aguarde alguns minutos antes de tentar novamente.');
        }
      } else {
        setIsSuccess(true);
        toast.success('Email de recuperação enviado com sucesso!');
      }
    } catch (error: any) {
      console.error('Erro inesperado:', error);
      toast.error('Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <button
            onClick={handleBackToLogin}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o login
          </button>
          
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-white" />
          </div>
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Recuperar Senha
          </h2>
          
          <p className="mt-2 text-sm text-gray-600">
            Digite seu email para receber as instruções de recuperação
          </p>
        </div>

        {/* Form */}
        {!isSuccess ? (
          <div className="mt-8">
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Email enviado com sucesso!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Enviamos as instruções para recuperar sua senha no email <strong>{email}</strong>
                    </p>
                    <p className="mt-2">
                      Verifique sua caixa de entrada e a pasta de spam. Caso não receba o email em alguns minutos, tente novamente.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={handleBackToLogin}
                className="font-medium text-primary-600 hover:text-primary-500 text-sm"
              >
                Voltar para o login
              </button>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="label">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={isLoading || isSubmitted}
                    className="input pl-10 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || isSubmitted || !email}
                className="group relative w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    Enviando...
                  </div>
                ) : (
                  'Enviar recuperação'
                )}
              </button>
            </div>

            {/* Help text */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Você receberá um email com link para redefinir sua senha.
                <br />
                O link expirará em 24 horas.
              </p>
            </div>
          </form>
        )}

        {/* Error state */}
        {isSubmitted && !isSuccess && !isLoading && (
          <div className="mt-4">
            <div className="rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Não foi possível enviar o email
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Verifique se o email está correto e tente novamente.
                    </p>
                    <p className="mt-1">
                      Se o problema persistir, entre em contato com o suporte.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
