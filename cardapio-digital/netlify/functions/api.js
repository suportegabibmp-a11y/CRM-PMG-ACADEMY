// Toda a API roda nesta função. O netlify.toml redireciona /api/* para cá.
process.env.NODE_ENV ||= 'production';

const serverless = require('serverless-http');
const app = require('../../server/index');

const PREFIX = '/.netlify/functions/api';

const handler = serverless(app, {
  request(req) {
    // Dependendo de como a rota chega, o caminho vem com o prefixo da função.
    if (req.url.startsWith(PREFIX)) req.url = '/api' + req.url.slice(PREFIX.length);
  },
});

exports.handler = async (event, context) => {
  // Não espera o pool do Postgres fechar para responder.
  context.callbackWaitsForEmptyEventLoop = false;
  return handler(event, context);
};
