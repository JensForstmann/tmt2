Set-Location $PSScriptRoot

$TMT_PORT_BACKEND = $env:TMT_PORT_BACKEND ?? 8080
$TMT_PORT_FRONTEND = $env:TMT_PORT_FRONTEND ?? 5173

docker run --name tmt2-dev-container -h tmt2-dev-container --rm -it -v .:/app -w /app -p ${TMT_PORT_BACKEND}:8080 -p ${TMT_PORT_FRONTEND}:5173 node:20 bash
