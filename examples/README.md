# TMT2 Match Init

Template (remove json comments before usage):

```json5
{
    "passthrough": "<remote match id here>",
	"mapPool": [ // map pool can contain any number of maps, but must be big enough for the given election steps, see below for more information
        "de_ancient", // use the name of the map file
		"de_anubis/anubis", // or add a friendly name for players when picking/banning maps
		"de_inferno",
		"de_mirage",
		"de_nuke",
		"de_overpass",
		"de_vertigo",
        "3070923343/fy_pool_day" // workshop maps consists of numbers only (their workshop id), consider adding a friendly name for players when picking/banning maps
    ],
	"teamA": {
		"name": "Alpha",
		"passthrough": "<remote team a id here>",
        "advantage": 0
	},
	"teamB": {
		"name": "Bravo",
		"passthrough": "<remote team a id here>",
        "advantage": 0
	},
	"electionSteps": [
        // see below for templates
	],
	"gameServer": { // can be `null` instead of object if game servers are managed by TMT itself
		"ip": "localhost",
		"port": 27016,
		"rconPassword": "blob"
	},
	"rconCommands": {
		"init": [ // these rcon commands will be executed only once: when the match is created
            "game_type 0; game_mode 1; sv_game_mode_flags 0; sv_skirmish_id 0", // normal competitive, see below for other examples
			"say > RCON INIT LOADED <"
		],
		"knife": [ // these rcon commands will only be executed at the start of a knife round
			"mp_give_player_c4 0; mp_startmoney 0; mp_ct_default_secondary \"\"; mp_t_default_secondary \"\"",
			"say > SPECIAL KNIFE CONFIG LOADED <"
		],
		"match": [ // these rcon commands will be executed at the start of each match map (after knife or when both teams are ready)
			"mp_give_player_c4 1; mp_startmoney 800; mp_ct_default_secondary \"weapon_hkp2000\"; mp_t_default_secondary \"weapon_glock\"",
            "mp_overtime_enable 1",
            "say > MATCH CONFIG LOADED <"
		],
		"end": [ // these rcon commands will be executed only once: after the end of the last map, or when the match has been stopped (by api)
            "say > MATCH END RCON LOADED <"
        ]
	},
	"tmtLogAddress": "http://localhost:8080" // tmt's http address the game server must send the logs to
}
```

Notes:

- The `passthrough` fields can be set to any value to match the data of webhooks.

## Election Steps & Map Pool

Depending on the action that should happen in a step a different json payload is need. The bare minimum to select a step mode is:

```json5
{
    "map": {
        "mode": "<map mode goes here>"
    }
}
```

The different map modes are:
- `AGREE` - Both teams must agree on a map *
- `BAN` - A team must ban a map *
- `FIXED` - A specific map will be played. Map pool will be ignored.
- `PICK` - A team must pick a map *
- `RANDOM_BAN` - TMT bans a random map *
- `RANDOM_PICK` - TMT picks a random map *

> \* from the remaining map pool

If the `map.mode` leads to a map being selected to play on, a `side` payload is required. The bare minimum is again a `mode`:

```json5
{
    "map": {
        "mode": "<map mode goes here>"
    },
    "side": {
        "mode": "<side mode goes here>"
    }
}
```

The different side modes are:
- `FIXED` - The teams (`TeamA` and `TeamB`) will be statically assigned to CT and T
- `KNIFE` - The winner of a knife round can choose the starting side
- `PICK` - A team during the election step phase can choose the starting side
- `RANDOM` - The teams will be assigned randomly

Every time a team can perform an action a `map.who` or/and `side.who` attribute is needed. Example:

```json5
{
    "map": {
        "mode": "<map mode goes here>",
        "who": "<map who goes here>"
    }
}
```

The different `who`s are:
- `TEAM_A`, `TEAM_B` - Team A and B as given in the match init payload data
- `TEAM_X`, `TEAM_Y` - Any Team can perform this action, but when (for example) Team A performs a Team X action it is assigned as being Team X from now on and Team Y becomes Team B



### Election Steps to remove (ban) a map from the map pool

```json5
// BAN
{
    "map": {
        "mode": "BAN",
        "who": "TEAM_A" // or TEAM_B, TEAM_X, TEAM_Y
    }
}

// RANDOM BAN
{
    "map": {
        "mode": "RANDOM_BAN"
    }
}
```

### Election Steps to play (pick) a map from the map pool

```json5
// AGREE
{
    "map": {
        "mode": "AGREE"
    },
    "side": { // or any other side configuration (see below)
        "mode": "KNIFE"
    }
}

// FIXED
{
    "map": {
        "mode": "FIXED",
        "fixed": "de_anubis"
    },
    "side": { // or any other side configuration (see below)
        "mode": "KNIFE"
    }
}

// PICK
{
    "map": {
        "mode": "PICK",
        "who": "TEAM_A" // or TEAM_B, TEAM_X, TEAM_Y
    },
    "side": { // or any other side configuration (see below)
        "mode": "KNIFE"
    }
}

// RANDOM_PICK
{
    "map": {
        "mode": "RANDOM_PICK"
    },
    "side": { // or any other side configuration (see below)
        "mode": "KNIFE"
    }
}
```

Possible side configurations:

```json5
// FIXED
{
    "map": { // or any other map configuration (see above)
        "mode": "RANDOM_PICK"
    },
    "side": {
        "mode": "FIXED",
        "fixed": "TEAM_A_CT"
    }
}

// KNIFE
{
    "map": { // or any other map configuration (see above)
        "mode": "RANDOM_PICK"
    },
    "side": {
        "mode": "KNIFE"
    }
}

// PICK
{
    "map": { // or any other map configuration (see above)
        "mode": "RANDOM_PICK"
    },
    "side": {
        "mode": "PICK",
        "who": "TEAM_A" // or TEAM_B, TEAM_X, TEAM_Y
    }
}

// RANDOM
{
    "map": { // or any other map configuration (see above)
        "mode": "RANDOM_PICK"
    },
    "side": {
        "mode": "RANDOM"
    }
}
```

## Common and useful examples

```json5
// Best-of-1
// Alternating map bans
// Knife for Side on last map
{
    "electionSteps": [
        { "map": { "mode": "BAN", "who": "TEAM_A" } },
        { "map": { "mode": "BAN", "who": "TEAM_B" } },
        { "map": { "mode": "BAN", "who": "TEAM_A" } },
        { "map": { "mode": "BAN", "who": "TEAM_B" } },
        { "map": { "mode": "BAN", "who": "TEAM_A" } },
        { "map": { "mode": "BAN", "who": "TEAM_B" } },
        {
            "map": { "mode": "RANDOM_PICK" },
            "side": { "mode": "KNIFE" }
        }
    ]
}

// Best-of-3
// Alternating Ban->Ban->Pick->Pick->Ban->Ban
// When a team picks am map, the starting side will be picked by the opponent
// Knife for Side on last map
{
    "electionSteps": [
        { "map": { "mode": "BAN", "who": "TEAM_A" } },
        { "map": { "mode": "BAN", "who": "TEAM_B" } },
        {
            "map": { "mode": "PICK", "who": "TEAM_A" },
            "side": { "mode": "PICK", "who": "TEAM_B" }
        },
        {
            "map": { "mode": "PICK", "who": "TEAM_B" },
            "side": { "mode": "PICK", "who": "TEAM_A" }
        },
        { "map": { "mode": "BAN", "who": "TEAM_A" } },
        { "map": { "mode": "BAN", "who": "TEAM_B" } },
        {
            "map": { "mode": "RANDOM_PICK" },
            "side": { "mode": "KNIFE" }
        }
    ]
}

// Premier Mode like in Counter-Strike 2
// 2 Bans by Team A
// 3 Bans by Team B
// 1 Ban by Team A
// Team B picks starting side on last map
{
    "electionSteps": [
        { "map": { "mode": "BAN", "who": "TEAM_A" } },
        { "map": { "mode": "BAN", "who": "TEAM_A" } },
        { "map": { "mode": "BAN", "who": "TEAM_B" } },
        { "map": { "mode": "BAN", "who": "TEAM_B" } },
        { "map": { "mode": "BAN", "who": "TEAM_B" } },
        { "map": { "mode": "BAN", "who": "TEAM_A" } },
        {
            "map": { "mode": "RANDOM_PICK" },
            "side": { "mode": "PICK", "who": "TEAM_B" }
        }
    ]
}

// Double Elimination Final
// BO3, but max. two maps, because of advantage for one team
{
    "electionSteps": [
		{ "map": { "mode": "BAN", "who": "TEAM_A" } },
		{ "map": { "mode": "BAN", "who": "TEAM_B" } },
		{
			"map": { "mode": "PICK", "who": "TEAM_A" },
			"side": { "mode": "PICK", "who": "TEAM_B" }
		},
		{
			"map": { "mode": "PICK", "who": "TEAM_B" },
			"side": { "mode": "PICK", "who": "TEAM_A" }
		}
    ]
}
```

### createMatch_01.json

quick tmt2 for testing

### createMatch_02.json

BO1, active duty map pool

- team A map ban
- 2* team B map ban
- 2* team A map ban
- team B map ban
- remaining map, knife for side

### createMatch_03.json

Double elimination final (BO3, but max. two maps, because of advantage for one team):

- team A map ban
- team B map ban
- team A map pick + team B side pick
- team B map pick + team A side pick

### createMatch_04.json

BO3, active duty map pool

- team A map ban
- team B map ban
- team A map pick + team B side pick
- team B map pick + team A side pick
- team A map ban
- team B map ban
- remaining map, knife for side

### createMatch_05.json

quick tmt2 for testing (loop mode)



# Counter-Strike Game mode settings

See also [Game Modes](https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive/Game_Modes) on Valve's wiki.

After changing the values, a new map must be loaded with `map` or `changelevel`

### Normal Competitive

    game_type 0
    game_mode 1
    sv_game_mode_flags 0
    sv_skirmish_id 0


### Short Competitive

    game_type 0
    game_mode 1
    sv_game_mode_flags 32
    sv_skirmish_id 0

### Wingman

    game_type 0
    game_mode 2
    sv_game_mode_flags 0
    sv_skirmish_id 0


