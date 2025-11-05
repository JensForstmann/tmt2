#!/usr/bin/env sh

cd "$(dirname "$0")"

TMT_PORT_BACKEND="${TMT_PORT_BACKEND:-8080}"
TMT_PORT_FRONTEND="${TMT_PORT_FRONTEND:-5173}"

docker run --name tmt2-dev-container -h tmt2-dev-container --rm -it -v .:/app -w /app -p ${TMT_PORT_BACKEND}:8080 -p ${TMT_PORT_FRONTEND}:5173 node:24 bash
