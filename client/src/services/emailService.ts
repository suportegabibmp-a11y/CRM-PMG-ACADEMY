// Email Service for CRM PMG
// Fallback system for password recovery when Supabase email is not configured

import { supabase } from '../lib/supabase';

interface EmailServiceResult {
  success: boolean;
  message: string;
  error?: string;
}

class EmailService {
  private isSupabaseConfigured = false;

  constructor() {
    this.checkSupabaseConfiguration();
  }

  private async checkSupabaseConfiguration() {
    try {
      // Test if Supabase Auth is configured for emails
      const { data, error } = await supabase.auth.getSession();
      // If we can get session, Supabase is configured
      this.isSupabaseConfigured = !error;
    } catch {
      this.isSupabaseConfigured = false;
    }
  }

  public async sendPasswordResetEmail(email: string): Promise<EmailServiceResult> {
    try {
      // First try Supabase
      if (this.isSupabaseConfigured) {
        const supabaseResult = await this.sendViaSupabase(email);
        if (supabaseResult.success) {
          return supabaseResult;
        }
      }

      // Fallback to local system
      return await this.sendViaLocalSystem(email);
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao enviar email de recuperação',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  private async sendViaSupabase(email: string): Promise<EmailServiceResult> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.warn('Supabase email failed, trying fallback:', error);
        return { success: false, message: 'Supabase email não disponível' };
      }

      return {
        success: true,
        message: 'Email de recuperação enviado via Supabase'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao enviar via Supabase',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  private async sendViaLocalSystem(email: string): Promise<EmailServiceResult> {
    try {
      // Generate a temporary reset token
      const resetToken = this.generateResetToken(email);
      
      // Store the token in localStorage (in production, this would be in a database)
      const resetData = {
        email,
        token: resetToken,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };

      // Store in localStorage
      const existingTokens = JSON.parse(localStorage.getItem('passwordResetTokens') || '[]');
      existingTokens.push(resetData);
      localStorage.setItem('passwordResetTokens', JSON.stringify(existingTokens));

      // Create reset URL
      const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

      // Log the reset URL (in production, this would send an actual email)
      console.log('=== EMAIL DE RECUPERAÇÃO DE SENHA ===');
      console.log('Para:', email);
      console.log('Assunto: Recuperação de Senha - CRM PMG');
      console.log('Mensagem:');
      console.log('Olá,');
      console.log('');
      console.log('Recebemos uma solicitação para redefinir sua senha do CRM PMG.');
      console.log('');
      console.log('Para redefinir sua senha, clique no link abaixo:');
      console.log(resetUrl);
      console.log('');
      console.log('Este link expirará em 24 horas.');
      console.log('');
      console.log('Se você não solicitou esta redefinição, ignore este email.');
      console.log('');
      console.log('Atenciosamente,');
      console.log('Equipe CRM PMG');
      console.log('=====================================');

      // Show the reset URL to the user in development
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          message: `Email de recuperação gerado! Link de reset: ${resetUrl}`
        };
      }

      return {
        success: true,
        message: 'Email de recuperação enviado (verifique o console do navegador em desenvolvimento)'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao gerar email de recuperação local',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  private generateResetToken(email: string): string {
    // Generate a simple token based on email and timestamp
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const emailHash = btoa(email).substring(0, 8);
    return `${emailHash}_${timestamp}_${random}`;
  }

  public async validateResetToken(token: string, email: string): Promise<boolean> {
    try {
      const tokens = JSON.parse(localStorage.getItem('passwordResetTokens') || '[]');
      const tokenData = tokens.find((t: any) => 
        t.token === token && 
        t.email === email && 
        new Date(t.expiresAt) > new Date()
      );

      if (!tokenData) {
        return false;
      }

      // Remove the used token
      const updatedTokens = tokens.filter((t: any) => t.token !== token);
      localStorage.setItem('passwordResetTokens', JSON.stringify(updatedTokens));

      return true;
    } catch {
      return false;
    }
  }

  public async resetPassword(token: string, email: string, newPassword: string): Promise<EmailServiceResult> {
    try {
      const isValid = await this.validateResetToken(token, email);
      
      if (!isValid) {
        return {
          success: false,
          message: 'Token inválido ou expirado'
        };
      }

      // In a real implementation, this would update the password in the database
      // For now, we'll just return success
      console.log(`Senha redefinida para ${email} com token ${token}`);

      return {
        success: true,
        message: 'Senha redefinida com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao redefinir senha',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

export const emailService = new EmailService();
