#!/usr/bin/env sh
set -e

ENV_JS_PATH="/usr/share/nginx/html/env.js"

if [ -f "$ENV_JS_PATH" ]; then
  envsubst '${API_URL}' < "$ENV_JS_PATH" > /tmp/env.js
  mv /tmp/env.js "$ENV_JS_PATH"
fi

exec "$@"
