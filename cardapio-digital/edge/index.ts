// Edge Function "api" do Cardápio Digital (Supabase).
// Roda o servidor Express do repositório, fixado num commit (não muda sozinho):
// para publicar mudanças, troque o commit abaixo e publique a função de novo.
// O Supabase injeta SUPABASE_DB_URL, então o banco conecta sem configuração.
// A autenticação é feita pelo próprio servidor (sessões e códigos de uso único),
// por isso a função é publicada com verify_jwt desligado.
import app from 'https://raw.githubusercontent.com/suportegabibmp-a11y/CRM-PMG-ACADEMY/150ed6c356187adf9941d12756ce1f2707463f58/cardapio-digital/server/index.js';

app.listen(8000);
