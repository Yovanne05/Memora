const dotenv = require('dotenv');

dotenv.config();

function loadEnv() {
  const flaskBaseUrl = process.env.FLASK_BASE_URL;
  const apiKey = process.env.COLLAB_SERVICE_API_KEY;
  const portRaw = process.env.PORT;
  const name = process.env.HOCUSPOCUS_NAME || 'collab-realtime';
  const timeoutRaw = process.env.HOCUSPOCUS_TIMEOUT;
  const debounceRaw = process.env.HOCUSPOCUS_DEBOUNCE;
  const maxDebounceRaw = process.env.HOCUSPOCUS_MAX_DEBOUNCE;
  const quietRaw = process.env.HOCUSPOCUS_QUIET;

  if (!flaskBaseUrl || !apiKey) {
    throw new Error('Missing required env: FLASK_BASE_URL or COLLAB_SERVICE_API_KEY');
  }

  const port = portRaw ? Number(portRaw) : 1234;
  if (Number.isNaN(port) || port <= 0) {
    throw new Error('Invalid PORT value');
  }

  const timeout = timeoutRaw ? Number(timeoutRaw) : 30000;
  const debounce = debounceRaw ? Number(debounceRaw) : 2000;
  const maxDebounce = maxDebounceRaw ? Number(maxDebounceRaw) : 10000;
  const quiet = quietRaw ? quietRaw.toLowerCase() === 'true' : true;

  if (Number.isNaN(timeout) || timeout <= 0) {
    throw new Error('Invalid HOCUSPOCUS_TIMEOUT value');
  }

  if (Number.isNaN(debounce) || debounce < 0) {
    throw new Error('Invalid HOCUSPOCUS_DEBOUNCE value');
  }

  if (Number.isNaN(maxDebounce) || maxDebounce < 0) {
    throw new Error('Invalid HOCUSPOCUS_MAX_DEBOUNCE value');
  }

  return {
    flaskBaseUrl,
    apiKey,
    port,
    name,
    timeout,
    debounce,
    maxDebounce,
    quiet,
  };
}

module.exports = {
  loadEnv,
};
