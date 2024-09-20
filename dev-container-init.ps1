Set-Location $PSScriptRoot

docker run --rm -it -v .:/app node:20 sh -c "cd /app && npm install && cd /app/backend && npm install && cd /app/frontend && npm install && mkdir -p /app/frontend/dist"
