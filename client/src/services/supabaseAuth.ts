// Supabase Auth Service - CRM PMG
// Autenticação 100% frontend + Supabase

import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  avatar_url?: string;
}

export interface AuthResponse {
  user: User | null;
  error?: string;
  isRateLimited?: boolean;
}

export interface SignUpResponse {
  user?: User;
  error?: string;
  needsEmailVerification?: boolean;
  isRateLimited?: boolean;
}

class SupabaseAuthService {
  // Login com email e senha
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMessage = 'Erro ao fazer login';
        
        // Tratamento específico de erros do Supabase
        switch (error.message) {
          case 'Invalid login credentials':
            errorMessage = 'Email ou senha incorretos';
            break;
          case 'Email not confirmed':
            errorMessage = 'Email não confirmado. Verifique sua caixa de entrada.';
            break;
          case 'Too many requests':
            errorMessage = 'Muitas tentativas detectadas. Aguarde alguns minutos antes de tentar novamente.';
            break;
          default:
            errorMessage = error.message;
        }

        return { user: null, error: errorMessage, isRateLimited: error.message === 'Too many requests' };
      }

      const user: User = {
        id: data.user?.id || '',
        email: data.user?.email || '',
        name: data.user?.user_metadata?.name || '',
        role: data.user?.user_metadata?.role || 'user',
        avatar_url: data.user?.user_metadata?.avatar_url,
      };

      return { user };
    } catch (err) {
      return { 
        user: null, 
        error: 'Erro inesperado ao fazer login. Tente novamente.' 
      };
    }
  }

  // Cadastro de novo usuário
  async signUp(email: string, password: string, name?: string, role?: string): Promise<SignUpResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
            role: role || 'user',
          },
        },
      });

      if (error) {
        let errorMessage = 'Erro ao criar conta';
        
        switch (error.message) {
          case 'User already registered':
            errorMessage = 'Este email já está cadastrado. Tente fazer login.';
            break;
          case 'Password should be at least 6 characters':
            errorMessage = 'A senha deve ter pelo menos 6 caracteres';
            break;
          case 'Invalid email':
            errorMessage = 'Email inválido';
            break;
          case 'Too many requests':
            errorMessage = 'Muitas tentativas detectadas. Aguarde alguns minutos antes de tentar novamente.';
            break;
          default:
            errorMessage = error.message;
        }

        return { error: errorMessage, isRateLimited: error.message === 'Too many requests' };
      }

      // Se o usuário foi criado mas precisa confirmar email
      if (data.user && !data.session) {
        return {
          needsEmailVerification: true,
          error: 'Por favor, confirme seu email para continuar.'
        };
      }

      const user: User = {
        id: data.user?.id || '',
        email: data.user?.email || '',
        name: data.user?.user_metadata?.name || name || email.split('@')[0],
        role: data.user?.user_metadata?.role || role || 'user',
        avatar_url: data.user?.user_metadata?.avatar_url,
      };

      return { user };
    } catch (err) {
      return { 
        error: 'Erro inesperado ao criar conta. Tente novamente.' 
      };
    }
  }

  // Esqueci minha senha
  async resetPasswordForEmail(email: string): Promise<{ error?: string; isRateLimited?: boolean }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        let errorMessage = 'Erro ao enviar email de recuperação';
        
        switch (error.message) {
          case 'User not found':
            errorMessage = 'Email não encontrado em nossa base de dados.';
            break;
          case 'Too many requests':
            errorMessage = 'Muitas tentativas detectadas. Aguarde alguns minutos antes de tentar novamente.';
            break;
          default:
            errorMessage = error.message;
        }

        return { error: errorMessage, isRateLimited: error.message === 'Too many requests' };
      }

      return {};
    } catch (err) {
      return { 
        error: 'Erro ao enviar email de recuperação. Tente novamente.' 
      };
    }
  }

  // Atualizar senha (usado na página de reset)
  async updatePassword(newPassword: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        let errorMessage = 'Erro ao atualizar senha';
        
        switch (error.message) {
          case 'Password should be at least 6 characters':
            errorMessage = 'A senha deve ter pelo menos 6 caracteres';
            break;
          default:
            errorMessage = error.message;
        }

        return { error: errorMessage };
      }

      return {};
    } catch (err) {
      return { 
        error: 'Erro ao atualizar senha. Tente novamente.' 
      };
    }
  }

  // Reenviar email de confirmação
  async resendConfirmationEmail(email: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        let errorMessage = 'Erro ao reenviar email de confirmação';
        
        switch (error.message) {
          case 'User already confirmed':
            errorMessage = 'Este email já foi confirmado.';
            break;
          default:
            errorMessage = error.message;
        }

        return { error: errorMessage };
      }

      return {};
    } catch (err) {
      return { 
        error: 'Erro ao reenviar email. Tente novamente.' 
      };
    }
  }

  // Obter usuário atual
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || '',
        role: user.user_metadata?.role || 'user',
        avatar_url: user.user_metadata?.avatar_url,
      };
    } catch {
      return null;
    }
  }

  // Logout
  async signOut(): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { error: 'Erro ao fazer logout' };
      }

      return {};
    } catch {
      return { error: 'Erro ao fazer logout' };
    }
  }

  // Listener de mudanças de autenticação
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || '',
          role: session.user.user_metadata?.role || 'user',
          avatar_url: session.user.user_metadata?.avatar_url,
        };
        callback(user);
      } else {
        callback(null);
      }
    });
  }

  // Validação de senha forte
  validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('A senha deve ter pelo menos 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('A senha deve ter pelo menos uma letra maiúscula');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('A senha deve ter pelo menos uma letra minúscula');
    }

    if (!/\d/.test(password)) {
      errors.push('A senha deve ter pelo menos um número');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('A senha deve ter pelo menos um caractere especial');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validação de email
  validateEmail(email: string): { isValid: boolean; error?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Email inválido' };
    }

    return { isValid: true };
  }
}

export const supabaseAuthService = new SupabaseAuthService();
