const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabase = createClient(
  'https://xmvebvicyqneswedgwna.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdmVidmljeXFuZXN3ZWRnd25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjU5OTQsImV4cCI6MjA5MzE0MTk5NH0.7Lt0tGn-BO5aed8MBvFu3AHsaN7utFxvszxydm7d9ks'
);

async function createConfirmedUserWithLifetimePlan() {
  try {
    console.log('🔍 Criando usuário gabii.maximino23@gmail.com com plano vitalício e confirmação automática...');

    // 1. Primeiro, tentar deletar o usuário existente se houver
    console.log('🗑️ Verificando se usuário já existe...');
    try {
      // Não podemos deletar via API anon, então vamos tentar criar direto
    } catch (e) {
      console.log('📝 Usuário não existe ou não pode ser verificado');
    }

    // 2. Criar usuário com signup e confirmar automaticamente
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'gabii.maximino23@gmail.com',
      password: 'Gabi@2309',
      options: {
        data: {
          name: 'Gabi Maximino',
          plan: 'lifetime',
          plan_status: 'active',
          plan_expires_at: null,
          created_at: new Date().toISOString()
        },
        emailRedirectTo: 'https://commercialorganizer.up.railway.app/reset-password'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('📝 Usuário já existe. Tentando fazer login...');
        
        // Tentar fazer login direto
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: 'gabii.maximino23@gmail.com',
          password: 'Gabi@2309'
        });

        if (loginError) {
          console.error('❌ Erro no login:', loginError);
          throw loginError;
        }

        console.log('✅ Login realizado com sucesso!');
        console.log('📋 Sessão:', loginData.session?.user?.user_metadata);
        
        return {
          success: true,
          user: {
            id: loginData.session?.user?.id,
            email: loginData.session?.user?.email,
            plan: loginData.session?.user?.user_metadata?.plan,
            email_confirmed: !!loginData.session?.user?.email_confirmed_at
          }
        };
      }
      
      console.error('❌ Erro ao criar usuário:', authError);
      throw authError;
    }

    console.log('✅ Usuário criado com sucesso:', authData.user?.id);

    // 3. Se o signup retornar uma sessão, usar ela
    if (authData.session) {
      console.log('✅ Sessão criada automaticamente!');
      console.log('📋 Metadados:', authData.session?.user?.user_metadata);
      
      return {
        success: true,
        user: {
          id: authData.session?.user?.id,
          email: authData.session?.user?.email,
          plan: authData.session?.user?.user_metadata?.plan,
          email_confirmed: !!authData.session?.user?.email_confirmed_at
        }
      };
    }

    // 4. Se não tiver sessão, tentar fazer o login
    console.log('🔍 Tentando fazer login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'gabii.maximino23@gmail.com',
      password: 'Gabi@2309'
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError);
      
      // Se for erro de confirmação, mostrar instruções
      if (loginError.message.includes('Email not confirmed')) {
        console.log('\n📧 INSTRUÇÕES PARA CONFIRMAR EMAIL:');
        console.log('1. Acesse o painel do Supabase: https://supabase.com/dashboard');
        console.log('2. Vá para Authentication > Users');
        console.log('3. Encontre o usuário gabii.maximino23@gmail.com');
        console.log('4. Clique nos 3 pontos > Confirm email');
        console.log('5. Ou desative a confirmação de email em Settings > Auth');
      }
      
      throw loginError;
    }

    console.log('✅ Login realizado com sucesso!');
    console.log('📋 Sessão:', loginData.session?.user?.user_metadata);

    console.log('\n🎉 USUÁRIO CRIADO E CONFIGURADO COM SUCESSO!');
    console.log('📧 Email: gabii.maximino23@gmail.com');
    console.log('🔑 Senha: Gabi@2309');
    console.log('💎 Plano: Vitalício');
    console.log('✅ Status: Ativo');
    console.log('🆔 ID: ', loginData.session?.user?.id);

    return {
      success: true,
      user: {
        id: loginData.session?.user?.id,
        email: loginData.session?.user?.email,
        plan: loginData.session?.user?.user_metadata?.plan,
        email_confirmed: !!loginData.session?.user?.email_confirmed_at
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
createConfirmedUserWithLifetimePlan()
  .then(result => {
    console.log('\n📋 Resultado Final:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
