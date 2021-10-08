# TMT2 Backend

## Run in Docker

You can either use the official image hosted on docker hub or build your own one from the source code.

### Official image

TMT2 is available on docker hub: https://hub.docker.com/repository/docker/jensforstmann/tmt2

Run it with:

    docker run -e TMT_LOG_ADDRESS=http://localhost:8080 -p 8080:8080 jensforstmann/tmt2

### Manual build

You have to clone this repository in order to build a docker image.

build image

    docker build -t tmt2 .

run container
    
    docker run -e TMT_LOG_ADDRESS=http://localhost:8080 -p 8080:8080 tmt2

### Persistence

Matches will be written to `/app/storage` (can be configured). To keep the files with different containers you can either specify a docker volume or a path on the local system:

    docker run -e TMT_LOG_ADDRESS=http://localhost:8080 -v dockerVolumeName:/app/storage -p 8080:8080 jensforstmann/tmt2

    docker run -e TMT_LOG_ADDRESS=http://localhost:8080 -v /home/tmt2/storage:/app/storage -p 8080:8080 jensforstmann/tmt2

The matches which are neither finished nor stopped will be loaded on application start.

## Run directly

install dependencies with npm

    npm install

build

    npm run build

start

    TMT_LOG_ADDRESS=http://localhost:8080 npm start

## Configuration

Just set environment variables before starting TMT2.

```sh
# http port that tmt listens on
TMT_PORT=8080

# the address the game server must send the logs to (from the pov of the game server)
TMT_LOG_ADDRESS=http://127.0.0.1:8080

# where tmt will store match data in
TMT_STORAGE_FOLDER=storage
TMT_STORAGE_PREFIX=match_
TMT_STORAGE_SUFFIX=.json

# ingame prefix to every chat message sent by this application
TMT_SAY_PREFIX="[TMT] "
```

## API

See `swagger.json`. You might want to copy its content and paste it into https://editor.swagger.io/.

See also the `examples` folder.

## Security / Authentication

There are two types of authentication:

- global access
- match specific access

Global access tokens have full permissions. Match specific ones can only access its own match.

Both are used in client requests in the Authorization header with a "Bearer "-prefix:

    ...
    Authorization: Bearer 2Mgog6ATqAs495NtUQUsph
    ...

### global access tokens

Global access tokens are persisted in the storage folder in the file `access_tokens.json`.

Example:

```json5
{
	"2Mgog6ATqAs495NtUQUsph": { // that's the token
		"comment": "first auto generated token" // optional comment, might be used in logging
	},

    // mutliple tokens are also possible
    "knRRkV41yLBUw1eVwRD9VF": {
        "comment": "Jens"
    },
    "vZQjPZBXRAK6yhCwoboxWk": {
        "comment": "tournament system"
    }
}
```

If the file does not exist at startup a new one with a single auto generated global access token will be created.

### match specific access tokens

Every match will have a `tmtSecret` property. This can be used in the same way as a global access token.
