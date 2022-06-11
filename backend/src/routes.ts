/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute, HttpStatusCodeLiteral, TsoaResponse } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MatchesController } from './matchesController';
import { expressAuthentication } from './auth';
// @ts-ignore - no great way to install types from subpackage
const promiseAny = require('promise.any');
import * as express from 'express';

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "EMatchSate": {
        "dataType": "refEnum",
        "enums": ["ELECTION","MATCH_MAP","FINISHED"],
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
    "EMapMode.FIXED": {
        "dataType": "refEnum",
        "enums": ["FIXED"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IFixedMap": {
        "dataType": "refObject",
        "properties": {
            "mode": {"ref":"EMapMode.FIXED","required":true},
            "fixed": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EMapMode.PICK": {
        "dataType": "refEnum",
        "enums": ["PICK"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EWho": {
        "dataType": "refEnum",
        "enums": ["TEAM_A","TEAM_B","TEAM_X","TEAM_Y"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IPickMap": {
        "dataType": "refObject",
        "properties": {
            "mode": {"ref":"EMapMode.PICK","required":true},
            "who": {"ref":"EWho","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EMapMode.RANDOM_BAN": {
        "dataType": "refEnum",
        "enums": ["RANDOM_BAN"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EMapMode.RANDOM_PICK": {
        "dataType": "refEnum",
        "enums": ["RANDOM_PICK"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EMapMode.AGREE": {
        "dataType": "refEnum",
        "enums": ["AGREE"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IAgreeOrRandomMap": {
        "dataType": "refObject",
        "properties": {
            "mode": {"dataType":"union","subSchemas":[{"ref":"EMapMode.RANDOM_BAN"},{"ref":"EMapMode.RANDOM_PICK"},{"ref":"EMapMode.AGREE"}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ESideMode.FIXED": {
        "dataType": "refEnum",
        "enums": ["FIXED"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ESideFixed": {
        "dataType": "refEnum",
        "enums": ["TEAM_A_CT","TEAM_A_T","TEAM_B_CT","TEAM_B_T","TEAM_X_CT","TEAM_X_T","TEAM_Y_CT","TEAM_Y_T"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IFixedSide": {
        "dataType": "refObject",
        "properties": {
            "mode": {"ref":"ESideMode.FIXED","required":true},
            "fixed": {"ref":"ESideFixed","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ESideMode.PICK": {
        "dataType": "refEnum",
        "enums": ["PICK"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IPickSide": {
        "dataType": "refObject",
        "properties": {
            "mode": {"ref":"ESideMode.PICK","required":true},
            "who": {"ref":"EWho","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ESideMode.RANDOM": {
        "dataType": "refEnum",
        "enums": ["RANDOM"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ESideMode.KNIFE": {
        "dataType": "refEnum",
        "enums": ["KNIFE"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IRandomOrKnifeSide": {
        "dataType": "refObject",
        "properties": {
            "mode": {"dataType":"union","subSchemas":[{"ref":"ESideMode.RANDOM"},{"ref":"ESideMode.KNIFE"}],"required":true},
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
    "EMapMode.BAN": {
        "dataType": "refEnum",
        "enums": ["BAN"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IBanMap": {
        "dataType": "refObject",
        "properties": {
            "mode": {"ref":"EMapMode.BAN","required":true},
            "who": {"ref":"EWho","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IElectionStepSkip": {
        "dataType": "refObject",
        "properties": {
            "map": {"ref":"IBanMap","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EElectionState": {
        "dataType": "refEnum",
        "enums": ["NOT_STARTED","RESTARTED","IN_PROGRESS","FINISHED"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ETeamAB": {
        "dataType": "refEnum",
        "enums": ["TEAM_A","TEAM_B"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EStep": {
        "dataType": "refEnum",
        "enums": ["MAP","SIDE"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IElection": {
        "dataType": "refObject",
        "properties": {
            "state": {"ref":"EElectionState","required":true},
            "teamX": {"ref":"ETeamAB"},
            "teamY": {"ref":"ETeamAB"},
            "remainingMaps": {"dataType":"array","array":{"dataType":"string"},"required":true},
            "currentStep": {"dataType":"double","required":true},
            "currentSubStep": {"ref":"EStep","required":true},
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
    "EMatchMapSate": {
        "dataType": "refEnum",
        "enums": ["PENDING","MAP_CHANGE","WARMUP","KNIFE","AFTER_KNIFE","IN_PROGRESS","PAUSED","FINISHED"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IMatchMap": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "knifeForSide": {"dataType":"boolean","required":true},
            "startAsCtTeam": {"ref":"ETeamAB","required":true},
            "state": {"ref":"EMatchMapSate","required":true},
            "knifeWinner": {"ref":"ETeamAB"},
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
    "EMatchEndAction": {
        "dataType": "refEnum",
        "enums": ["KICK_ALL","QUIT_SERVER","NONE"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ELogType.CHAT": {
        "dataType": "refEnum",
        "enums": ["CHAT"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ELogType": {
        "dataType": "refEnum",
        "enums": ["CHAT","SYSTEM"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ILogChat": {
        "dataType": "refObject",
        "properties": {
            "type": {"ref":"ELogType.CHAT","required":true},
            "timestamp": {"dataType":"double","required":true},
            "isTeamChat": {"dataType":"boolean","required":true},
            "steamId64": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ELogType.SYSTEM": {
        "dataType": "refEnum",
        "enums": ["SYSTEM"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ESystemLogCategory": {
        "dataType": "refEnum",
        "enums": ["ERROR","WARN","INFO","DEBUG"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ILogSystem": {
        "dataType": "refObject",
        "properties": {
            "type": {"ref":"ELogType.SYSTEM","required":true},
            "timestamp": {"dataType":"double","required":true},
            "category": {"ref":"ESystemLogCategory","required":true},
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
            "team": {"ref":"ETeamAB"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IMatch": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "state": {"ref":"EMatchSate","required":true},
            "passthrough": {"dataType":"string"},
            "mapPool": {"dataType":"array","array":{"dataType":"string"},"required":true},
            "teamA": {"ref":"ITeam","required":true},
            "teamB": {"ref":"ITeam","required":true},
            "electionSteps": {"dataType":"array","array":{"dataType":"union","subSchemas":[{"ref":"IElectionStepAdd"},{"ref":"IElectionStepSkip"}]},"required":true},
            "election": {"ref":"IElection","required":true},
            "gameServer": {"ref":"IGameServer","required":true},
            "logSecret": {"dataType":"string","required":true},
            "parseIncomingLogs": {"dataType":"boolean","required":true},
            "matchMaps": {"dataType":"array","array":{"dataType":"refObject","ref":"IMatchMap"},"required":true},
            "currentMap": {"dataType":"double","required":true},
            "webhookUrl": {"dataType":"string"},
            "rconCommands": {"dataType":"nestedObjectLiteral","nestedProperties":{"end":{"dataType":"array","array":{"dataType":"string"},"required":true},"match":{"dataType":"array","array":{"dataType":"string"},"required":true},"knife":{"dataType":"array","array":{"dataType":"string"},"required":true},"init":{"dataType":"array","array":{"dataType":"string"},"required":true}},"required":true},
            "canClinch": {"dataType":"boolean","required":true},
            "matchEndAction": {"ref":"EMatchEndAction","required":true},
            "logs": {"dataType":"array","array":{"dataType":"refAlias","ref":"TLogUnion"},"required":true},
            "players": {"dataType":"array","array":{"dataType":"refObject","ref":"IPlayer"},"required":true},
            "tmtSecret": {"dataType":"string","required":true},
            "isStopped": {"dataType":"boolean","required":true},
            "electionMap": {"dataType":"string","required":true},
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
            "matchEndAction": {"ref":"EMatchEndAction"},
            "electionMap": {"dataType":"string"},
        },
        "additionalProperties": false,
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
            "matchEndAction": {"ref":"EMatchEndAction"},
            "electionMap": {"dataType":"string"},
            "state": {"ref":"EMatchSate"},
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
            "startAsCtTeam": {"ref":"ETeamAB"},
            "state": {"ref":"EMatchMapSate"},
            "knifeWinner": {"ref":"ETeamAB"},
            "readyTeams": {"dataType":"nestedObjectLiteral","nestedProperties":{"teamB":{"dataType":"boolean","required":true},"teamA":{"dataType":"boolean","required":true}}},
            "knifeRestart": {"dataType":"nestedObjectLiteral","nestedProperties":{"teamB":{"dataType":"boolean","required":true},"teamA":{"dataType":"boolean","required":true}}},
            "score": {"dataType":"nestedObjectLiteral","nestedProperties":{"teamB":{"dataType":"double","required":true},"teamA":{"dataType":"double","required":true}}},
            "overTimeEnabled": {"dataType":"boolean"},
            "overTimeMaxRounds": {"dataType":"double"},
            "maxRounds": {"dataType":"double"},
            "_refreshOvertimeAndMaxRoundsSettings": {"dataType":"boolean"},
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
        app.post('/api/matches',

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
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/matches',
            authenticateMiddleware([{"bearer_token":[]}]),

            function MatchesController_getAllMatches(request: any, response: any, next: any) {
            const args = {
                    undefined: {"in":"request","required":true,"dataType":"object"},
                    state: {"in":"query","name":"state","dataType":"array","array":{"dataType":"string"}},
                    passthrough: {"in":"query","name":"passthrough","dataType":"array","array":{"dataType":"string"}},
                    isStopped: {"in":"query","name":"isStopped","dataType":"boolean"},
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
        app.get('/api/matches/:id/server/round_backups',
            authenticateMiddleware([{"bearer_token":[]}]),

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
        app.post('/api/matches/:id/server/log/:secret',

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
                    return validationService.ValidateParam(args[key], request.query[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'path':
                    return validationService.ValidateParam(args[key], request.params[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'header':
                    return validationService.ValidateParam(args[key], request.header(name), name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'body':
                    return validationService.ValidateParam(args[key], request.body, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'body-prop':
                    return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, 'body.', {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'formData':
                    if (args[key].dataType === 'file') {
                        return validationService.ValidateParam(args[key], request.file, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    } else if (args[key].dataType === 'array' && args[key].array.dataType === 'file') {
                        return validationService.ValidateParam(args[key], request.files, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    } else {
                        return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
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
