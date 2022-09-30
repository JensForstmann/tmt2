/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute, HttpStatusCodeLiteral, TsoaResponse, fetchMiddlewares } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { LoginController } from './loginController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MatchesController } from './matchesController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DebugController } from './debugController';
import { expressAuthentication } from './auth';
// @ts-ignore - no great way to install types from subpackage
const promiseAny = require('promise.any');
import type { RequestHandler } from 'express';
import * as express from 'express';

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "TMatchSate": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["ELECTION"]},{"dataType":"enum","enums":["MATCH_MAP"]},{"dataType":"enum","enums":["FINISHED"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ITeam": {
        "dataType": "refObject",
        "properties": {
            "passthrough": {"dataType":"string"},
            "name": {"dataType":"string","required":true},
            "advantage": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IFixedMap": {
        "dataType": "refObject",
        "properties": {
            "mode": {"dataType":"enum","enums":["FIXED"],"required":true},
            "fixed": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TWho": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["TEAM_A"]},{"dataType":"enum","enums":["TEAM_B"]},{"dataType":"enum","enums":["TEAM_X"]},{"dataType":"enum","enums":["TEAM_Y"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IPickMap": {
        "dataType": "refObject",
        "properties": {
            "mode": {"dataType":"enum","enums":["PICK"],"required":true},
            "who": {"ref":"TWho","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IAgreeOrRandomMap": {
        "dataType": "refObject",
        "properties": {
            "mode": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["RANDOM_PICK"]},{"dataType":"enum","enums":["AGREE"]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TSideFixed": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["TEAM_A_CT"]},{"dataType":"enum","enums":["TEAM_A_T"]},{"dataType":"enum","enums":["TEAM_B_CT"]},{"dataType":"enum","enums":["TEAM_B_T"]},{"dataType":"enum","enums":["TEAM_X_CT"]},{"dataType":"enum","enums":["TEAM_X_T"]},{"dataType":"enum","enums":["TEAM_Y_CT"]},{"dataType":"enum","enums":["TEAM_Y_T"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IFixedSide": {
        "dataType": "refObject",
        "properties": {
            "mode": {"dataType":"enum","enums":["FIXED"],"required":true},
            "fixed": {"ref":"TSideFixed","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IPickSide": {
        "dataType": "refObject",
        "properties": {
            "mode": {"dataType":"enum","enums":["PICK"],"required":true},
            "who": {"ref":"TWho","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IRandomOrKnifeSide": {
        "dataType": "refObject",
        "properties": {
            "mode": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["RANDOM"]},{"dataType":"enum","enums":["KNIFE"]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IElectionStepAdd": {
        "dataType": "refObject",
        "properties": {
            "map": {"dataType":"union","subSchemas":[{"ref":"IFixedMap"},{"ref":"IPickMap"},{"ref":"IAgreeOrRandomMap"}],"required":true},
            "side": {"dataType":"union","subSchemas":[{"ref":"IFixedSide"},{"ref":"IPickSide"},{"ref":"IRandomOrKnifeSide"}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IRandomMapBan": {
        "dataType": "refObject",
        "properties": {
            "mode": {"dataType":"enum","enums":["RANDOM_BAN"],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IBanMap": {
        "dataType": "refObject",
        "properties": {
            "mode": {"dataType":"enum","enums":["BAN"],"required":true},
            "who": {"ref":"TWho","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IElectionStepSkip": {
        "dataType": "refObject",
        "properties": {
            "map": {"dataType":"union","subSchemas":[{"ref":"IRandomMapBan"},{"ref":"IBanMap"}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IElectionStep": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"IElectionStepAdd"},{"ref":"IElectionStepSkip"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TElectionState": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["NOT_STARTED"]},{"dataType":"enum","enums":["RESTARTED"]},{"dataType":"enum","enums":["IN_PROGRESS"]},{"dataType":"enum","enums":["FINISHED"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TTeamAB": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["TEAM_A"]},{"dataType":"enum","enums":["TEAM_B"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TStep": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["MAP"]},{"dataType":"enum","enums":["SIDE"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IElection": {
        "dataType": "refObject",
        "properties": {
            "state": {"ref":"TElectionState","required":true},
            "teamX": {"ref":"TTeamAB"},
            "teamY": {"ref":"TTeamAB"},
            "remainingMaps": {"dataType":"array","array":{"dataType":"string"},"required":true},
            "currentStep": {"dataType":"double","required":true},
            "currentSubStep": {"ref":"TStep","required":true},
            "currentStepMap": {"dataType":"string"},
            "currentAgree": {"dataType":"nestedObjectLiteral","nestedProperties":{"teamB":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"teamA":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true}},"required":true},
            "currentRestart": {"dataType":"nestedObjectLiteral","nestedProperties":{"teamB":{"dataType":"boolean","required":true},"teamA":{"dataType":"boolean","required":true}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IGameServer": {
        "dataType": "refObject",
        "properties": {
            "ip": {"dataType":"string","required":true},
            "port": {"dataType":"double","required":true},
            "rconPassword": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TMatchMapSate": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["PENDING"]},{"dataType":"enum","enums":["MAP_CHANGE"]},{"dataType":"enum","enums":["WARMUP"]},{"dataType":"enum","enums":["KNIFE"]},{"dataType":"enum","enums":["AFTER_KNIFE"]},{"dataType":"enum","enums":["IN_PROGRESS"]},{"dataType":"enum","enums":["PAUSED"]},{"dataType":"enum","enums":["FINISHED"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IMatchMap": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "knifeForSide": {"dataType":"boolean","required":true},
            "startAsCtTeam": {"ref":"TTeamAB","required":true},
            "state": {"ref":"TMatchMapSate","required":true},
            "knifeWinner": {"ref":"TTeamAB"},
            "readyTeams": {"dataType":"nestedObjectLiteral","nestedProperties":{"teamB":{"dataType":"boolean","required":true},"teamA":{"dataType":"boolean","required":true}},"required":true},
            "knifeRestart": {"dataType":"nestedObjectLiteral","nestedProperties":{"teamB":{"dataType":"boolean","required":true},"teamA":{"dataType":"boolean","required":true}},"required":true},
            "score": {"dataType":"nestedObjectLiteral","nestedProperties":{"teamB":{"dataType":"double","required":true},"teamA":{"dataType":"double","required":true}},"required":true},
            "overTimeEnabled": {"dataType":"boolean","required":true},
            "overTimeMaxRounds": {"dataType":"double","required":true},
            "maxRounds": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TMatchEndAction": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["KICK_ALL"]},{"dataType":"enum","enums":["QUIT_SERVER"]},{"dataType":"enum","enums":["NONE"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TLogType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["CHAT"]},{"dataType":"enum","enums":["SYSTEM"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ILogChat": {
        "dataType": "refObject",
        "properties": {
            "type": {"dataType":"enum","enums":["CHAT"],"required":true},
            "timestamp": {"dataType":"double","required":true},
            "isTeamChat": {"dataType":"boolean","required":true},
            "steamId64": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TSystemLogCategory": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["ERROR"]},{"dataType":"enum","enums":["WARN"]},{"dataType":"enum","enums":["INFO"]},{"dataType":"enum","enums":["DEBUG"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ILogSystem": {
        "dataType": "refObject",
        "properties": {
            "type": {"dataType":"enum","enums":["SYSTEM"],"required":true},
            "timestamp": {"dataType":"double","required":true},
            "category": {"ref":"TSystemLogCategory","required":true},
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TLogUnion": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"ILogChat"},{"ref":"ILogSystem"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IPlayer": {
        "dataType": "refObject",
        "properties": {
            "steamId64": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "team": {"ref":"TTeamAB"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IMatch": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "state": {"ref":"TMatchSate","required":true},
            "passthrough": {"dataType":"string"},
            "mapPool": {"dataType":"array","array":{"dataType":"string"},"required":true},
            "teamA": {"ref":"ITeam","required":true},
            "teamB": {"ref":"ITeam","required":true},
            "electionSteps": {"dataType":"array","array":{"dataType":"refAlias","ref":"IElectionStep"},"required":true},
            "election": {"ref":"IElection","required":true},
            "gameServer": {"ref":"IGameServer","required":true},
            "logSecret": {"dataType":"string","required":true},
            "parseIncomingLogs": {"dataType":"boolean","required":true},
            "matchMaps": {"dataType":"array","array":{"dataType":"refObject","ref":"IMatchMap"},"required":true},
            "currentMap": {"dataType":"double","required":true},
            "webhookUrl": {"dataType":"string"},
            "rconCommands": {"dataType":"nestedObjectLiteral","nestedProperties":{"end":{"dataType":"array","array":{"dataType":"string"},"required":true},"match":{"dataType":"array","array":{"dataType":"string"},"required":true},"knife":{"dataType":"array","array":{"dataType":"string"},"required":true},"init":{"dataType":"array","array":{"dataType":"string"},"required":true}},"required":true},
            "canClinch": {"dataType":"boolean","required":true},
            "matchEndAction": {"ref":"TMatchEndAction","required":true},
            "logs": {"dataType":"array","array":{"dataType":"refAlias","ref":"TLogUnion"},"required":true},
            "players": {"dataType":"array","array":{"dataType":"refObject","ref":"IPlayer"},"required":true},
            "tmtSecret": {"dataType":"string","required":true},
            "isStopped": {"dataType":"boolean","required":true},
            "electionMap": {"dataType":"string","required":true},
            "serverPassword": {"dataType":"string","required":true},
            "tmtLogAddress": {"dataType":"string"},
            "createdAt": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ITeamCreateDto": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "passthrough": {"dataType":"string"},
            "advantage": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IMatchCreateDto": {
        "dataType": "refObject",
        "properties": {
            "passthrough": {"dataType":"string"},
            "mapPool": {"dataType":"array","array":{"dataType":"string"},"required":true},
            "teamA": {"ref":"ITeamCreateDto","required":true},
            "teamB": {"ref":"ITeamCreateDto","required":true},
            "electionSteps": {"dataType":"array","array":{"dataType":"union","subSchemas":[{"ref":"IElectionStepAdd"},{"ref":"IElectionStepSkip"}]},"required":true},
            "gameServer": {"ref":"IGameServer","required":true},
            "webhookUrl": {"dataType":"string"},
            "rconCommands": {"dataType":"nestedObjectLiteral","nestedProperties":{"end":{"dataType":"array","array":{"dataType":"string"}},"match":{"dataType":"array","array":{"dataType":"string"}},"knife":{"dataType":"array","array":{"dataType":"string"}},"init":{"dataType":"array","array":{"dataType":"string"}}}},
            "canClinch": {"dataType":"boolean"},
            "matchEndAction": {"ref":"TMatchEndAction"},
            "electionMap": {"dataType":"string"},
            "tmtLogAddress": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IMatchResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "state": {"ref":"TMatchSate","required":true},
            "passthrough": {"dataType":"string"},
            "mapPool": {"dataType":"array","array":{"dataType":"string"},"required":true},
            "teamA": {"ref":"ITeam","required":true},
            "teamB": {"ref":"ITeam","required":true},
            "electionSteps": {"dataType":"array","array":{"dataType":"refAlias","ref":"IElectionStep"},"required":true},
            "election": {"ref":"IElection","required":true},
            "gameServer": {"ref":"IGameServer","required":true},
            "logSecret": {"dataType":"string","required":true},
            "parseIncomingLogs": {"dataType":"boolean","required":true},
            "matchMaps": {"dataType":"array","array":{"dataType":"refObject","ref":"IMatchMap"},"required":true},
            "currentMap": {"dataType":"double","required":true},
            "webhookUrl": {"dataType":"string"},
            "rconCommands": {"dataType":"nestedObjectLiteral","nestedProperties":{"end":{"dataType":"array","array":{"dataType":"string"},"required":true},"match":{"dataType":"array","array":{"dataType":"string"},"required":true},"knife":{"dataType":"array","array":{"dataType":"string"},"required":true},"init":{"dataType":"array","array":{"dataType":"string"},"required":true}},"required":true},
            "canClinch": {"dataType":"boolean","required":true},
            "matchEndAction": {"ref":"TMatchEndAction","required":true},
            "logs": {"dataType":"array","array":{"dataType":"refAlias","ref":"TLogUnion"},"required":true},
            "players": {"dataType":"array","array":{"dataType":"refObject","ref":"IPlayer"},"required":true},
            "tmtSecret": {"dataType":"string","required":true},
            "isStopped": {"dataType":"boolean","required":true},
            "electionMap": {"dataType":"string","required":true},
            "serverPassword": {"dataType":"string","required":true},
            "tmtLogAddress": {"dataType":"string"},
            "createdAt": {"dataType":"double","required":true},
            "isLive": {"dataType":"boolean","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EventType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["CHAT"]},{"dataType":"enum","enums":["ELECTION_MAP_STEP"]},{"dataType":"enum","enums":["ELECTION_SIDE_STEP"]},{"dataType":"enum","enums":["MAP_ELECTION_END"]},{"dataType":"enum","enums":["KNIFE_END"]},{"dataType":"enum","enums":["ROUND_END"]},{"dataType":"enum","enums":["MAP_START"]},{"dataType":"enum","enums":["MAP_END"]},{"dataType":"enum","enums":["MATCH_END"]},{"dataType":"enum","enums":["LOG"]},{"dataType":"enum","enums":["MATCH_CREATE"]},{"dataType":"enum","enums":["MATCH_UPDATE"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ChatEvent": {
        "dataType": "refObject",
        "properties": {
            "timestamp": {"dataType":"string","required":true},
            "matchId": {"dataType":"string","required":true},
            "matchPassthrough": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "type": {"dataType":"enum","enums":["CHAT"],"required":true},
            "player": {"dataType":"union","subSchemas":[{"ref":"IPlayer"},{"dataType":"enum","enums":[null]}],"required":true},
            "playerTeam": {"dataType":"union","subSchemas":[{"ref":"ITeam"},{"dataType":"enum","enums":[null]}],"required":true},
            "message": {"dataType":"string","required":true},
            "isTeamChat": {"dataType":"boolean","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ElectionEndEvent": {
        "dataType": "refObject",
        "properties": {
            "timestamp": {"dataType":"string","required":true},
            "matchId": {"dataType":"string","required":true},
            "matchPassthrough": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "type": {"dataType":"enum","enums":["MAP_ELECTION_END"],"required":true},
            "mapNames": {"dataType":"array","array":{"dataType":"string"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RoundEndEvent": {
        "dataType": "refObject",
        "properties": {
            "timestamp": {"dataType":"string","required":true},
            "matchId": {"dataType":"string","required":true},
            "matchPassthrough": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "type": {"dataType":"enum","enums":["ROUND_END"],"required":true},
            "mapIndex": {"dataType":"double","required":true},
            "mapName": {"dataType":"string","required":true},
            "winnerTeam": {"ref":"ITeam","required":true},
            "scoreTeamA": {"dataType":"double","required":true},
            "scoreTeamB": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MapEndEvent": {
        "dataType": "refObject",
        "properties": {
            "timestamp": {"dataType":"string","required":true},
            "matchId": {"dataType":"string","required":true},
            "matchPassthrough": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "type": {"dataType":"enum","enums":["MAP_END"],"required":true},
            "mapIndex": {"dataType":"double","required":true},
            "mapName": {"dataType":"string","required":true},
            "scoreTeamA": {"dataType":"double","required":true},
            "scoreTeamB": {"dataType":"double","required":true},
            "winnerTeam": {"dataType":"union","subSchemas":[{"ref":"ITeam"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MatchEndEvent": {
        "dataType": "refObject",
        "properties": {
            "timestamp": {"dataType":"string","required":true},
            "matchId": {"dataType":"string","required":true},
            "matchPassthrough": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "type": {"dataType":"enum","enums":["MATCH_END"],"required":true},
            "wonMapsTeamA": {"dataType":"double","required":true},
            "wonMapsTeamB": {"dataType":"double","required":true},
            "winnerTeam": {"dataType":"union","subSchemas":[{"ref":"ITeam"},{"dataType":"enum","enums":[null]}],"required":true},
            "mapResults": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"winnerTeam":{"dataType":"union","subSchemas":[{"ref":"ITeam"},{"dataType":"enum","enums":[null]}],"required":true},"scoreTeamB":{"dataType":"double","required":true},"scoreTeamA":{"dataType":"double","required":true},"mapName":{"dataType":"string","required":true}}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "KnifeRoundEndEvent": {
        "dataType": "refObject",
        "properties": {
            "timestamp": {"dataType":"string","required":true},
            "matchId": {"dataType":"string","required":true},
            "matchPassthrough": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "type": {"dataType":"enum","enums":["KNIFE_END"],"required":true},
            "mapIndex": {"dataType":"double","required":true},
            "mapName": {"dataType":"string","required":true},
            "winnerTeam": {"ref":"ITeam","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MapStartEvent": {
        "dataType": "refObject",
        "properties": {
            "timestamp": {"dataType":"string","required":true},
            "matchId": {"dataType":"string","required":true},
            "matchPassthrough": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "type": {"dataType":"enum","enums":["MAP_START"],"required":true},
            "mapIndex": {"dataType":"double","required":true},
            "mapName": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LogEvent": {
        "dataType": "refObject",
        "properties": {
            "timestamp": {"dataType":"string","required":true},
            "matchId": {"dataType":"string","required":true},
            "matchPassthrough": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "type": {"dataType":"enum","enums":["LOG"],"required":true},
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TMapMode": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["FIXED"]},{"dataType":"enum","enums":["BAN"]},{"dataType":"enum","enums":["PICK"]},{"dataType":"enum","enums":["RANDOM_BAN"]},{"dataType":"enum","enums":["RANDOM_PICK"]},{"dataType":"enum","enums":["AGREE"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ElectionMapStep": {
        "dataType": "refObject",
        "properties": {
            "timestamp": {"dataType":"string","required":true},
            "matchId": {"dataType":"string","required":true},
            "matchPassthrough": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "type": {"dataType":"enum","enums":["ELECTION_MAP_STEP"],"required":true},
            "mode": {"ref":"TMapMode","required":true},
            "mapName": {"dataType":"string","required":true},
            "pickerTeam": {"ref":"ITeam"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TSideMode": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["FIXED"]},{"dataType":"enum","enums":["PICK"]},{"dataType":"enum","enums":["RANDOM"]},{"dataType":"enum","enums":["KNIFE"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TTeamSides": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["CT"]},{"dataType":"enum","enums":["T"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ElectionSideStep": {
        "dataType": "refObject",
        "properties": {
            "timestamp": {"dataType":"string","required":true},
            "matchId": {"dataType":"string","required":true},
            "matchPassthrough": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "type": {"dataType":"enum","enums":["ELECTION_SIDE_STEP"],"required":true},
            "mode": {"ref":"TSideMode","required":true},
            "pickerTeam": {"ref":"ITeam"},
            "pickerSide": {"ref":"TTeamSides"},
            "ctTeam": {"ref":"ITeam"},
            "tTeam": {"ref":"ITeam"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MatchCreateEvent": {
        "dataType": "refObject",
        "properties": {
            "timestamp": {"dataType":"string","required":true},
            "matchId": {"dataType":"string","required":true},
            "matchPassthrough": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "type": {"dataType":"enum","enums":["MATCH_CREATE"],"required":true},
            "match": {"ref":"IMatchResponse","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MatchUpdateEvent": {
        "dataType": "refObject",
        "properties": {
            "timestamp": {"dataType":"string","required":true},
            "matchId": {"dataType":"string","required":true},
            "matchPassthrough": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "type": {"dataType":"enum","enums":["MATCH_UPDATE"],"required":true},
            "path": {"dataType":"array","array":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"double"}]},"required":true},
            "value": {"dataType":"any","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Event": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"ChatEvent"},{"ref":"ElectionEndEvent"},{"ref":"RoundEndEvent"},{"ref":"MapEndEvent"},{"ref":"MatchEndEvent"},{"ref":"KnifeRoundEndEvent"},{"ref":"MapStartEvent"},{"ref":"LogEvent"},{"ref":"ElectionMapStep"},{"ref":"ElectionSideStep"},{"ref":"MatchCreateEvent"},{"ref":"MatchUpdateEvent"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IMatchUpdateDto": {
        "dataType": "refObject",
        "properties": {
            "passthrough": {"dataType":"string"},
            "mapPool": {"dataType":"array","array":{"dataType":"string"}},
            "teamA": {"ref":"ITeamCreateDto"},
            "teamB": {"ref":"ITeamCreateDto"},
            "electionSteps": {"dataType":"array","array":{"dataType":"union","subSchemas":[{"ref":"IElectionStepAdd"},{"ref":"IElectionStepSkip"}]}},
            "gameServer": {"ref":"IGameServer"},
            "webhookUrl": {"dataType":"string"},
            "rconCommands": {"dataType":"nestedObjectLiteral","nestedProperties":{"end":{"dataType":"array","array":{"dataType":"string"}},"match":{"dataType":"array","array":{"dataType":"string"}},"knife":{"dataType":"array","array":{"dataType":"string"}},"init":{"dataType":"array","array":{"dataType":"string"}}}},
            "canClinch": {"dataType":"boolean"},
            "matchEndAction": {"ref":"TMatchEndAction"},
            "electionMap": {"dataType":"string"},
            "tmtLogAddress": {"dataType":"string"},
            "state": {"ref":"TMatchSate"},
            "logSecret": {"dataType":"string"},
            "currentMap": {"dataType":"double"},
            "_restartElection": {"dataType":"boolean"},
            "_init": {"dataType":"boolean"},
            "_setup": {"dataType":"boolean"},
            "_execRconCommandsInit": {"dataType":"boolean"},
            "_execRconCommandsKnife": {"dataType":"boolean"},
            "_execRconCommandsMatch": {"dataType":"boolean"},
            "_execRconCommandsEnd": {"dataType":"boolean"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IMatchMapUpdateDto": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "knifeForSide": {"dataType":"boolean"},
            "startAsCtTeam": {"ref":"TTeamAB"},
            "state": {"ref":"TMatchMapSate"},
            "knifeWinner": {"ref":"TTeamAB"},
            "readyTeams": {"dataType":"nestedObjectLiteral","nestedProperties":{"teamB":{"dataType":"boolean","required":true},"teamA":{"dataType":"boolean","required":true}}},
            "knifeRestart": {"dataType":"nestedObjectLiteral","nestedProperties":{"teamB":{"dataType":"boolean","required":true},"teamA":{"dataType":"boolean","required":true}}},
            "score": {"dataType":"nestedObjectLiteral","nestedProperties":{"teamB":{"dataType":"double","required":true},"teamA":{"dataType":"double","required":true}}},
            "overTimeEnabled": {"dataType":"boolean"},
            "overTimeMaxRounds": {"dataType":"double"},
            "maxRounds": {"dataType":"double"},
            "_refreshOvertimeAndMaxRoundsSettings": {"dataType":"boolean"},
            "_switchTeamInternals": {"dataType":"boolean"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const validationService = new ValidationService(models);

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

export function RegisterRoutes(app: express.Router) {
    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################
        app.post('/api/login',
            authenticateMiddleware([{"bearer_token":[]}]),
            ...(fetchMiddlewares<RequestHandler>(LoginController)),
            ...(fetchMiddlewares<RequestHandler>(LoginController.prototype.login)),

            function LoginController_login(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new LoginController();


              const promise = controller.login.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/matches',
            ...(fetchMiddlewares<RequestHandler>(MatchesController)),
            ...(fetchMiddlewares<RequestHandler>(MatchesController.prototype.createMatch)),

            function MatchesController_createMatch(request: any, response: any, next: any) {
            const args = {
                    requestBody: {"in":"body","name":"requestBody","required":true,"ref":"IMatchCreateDto"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new MatchesController();


              const promise = controller.createMatch.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, 201, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/matches',
            authenticateMiddleware([{"bearer_token":[]}]),
            ...(fetchMiddlewares<RequestHandler>(MatchesController)),
            ...(fetchMiddlewares<RequestHandler>(MatchesController.prototype.getAllMatches)),

            function MatchesController_getAllMatches(request: any, response: any, next: any) {
            const args = {
                    undefined: {"in":"request","required":true,"dataType":"object"},
                    state: {"in":"query","name":"state","dataType":"array","array":{"dataType":"string"}},
                    passthrough: {"in":"query","name":"passthrough","dataType":"array","array":{"dataType":"string"}},
                    isStopped: {"in":"query","name":"isStopped","dataType":"boolean"},
                    isLive: {"in":"query","name":"isLive","dataType":"boolean"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new MatchesController();


              const promise = controller.getAllMatches.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/matches/:id',
            authenticateMiddleware([{"bearer_token":[]}]),
            ...(fetchMiddlewares<RequestHandler>(MatchesController)),
            ...(fetchMiddlewares<RequestHandler>(MatchesController.prototype.getMatch)),

            function MatchesController_getMatch(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
                    undefined: {"in":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new MatchesController();


              const promise = controller.getMatch.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/matches/:id/logs',
            authenticateMiddleware([{"bearer_token":[]}]),
            ...(fetchMiddlewares<RequestHandler>(MatchesController)),
            ...(fetchMiddlewares<RequestHandler>(MatchesController.prototype.getLogs)),

            function MatchesController_getLogs(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
                    undefined: {"in":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new MatchesController();


              const promise = controller.getLogs.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/matches/:id/events',
            authenticateMiddleware([{"bearer_token":[]}]),
            ...(fetchMiddlewares<RequestHandler>(MatchesController)),
            ...(fetchMiddlewares<RequestHandler>(MatchesController.prototype.getEvents)),

            function MatchesController_getEvents(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
                    undefined: {"in":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new MatchesController();


              const promise = controller.getEvents.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/matches/:id/server/round_backups',
            authenticateMiddleware([{"bearer_token":[]}]),
            ...(fetchMiddlewares<RequestHandler>(MatchesController)),
            ...(fetchMiddlewares<RequestHandler>(MatchesController.prototype.getRoundBackups)),

            function MatchesController_getRoundBackups(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
                    undefined: {"in":"request","required":true,"dataType":"object"},
                    count: {"in":"query","name":"count","dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new MatchesController();


              const promise = controller.getRoundBackups.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/matches/:id/server/round_backups/:file',
            authenticateMiddleware([{"bearer_token":[]}]),
            ...(fetchMiddlewares<RequestHandler>(MatchesController)),
            ...(fetchMiddlewares<RequestHandler>(MatchesController.prototype.loadRoundBackup)),

            function MatchesController_loadRoundBackup(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
                    file: {"in":"path","name":"file","required":true,"dataType":"string"},
                    undefined: {"in":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new MatchesController();


              const promise = controller.loadRoundBackup.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.patch('/api/matches/:id',
            authenticateMiddleware([{"bearer_token":[]}]),
            ...(fetchMiddlewares<RequestHandler>(MatchesController)),
            ...(fetchMiddlewares<RequestHandler>(MatchesController.prototype.updateMatch)),

            function MatchesController_updateMatch(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
                    requestBody: {"in":"body","name":"requestBody","required":true,"ref":"IMatchUpdateDto"},
                    undefined: {"in":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new MatchesController();


              const promise = controller.updateMatch.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.patch('/api/matches/:id/matchMap/:mapNumber',
            authenticateMiddleware([{"bearer_token":[]}]),
            ...(fetchMiddlewares<RequestHandler>(MatchesController)),
            ...(fetchMiddlewares<RequestHandler>(MatchesController.prototype.updateMatchMap)),

            function MatchesController_updateMatchMap(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
                    mapNumber: {"in":"path","name":"mapNumber","required":true,"dataType":"double"},
                    requestBody: {"in":"body","name":"requestBody","required":true,"ref":"IMatchMapUpdateDto"},
                    undefined: {"in":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new MatchesController();


              const promise = controller.updateMatchMap.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/matches/:id',
            authenticateMiddleware([{"bearer_token":[]}]),
            ...(fetchMiddlewares<RequestHandler>(MatchesController)),
            ...(fetchMiddlewares<RequestHandler>(MatchesController.prototype.deleteMatch)),

            function MatchesController_deleteMatch(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
                    undefined: {"in":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new MatchesController();


              const promise = controller.deleteMatch.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.patch('/api/matches/:id/revive',
            authenticateMiddleware([{"bearer_token":[]}]),
            ...(fetchMiddlewares<RequestHandler>(MatchesController)),
            ...(fetchMiddlewares<RequestHandler>(MatchesController.prototype.reviveMatch)),

            function MatchesController_reviveMatch(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
                    undefined: {"in":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new MatchesController();


              const promise = controller.reviveMatch.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/matches/:id/server/rcon',
            authenticateMiddleware([{"bearer_token":[]}]),
            ...(fetchMiddlewares<RequestHandler>(MatchesController)),
            ...(fetchMiddlewares<RequestHandler>(MatchesController.prototype.rcon)),

            function MatchesController_rcon(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
                    requestBody: {"in":"body","name":"requestBody","required":true,"dataType":"array","array":{"dataType":"string"}},
                    undefined: {"in":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new MatchesController();


              const promise = controller.rcon.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/matches/:id/server/log/:secret',
            ...(fetchMiddlewares<RequestHandler>(MatchesController)),
            ...(fetchMiddlewares<RequestHandler>(MatchesController.prototype.receiveLog)),

            function MatchesController_receiveLog(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
                    secret: {"in":"path","name":"secret","required":true,"dataType":"string"},
                    requestBody: {"in":"body","name":"requestBody","required":true,"dataType":"any"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new MatchesController();


              const promise = controller.receiveLog.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/debug/webSockets',
            authenticateMiddleware([{"bearer_token":[]}]),
            ...(fetchMiddlewares<RequestHandler>(DebugController)),
            ...(fetchMiddlewares<RequestHandler>(DebugController.prototype.getWebSocketClients)),

            function DebugController_getWebSocketClients(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DebugController();


              const promise = controller.getWebSocketClients.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function authenticateMiddleware(security: TsoaRoute.Security[] = []) {
        return async function runAuthenticationMiddleware(request: any, _response: any, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            // keep track of failed auth attempts so we can hand back the most
            // recent one.  This behavior was previously existing so preserving it
            // here
            const failedAttempts: any[] = [];
            const pushAndRethrow = (error: any) => {
                failedAttempts.push(error);
                throw error;
            };

            const secMethodOrPromises: Promise<any>[] = [];
            for (const secMethod of security) {
                if (Object.keys(secMethod).length > 1) {
                    const secMethodAndPromises: Promise<any>[] = [];

                    for (const name in secMethod) {
                        secMethodAndPromises.push(
                            expressAuthentication(request, name, secMethod[name])
                                .catch(pushAndRethrow)
                        );
                    }

                    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                    secMethodOrPromises.push(Promise.all(secMethodAndPromises)
                        .then(users => { return users[0]; }));
                } else {
                    for (const name in secMethod) {
                        secMethodOrPromises.push(
                            expressAuthentication(request, name, secMethod[name])
                                .catch(pushAndRethrow)
                        );
                    }
                }
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            try {
                request['user'] = await promiseAny(secMethodOrPromises);
                next();
            }
            catch(err) {
                // Show most recent error as response
                const error = failedAttempts.pop();
                error.status = error.status || 401;
                next(error);
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        }
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function isController(object: any): object is Controller {
        return 'getHeaders' in object && 'getStatus' in object && 'setStatus' in object;
    }

    function promiseHandler(controllerObj: any, promise: any, response: any, successStatus: any, next: any) {
        return Promise.resolve(promise)
            .then((data: any) => {
                let statusCode = successStatus;
                let headers;
                if (isController(controllerObj)) {
                    headers = controllerObj.getHeaders();
                    statusCode = controllerObj.getStatus() || statusCode;
                }

                // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                returnHandler(response, statusCode, data, headers)
            })
            .catch((error: any) => next(error));
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function returnHandler(response: any, statusCode?: number, data?: any, headers: any = {}) {
        if (response.headersSent) {
            return;
        }
        Object.keys(headers).forEach((name: string) => {
            response.set(name, headers[name]);
        });
        if (data && typeof data.pipe === 'function' && data.readable && typeof data._read === 'function') {
            data.pipe(response);
        } else if (data !== null && data !== undefined) {
            response.status(statusCode || 200).json(data);
        } else {
            response.status(statusCode || 204).end();
        }
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function responder(response: any): TsoaResponse<HttpStatusCodeLiteral, unknown>  {
        return function(status, data, headers) {
            returnHandler(response, status, data, headers);
        };
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function getValidatedArgs(args: any, request: any, response: any): any[] {
        const fieldErrors: FieldErrors  = {};
        const values = Object.keys(args).map((key) => {
            const name = args[key].name;
            switch (args[key].in) {
                case 'request':
                    return request;
                case 'query':
                    return validationService.ValidateParam(args[key], request.query[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"silently-remove-extras"});
                case 'path':
                    return validationService.ValidateParam(args[key], request.params[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"silently-remove-extras"});
                case 'header':
                    return validationService.ValidateParam(args[key], request.header(name), name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"silently-remove-extras"});
                case 'body':
                    return validationService.ValidateParam(args[key], request.body, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"silently-remove-extras"});
                case 'body-prop':
                    return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, 'body.', {"noImplicitAdditionalProperties":"silently-remove-extras"});
                case 'formData':
                    if (args[key].dataType === 'file') {
                        return validationService.ValidateParam(args[key], request.file, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"silently-remove-extras"});
                    } else if (args[key].dataType === 'array' && args[key].array.dataType === 'file') {
                        return validationService.ValidateParam(args[key], request.files, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"silently-remove-extras"});
                    } else {
                        return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"silently-remove-extras"});
                    }
                case 'res':
                    return responder(response);
            }
        });

        if (Object.keys(fieldErrors).length > 0) {
            throw new ValidateError(fieldErrors, '');
        }
        return values;
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
