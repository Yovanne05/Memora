class CollabService {
  constructor(baseUrl, apiKey, logger) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.logger = logger;
  }

  async verifySession(payload) {
    const res = await this.fetch('/collab/sessions/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      this.logger.warn({ status: res.status }, 'verifySession failed');
      throw new Error('Unauthorized');
    }

    return res.json();
  }

  async loadDocument(documentId) {
    const res = await this.fetch(`/collab/documents/${encodeURIComponent(documentId)}`, {
      method: 'GET',
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      this.logger.warn({ status: res.status }, 'loadDocument failed');
      throw new Error(`Failed to load document: ${res.status}`);
    }

    return res.json();
  }

  async storeDocument(documentId, payload) {
    const res = await this.fetch(`/collab/documents/${encodeURIComponent(documentId)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      this.logger.warn({ status: res.status }, 'storeDocument failed');
      throw new Error(`Failed to store document: ${res.status}`);
    }
  }

  fetch(path, options) {
    const url = `${this.baseUrl}${path}`;
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        ...(options.headers || {}),
      },
    });
  }
}

module.exports = {
  CollabService,
};
