import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Building, Mail, Lock, Eye, EyeOff, AlertTriangle, Clock, UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabaseAuthService } from '../../services/supabaseAuth';
import { sanitizeInput } from '../../security/securityConfig';
import { rateLimiter } from '../../utils/rateLimiter';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { login, isRateLimited, remainingAttempts, rateLimitResetTime } = useAuth();
  const navigate = useNavigate();

  // Format remaining time for display
  const formatTimeRemaining = (ms: number): string => {
    const minutes = Math.ceil(ms / 60000);
    return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  // Validate email on change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const sanitized = sanitizeInput(value);
    setEmail(sanitized);
    
    const emailValidation = supabaseAuthService.validateEmail(sanitized);
    if (sanitized && !emailValidation.isValid) {
      setEmailError(emailValidation.error || 'Email inválido');
    } else {
      setEmailError('');
    }
  };

  // Validate password on change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const sanitized = sanitizeInput(value);
    setPassword(sanitized);
    
    const passwordValidation = supabaseAuthService.validatePasswordStrength(sanitized);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.errors[0]);
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setEmailError('');
    setPasswordError('');
    
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    // Validate email format
    const emailValidation = supabaseAuthService.validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || 'Email inválido');
      return;
    }

    // Validate password strength
    const passwordValidation = supabaseAuthService.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.errors[0]);
      return;
    }

    // Check rate limiting
    if (isRateLimited) {
      toast.error(`Muitas tentativas. Tente novamente em ${formatTimeRemaining(rateLimitResetTime)}`);
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.error) {
        toast.error(result.error);
        
        // Handle rate limiting from Supabase
        if (result.isRateLimited) {
          toast.error('Muitas tentativas detectadas. Aguarde alguns minutos antes de tentar novamente.');
        }
      } else {
        toast.success('Login realizado com sucesso!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
            <Building className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            CRM PMG
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Faça login para acessar o sistema
          </p>
        </div>

        {/* Rate Limiting Warning */}
        {isRateLimited && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Limite de tentativas excedido
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    Muitas tentativas de login falharam. Tente novamente em{' '}
                    <span className="font-semibold">
                      {formatTimeRemaining(rateLimitResetTime)}
                    </span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Remaining Attempts Warning */}
        {!isRateLimited && remainingAttempts < 5 && remainingAttempts > 0 && (
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Tentativas restantes: {remainingAttempts}
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Restam {remainingAttempts} tentativa{remainingAttempts > 1 ? 's' : ''} antes do bloqueio temporário.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
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
                  className={`input pl-10 ${emailError ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="seu@email.com"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isRateLimited}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="label">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className={`input pl-10 pr-10 ${passwordError ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={isRateLimited}
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
              {/* Email Error Message */}
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="label">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className={`input pl-10 pr-10 ${passwordError ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={isRateLimited}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isRateLimited}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {/* Password Error Message */}
              {passwordError && (
                <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </div>

          <div className="text-center space-y-2">
            <button
              type="button"
              className="font-medium text-primary-600 hover:text-primary-500 text-sm"
              onClick={() => navigate('/forgot-password')}
            >
              Esqueci minha senha
            </button>
            
            <div className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <button
                type="button"
                className="font-medium text-primary-600 hover:text-primary-500"
                onClick={handleSignUp}
              >
                <UserPlus className="h-4 w-4 inline mr-1" />
                Criar conta
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
