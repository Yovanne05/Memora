const Y = require('yjs');
const {
  mapVerifySessionRequest,
  mapVerifySessionResponse,
  mapLoadDocumentResponse,
  mapStoreDocumentRequest,
} = require('../mappers/collabMappers');
const { CollabScopes } = require('../domain/collab');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildYDocFromSnapshot(snapshot, logger) {
  const ydoc = new Y.Doc();
  if (!snapshot || typeof snapshot !== 'string' || !snapshot.trim()) {
    return ydoc;
  }

  const trimmed = snapshot.trim();
  if (trimmed === 'null' || trimmed === '[]') {
    return ydoc;
  }

  const isBase64 =
    trimmed.length % 4 === 0 && /^[A-Za-z0-9+/]+={0,2}$/.test(trimmed);
  if (!isBase64) {
    logger.warn({ snapshotLength: trimmed.length }, 'Invalid yjs_snapshot format');
    return ydoc;
  }

  try {
    const update = Buffer.from(trimmed, 'base64');
    if (update.length < 2) {
      return ydoc;
    }

    const asText = update.toString('utf8');
    const isPrintableAscii = /^[\t\n\r\x20-\x7E]*$/.test(asText);
    const looksLikeJson =
      isPrintableAscii && (asText.trim().startsWith('{') || asText.trim().startsWith('['));
    if (looksLikeJson) {
      return ydoc;
    }

    Y.applyUpdate(ydoc, update);
  } catch (err) {
    logger.warn({ err }, 'Invalid yjs_snapshot, starting with empty doc');
    return ydoc;
  }

  return ydoc;
}

class HocuspocusController {
  constructor(service, logger) {
    this.service = service;
    this.logger = logger;
  }

  async onAuthenticate({ token, documentId }) {
    this.logger.info(
      { documentId, token: token },)
    this.logger.info(
      { documentId, hasToken: Boolean(token) },
      'onAuthenticate called',
    );
    const response = await this.service.verifySession(
      mapVerifySessionRequest(token, documentId),
    );
    const normalized = mapVerifySessionResponse(response);

    return {
      user: {
        id: normalized.userId,
        name: normalized.username,
        color: normalized.color,
      },
      scope: normalized.scope,
    };
  }

  async onLoadDocument({ documentId }) {
    this.logger.info({ documentId }, 'onLoadDocument called');
    const response = await this.service.loadDocument(documentId);
    const mapped = mapLoadDocumentResponse(response);
    return buildYDocFromSnapshot(mapped.yjsSnapshot, this.logger);
  }

  async onStoreDocument({ documentId, document, context }) {
    this.logger.info({ documentId }, 'onStoreDocument called');
    const scope = Array.isArray(context.scope) ? context.scope : [];
    if (!scope.includes(CollabScopes.WRITE)) {
      this.logger.info({ documentId, scope }, 'onStoreDocument skipped: no write scope');
      return;
    }

    const update = Y.encodeStateAsUpdate(document);
    const payload = mapStoreDocumentRequest(Buffer.from(update).toString('base64'));

    try {
      await this.service.storeDocument(documentId, payload);
    } catch (err) {
      this.logger.error({ err, documentId }, 'storeDocument failed, retrying once');
      await sleep(500);
      try {
        await this.service.storeDocument(documentId, payload);
      } catch (retryErr) {
        this.logger.error({ err: retryErr, documentId }, 'storeDocument retry failed');
      }
    }
  }
}

module.exports = {
  HocuspocusController,
};
