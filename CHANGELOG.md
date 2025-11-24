# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **BREAKING:** Remove `logs` field from match data API responses. It was never used but an empty array instead.
- **BREAKING:** Remove HTTP `logs` endpoint for a specific match in favor of the `events` endpoint (which also contains logs).
- **BREAKING:** All optional fields in API responses are now always present and might be `null` instead of being not there at all.

### Fixed

- Fix match map being in wrong (`PAUSED`) state when ingame vote for tactical timeout (or the `.tac` command) is used together with TMT's `.pause` command.

## [2.9.1] - 2024-10-08

### Fixed

- Re-add previous docker tag schema with leading "v" for backwards compatibility (e.g. v2).

## [2.9.0] - 2024-10-08

### Added

- Make presets usable for logged in or all users (configurable per preset).
- Update 2on2 wingman default preset (active duty map pool & election steps).
- Add docker compose file.
- Add `MATCH_STOP` webhook (sent when TMT stops supervising a match).
- Improve (rcon and log) connections between game server and TMT, especially when game server has crashed/changed.
- Add workaround for CS2 getting stuck after loading round backup.

### Changed

- Tag docker container with a correct semver version (2.9.0, 2.9, 2 instead of v2.8, v2)

### Fixed

- Fix copy to clipboard not always working.
- Fix redirect from edit match page back to match page.

## [2.8.0] - 2024-09-20

### Added

- Add `.tac` command for tactical timeouts (will send `timeout_ct_start`/`timeout_terrorist_start` commands to the CS2 server).
- Improve team joining process (`.team a`/`.team b`): send various ingame chat message to help the players to pick the right team.
- Add support for workshop maps.
- Dynamic map change delay: wait for `mp_match_restart_delay` seconds before loading the next map (to not cut off casters/specatators on the CSTV server).
- Custom headers can be added to all webhook requests (e.g. for auth).
- Add separate page to send rcon commands to managed game servers (independent of a match).
- Improve detection and handling of dangling matches.
  A dangling match is currently not being supervised (not tracked by TMT) and has not been stopped properly.
  A match must be either stopped via the UI ("stop") or the API (`DELETE`).
  This can happen if the game server goes offline and TMT quits.
  Next time TMT starts it tries to resume unfinished matches, if the match cannot be continued (game server is still offline) the match is dangling.

## [2.7.0] - 2023-11-15

### Added

- Track online state for each player.
- Make displayed columns in match list configurable.

### Fixed

- Fix copy to clipboard not working in some cases

## [2.6.0] - 2023-10-20

### Added

- Add color support for chat messages.
- Track team sides for each player (CT/T) and display them in the frontend.
- Add preset system to save and reuse match creation payload data.

## [2.5.0] - 2023-10-09

### Fixed

- Fix that the game server does not pause after loading a round backup despite `mp_backup_restore_load_autopause = true`.

## [2.4.0] - 2023-10-08

### Added

- Add support for Counter-Strike 2.

## [2.3.0] - 2023-04-21

### Added

- Game servers managed by TMT: If game server property is `null` when match is created a game server managed by TMT will be assigned.
- Loop mode: If enabled (for a match) and after the match has ended or if there are no players left on the server, the match will restart from the beginning (starting with the election process).
- Add pages to frontend to create and update matches.

## [2.2.0] - 2022-08-27

### Added

- Add method to switch the internal team assignments (in case the teams are already playing, but are in the wrong teams).
- Print auto generated access token to console.
- Live sync match state via WebSocket to the frontend.
- Add dark mode to the frontend.

### Changed

- Environment variable `TMT_LOG_ADDRESS` is now optional, if omitted one must be set in match creation payload (`tmtLogAddress`).
