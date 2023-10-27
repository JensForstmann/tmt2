#!/bin/sh

cd "$(dirname "$0")"

TMT_PORT_BACKEND="${TMT_PORT_BACKEND:-8080}"
TMT_PORT_FRONTEND="${TMT_PORT_FRONTEND:-5173}"

docker run --rm -it -v .:/app -p $TMT_PORT_BACKEND:8080 -p $TMT_PORT_FRONTEND:5173 node:20-alpine sh -c "cd /app/frontend && npm run dev & cd /app/backend && npm run dev"
