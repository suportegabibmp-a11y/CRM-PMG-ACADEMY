import { supabase } from './supabase';

export const handleForgotPassword = async (email: string) => {
  try {
    console.log('Iniciando processo de recuperação de senha para:', email);
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      throw new Error(error.message);
    }

    console.log('Email de recuperação enviado com sucesso:', data);
    return { success: true, message: 'Email de recuperação enviado com sucesso!' };
    
  } catch (error) {
    console.error('Erro no handleForgotPassword:', error);
    throw error;
  }
};
