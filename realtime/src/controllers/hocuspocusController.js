const Y = require('yjs');
const {
  buildVerifySessionRequest,
  normalizeVerifySessionResponse,
  normalizeLoadDocumentResponse,
  buildStoreDocumentRequest,
} = require('../dtos/collabDtos');
const { CollabScopes } = require('../domain/collab');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class HocuspocusController {
  constructor(service, logger) {
    this.service = service;
    this.logger = logger;
  }

  async onAuthenticate({ token, documentName }) {
    const response = await this.service.verifySession(
      buildVerifySessionRequest(token, documentName),
    );
    const normalized = normalizeVerifySessionResponse(response);

    return {
      userId: normalized.userId,
      scope: normalized.scope,
    };
  }

  async onLoadDocument({ documentName }) {
    const response = await this.service.loadDocument(documentName);
    const snapshot = normalizeLoadDocumentResponse(response);
    if (!snapshot) {
      return null;
    }

    const ydoc = new Y.Doc();
    const update = Buffer.from(snapshot, 'base64');
    Y.applyUpdate(ydoc, update);
    return ydoc;
  }

  async onStoreDocument({ documentName, document, context }) {
    const scope = Array.isArray(context.scope) ? context.scope : [];
    if (!scope.includes(CollabScopes.WRITE)) {
      return;
    }

    const update = Y.encodeStateAsUpdate(document);
    const payload = buildStoreDocumentRequest(
      Buffer.from(update).toString('base64'),
      context.userId,
      [CollabScopes.WRITE],
    );

    try {
      await this.service.storeDocument(documentName, payload);
    } catch (err) {
      this.logger.error({ err, documentName }, 'storeDocument failed, retrying once');
      await sleep(500);
      try {
        await this.service.storeDocument(documentName, payload);
      } catch (retryErr) {
        this.logger.error({ err: retryErr, documentName }, 'storeDocument retry failed');
      }
    }
  }
}

module.exports = {
  HocuspocusController,
};
