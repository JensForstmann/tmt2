# TMT2 - Tournament Match Tracker 2

[![Docker Pulls](https://img.shields.io/docker/pulls/jensforstmann/tmt2)](https://hub.docker.com/r/jensforstmann/tmt2)
[![Docker Image Size (tag)](https://img.shields.io/docker/image-size/jensforstmann/tmt2/latest)](https://hub.docker.com/r/jensforstmann/tmt2)

TMT is a tool that tracks/watches/observes a Counter-Strike 2 match.

It will keep track of matches and can interact with 3rd party applications like tournament systems,
websites or others via a REST API and webhooks to send real time notifications.

**FEATURES**

- Fully configure the tournament match beforehand (and edit it after it's created)
- Play how many maps you want in a series (BO1, BO2, BO3, BO*...)
- Configure how to ban and pick maps & sides, even knife-for-side is supported
- Support for workshop maps
- Automatic map changes & side switches
- Ingame chat commands for the players (see section [Ingame Chat Commands](#ingame-chat-commands))
- Integrated support for round backups and rollbacks
- REST API to fully control TMT from another system
- Webhooks to receive real time updates
- Loop Mode (TMT starts over after the match ends, useful for public servers)
- Web frontend
  - create new matches
  - create presets for common match configurations
  - list all matches
  - show logs
  - read and use ingame chat
  - see players & teams
  - rcon console
  - manage pool of game servers (can be used for new matches)
- **No server side plugin or mod needed**

_Example screenshot: Banning a map from the map pool:_
![Ban a map (screenshot)](docs/screenshot-ban-map.png)



---



Table of Contents:

- [TMT2 - Tournament Match Tracker 2](#tmt2---tournament-match-tracker-2)
  - [Getting Started](#getting-started)
    - [Create you first Match](#create-you-first-match)
    - [Ingame Chat Commands](#ingame-chat-commands)
  - [Configuration](#configuration)
  - [API](#api)
  - [Security / Authentication](#security--authentication)
    - [global access tokens](#global-access-tokens)
    - [match specific access tokens](#match-specific-access-tokens)
- [Development](#development)
  - [Docker](#docker)
  - [NodeJS](#nodejs)

## Getting Started

TMT2 is available on docker hub: https://hub.docker.com/r/jensforstmann/tmt2

Run it with:

```sh
docker run --name tmt2 -d -p 8080:8080 jensforstmann/tmt2
```

Data will be written within the container to `/app/backend/storage`. To keep the files with different containers you can either specify a docker volume or a path on the local system:

```sh
# docker volume
docker run --name tmt2 -d -p 8080:8080 -v dockerVolumeName:/app/backend/storage jensforstmann/tmt2

# local host directory
docker run --name tmt2 -d -p 8080:8080 -v /home/tmt2/storage:/app/backend/storage jensforstmann/tmt2
```

The matches which are neither finished nor stopped will be loaded on application start.

### Create you first Match

After running the container you can open the web frontend: http://localhost:8080 (or at whatever ip/server your docker container runs on.)



_Example screenshot: Create a new match from the web frontend (both dark and light mode available):_
![Create a new match (screenshot)](docs/screenshot-create-match.png)



Even without an admin token you can create and manage matches (but only your own ones). If you want to know your admin token (a random one is generated at startup) either take a look at the `access_tokens.json` file or take a look at the first lines of the log output (`docker logs tmt2`).


### Ingame Chat Commands

While TMT watches a match the player ingame can use chat commands to communicate with TMT:

- `.team a` or `.team b` - you need to choose a team before you can execute any other commands, check the response in the chat to be sure you've joined the right one, also check the scoreboard (team names are visible there) if you're on the right side (CT/T)
- during the map election process:
  - `.ban` - ban a map from the map pool
  - `.pick` - pick a map to be played
  - `.agree` - agree on a map together with the opponent (alias `.map`)
  - `.ct`/`.t` - select CT/T as your starting side
  - `.restart` - restart the election process
- during and after the knife round (if one takes place)
  - `.restart` - restart the knife round
  - `.ct`/`.t` - select CT/T as your starting side
  - `.stay` - stay on your side
  - `.switch` - switch the sides (alias `.swap`)
- during the warmup
  - `.ready` - set your team as ready (alias `.rdy`)
  - `.unready` - set your team as not ready (alias `.unrdy`)
- during the match
  - `.pause` - pause the match at the next freezetime (alias `.tech`)
  - `.unpause` - set your team as ready (alias `.ready` & `.rdy`)
  - `.tac` - like pause, but uses up a tactical timeout for that team (same as calling an ingame vote for a tactical timeout)



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

See also the [`examples`](examples) folder.

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



---



# Development

After starting the dev processes you can reach the backend & frontend at:

- Backend: http://localhost:8080
- Frontend: http://localhost:5173

## Docker

Docker is recommended as it's easy to use and doesn't require any other software to be installed (if docker is already set up).

> Note for windows user: It's recommended to have docker installed **directly within** WSL (not using Windows Docker from WSL) or to run a Linux VM.

Init the dev environment:

    ./dev-container-init.sh

Start a docker container with port forwarding and hot reloading:

    ./dev-container-start.sh



## NodeJS

If you don't want to use docker or want to use NodeJS directly, you can do the following to setup a dev environment:

Install dependencies:

    npm install
    cd backend
    npm install
    cd ../frontend
    npm install

Run backend with hot reloading:

    cd backend
    npm run dev

Run frontend with hot reloading:

    cd frontend
    npm run dev



---

> This project is a complete rewrite of the former [TMT](https://github.com/JensForstmann/CSGO-PHP-TournamentMatchTracker).
