// Monta a lista de arquivos da Edge Function "api" do Supabase:
// edge/index.ts, edge/deno.json e server/*.js (exceto os que só rodam no Node).
// Uso: node scripts/edge-files.mjs > edge-files.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const NODE_ONLY = new Set(['start.js', 'seed.js']);
const files = [
  { name: 'index.ts', content: fs.readFileSync(path.join(root, 'edge/index.ts'), 'utf8') },
  { name: 'deno.json', content: fs.readFileSync(path.join(root, 'edge/deno.json'), 'utf8') },
  ...fs.readdirSync(path.join(root, 'server'))
    .filter((f) => f.endsWith('.js') && !NODE_ONLY.has(f))
    .map((f) => ({ name: `server/${f}`, content: fs.readFileSync(path.join(root, 'server', f), 'utf8') })),
];
process.stdout.write(JSON.stringify(files));
