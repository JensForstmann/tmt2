#!/bin/sh

cd "$(dirname "$0")"

docker run --rm -it -v .:/app node:20-alpine sh -c "cd /app && npm install && cd /app/backend && npm install && cd /app/frontend && npm install && mkdir -p /app/frontend/dist"
