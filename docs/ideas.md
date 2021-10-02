- Server Side Names https://steamcommunity.com/sharedfiles/filedetails/?id=1187798154
- CS:GO I 30 Sec timeout settings https://steamcommunity.com/sharedfiles/filedetails/?id=1250333938
- round backups
- api to adjust settings after initial match payload
- keep history of old matches
- How to set up server-side avatars and forced player names https://steamcommunity.com/sharedfiles/filedetails/?id=765964792
- Advanced Scoreboard - How to create professional looking GOTV streams and demos https://steamcommunity.com/sharedfiles/filedetails/?id=516354540
- csgo http log https://blog.counter-strike.net/index.php/2017/05/18665/
- List of csgo cvars https://developer.valvesoftware.com/wiki/List_of_CS:GO_Cvars
- mp_teamscore_1, mp_teamscore_2, mp_teamscore_max https://blog.counter-strike.net/index.php/2017/02/17867/
- sv_competitive_official_5v5
- mp_team_timeout_max, mp_team_timeout_time, timeout_ct_start, timeout_t_start, mp_debug_timeouts
- mp_match_end_restart, mp_match_restart_delay, mp_match_end_changelevel
- mp_competitive_endofmatch_extra_time
- sv_buy_status_override 3, mp_give_player_c4 0, mp_startmoney 0, mp_drop_knife_enable 1, mp_t_default_melee "", mp_ct_default_melee "", mp_ct_default_secondary "", mp_t_default_secondary ""
- mp_halftime, mp_halftime_duration, mp_halftime_pausematch, mp_halftime_pausetimer
- mp_win_panel_display_time
- mp_backup_*


# Planning

## API Endpoints

get all matches
GET     /api/matches/

create new match
POST    /api/matches/

get one match
GET     /api/matches/{id}

change one match
PUT     /api/matches/{id}

delete one match
DELETE  /api/matches/{id}

get maps of match
GET     /api/matches/{id}/maps

(create new map)
(POST    /api/matches/{id}/maps)

change one map
PUT     /api/matches/{id}/maps/{index}

delete one map
DELETE  /api/matches/{id}/maps/{index}

get round backups
GET     /api/matches/{id}/server/round_backups

load round backup
POST    /api/matches/{id}/server/round_backups/{file}

execute rcon
POST    /api/matches/{id}/server/rcon

receive server log
POST    /api/matches/{id}/server/log/{secret}

 - /api/matches
 - /api/matches/{id}
 - /api/matches/{id}/{action}
    - action like
        - set game status
        - goto knife / warmup
        - switch teams
        - switch team names
        - change map
        - restart server
        - restore round save
        - arbitrary rcon command
        - pause/unpause
        - overwrite map/match score
        - chat to server
        - change server password
 - /api/matches/{id}/server
 - /api/matches/{id}/server/{action}
    - action like
        - rcon command
        - say
        - switch teams
        - pause
        - change server password
        - log (to receive log data from server)?
 - /api/matches/{id}/players
 - /api/matches/{id}/players/{action}
    - action will be performed for every player
        - kick
        - ban
 - /api/matches/{id}/players/{id}
 - /api/matches/{id}/players/{id}/{action}
    - action is performed for specific player
        - kick
        - ban
 - /api/servers
 - /api/players
 - /api/stats
 - /api/admins
 - /api/access-tokens
 