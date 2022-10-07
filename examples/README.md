# TMT2 examples

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

# Game mode settings

See also [CS:GO Game Modes](https://developer.valvesoftware.com/wiki/CS:GO_Game_Modes).

After changing the values, a new map must be loaded with `map` or `changelevel`

### Normal Competitive

    game_type 0
    game_mode 1
    sv_game_mode_flags 0


### Short Competitive

    game_type 0
    game_mode 1
    sv_game_mode_flags 32

### Wingman

    game_type 0
    game_mode 2
    sv_game_mode_flags 0
