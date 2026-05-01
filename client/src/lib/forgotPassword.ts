import { supabase } from './supabase';

export const handleForgotPassword = async (email: string) => {
  try {
    console.log('🔍 Iniciando processo de recuperação de senha para:', email);
    
    // Usar URL de produção se estiver no Railway, senão usar localhost
    const baseUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000'
      : 'https://commercialorganizer.up.railway.app';
    
    console.log('🔍 URL base para redirect:', baseUrl);
    console.log('🔍 URL completa de redirect:', `${baseUrl}/reset-password`);
    
    // Verificar configuração do Supabase antes de enviar
    console.log('🔍 Verificando configuração do Supabase...');
    console.log('🔍 Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
    console.log('🔍 Supabase Key exists:', !!process.env.REACT_APP_SUPABASE_ANON_KEY);
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/reset-password`
    });

    console.log('🔍 Resposta do Supabase:', { data, error });

    if (error) {
      console.error('❌ Erro ao enviar email de recuperação:', error);
      console.error('❌ Detalhes do erro:', {
        message: error.message,
        status: error.status,
        code: error.code || 'no_code'
      });
      
      // Verificar tipos comuns de erro
      if (error.message.includes('email')) {
        throw new Error('Email inválido ou não cadastrado');
      } else if (error.message.includes('rate') || error.message.includes('limit')) {
        throw new Error('Muitas tentativas. Tente novamente em alguns minutos');
      } else if (error.message.includes('configuration')) {
        throw new Error('Serviço de email não configurado. Contate o suporte');
      } else {
        throw new Error(`Erro: ${error.message}`);
      }
    }

    console.log('✅ Email de recuperação enviado com sucesso:', data);
    
    // Verificar se o retorno indica sucesso real
    if (data && Object.keys(data).length === 0) {
      console.warn('⚠️ Email enviado mas dados vazios retornados - isso pode ser normal');
    }
    
    return { 
      success: true, 
      message: 'Email de recuperação enviado! Verifique sua caixa de entrada e spam.',
      debug: { email, baseUrl, timestamp: new Date().toISOString() }
    };
    
  } catch (error: any) {
    console.error('❌ Erro no handleForgotPassword:', error);
    console.error('❌ Stack trace:', error.stack);
    
    // Adicionar fallback para teste
    if (window.location.hostname === 'localhost') {
      console.log('🔧 MODO DEBUG: Simulando envio bem-sucedido para teste local');
      return { 
        success: true, 
        message: 'MODO DEBUG: Email simulado como enviado. Verifique console para URL de teste.',
        debug: { 
          simulated: true, 
          email, 
          testUrl: `http://localhost:3000/reset-password#access_token=test&refresh_token=test`,
          timestamp: new Date().toISOString()
        }
      };
    }
    
    throw error;
  }
};
