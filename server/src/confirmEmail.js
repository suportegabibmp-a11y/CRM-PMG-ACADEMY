const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabase = createClient(
  'https://xmvebvicyqneswedgwna.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdmVidmljeXFuZXN3ZWRnd25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjU5OTQsImV4cCI6MjA5MzE0MTk5NH0.7Lt0tGn-BO5aed8MBvFu3AHsaN7utFxvszxydm7d9ks'
);

async function confirmUserEmail() {
  try {
    console.log('🔍 Confirmando email do usuário gabii.maximino23@gmail.com...');

    // 1. Fazer login para obter o token de confirmação
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'gabii.maximino23@gmail.com',
      password: 'Gabi@2309'
    });

    if (signInError) {
      console.error('❌ Erro no login:', signInError);
      
      // Se o erro for de email não confirmado, tentar confirmar manualmente
      if (signInError.message.includes('Email not confirmed')) {
        console.log('📧 Email não confirmado. Tentando confirmar manualmente...');
        
        // Tentar reenviar email de confirmação
        const { data: resendData, error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email: 'gabii.maximino23@gmail.com'
        });

        if (resendError) {
          console.error('❌ Erro ao reenviar email de confirmação:', resendError);
        } else {
          console.log('✅ Email de confirmação reenviado com sucesso!');
          console.log('📧 Verifique a caixa de entrada de gabii.maximino23@gmail.com');
        }
      }
      
      throw signInError;
    }

    console.log('✅ Login realizado com sucesso!');
    console.log('📋 Sessão:', signInData.session?.user?.user_metadata);
    console.log('📧 Email confirmado:', signInData.session?.user?.email_confirmed_at);

    // 2. Verificar metadados do usuário
    const userData = signInData.session?.user;
    if (userData) {
      console.log('\n📋 Dados do Usuário:');
      console.log('🆔 ID:', userData.id);
      console.log('📧 Email:', userData.email);
      console.log('✅ Email Confirmado:', !!userData.email_confirmed_at);
      console.log('💎 Plano:', userData.user_metadata?.plan);
      console.log('📊 Status do Plano:', userData.user_metadata?.plan_status);
      console.log('📅 Data de Criação:', userData.user_metadata?.created_at);
    }

    return {
      success: true,
      user: {
        id: signInData.session?.user?.id,
        email: signInData.session?.user?.email,
        email_confirmed: !!signInData.session?.user?.email_confirmed_at,
        plan: signInData.session?.user?.user_metadata?.plan
      }
    };

  } catch (error) {
    console.error('❌ Erro ao confirmar email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Executar a função
confirmUserEmail()
  .then(result => {
    console.log('\n📋 Resultado:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
