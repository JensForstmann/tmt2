/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TsoaRoute, fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { LoginController } from './loginController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MatchesController } from './matchesController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { GameServersController } from './gameServersController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DebugController } from './debugController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ConfigController } from './configController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PresetsController } from './presetsController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { StatsController } from './statsController';
import { expressAuthentication } from './auth';
// @ts-ignore - no great way to install types from subpackage
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';

const expressAuthenticationRecasted = expressAuthentication as (
	req: ExRequest,
	securityName: string,
	scopes?: string[],
	res?: ExResponse
) => Promise<any>;

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
	TMatchState: {
		dataType: 'refAlias',
		type: {
			dataType: 'union',
			subSchemas: [
				{ dataType: 'enum', enums: ['ELECTION'] },
				{ dataType: 'enum', enums: ['MATCH_MAP'] },
				{ dataType: 'enum', enums: ['FINISHED'] },
			],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ITeam: {
		dataType: 'refObject',
		properties: {
			passthrough: { dataType: 'string' },
			name: { dataType: 'string', required: true },
			advantage: { dataType: 'double', required: true },
			playerSteamIds64: { dataType: 'array', array: { dataType: 'string' } },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IFixedMap: {
		dataType: 'refObject',
		properties: {
			mode: { dataType: 'enum', enums: ['FIXED'], required: true },
			fixed: { dataType: 'string', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TWho: {
		dataType: 'refAlias',
		type: {
			dataType: 'union',
			subSchemas: [
				{ dataType: 'enum', enums: ['TEAM_A'] },
				{ dataType: 'enum', enums: ['TEAM_B'] },
				{ dataType: 'enum', enums: ['TEAM_X'] },
				{ dataType: 'enum', enums: ['TEAM_Y'] },
			],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IPickMap: {
		dataType: 'refObject',
		properties: {
			mode: { dataType: 'enum', enums: ['PICK'], required: true },
			who: { ref: 'TWho', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IAgreeOrRandomMap: {
		dataType: 'refObject',
		properties: {
			mode: {
				dataType: 'union',
				subSchemas: [
					{ dataType: 'enum', enums: ['RANDOM_PICK'] },
					{ dataType: 'enum', enums: ['AGREE'] },
				],
				required: true,
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TSideFixed: {
		dataType: 'refAlias',
		type: {
			dataType: 'union',
			subSchemas: [
				{ dataType: 'enum', enums: ['TEAM_A_CT'] },
				{ dataType: 'enum', enums: ['TEAM_A_T'] },
				{ dataType: 'enum', enums: ['TEAM_B_CT'] },
				{ dataType: 'enum', enums: ['TEAM_B_T'] },
				{ dataType: 'enum', enums: ['TEAM_X_CT'] },
				{ dataType: 'enum', enums: ['TEAM_X_T'] },
				{ dataType: 'enum', enums: ['TEAM_Y_CT'] },
				{ dataType: 'enum', enums: ['TEAM_Y_T'] },
			],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IFixedSide: {
		dataType: 'refObject',
		properties: {
			mode: { dataType: 'enum', enums: ['FIXED'], required: true },
			fixed: { ref: 'TSideFixed', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IPickSide: {
		dataType: 'refObject',
		properties: {
			mode: { dataType: 'enum', enums: ['PICK'], required: true },
			who: { ref: 'TWho', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IRandomOrKnifeSide: {
		dataType: 'refObject',
		properties: {
			mode: {
				dataType: 'union',
				subSchemas: [
					{ dataType: 'enum', enums: ['RANDOM'] },
					{ dataType: 'enum', enums: ['KNIFE'] },
				],
				required: true,
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IElectionStepAdd: {
		dataType: 'refObject',
		properties: {
			map: {
				dataType: 'union',
				subSchemas: [
					{ ref: 'IFixedMap' },
					{ ref: 'IPickMap' },
					{ ref: 'IAgreeOrRandomMap' },
				],
				required: true,
			},
			side: {
				dataType: 'union',
				subSchemas: [
					{ ref: 'IFixedSide' },
					{ ref: 'IPickSide' },
					{ ref: 'IRandomOrKnifeSide' },
				],
				required: true,
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IRandomMapBan: {
		dataType: 'refObject',
		properties: {
			mode: { dataType: 'enum', enums: ['RANDOM_BAN'], required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IBanMap: {
		dataType: 'refObject',
		properties: {
			mode: { dataType: 'enum', enums: ['BAN'], required: true },
			who: { ref: 'TWho', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IElectionStepSkip: {
		dataType: 'refObject',
		properties: {
			map: {
				dataType: 'union',
				subSchemas: [{ ref: 'IRandomMapBan' }, { ref: 'IBanMap' }],
				required: true,
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IElectionStep: {
		dataType: 'refAlias',
		type: {
			dataType: 'union',
			subSchemas: [{ ref: 'IElectionStepAdd' }, { ref: 'IElectionStepSkip' }],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TElectionState: {
		dataType: 'refAlias',
		type: {
			dataType: 'union',
			subSchemas: [
				{ dataType: 'enum', enums: ['NOT_STARTED'] },
				{ dataType: 'enum', enums: ['IN_PROGRESS'] },
				{ dataType: 'enum', enums: ['FINISHED'] },
			],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TTeamAB: {
		dataType: 'refAlias',
		type: {
			dataType: 'union',
			subSchemas: [
				{ dataType: 'enum', enums: ['TEAM_A'] },
				{ dataType: 'enum', enums: ['TEAM_B'] },
			],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TStep: {
		dataType: 'refAlias',
		type: {
			dataType: 'union',
			subSchemas: [
				{ dataType: 'enum', enums: ['MAP'] },
				{ dataType: 'enum', enums: ['SIDE'] },
			],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IElection: {
		dataType: 'refObject',
		properties: {
			state: { ref: 'TElectionState', required: true },
			teamX: { ref: 'TTeamAB' },
			teamY: { ref: 'TTeamAB' },
			remainingMaps: { dataType: 'array', array: { dataType: 'string' }, required: true },
			currentStep: { dataType: 'double', required: true },
			currentSubStep: { ref: 'TStep', required: true },
			currentStepMap: { dataType: 'string' },
			currentAgree: {
				dataType: 'nestedObjectLiteral',
				nestedProperties: {
					teamB: {
						dataType: 'union',
						subSchemas: [{ dataType: 'string' }, { dataType: 'enum', enums: [null] }],
						required: true,
					},
					teamA: {
						dataType: 'union',
						subSchemas: [{ dataType: 'string' }, { dataType: 'enum', enums: [null] }],
						required: true,
					},
				},
				required: true,
			},
			currentRestart: {
				dataType: 'nestedObjectLiteral',
				nestedProperties: {
					teamB: { dataType: 'boolean', required: true },
					teamA: { dataType: 'boolean', required: true },
				},
				required: true,
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IGameServer: {
		dataType: 'refObject',
		properties: {
			ip: { dataType: 'string', required: true },
			port: { dataType: 'double', required: true },
			rconPassword: { dataType: 'string', required: true },
			hideRconPassword: { dataType: 'boolean' },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TMatchMapSate: {
		dataType: 'refAlias',
		type: {
			dataType: 'union',
			subSchemas: [
				{ dataType: 'enum', enums: ['PENDING'] },
				{ dataType: 'enum', enums: ['MAP_CHANGE'] },
				{ dataType: 'enum', enums: ['WARMUP'] },
				{ dataType: 'enum', enums: ['KNIFE'] },
				{ dataType: 'enum', enums: ['AFTER_KNIFE'] },
				{ dataType: 'enum', enums: ['IN_PROGRESS'] },
				{ dataType: 'enum', enums: ['PAUSED'] },
				{ dataType: 'enum', enums: ['FINISHED'] },
			],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IMatchMap: {
		dataType: 'refObject',
		properties: {
			name: { dataType: 'string', required: true },
			knifeForSide: { dataType: 'boolean', required: true },
			startAsCtTeam: { ref: 'TTeamAB', required: true },
			state: { ref: 'TMatchMapSate', required: true },
			knifeWinner: { ref: 'TTeamAB' },
			readyTeams: {
				dataType: 'nestedObjectLiteral',
				nestedProperties: {
					teamB: { dataType: 'boolean', required: true },
					teamA: { dataType: 'boolean', required: true },
				},
				required: true,
			},
			knifeRestart: {
				dataType: 'nestedObjectLiteral',
				nestedProperties: {
					teamB: { dataType: 'boolean', required: true },
					teamA: { dataType: 'boolean', required: true },
				},
				required: true,
			},
			score: {
				dataType: 'nestedObjectLiteral',
				nestedProperties: {
					teamB: { dataType: 'double', required: true },
					teamA: { dataType: 'double', required: true },
				},
				required: true,
			},
			overTimeEnabled: { dataType: 'boolean', required: true },
			overTimeMaxRounds: { dataType: 'double', required: true },
			maxRounds: { dataType: 'double', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TMatchEndAction: {
		dataType: 'refAlias',
		type: {
			dataType: 'union',
			subSchemas: [
				{ dataType: 'enum', enums: ['KICK_ALL'] },
				{ dataType: 'enum', enums: ['QUIT_SERVER'] },
				{ dataType: 'enum', enums: ['NONE'] },
			],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TLogType: {
		dataType: 'refAlias',
		type: {
			dataType: 'union',
			subSchemas: [
				{ dataType: 'enum', enums: ['CHAT'] },
				{ dataType: 'enum', enums: ['SYSTEM'] },
			],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ILogChat: {
		dataType: 'refObject',
		properties: {
			type: { dataType: 'enum', enums: ['CHAT'], required: true },
			timestamp: { dataType: 'double', required: true },
			isTeamChat: { dataType: 'boolean', required: true },
			steamId64: { dataType: 'string', required: true },
			message: { dataType: 'string', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TSystemLogCategory: {
		dataType: 'refAlias',
		type: {
			dataType: 'union',
			subSchemas: [
				{ dataType: 'enum', enums: ['ERROR'] },
				{ dataType: 'enum', enums: ['WARN'] },
				{ dataType: 'enum', enums: ['INFO'] },
				{ dataType: 'enum', enums: ['DEBUG'] },
			],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ILogSystem: {
		dataType: 'refObject',
		properties: {
			type: { dataType: 'enum', enums: ['SYSTEM'], required: true },
			timestamp: { dataType: 'double', required: true },
			category: { ref: 'TSystemLogCategory', required: true },
			message: { dataType: 'string', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TLogUnion: {
		dataType: 'refAlias',
		type: {
			dataType: 'union',
			subSchemas: [{ ref: 'ILogChat' }, { ref: 'ILogSystem' }],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TTeamSides: {
		dataType: 'refAlias',
		type: {
			dataType: 'union',
			subSchemas: [
				{ dataType: 'enum', enums: ['CT'] },
				{ dataType: 'enum', enums: ['T'] },
			],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IPlayer: {
		dataType: 'refObject',
		properties: {
			steamId64: { dataType: 'string', required: true },
			name: { dataType: 'string', required: true },
			team: { ref: 'TTeamAB' },
			side: {
				dataType: 'union',
				subSchemas: [{ ref: 'TTeamSides' }, { dataType: 'enum', enums: [null] }],
			},
			online: { dataType: 'boolean' },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TMatchMode: {
		dataType: 'refAlias',
		type: {
			dataType: 'union',
			subSchemas: [
				{ dataType: 'enum', enums: ['SINGLE'] },
				{ dataType: 'enum', enums: ['LOOP'] },
			],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IMatch: {
		dataType: 'refObject',
		properties: {
			id: { dataType: 'string', required: true },
			state: { ref: 'TMatchState', required: true },
			passthrough: { dataType: 'string' },
			mapPool: { dataType: 'array', array: { dataType: 'string' }, required: true },
			teamA: { ref: 'ITeam', required: true },
			teamB: { ref: 'ITeam', required: true },
			electionSteps: {
				dataType: 'array',
				array: { dataType: 'refAlias', ref: 'IElectionStep' },
				required: true,
			},
			election: { ref: 'IElection', required: true },
			gameServer: { ref: 'IGameServer', required: true },
			logSecret: { dataType: 'string', required: true },
			parseIncomingLogs: { dataType: 'boolean', required: true },
			matchMaps: {
				dataType: 'array',
				array: { dataType: 'refObject', ref: 'IMatchMap' },
				required: true,
			},
			currentMap: { dataType: 'double', required: true },
			webhookUrl: {
				dataType: 'union',
				subSchemas: [{ dataType: 'string' }, { dataType: 'enum', enums: [null] }],
				required: true,
			},
			webhookHeaders: {
				dataType: 'union',
				subSchemas: [
					{
						dataType: 'nestedObjectLiteral',
						nestedProperties: {},
						additionalProperties: { dataType: 'string' },
					},
					{ dataType: 'enum', enums: [null] },
				],
				required: true,
			},
			rconCommands: {
				dataType: 'nestedObjectLiteral',
				nestedProperties: {
					end: { dataType: 'array', array: { dataType: 'string' }, required: true },
					match: { dataType: 'array', array: { dataType: 'string' }, required: true },
					knife: { dataType: 'array', array: { dataType: 'string' }, required: true },
					init: { dataType: 'array', array: { dataType: 'string' }, required: true },
				},
				required: true,
			},
			canClinch: { dataType: 'boolean', required: true },
			matchEndAction: { ref: 'TMatchEndAction', required: true },
			logs: {
				dataType: 'array',
				array: { dataType: 'refAlias', ref: 'TLogUnion' },
				required: true,
			},
			players: {
				dataType: 'array',
				array: { dataType: 'refObject', ref: 'IPlayer' },
				required: true,
			},
			tmtSecret: { dataType: 'string', required: true },
			isStopped: { dataType: 'boolean', required: true },
			serverPassword: { dataType: 'string', required: true },
			tmtLogAddress: { dataType: 'string' },
			createdAt: { dataType: 'double', required: true },
			lastSavedAt: { dataType: 'double' },
			mode: { ref: 'TMatchMode', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ITeamCreateDto: {
		dataType: 'refObject',
		properties: {
			name: { dataType: 'string', required: true },
			passthrough: { dataType: 'string' },
			advantage: { dataType: 'double' },
			playerSteamIds64: { dataType: 'array', array: { dataType: 'string' } },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IMatchCreateDto: {
		dataType: 'refObject',
		properties: {
			passthrough: { dataType: 'string' },
			mapPool: { dataType: 'array', array: { dataType: 'string' }, required: true },
			teamA: { ref: 'ITeamCreateDto', required: true },
			teamB: { ref: 'ITeamCreateDto', required: true },
			electionSteps: {
				dataType: 'array',
				array: {
					dataType: 'union',
					subSchemas: [{ ref: 'IElectionStepAdd' }, { ref: 'IElectionStepSkip' }],
				},
				required: true,
			},
			gameServer: {
				dataType: 'union',
				subSchemas: [{ ref: 'IGameServer' }, { dataType: 'enum', enums: [null] }],
				required: true,
			},
			webhookUrl: {
				dataType: 'union',
				subSchemas: [{ dataType: 'string' }, { dataType: 'enum', enums: [null] }],
			},
			webhookHeaders: {
				dataType: 'union',
				subSchemas: [
					{
						dataType: 'nestedObjectLiteral',
						nestedProperties: {},
						additionalProperties: { dataType: 'string' },
					},
					{ dataType: 'enum', enums: [null] },
				],
			},
			rconCommands: {
				dataType: 'nestedObjectLiteral',
				nestedProperties: {
					end: { dataType: 'array', array: { dataType: 'string' } },
					match: { dataType: 'array', array: { dataType: 'string' } },
					knife: { dataType: 'array', array: { dataType: 'string' } },
					init: { dataType: 'array', array: { dataType: 'string' } },
				},
			},
			canClinch: { dataType: 'boolean' },
			matchEndAction: { ref: 'TMatchEndAction' },
			tmtLogAddress: { dataType: 'string' },
			mode: { ref: 'TMatchMode' },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IMatchResponse: {
		dataType: 'refObject',
		properties: {
			id: { dataType: 'string', required: true },
			state: { ref: 'TMatchState', required: true },
			passthrough: { dataType: 'string' },
			mapPool: { dataType: 'array', array: { dataType: 'string' }, required: true },
			teamA: { ref: 'ITeam', required: true },
			teamB: { ref: 'ITeam', required: true },
			electionSteps: {
				dataType: 'array',
				array: { dataType: 'refAlias', ref: 'IElectionStep' },
				required: true,
			},
			election: { ref: 'IElection', required: true },
			gameServer: { ref: 'IGameServer', required: true },
			logSecret: { dataType: 'string', required: true },
			parseIncomingLogs: { dataType: 'boolean', required: true },
			matchMaps: {
				dataType: 'array',
				array: { dataType: 'refObject', ref: 'IMatchMap' },
				required: true,
			},
			currentMap: { dataType: 'double', required: true },
			webhookUrl: {
				dataType: 'union',
				subSchemas: [{ dataType: 'string' }, { dataType: 'enum', enums: [null] }],
				required: true,
			},
			webhookHeaders: {
				dataType: 'union',
				subSchemas: [
					{
						dataType: 'nestedObjectLiteral',
						nestedProperties: {},
						additionalProperties: { dataType: 'string' },
					},
					{ dataType: 'enum', enums: [null] },
				],
				required: true,
			},
			rconCommands: {
				dataType: 'nestedObjectLiteral',
				nestedProperties: {
					end: { dataType: 'array', array: { dataType: 'string' }, required: true },
					match: { dataType: 'array', array: { dataType: 'string' }, required: true },
					knife: { dataType: 'array', array: { dataType: 'string' }, required: true },
					init: { dataType: 'array', array: { dataType: 'string' }, required: true },
				},
				required: true,
			},
			canClinch: { dataType: 'boolean', required: true },
			matchEndAction: { ref: 'TMatchEndAction', required: true },
			logs: {
				dataType: 'array',
				array: { dataType: 'refAlias', ref: 'TLogUnion' },
				required: true,
			},
			players: {
				dataType: 'array',
				array: { dataType: 'refObject', ref: 'IPlayer' },
				required: true,
			},
			tmtSecret: { dataType: 'string', required: true },
			isStopped: { dataType: 'boolean', required: true },
			serverPassword: { dataType: 'string', required: true },
			tmtLogAddress: { dataType: 'string' },
			createdAt: { dataType: 'double', required: true },
			lastSavedAt: { dataType: 'double' },
			mode: { ref: 'TMatchMode', required: true },
			isLive: { dataType: 'boolean', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TTeamString: {
		dataType: 'refAlias',
		type: {
			dataType: 'union',
			subSchemas: [
				{ dataType: 'enum', enums: ['Unassigned'] },
				{ dataType: 'enum', enums: ['CT'] },
				{ dataType: 'enum', enums: ['TERRORIST'] },
				{ dataType: 'enum', enums: [''] },
				{ dataType: 'enum', enums: ['Spectator'] },
			],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	EventType: {
		dataType: 'refAlias',
		type: {
			dataType: 'union',
			subSchemas: [
				{ dataType: 'enum', enums: ['CHAT'] },
				{ dataType: 'enum', enums: ['ELECTION_MAP_STEP'] },
				{ dataType: 'enum', enums: ['ELECTION_SIDE_STEP'] },
				{ dataType: 'enum', enums: ['MAP_ELECTION_END'] },
				{ dataType: 'enum', enums: ['KNIFE_END'] },
				{ dataType: 'enum', enums: ['ROUND_END'] },
				{ dataType: 'enum', enums: ['MAP_START'] },
				{ dataType: 'enum', enums: ['MAP_END'] },
				{ dataType: 'enum', enums: ['MATCH_END'] },
				{ dataType: 'enum', enums: ['LOG'] },
				{ dataType: 'enum', enums: ['MATCH_CREATE'] },
				{ dataType: 'enum', enums: ['MATCH_UPDATE'] },
				{ dataType: 'enum', enums: ['MATCH_STOP'] },
			],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ChatEvent: {
		dataType: 'refObject',
		properties: {
			timestamp: { dataType: 'string', required: true },
			matchId: { dataType: 'string', required: true },
			matchPassthrough: {
				dataType: 'union',
				subSchemas: [{ dataType: 'string' }, { dataType: 'enum', enums: [null] }],
				required: true,
			},
			type: { dataType: 'enum', enums: ['CHAT'], required: true },
			player: {
				dataType: 'union',
				subSchemas: [{ ref: 'IPlayer' }, { dataType: 'enum', enums: [null] }],
				required: true,
			},
			playerTeam: {
				dataType: 'union',
				subSchemas: [{ ref: 'ITeam' }, { dataType: 'enum', enums: [null] }],
				required: true,
			},
			message: { dataType: 'string', required: true },
			isTeamChat: { dataType: 'boolean', required: true },
			teamString: { ref: 'TTeamString' },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ElectionEndEvent: {
		dataType: 'refObject',
		properties: {
			timestamp: { dataType: 'string', required: true },
			matchId: { dataType: 'string', required: true },
			matchPassthrough: {
				dataType: 'union',
				subSchemas: [{ dataType: 'string' }, { dataType: 'enum', enums: [null] }],
				required: true,
			},
			type: { dataType: 'enum', enums: ['MAP_ELECTION_END'], required: true },
			mapNames: { dataType: 'array', array: { dataType: 'string' }, required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	RoundEndEvent: {
		dataType: 'refObject',
		properties: {
			timestamp: { dataType: 'string', required: true },
			matchId: { dataType: 'string', required: true },
			matchPassthrough: {
				dataType: 'union',
				subSchemas: [{ dataType: 'string' }, { dataType: 'enum', enums: [null] }],
				required: true,
			},
			type: { dataType: 'enum', enums: ['ROUND_END'], required: true },
			mapIndex: { dataType: 'double', required: true },
			mapName: { dataType: 'string', required: true },
			matchMapCount: { dataType: 'double', required: true },
			winnerTeam: { ref: 'ITeam', required: true },
			scoreTeamA: { dataType: 'double', required: true },
			scoreTeamB: { dataType: 'double', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	MapEndEvent: {
		dataType: 'refObject',
		properties: {
			timestamp: { dataType: 'string', required: true },
			matchId: { dataType: 'string', required: true },
			matchPassthrough: {
				dataType: 'union',
				subSchemas: [{ dataType: 'string' }, { dataType: 'enum', enums: [null] }],
				required: true,
			},
			type: { dataType: 'enum', enums: ['MAP_END'], required: true },
			mapIndex: { dataType: 'double', required: true },
			mapName: { dataType: 'string', required: true },
			matchMapCount: { dataType: 'double', required: true },
			scoreTeamA: { dataType: 'double', required: true },
			scoreTeamB: { dataType: 'double', required: true },
			winnerTeam: {
				dataType: 'union',
				subSchemas: [{ ref: 'ITeam' }, { dataType: 'enum', enums: [null] }],
				required: true,
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	MatchEndEvent: {
		dataType: 'refObject',
		properties: {
			timestamp: { dataType: 'string', required: true },
			matchId: { dataType: 'string', required: true },
			matchPassthrough: {
				dataType: 'union',
				subSchemas: [{ dataType: 'string' }, { dataType: 'enum', enums: [null] }],
				required: true,
			},
			type: { dataType: 'enum', enums: ['MATCH_END'], required: true },
			wonMapsTeamA: { dataType: 'double', required: true },
			wonMapsTeamB: { dataType: 'double', required: true },
			winnerTeam: {
				dataType: 'union',
				subSchemas: [{ ref: 'ITeam' }, { dataType: 'enum', enums: [null] }],
				required: true,
			},
			mapResults: {
				dataType: 'array',
				array: {
					dataType: 'nestedObjectLiteral',
					nestedProperties: {
						winnerTeam: {
							dataType: 'union',
							subSchemas: [{ ref: 'ITeam' }, { dataType: 'enum', enums: [null] }],
							required: true,
						},
						scoreTeamB: { dataType: 'double', required: true },
						scoreTeamA: { dataType: 'double', required: true },
						mapName: { dataType: 'string', required: true },
					},
				},
				required: true,
			},
			matchMapCount: { dataType: 'double', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	KnifeRoundEndEvent: {
		dataType: 'refObject',
		properties: {
			timestamp: { dataType: 'string', required: true },
			matchId: { dataType: 'string', required: true },
			matchPassthrough: {
				dataType: 'union',
				subSchemas: [{ dataType: 'string' }, { dataType: 'enum', enums: [null] }],
				required: true,
			},
			type: { dataType: 'enum', enums: ['KNIFE_END'], required: true },
			mapIndex: { dataType: 'double', required: true },
			mapName: { dataType: 'string', required: true },
			matchMapCount: { dataType: 'double', required: true },
			winnerTeam: { ref: 'ITeam', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	MapStartEvent: {
		dataType: 'refObject',
		properties: {
			timestamp: { dataType: 'string', required: true },
			matchId: { dataType: 'string', required: true },
			matchPassthrough: {
				dataType: 'union',
				subSchemas: [{ dataType: 'string' }, { dataType: 'enum', enums: [null] }],
				required: true,
			},
			type: { dataType: 'enum', enums: ['MAP_START'], required: true },
			mapIndex: { dataType: 'double', required: true },
			mapName: { dataType: 'string', required: true },
			matchMapCount: { dataType: 'double', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	LogEvent: {
		dataType: 'refObject',
		properties: {
			timestamp: { dataType: 'string', required: true },
			matchId: { dataType: 'string', required: true },
			matchPassthrough: {
				dataType: 'union',
				subSchemas: [{ dataType: 'string' }, { dataType: 'enum', enums: [null] }],
				required: true,
			},
			type: { dataType: 'enum', enums: ['LOG'], required: true },
			message: { dataType: 'string', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TMapMode: {
		dataType: 'refAlias',
		type: {
			dataType: 'union',
			subSchemas: [
				{ dataType: 'enum', enums: ['FIXED'] },
				{ dataType: 'enum', enums: ['PICK'] },
				{ dataType: 'enum', enums: ['RANDOM_PICK'] },
				{ dataType: 'enum', enums: ['AGREE'] },
				{ dataType: 'enum', enums: ['BAN'] },
				{ dataType: 'enum', enums: ['RANDOM_BAN'] },
			],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ElectionMapStep: {
		dataType: 'refObject',
		properties: {
			timestamp: { dataType: 'string', required: true },
			matchId: { dataType: 'string', required: true },
			matchPassthrough: {
				dataType: 'union',
				subSchemas: [{ dataType: 'string' }, { dataType: 'enum', enums: [null] }],
				required: true,
			},
			type: { dataType: 'enum', enums: ['ELECTION_MAP_STEP'], required: true },
			mode: { ref: 'TMapMode', required: true },
			mapName: { dataType: 'string', required: true },
			pickerTeam: { ref: 'ITeam' },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TSideMode: {
		dataType: 'refAlias',
		type: {
			dataType: 'union',
			subSchemas: [
				{ dataType: 'enum', enums: ['KNIFE'] },
				{ dataType: 'enum', enums: ['FIXED'] },
				{ dataType: 'enum', enums: ['PICK'] },
				{ dataType: 'enum', enums: ['RANDOM'] },
			],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ElectionSideStep: {
		dataType: 'refObject',
		properties: {
			timestamp: { dataType: 'string', required: true },
			matchId: { dataType: 'string', required: true },
			matchPassthrough: {
				dataType: 'union',
				subSchemas: [{ dataType: 'string' }, { dataType: 'enum', enums: [null] }],
				required: true,
			},
			type: { dataType: 'enum', enums: ['ELECTION_SIDE_STEP'], required: true },
			mode: { ref: 'TSideMode', required: true },
			pickerTeam: { ref: 'ITeam' },
			pickerSide: { ref: 'TTeamSides' },
			ctTeam: { ref: 'ITeam' },
			tTeam: { ref: 'ITeam' },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	MatchCreateEvent: {
		dataType: 'refObject',
		properties: {
			timestamp: { dataType: 'string', required: true },
			matchId: { dataType: 'string', required: true },
			matchPassthrough: {
				dataType: 'union',
				subSchemas: [{ dataType: 'string' }, { dataType: 'enum', enums: [null] }],
				required: true,
			},
			type: { dataType: 'enum', enums: ['MATCH_CREATE'], required: true },
			match: { ref: 'IMatchResponse', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	MatchUpdateEvent: {
		dataType: 'refObject',
		properties: {
			timestamp: { dataType: 'string', required: true },
			matchId: { dataType: 'string', required: true },
			matchPassthrough: {
				dataType: 'union',
				subSchemas: [{ dataType: 'string' }, { dataType: 'enum', enums: [null] }],
				required: true,
			},
			type: { dataType: 'enum', enums: ['MATCH_UPDATE'], required: true },
			path: {
				dataType: 'array',
				array: {
					dataType: 'union',
					subSchemas: [{ dataType: 'string' }, { dataType: 'double' }],
				},
				required: true,
			},
			value: { dataType: 'any', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	MatchStopEvent: {
		dataType: 'refObject',
		properties: {
			timestamp: { dataType: 'string', required: true },
			matchId: { dataType: 'string', required: true },
			matchPassthrough: {
				dataType: 'union',
				subSchemas: [{ dataType: 'string' }, { dataType: 'enum', enums: [null] }],
				required: true,
			},
			type: { dataType: 'enum', enums: ['MATCH_STOP'], required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	Event: {
		dataType: 'refAlias',
		type: {
			dataType: 'union',
			subSchemas: [
				{ ref: 'ChatEvent' },
				{ ref: 'ElectionEndEvent' },
				{ ref: 'RoundEndEvent' },
				{ ref: 'MapEndEvent' },
				{ ref: 'MatchEndEvent' },
				{ ref: 'KnifeRoundEndEvent' },
				{ ref: 'MapStartEvent' },
				{ ref: 'LogEvent' },
				{ ref: 'ElectionMapStep' },
				{ ref: 'ElectionSideStep' },
				{ ref: 'MatchCreateEvent' },
				{ ref: 'MatchUpdateEvent' },
				{ ref: 'MatchStopEvent' },
			],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IMatchUpdateDto: {
		dataType: 'refObject',
		properties: {
			passthrough: { dataType: 'string' },
			mapPool: { dataType: 'array', array: { dataType: 'string' } },
			teamA: { ref: 'ITeamCreateDto' },
			teamB: { ref: 'ITeamCreateDto' },
			electionSteps: {
				dataType: 'array',
				array: {
					dataType: 'union',
					subSchemas: [{ ref: 'IElectionStepAdd' }, { ref: 'IElectionStepSkip' }],
				},
			},
			gameServer: { ref: 'IGameServer' },
			webhookUrl: { dataType: 'string' },
			webhookHeaders: {
				dataType: 'nestedObjectLiteral',
				nestedProperties: {},
				additionalProperties: { dataType: 'string' },
			},
			rconCommands: {
				dataType: 'nestedObjectLiteral',
				nestedProperties: {
					end: { dataType: 'array', array: { dataType: 'string' } },
					match: { dataType: 'array', array: { dataType: 'string' } },
					knife: { dataType: 'array', array: { dataType: 'string' } },
					init: { dataType: 'array', array: { dataType: 'string' } },
				},
			},
			canClinch: { dataType: 'boolean' },
			matchEndAction: {
				dataType: 'union',
				subSchemas: [
					{ dataType: 'enum', enums: ['KICK_ALL'] },
					{ dataType: 'enum', enums: ['QUIT_SERVER'] },
					{ dataType: 'enum', enums: ['NONE'] },
				],
			},
			tmtLogAddress: { dataType: 'string' },
			mode: { ref: 'TMatchMode' },
			state: { ref: 'TMatchState' },
			logSecret: { dataType: 'string' },
			currentMap: { dataType: 'double' },
			_restartElection: { dataType: 'boolean' },
			_execRconCommandsInit: { dataType: 'boolean' },
			_execRconCommandsKnife: { dataType: 'boolean' },
			_execRconCommandsMatch: { dataType: 'boolean' },
			_execRconCommandsEnd: { dataType: 'boolean' },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IMatchMapUpdateDto: {
		dataType: 'refObject',
		properties: {
			name: { dataType: 'string' },
			knifeForSide: { dataType: 'boolean' },
			startAsCtTeam: { ref: 'TTeamAB' },
			state: { ref: 'TMatchMapSate' },
			knifeWinner: { ref: 'TTeamAB' },
			readyTeams: {
				dataType: 'nestedObjectLiteral',
				nestedProperties: {
					teamB: { dataType: 'boolean', required: true },
					teamA: { dataType: 'boolean', required: true },
				},
			},
			knifeRestart: {
				dataType: 'nestedObjectLiteral',
				nestedProperties: {
					teamB: { dataType: 'boolean', required: true },
					teamA: { dataType: 'boolean', required: true },
				},
			},
			score: {
				dataType: 'nestedObjectLiteral',
				nestedProperties: {
					teamB: { dataType: 'double', required: true },
					teamA: { dataType: 'double', required: true },
				},
			},
			overTimeEnabled: { dataType: 'boolean' },
			overTimeMaxRounds: { dataType: 'double' },
			maxRounds: { dataType: 'double' },
			_refreshOvertimeAndMaxRoundsSettings: { dataType: 'boolean' },
			_switchTeamInternals: { dataType: 'boolean' },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IManagedGameServer: {
		dataType: 'refObject',
		properties: {
			ip: { dataType: 'string', required: true },
			port: { dataType: 'double', required: true },
			rconPassword: { dataType: 'string', required: true },
			hideRconPassword: { dataType: 'boolean' },
			canBeUsed: { dataType: 'boolean', required: true },
			usedBy: {
				dataType: 'union',
				subSchemas: [{ dataType: 'string' }, { dataType: 'enum', enums: [null] }],
				required: true,
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IManagedGameServerCreateDto: {
		dataType: 'refObject',
		properties: {
			ip: { dataType: 'string', required: true },
			port: { dataType: 'double', required: true },
			rconPassword: { dataType: 'string', required: true },
			hideRconPassword: { dataType: 'boolean' },
			canBeUsed: { dataType: 'boolean' },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IManagedGameServerUpdateDto: {
		dataType: 'refObject',
		properties: {
			ip: { dataType: 'string', required: true },
			port: { dataType: 'double', required: true },
			rconPassword: { dataType: 'string' },
			canBeUsed: { dataType: 'boolean' },
			usedBy: {
				dataType: 'union',
				subSchemas: [{ dataType: 'string' }, { dataType: 'enum', enums: [null] }],
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IDebugResponse: {
		dataType: 'refObject',
		properties: {
			tmtVersion: {
				dataType: 'union',
				subSchemas: [{ dataType: 'string' }, { dataType: 'enum', enums: [null] }],
				required: true,
			},
			tmtCommitSha: {
				dataType: 'union',
				subSchemas: [{ dataType: 'string' }, { dataType: 'enum', enums: [null] }],
				required: true,
			},
			tmtImageBuildTimestamp: {
				dataType: 'union',
				subSchemas: [{ dataType: 'string' }, { dataType: 'enum', enums: [null] }],
				required: true,
			},
			tmtStorageFolder: { dataType: 'string', required: true },
			tmtPort: {
				dataType: 'union',
				subSchemas: [{ dataType: 'string' }, { dataType: 'double' }],
				required: true,
			},
			tmtLogAddress: {
				dataType: 'union',
				subSchemas: [{ dataType: 'string' }, { dataType: 'enum', enums: [null] }],
				required: true,
			},
			tmtSayPrefix: { dataType: 'string', required: true },
			webSockets: { dataType: 'array', array: { dataType: 'any' }, required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IConfig: {
		dataType: 'refObject',
		properties: {
			tmtLogAddress: {
				dataType: 'union',
				subSchemas: [{ dataType: 'string' }, { dataType: 'enum', enums: [null] }],
				required: true,
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IPreset: {
		dataType: 'refObject',
		properties: {
			name: { dataType: 'string', required: true },
			isPublic: { dataType: 'boolean' },
			data: { ref: 'IMatchCreateDto', required: true },
			id: { dataType: 'string', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IPresetCreateDto: {
		dataType: 'refObject',
		properties: {
			name: { dataType: 'string', required: true },
			isPublic: { dataType: 'boolean' },
			data: { ref: 'IMatchCreateDto', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IPlayerStats: {
		dataType: 'refObject',
		properties: {
			steamId: { dataType: 'string', required: true },
			name: { dataType: 'string', required: true },
			kills: { dataType: 'double', required: true },
			deaths: { dataType: 'double', required: true },
			assists: { dataType: 'double', required: true },
			diff: { dataType: 'double', required: true },
			hits: { dataType: 'double', required: true },
			headshots: { dataType: 'double', required: true },
			hsPct: { dataType: 'double', required: true },
			rounds: { dataType: 'double', required: true },
			damages: { dataType: 'double', required: true },
			adr: { dataType: 'double', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IMatchStats: {
		dataType: 'refObject',
		properties: {
			matchId: { dataType: 'string', required: true },
			map: { dataType: 'string', required: true },
			teamA: { dataType: 'string', required: true },
			teamAScore: { dataType: 'string', required: true },
			teamB: { dataType: 'string', required: true },
			teamBScore: { dataType: 'string', required: true },
			winner: { dataType: 'string', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {
	noImplicitAdditionalProperties: 'silently-remove-extras',
	bodyCoercion: true,
});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

export function RegisterRoutes(app: Router) {
	// ###########################################################################################################
	//  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
	//      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
	// ###########################################################################################################

	app.post(
		'/api/login',
		authenticateMiddleware([{ bearer_token: [] }]),
		...fetchMiddlewares<RequestHandler>(LoginController),
		...fetchMiddlewares<RequestHandler>(LoginController.prototype.login),

		async function LoginController_login(request: ExRequest, response: ExResponse, next: any) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new LoginController();

				await templateService.apiHandler({
					methodName: 'login',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.post(
		'/api/matches',
		authenticateMiddleware([{ bearer_token_optional: [] }]),
		...fetchMiddlewares<RequestHandler>(MatchesController),
		...fetchMiddlewares<RequestHandler>(MatchesController.prototype.createMatch),

		async function MatchesController_createMatch(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {
				requestBody: {
					in: 'body',
					name: 'requestBody',
					required: true,
					ref: 'IMatchCreateDto',
				},
				req: { in: 'request', name: 'req', required: true, dataType: 'object' },
			};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new MatchesController();

				await templateService.apiHandler({
					methodName: 'createMatch',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 201,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.get(
		'/api/matches',
		authenticateMiddleware([{ bearer_token: [] }]),
		...fetchMiddlewares<RequestHandler>(MatchesController),
		...fetchMiddlewares<RequestHandler>(MatchesController.prototype.getAllMatches),

		async function MatchesController_getAllMatches(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {
				req: { in: 'request', name: 'req', required: true, dataType: 'object' },
				state: {
					in: 'query',
					name: 'state',
					dataType: 'array',
					array: { dataType: 'string' },
				},
				passthrough: {
					in: 'query',
					name: 'passthrough',
					dataType: 'array',
					array: { dataType: 'string' },
				},
				isStopped: { in: 'query', name: 'isStopped', dataType: 'boolean' },
				isLive: { in: 'query', name: 'isLive', dataType: 'boolean' },
			};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new MatchesController();

				await templateService.apiHandler({
					methodName: 'getAllMatches',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.get(
		'/api/matches/:id',
		authenticateMiddleware([{ bearer_token: [] }]),
		...fetchMiddlewares<RequestHandler>(MatchesController),
		...fetchMiddlewares<RequestHandler>(MatchesController.prototype.getMatch),

		async function MatchesController_getMatch(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {
				id: { in: 'path', name: 'id', required: true, dataType: 'string' },
				req: { in: 'request', name: 'req', required: true, dataType: 'object' },
			};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new MatchesController();

				await templateService.apiHandler({
					methodName: 'getMatch',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.get(
		'/api/matches/:id/logs',
		authenticateMiddleware([{ bearer_token: [] }]),
		...fetchMiddlewares<RequestHandler>(MatchesController),
		...fetchMiddlewares<RequestHandler>(MatchesController.prototype.getLogs),

		async function MatchesController_getLogs(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {
				id: { in: 'path', name: 'id', required: true, dataType: 'string' },
				req: { in: 'request', name: 'req', required: true, dataType: 'object' },
			};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new MatchesController();

				await templateService.apiHandler({
					methodName: 'getLogs',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.get(
		'/api/matches/:id/events',
		authenticateMiddleware([{ bearer_token: [] }]),
		...fetchMiddlewares<RequestHandler>(MatchesController),
		...fetchMiddlewares<RequestHandler>(MatchesController.prototype.getEvents),

		async function MatchesController_getEvents(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {
				id: { in: 'path', name: 'id', required: true, dataType: 'string' },
				req: { in: 'request', name: 'req', required: true, dataType: 'object' },
			};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new MatchesController();

				await templateService.apiHandler({
					methodName: 'getEvents',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.get(
		'/api/matches/:id/server/round_backups',
		authenticateMiddleware([{ bearer_token: [] }]),
		...fetchMiddlewares<RequestHandler>(MatchesController),
		...fetchMiddlewares<RequestHandler>(MatchesController.prototype.getRoundBackups),

		async function MatchesController_getRoundBackups(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {
				id: { in: 'path', name: 'id', required: true, dataType: 'string' },
				req: { in: 'request', name: 'req', required: true, dataType: 'object' },
				count: { in: 'query', name: 'count', dataType: 'double' },
			};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new MatchesController();

				await templateService.apiHandler({
					methodName: 'getRoundBackups',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.post(
		'/api/matches/:id/server/round_backups/:file',
		authenticateMiddleware([{ bearer_token: [] }]),
		...fetchMiddlewares<RequestHandler>(MatchesController),
		...fetchMiddlewares<RequestHandler>(MatchesController.prototype.loadRoundBackup),

		async function MatchesController_loadRoundBackup(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {
				id: { in: 'path', name: 'id', required: true, dataType: 'string' },
				file: { in: 'path', name: 'file', required: true, dataType: 'string' },
				req: { in: 'request', name: 'req', required: true, dataType: 'object' },
			};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new MatchesController();

				await templateService.apiHandler({
					methodName: 'loadRoundBackup',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.patch(
		'/api/matches/:id',
		authenticateMiddleware([{ bearer_token: [] }]),
		...fetchMiddlewares<RequestHandler>(MatchesController),
		...fetchMiddlewares<RequestHandler>(MatchesController.prototype.updateMatch),

		async function MatchesController_updateMatch(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {
				id: { in: 'path', name: 'id', required: true, dataType: 'string' },
				requestBody: {
					in: 'body',
					name: 'requestBody',
					required: true,
					ref: 'IMatchUpdateDto',
				},
				req: { in: 'request', name: 'req', required: true, dataType: 'object' },
			};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new MatchesController();

				await templateService.apiHandler({
					methodName: 'updateMatch',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.patch(
		'/api/matches/:id/matchMap/:mapNumber',
		authenticateMiddleware([{ bearer_token: [] }]),
		...fetchMiddlewares<RequestHandler>(MatchesController),
		...fetchMiddlewares<RequestHandler>(MatchesController.prototype.updateMatchMap),

		async function MatchesController_updateMatchMap(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {
				id: { in: 'path', name: 'id', required: true, dataType: 'string' },
				mapNumber: { in: 'path', name: 'mapNumber', required: true, dataType: 'double' },
				requestBody: {
					in: 'body',
					name: 'requestBody',
					required: true,
					ref: 'IMatchMapUpdateDto',
				},
				req: { in: 'request', name: 'req', required: true, dataType: 'object' },
			};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new MatchesController();

				await templateService.apiHandler({
					methodName: 'updateMatchMap',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.delete(
		'/api/matches/:id',
		authenticateMiddleware([{ bearer_token: [] }]),
		...fetchMiddlewares<RequestHandler>(MatchesController),
		...fetchMiddlewares<RequestHandler>(MatchesController.prototype.deleteMatch),

		async function MatchesController_deleteMatch(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {
				id: { in: 'path', name: 'id', required: true, dataType: 'string' },
				req: { in: 'request', name: 'req', required: true, dataType: 'object' },
			};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new MatchesController();

				await templateService.apiHandler({
					methodName: 'deleteMatch',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.patch(
		'/api/matches/:id/revive',
		authenticateMiddleware([{ bearer_token: [] }]),
		...fetchMiddlewares<RequestHandler>(MatchesController),
		...fetchMiddlewares<RequestHandler>(MatchesController.prototype.reviveMatch),

		async function MatchesController_reviveMatch(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {
				id: { in: 'path', name: 'id', required: true, dataType: 'string' },
				req: { in: 'request', name: 'req', required: true, dataType: 'object' },
			};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new MatchesController();

				await templateService.apiHandler({
					methodName: 'reviveMatch',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.post(
		'/api/matches/:id/server/rcon',
		authenticateMiddleware([{ bearer_token: [] }]),
		...fetchMiddlewares<RequestHandler>(MatchesController),
		...fetchMiddlewares<RequestHandler>(MatchesController.prototype.rcon),

		async function MatchesController_rcon(request: ExRequest, response: ExResponse, next: any) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {
				id: { in: 'path', name: 'id', required: true, dataType: 'string' },
				requestBody: {
					in: 'body',
					name: 'requestBody',
					required: true,
					dataType: 'array',
					array: { dataType: 'string' },
				},
				req: { in: 'request', name: 'req', required: true, dataType: 'object' },
			};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new MatchesController();

				await templateService.apiHandler({
					methodName: 'rcon',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.post(
		'/api/matches/:id/server/log/:secret',
		...fetchMiddlewares<RequestHandler>(MatchesController),
		...fetchMiddlewares<RequestHandler>(MatchesController.prototype.receiveLog),

		async function MatchesController_receiveLog(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {
				id: { in: 'path', name: 'id', required: true, dataType: 'string' },
				secret: { in: 'path', name: 'secret', required: true, dataType: 'string' },
				requestBody: { in: 'body', name: 'requestBody', required: true, dataType: 'any' },
			};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new MatchesController();

				await templateService.apiHandler({
					methodName: 'receiveLog',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.get(
		'/api/gameservers',
		authenticateMiddleware([{ bearer_token: [] }]),
		...fetchMiddlewares<RequestHandler>(GameServersController),
		...fetchMiddlewares<RequestHandler>(GameServersController.prototype.getGameServers),

		async function GameServersController_getGameServers(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new GameServersController();

				await templateService.apiHandler({
					methodName: 'getGameServers',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.post(
		'/api/gameservers',
		authenticateMiddleware([{ bearer_token: [] }]),
		...fetchMiddlewares<RequestHandler>(GameServersController),
		...fetchMiddlewares<RequestHandler>(GameServersController.prototype.createGameServer),

		async function GameServersController_createGameServer(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {
				requestBody: {
					in: 'body',
					name: 'requestBody',
					required: true,
					ref: 'IManagedGameServerCreateDto',
				},
			};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new GameServersController();

				await templateService.apiHandler({
					methodName: 'createGameServer',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.patch(
		'/api/gameservers/:ip/:port',
		authenticateMiddleware([{ bearer_token: [] }]),
		...fetchMiddlewares<RequestHandler>(GameServersController),
		...fetchMiddlewares<RequestHandler>(GameServersController.prototype.updateGameServer),

		async function GameServersController_updateGameServer(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {
				requestBody: {
					in: 'body',
					name: 'requestBody',
					required: true,
					ref: 'IManagedGameServerUpdateDto',
				},
				ip: { in: 'path', name: 'ip', required: true, dataType: 'string' },
				port: { in: 'path', name: 'port', required: true, dataType: 'double' },
			};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new GameServersController();

				await templateService.apiHandler({
					methodName: 'updateGameServer',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.delete(
		'/api/gameservers/:ip/:port',
		authenticateMiddleware([{ bearer_token: [] }]),
		...fetchMiddlewares<RequestHandler>(GameServersController),
		...fetchMiddlewares<RequestHandler>(GameServersController.prototype.deleteGameServer),

		async function GameServersController_deleteGameServer(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {
				ip: { in: 'path', name: 'ip', required: true, dataType: 'string' },
				port: { in: 'path', name: 'port', required: true, dataType: 'double' },
			};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new GameServersController();

				await templateService.apiHandler({
					methodName: 'deleteGameServer',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.post(
		'/api/gameservers/:ip/:port',
		authenticateMiddleware([{ bearer_token: [] }]),
		...fetchMiddlewares<RequestHandler>(GameServersController),
		...fetchMiddlewares<RequestHandler>(GameServersController.prototype.rcon),

		async function GameServersController_rcon(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {
				ip: { in: 'path', name: 'ip', required: true, dataType: 'string' },
				port: { in: 'path', name: 'port', required: true, dataType: 'double' },
				requestBody: {
					in: 'body',
					name: 'requestBody',
					required: true,
					dataType: 'array',
					array: { dataType: 'string' },
				},
			};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new GameServersController();

				await templateService.apiHandler({
					methodName: 'rcon',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.get(
		'/api/debug/webSockets',
		authenticateMiddleware([{ bearer_token: [] }]),
		...fetchMiddlewares<RequestHandler>(DebugController),
		...fetchMiddlewares<RequestHandler>(DebugController.prototype.getWebSocketClients),

		async function DebugController_getWebSocketClients(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new DebugController();

				await templateService.apiHandler({
					methodName: 'getWebSocketClients',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.get(
		'/api/debug',
		authenticateMiddleware([{ bearer_token: [] }]),
		...fetchMiddlewares<RequestHandler>(DebugController),
		...fetchMiddlewares<RequestHandler>(DebugController.prototype.getInfos),

		async function DebugController_getInfos(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new DebugController();

				await templateService.apiHandler({
					methodName: 'getInfos',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.get(
		'/api/config',
		...fetchMiddlewares<RequestHandler>(ConfigController),
		...fetchMiddlewares<RequestHandler>(ConfigController.prototype.getConfig),

		async function ConfigController_getConfig(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new ConfigController();

				await templateService.apiHandler({
					methodName: 'getConfig',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.get(
		'/api/presets',
		authenticateMiddleware([{ bearer_token_optional: [] }]),
		...fetchMiddlewares<RequestHandler>(PresetsController),
		...fetchMiddlewares<RequestHandler>(PresetsController.prototype.getPresets),

		async function PresetsController_getPresets(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {
				req: { in: 'request', name: 'req', required: true, dataType: 'object' },
			};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new PresetsController();

				await templateService.apiHandler({
					methodName: 'getPresets',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.post(
		'/api/presets',
		authenticateMiddleware([{ bearer_token: [] }]),
		...fetchMiddlewares<RequestHandler>(PresetsController),
		...fetchMiddlewares<RequestHandler>(PresetsController.prototype.createPreset),

		async function PresetsController_createPreset(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {
				requestBody: {
					in: 'body',
					name: 'requestBody',
					required: true,
					ref: 'IPresetCreateDto',
				},
				req: { in: 'request', name: 'req', required: true, dataType: 'object' },
			};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new PresetsController();

				await templateService.apiHandler({
					methodName: 'createPreset',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 201,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.put(
		'/api/presets',
		authenticateMiddleware([{ bearer_token: [] }]),
		...fetchMiddlewares<RequestHandler>(PresetsController),
		...fetchMiddlewares<RequestHandler>(PresetsController.prototype.updatePreset),

		async function PresetsController_updatePreset(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {
				requestBody: { in: 'body', name: 'requestBody', required: true, ref: 'IPreset' },
				req: { in: 'request', name: 'req', required: true, dataType: 'object' },
			};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new PresetsController();

				await templateService.apiHandler({
					methodName: 'updatePreset',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.delete(
		'/api/presets/:id',
		authenticateMiddleware([{ bearer_token: [] }]),
		...fetchMiddlewares<RequestHandler>(PresetsController),
		...fetchMiddlewares<RequestHandler>(PresetsController.prototype.deletePreset),

		async function PresetsController_deletePreset(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {
				id: { in: 'path', name: 'id', required: true, dataType: 'string' },
				req: { in: 'request', name: 'req', required: true, dataType: 'object' },
			};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new PresetsController();

				await templateService.apiHandler({
					methodName: 'deletePreset',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.get(
		'/api/stats/players',
		authenticateMiddleware([{ bearer_token_optional: [] }]),
		...fetchMiddlewares<RequestHandler>(StatsController),
		...fetchMiddlewares<RequestHandler>(StatsController.prototype.getPlayerStats),

		async function StatsController_getPlayerStats(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new StatsController();

				await templateService.apiHandler({
					methodName: 'getPlayerStats',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.get(
		'/api/stats/players/match',
		authenticateMiddleware([{ bearer_token_optional: [] }]),
		...fetchMiddlewares<RequestHandler>(StatsController),
		...fetchMiddlewares<RequestHandler>(StatsController.prototype.getPlayerMatchStats),

		async function StatsController_getPlayerMatchStats(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {
				matchId: { in: 'query', name: 'id', required: true, dataType: 'string' },
			};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new StatsController();

				await templateService.apiHandler({
					methodName: 'getPlayerMatchStats',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.get(
		'/api/stats/matches',
		authenticateMiddleware([{ bearer_token_optional: [] }]),
		...fetchMiddlewares<RequestHandler>(StatsController),
		...fetchMiddlewares<RequestHandler>(StatsController.prototype.getMatchStats),

		async function StatsController_getMatchStats(
			request: ExRequest,
			response: ExResponse,
			next: any
		) {
			const args: Record<string, TsoaRoute.ParameterSchema> = {};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = templateService.getValidatedArgs({ args, request, response });

				const controller = new StatsController();

				await templateService.apiHandler({
					methodName: 'getMatchStats',
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				});
			} catch (err) {
				return next(err);
			}
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

	function authenticateMiddleware(security: TsoaRoute.Security[] = []) {
		return async function runAuthenticationMiddleware(request: any, response: any, next: any) {
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
							expressAuthenticationRecasted(
								request,
								name,
								secMethod[name],
								response
							).catch(pushAndRethrow)
						);
					}

					// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

					secMethodOrPromises.push(
						Promise.all(secMethodAndPromises).then((users) => {
							return users[0];
						})
					);
				} else {
					for (const name in secMethod) {
						secMethodOrPromises.push(
							expressAuthenticationRecasted(
								request,
								name,
								secMethod[name],
								response
							).catch(pushAndRethrow)
						);
					}
				}
			}

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			try {
				request['user'] = await Promise.any(secMethodOrPromises);

				// Response was sent in middleware, abort
				if (response.writableEnded) {
					return;
				}

				next();
			} catch (err) {
				// Show most recent error as response
				const error = failedAttempts.pop();
				error.status = error.status || 401;

				// Response was sent in middleware, abort
				if (response.writableEnded) {
					return;
				}
				next(error);
			}

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
		};
	}

	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
