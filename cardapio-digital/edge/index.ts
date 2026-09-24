// Edge Function "api" do Cardápio Digital (Supabase).
// Roda o servidor Express do repositório, fixado num commit (não muda sozinho):
// para publicar mudanças, troque o commit abaixo e publique a função de novo.
// O Supabase injeta SUPABASE_DB_URL, então o banco conecta sem configuração.
// A autenticação é feita pelo próprio servidor (sessões e códigos de uso único),
// por isso a função é publicada com verify_jwt desligado.
import app from 'https://raw.githubusercontent.com/suportegabibmp-a11y/CRM-PMG-ACADEMY/e0eb329c78164f716efa0b965ee9215101d926e5/cardapio-digital/server/index.js';

app.listen(8000);
