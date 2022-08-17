# TMT2 - Tournament Match Tracker 2

TMT is a tool that tracks/watches/observes a Counter-Strike: Global Offensive match.

It will keep track of matches and can interact with 3rd party applications like tournament systems,
websites or others via a REST API and webhooks to send real time notifications.

This project is a complete rewrite of the former [TMT](https://github.com/JensForstmann/CSGO-PHP-TournamentMatchTracker).

- [TMT2 - Tournament Match Tracker 2](#tmt2---tournament-match-tracker-2)
  - [Run with Docker](#run-with-docker)
  - [Configuration](#configuration)
  - [API](#api)
  - [Security / Authentication](#security--authentication)
    - [global access tokens](#global-access-tokens)
    - [match specific access tokens](#match-specific-access-tokens)

## Run with Docker

TMT2 is available on docker hub: https://hub.docker.com/r/jensforstmann/tmt2

Run it with:

    docker run -p 8080:8080 jensforstmann/tmt2

Data will be written to `/app/backend/storage` (can be configured). To keep the files with different containers you can either specify a docker volume or a path on the local system:

    docker run -v dockerVolumeName:/app/storage -p 8080:8080 jensforstmann/tmt2

    docker run -v /home/tmt2/storage:/app/storage -p 8080:8080 jensforstmann/tmt2

The matches which are neither finished nor stopped will be loaded on application start.


## Configuration

Just use these environment variables:

```sh
# http port that tmt listens on
TMT_PORT=8080

# the address the game server must send the logs to (from the pov of the game server)
# if not set a tmtLogAddress must be for every match
TMT_LOG_ADDRESS=http://127.0.0.1:8080

# where tmt will store match data in
TMT_STORAGE_FOLDER=storage

# ingame prefix to every chat message sent by this application
TMT_SAY_PREFIX="[TMT] "
```


## API

See [`backend/swagger.json`](backend/swagger.json). You might want to copy its content and paste it into https://editor.swagger.io/.

See also the [`examples`](examples)  folder.

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

    // multiple tokens are also possible
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

