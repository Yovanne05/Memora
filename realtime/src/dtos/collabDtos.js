function buildVerifySessionRequest(token, documentId) {
  return {
    token,
    documentId,
  };
}

function normalizeVerifySessionResponse(data) {
  return {
    userId: data && data.userId ? data.userId : null,
    scope: Array.isArray(data && data.scope) ? data.scope : [],
  };
}

function normalizeLoadDocumentResponse(data) {
  if (!data || !data.ydoc) {
    return null;
  }

  return data.ydoc;
}

function buildStoreDocumentRequest(ydocBase64, userId, scope) {
  return {
    ydoc: ydocBase64,
    userId: userId || null,
    scope,
  };
}

module.exports = {
  buildVerifySessionRequest,
  normalizeVerifySessionResponse,
  normalizeLoadDocumentResponse,
  buildStoreDocumentRequest,
};
