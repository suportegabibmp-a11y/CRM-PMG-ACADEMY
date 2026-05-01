import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulação de verificação de sessão
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Simulação de login - substituir com Supabase real depois
      const mockUser = { id: '1', email };
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      return {};
    } catch (err) {
      return { error: 'Erro ao fazer login. Tente novamente.' };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      // Simulação de signup - substituir com Supabase real depois
      const mockUser = { id: '1', email, name };
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      return {};
    } catch (err) {
      return { error: 'Erro ao criar conta. Tente novamente.' };
    }
  };

  const logout = async () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
