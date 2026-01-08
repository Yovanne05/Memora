const { Server } = require('@hocuspocus/server');
const { loadEnv } = require('./config/env');
const { logger } = require('./infrastructure/logger');
const { CollabService } = require('./services/collabService');
const { HocuspocusController } = require('./controllers/hocuspocusController');

const env = loadEnv();
const service = new CollabService(env.flaskBaseUrl, env.apiKey, logger);
const controller = new HocuspocusController(service, logger);

const server = new Server({
  name: env.name,
  port: env.port,
  timeout: env.timeout,
  debounce: env.debounce,
  maxDebounce: env.maxDebounce,
  quiet: env.quiet,
  async onAuthenticate(data) {
    return controller.onAuthenticate({
      token: data.token,
      documentId: data.documentId,
    });
  },
  async onLoadDocument(data) {
    return controller.onLoadDocument({
      documentId: data.documentId,
    });
  },
  async onStoreDocument(data) {
    await controller.onStoreDocument({
      documentId: data.documentId,
      document: data.document,
      context: data.context,
    });
  },
  async onListen({ port }) {
    logger.info(`Hocuspocus listening on :${port}`);
  },
});

server.listen();
