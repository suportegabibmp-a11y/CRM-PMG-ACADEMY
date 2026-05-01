const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabase = createClient(
  'https://xmvebvicyqneswedgwna.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdmVidmljeXFuZXN3ZWRnd25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjU5OTQsImV4cCI6MjA5MzE0MTk5NH0.7Lt0tGn-BO5aed8MBvFu3AHsaN7utFxvszxydm7d9ks'
);

async function createUserWithLifetimePlan() {
  try {
    console.log('🔍 Criando usuário gabii.maximino23@gmail.com com plano vitalício...');

    // 1. Criar usuário no Supabase Auth usando signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'gabii.maximino23@gmail.com',
      password: 'Gabi@2309',
      options: {
        data: {
          name: 'Gabi Maximino',
          plan: 'lifetime',
          plan_status: 'active',
          plan_expires_at: null, // null para vitalício
          created_at: new Date().toISOString()
        }
      }
    });

    if (authError) {
      console.error('❌ Erro ao criar usuário no Supabase Auth:', authError);
      throw authError;
    }

    console.log('✅ Usuário criado no Supabase Auth:', authData.user?.id);

    if (!authData.user) {
      throw new Error('Usuário não foi criado corretamente');
    }

    console.log('\n🎉 USUÁRIO CRIADO COM SUCESSO!');
    console.log('📧 Email: gabii.maximino23@gmail.com');
    console.log('🔑 Senha: Gabi@2309');
    console.log('💎 Plano: Vitalício');
    console.log('🆔 ID: ', authData.user.id);
    console.log('📋 Metadados:', authData.user.user_metadata);

    // 2. Tentar fazer login para confirmar
    console.log('\n🔍 Testando login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'gabii.maximino23@gmail.com',
      password: 'Gabi@2309'
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError);
    } else {
      console.log('✅ Login realizado com sucesso!');
      console.log('� Sessão:', loginData.session?.user?.user_metadata);
    }

    return {
      success: true,
      user: {
        id: authData.user.id,
        email: 'gabii.maximino23@gmail.com',
        plan: 'lifetime',
        plan_status: 'active'
      }
    };

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Executar a função
createUserWithLifetimePlan()
  .then(result => {
    console.log('\n📋 Resultado:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
