// Edge Function "api" do Cardápio Digital (Supabase).
// Roda o servidor Express do repositório, fixado num commit (não muda sozinho):
// para publicar mudanças, troque o commit abaixo e publique a função de novo.
// O Supabase injeta SUPABASE_DB_URL, então o banco conecta sem configuração.
// A autenticação é feita pelo próprio servidor (sessões e códigos de uso único),
// por isso a função é publicada com verify_jwt desligado.
import app from 'https://raw.githubusercontent.com/suportegabibmp-a11y/CRM-PMG-ACADEMY/407fd7125210740e940cd25236a09c1f7568bbf7/cardapio-digital/server/index.js';

app.listen(8000);
