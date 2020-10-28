# TMT2 Backend

## Run in Docker

build image

    docker build -t tmt2 .

run container
    
    docker run -p 8080:8080 tmt2

full examples

    docker run -e TMT_LOG_ADDRESS=http://localhost:9090 -e TMT_PORT=1234 -p 9090:1234 tmt2

## Run directly

install dependencies with npm OR yarn

    npm install
    # or
    yarn install

build

    npm run build
    # or
    yarn run build

start

    npm start
    # or
    yarn start

## Configuration

Just set environment variables before starting TMT2.

See file `.env_example` for all available settings.
