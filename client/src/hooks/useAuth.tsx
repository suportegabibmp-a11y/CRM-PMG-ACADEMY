import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabaseAuthService, User } from '../services/supabaseAuth';
import { sanitizeInput } from '../security/securityConfig';
import { rateLimiter } from '../utils/rateLimiter';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ error?: string; isRateLimited?: boolean }>;
  logout: () => void;
  loading: boolean;
  isRateLimited: boolean;
  remainingAttempts: number;
  rateLimitResetTime: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [rateLimitResetTime, setRateLimitResetTime] = useState(0);

  useEffect(() => {
    // Verificar usuário atual ao carregar
    const initializeAuth = async () => {
      const currentUser = await supabaseAuthService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    initializeAuth();

    // Listener de mudanças de autenticação
    const { data: { subscription } } = supabaseAuthService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string; isRateLimited?: boolean }> => {
    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);

    // Validate email format
    const emailValidation = supabaseAuthService.validateEmail(sanitizedEmail);
    if (!emailValidation.isValid) {
      return { error: emailValidation.error || 'Email inválido' };
    }

    // Check rate limiting
    const rateLimitResult = rateLimiter.isRateLimited('login', sanitizedEmail, 5, 15 * 60 * 1000); // 5 attempts per 15 minutes
    
    if (!rateLimitResult.allowed) {
      setIsRateLimited(true);
      setRemainingAttempts(0);
      setRateLimitResetTime(rateLimitResult.resetTime);
      return { 
        error: 'Muitas tentativas de login. Tente novamente mais tarde.',
        isRateLimited: true 
      };
    }

    setRemainingAttempts(rateLimitResult.remainingAttempts);
    setRateLimitResetTime(rateLimitResult.resetTime);

    try {
      const result = await supabaseAuthService.signIn(sanitizedEmail, sanitizedPassword);
      
      if (result.error) {
        return { error: result.error, isRateLimited: result.isRateLimited };
      }

      if (result.user) {
        setUser(result.user);
        setIsRateLimited(false);
        return {};
      }

      return { error: 'Erro desconhecido ao fazer login' };
    } catch (error: any) {
      return { error: error.message || 'Ocorreu um erro. Tente novamente.' };
    }
  };

  const logout = async () => {
    await supabaseAuthService.signOut();
    setUser(null);
    setIsRateLimited(false);
    setRemainingAttempts(5);
    setRateLimitResetTime(0);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      isRateLimited, 
      remainingAttempts, 
      rateLimitResetTime 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Supabase Auth gerencia sessão automaticamente
// Não é necessário armazenamento manual de tokens
