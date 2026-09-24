// Servidor local: npm start
import process from 'node:process';
import app from './index.js';

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`Cardápio Digital rodando em http://localhost:${port}`));
