import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string; isRateLimited?: boolean }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no login:', error);
        return { error: 'Email ou senha incorretos' };
      }

      if (data.user) {
        setUser(data.user);
        return {};
      }

      return { error: 'Erro desconhecido ao fazer login' };
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      return { error: error.message || 'Ocorreu um erro. Tente novamente.' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsRateLimited(false);
      setRemainingAttempts(5);
      setRateLimitResetTime(0);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
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
