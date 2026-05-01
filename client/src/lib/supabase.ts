import { createClient } from '@supabase/supabase-js';

// Debug logs para verificar configuração
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://xmvebvicyqneswedgwna.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdmVidmljeXFuZXN3ZWRnd25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjU5OTQsImV4cCI6MjA5MzE0MTk5NH0.7Lt0tGn-BO5aed8MBvFu3AHsaN7utFxvszxydm7d9ks';

// Logs de debug
console.log('🔍 Supabase Config Debug:');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseAnonKey);
console.log('Key length:', supabaseAnonKey?.length);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Teste de conexão
supabase.auth.getSession().then(({ data, error }) => {
  console.log('🔍 Supabase Connection Test:');
  console.log('Session exists:', !!data.session);
  console.log('Error:', error);
});

export default supabase;
