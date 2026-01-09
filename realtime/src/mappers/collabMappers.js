function mapVerifySessionRequest(collabToken, noteId) {
  return {
    collab_token: collabToken,
    note_id: noteId,
  };
}

function mapVerifySessionResponse(response) {
  return {
    userId: response ? response.user_id : null,
    username: response ? response.username : null,
    color: response ? response.color : null,
    scope: response ? response.scope : undefined,
  };
}

function mapLoadDocumentResponse(response) {
  return {
    yjsSnapshot: response ? response.yjs_snapshot : null,
  };
}

function mapStoreDocumentRequest(yjsSnapshot) {
  return {
    yjs_snapshot: yjsSnapshot,
  };
}

module.exports = {
  mapVerifySessionRequest,
  mapVerifySessionResponse,
  mapLoadDocumentResponse,
  mapStoreDocumentRequest,
};
