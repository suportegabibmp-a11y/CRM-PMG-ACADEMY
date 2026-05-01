import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { supabaseAuthService } from '../../services/supabaseAuth';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader, ArrowLeft, Info } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Validação de senha forte
  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'A senha deve ter pelo menos 8 caracteres';
    }
    if (!/[A-Z]/.test(password)) {
      return 'A senha deve ter pelo menos uma letra maiúscula';
    }
    if (!/[a-z]/.test(password)) {
      return 'A senha deve ter pelo menos uma letra minúscula';
    }
    if (!/\d/.test(password)) {
      return 'A senha deve ter pelo menos um número';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'A senha deve ter pelo menos um caractere especial';
    }
    return '';
  };

  // Validar sessão de recuperação ao carregar componente
  useEffect(() => {
    const validateRecoverySession = async () => {
      try {
        // Verificar se há uma sessão de recuperação ativa
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          setError('Link de recuperação inválido ou expirado');
        } else {
          // Verificar se é uma sessão de recuperação
          const { data: { user } } = await supabase.auth.getUser(session.access_token);
          if (!user) {
            setError('Sessão inválida');
          }
        }
      } catch (err) {
        setError('Erro ao validar sessão de recuperação');
      }

      setIsValidating(false);
    };

    validateRecoverySession();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error('Preencha todos os campos');
      return;
    }

    // Validate password strength using Supabase service
    const passwordValidation = supabaseAuthService.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.errors[0]);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Use Supabase Auth to update password
      const result = await supabaseAuthService.updatePassword(password);

      if (result.error) {
        setError(result.error);
      } else {
        setIsSuccess(true);
        toast.success('Senha redefinida com sucesso!');
        
        // Limpar URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Redirecionar após 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err: any) {
      console.error('Erro ao redefinir senha:', err);
      setError('Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Validando token de recuperação...</p>
        </div>
      </div>
    );
  }

  if (error && !isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <button
            onClick={handleBackToLogin}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o login
          </button>

          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Erro na Recuperação
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {error}
            </p>
          </div>

          <div className="mt-6">
            <button
              onClick={handleBackToLogin}
              className="w-full btn btn-primary"
            >
              Voltar para o Login
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Se o problema persistir, entre em contato com o suporte.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Senha Redefinida!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sua senha foi atualizada com sucesso.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Você será redirecionado para a página de login em alguns segundos...
          </p>
        </div>
      </div>
    );
  }

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
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Redefinir Senha
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Digite sua nova senha abaixo
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="label">
                Nova Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                  className="input pl-10 pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Digite sua nova senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                  className="input pl-10 pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Confirme sua nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Password requirements */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Requisitos da senha:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center">
                <span className={password.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                  ✓
                </span>
                <span className="ml-2">Pelo menos 8 caracteres</span>
              </li>
              <li className="flex items-center">
                <span className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                  ✓
                </span>
                <span className="ml-2">Uma letra maiúscula</span>
              </li>
              <li className="flex items-center">
                <span className={/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                  ✓
                </span>
                <span className="ml-2">Uma letra minúscula</span>
              </li>
              <li className="flex items-center">
                <span className={/\d/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                  ✓
                </span>
                <span className="ml-2">Um número</span>
              </li>
              <li className="flex items-center">
                <span className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                  ✓
                </span>
                <span className="ml-2">Um caractere especial</span>
              </li>
            </ul>
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Erro
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              className="group relative w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Redefinindo...
                </div>
              ) : (
                'Redefinir Senha'
              )}
            </button>
          </div>

          {/* Help text */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Sua nova senha deve ser segura e única.
              <br />
              Não use a mesma senha de outros serviços.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
