// Edge Function "api" do Supabase: roda o mesmo servidor Express do projeto.
// O Supabase injeta SUPABASE_DB_URL, então o banco conecta sem configuração.
// Publicada a partir destes arquivos + a pasta server/ (veja scripts/edge-files.mjs).
import app from './server/index.js';

app.listen(8000);
