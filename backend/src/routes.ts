/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import {
	Controller,
	ValidationService,
	FieldErrors,
	ValidateError,
	TsoaRoute,
	HttpStatusCodeLiteral,
	TsoaResponse,
} from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MatchesController } from './matchesController';
import * as express from 'express';

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
	IMatchInitTeamData: {
		dataType: 'refObject',
		properties: {
			remoteId: { dataType: 'string' },
			name: { dataType: 'string', required: true },
			advantage: { dataType: 'double' },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	'EMapMode.FIXED': {
		dataType: 'refEnum',
		enums: ['FIXED'],
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IFixedMap: {
		dataType: 'refObject',
		properties: {
			mode: { ref: 'EMapMode.FIXED', required: true },
			fixed: { dataType: 'string', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	'EMapMode.BAN': {
		dataType: 'refEnum',
		enums: ['BAN'],
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	'EMapMode.PICK': {
		dataType: 'refEnum',
		enums: ['PICK'],
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	EWho: {
		dataType: 'refEnum',
		enums: ['TEAM_A', 'TEAM_B', 'TEAM_X', 'TEAM_Y'],
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IBanOrPickMap: {
		dataType: 'refObject',
		properties: {
			mode: {
				dataType: 'union',
				subSchemas: [{ ref: 'EMapMode.BAN' }, { ref: 'EMapMode.PICK' }],
				required: true,
			},
			who: { ref: 'EWho', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	'EMapMode.RANDOM_BAN': {
		dataType: 'refEnum',
		enums: ['RANDOM_BAN'],
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	'EMapMode.RANDOM_PICK': {
		dataType: 'refEnum',
		enums: ['RANDOM_PICK'],
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	'EMapMode.AGREE': {
		dataType: 'refEnum',
		enums: ['AGREE'],
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IAgreeOrRandomMap: {
		dataType: 'refObject',
		properties: {
			mode: {
				dataType: 'union',
				subSchemas: [
					{ ref: 'EMapMode.RANDOM_BAN' },
					{ ref: 'EMapMode.RANDOM_PICK' },
					{ ref: 'EMapMode.AGREE' },
				],
				required: true,
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	'ESideMode.FIXED': {
		dataType: 'refEnum',
		enums: ['FIXED'],
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ESideFixed: {
		dataType: 'refEnum',
		enums: [
			'TEAM_A_CT',
			'TEAM_A_T',
			'TEAM_B_CT',
			'TEAM_B_T',
			'TEAM_X_CT',
			'TEAM_X_T',
			'TEAM_Y_CT',
			'TEAM_Y_T',
		],
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IFixedSide: {
		dataType: 'refObject',
		properties: {
			mode: { ref: 'ESideMode.FIXED', required: true },
			fixed: { ref: 'ESideFixed', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	'ESideMode.PICK': {
		dataType: 'refEnum',
		enums: ['PICK'],
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IPickSide: {
		dataType: 'refObject',
		properties: {
			mode: { ref: 'ESideMode.PICK', required: true },
			who: { ref: 'EWho', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	'ESideMode.RANDOM': {
		dataType: 'refEnum',
		enums: ['RANDOM'],
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	'ESideMode.KNIFE': {
		dataType: 'refEnum',
		enums: ['KNIFE'],
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IRandomOrKnifeSide: {
		dataType: 'refObject',
		properties: {
			mode: {
				dataType: 'union',
				subSchemas: [{ ref: 'ESideMode.RANDOM' }, { ref: 'ESideMode.KNIFE' }],
				required: true,
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IElectionStep: {
		dataType: 'refObject',
		properties: {
			map: {
				dataType: 'union',
				subSchemas: [
					{ ref: 'IFixedMap' },
					{ ref: 'IBanOrPickMap' },
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
	ISerializedGameServer: {
		dataType: 'refObject',
		properties: {
			ip: { dataType: 'string', required: true },
			port: { dataType: 'double', required: true },
			rconPassword: { dataType: 'string', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	EMatchEndAction: {
		dataType: 'refEnum',
		enums: ['KICK_ALL', 'QUIT_SERVER', 'NONE'],
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ISerializedMatchInitData: {
		dataType: 'refObject',
		properties: {
			remoteId: { dataType: 'string' },
			mapPool: {
				dataType: 'array',
				array: { dataType: 'string' },
				required: true,
				validators: { minItems: { value: 1 } },
			},
			teamA: { ref: 'IMatchInitTeamData', required: true },
			teamB: { ref: 'IMatchInitTeamData', required: true },
			electionSteps: {
				dataType: 'array',
				array: { ref: 'IElectionStep' },
				required: true,
				validators: { minItems: { value: 1 } },
			},
			gameServer: { ref: 'ISerializedGameServer', required: true },
			webhookUrl: { dataType: 'string' },
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
			matchEndAction: { ref: 'EMatchEndAction' },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	EMatchSate: {
		dataType: 'refEnum',
		enums: ['ELECTION', 'MATCH_MAP', 'FINISHED'],
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ElectionState: {
		dataType: 'refEnum',
		enums: ['NOT_STARTED', 'IN_PROGRESS', 'FINISHED'],
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	EStep: {
		dataType: 'refEnum',
		enums: ['MAP', 'SIDE'],
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ISerializedElection: {
		dataType: 'refObject',
		properties: {
			state: { ref: 'ElectionState', required: true },
			currentStep: { dataType: 'double', required: true },
			currentElectionStep: { ref: 'IElectionStep', required: true },
			currentSubStep: { ref: 'EStep', required: true },
			teamX: { dataType: 'string' },
			teamY: { dataType: 'string' },
			remainingMaps: { dataType: 'array', array: { dataType: 'string' }, required: true },
			map: { dataType: 'string', required: true },
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
	ETeamSides: {
		dataType: 'refEnum',
		enums: ['CT', 'T'],
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ISerializedPlayer: {
		dataType: 'refObject',
		properties: {
			steamId64: { dataType: 'string', required: true },
			name: { dataType: 'string', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ISerializedTeam: {
		dataType: 'refObject',
		properties: {
			id: { dataType: 'string', required: true },
			remoteId: { dataType: 'string' },
			currentSide: { ref: 'ETeamSides', required: true },
			isTeamA: { dataType: 'boolean', required: true },
			isTeamB: { dataType: 'boolean', required: true },
			players: { dataType: 'array', array: { ref: 'ISerializedPlayer' }, required: true },
			name: { dataType: 'string', required: true },
			advantage: { dataType: 'double', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	EMatchMapSate: {
		dataType: 'refEnum',
		enums: [
			'PENDING',
			'MAP_CHANGE',
			'WARMUP',
			'KNIFE',
			'AFTER_KNIFE',
			'IN_PROGRESS',
			'PAUSED',
			'FINISHED',
		],
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ISerializedMatchMap: {
		dataType: 'refObject',
		properties: {
			name: { dataType: 'string', required: true },
			knifeForSide: { dataType: 'boolean', required: true },
			startAsCtTeam: { dataType: 'string', required: true },
			startAsTTeam: { dataType: 'string', required: true },
			state: { ref: 'EMatchMapSate', required: true },
			knifeWinner: { dataType: 'string' },
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
	ISerializedMatch: {
		dataType: 'refObject',
		properties: {
			id: { dataType: 'string', required: true },
			matchInitData: { ref: 'ISerializedMatchInitData', required: true },
			state: { ref: 'EMatchSate', required: true },
			election: { ref: 'ISerializedElection', required: true },
			teamA: { ref: 'ISerializedTeam', required: true },
			teamB: { ref: 'ISerializedTeam', required: true },
			gameServer: { ref: 'ISerializedGameServer', required: true },
			logSecret: { dataType: 'string', required: true },
			parseIncomingLogs: { dataType: 'boolean', required: true },
			logCounter: { dataType: 'double', required: true },
			logLineCounter: { dataType: 'double', required: true },
			matchMaps: { dataType: 'array', array: { ref: 'ISerializedMatchMap' }, required: true },
			currentMap: { dataType: 'double', required: true },
			canClinch: { dataType: 'boolean', required: true },
			webhookUrl: { dataType: 'string' },
			matchEndAction: { ref: 'EMatchEndAction', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IMatchChange: {
		dataType: 'refObject',
		properties: {
			state: { ref: 'EMatchSate' },
			gameServer: { ref: 'ISerializedGameServer' },
			webhookUrl: {
				dataType: 'union',
				subSchemas: [{ dataType: 'string' }, { dataType: 'enum', enums: [null] }],
			},
			logSecret: { dataType: 'string' },
			parseIncomingLogs: { dataType: 'boolean' },
			currentMap: { dataType: 'double' },
			canClinch: { dataType: 'boolean' },
			matchEndAction: { ref: 'EMatchEndAction' },
		},
		additionalProperties: false,
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
	app.post('/api/matches', function (request: any, response: any, next: any) {
		const args = {
			requestBody: {
				in: 'body',
				name: 'requestBody',
				required: true,
				ref: 'ISerializedMatchInitData',
			},
		};

		// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

		let validatedArgs: any[] = [];
		try {
			validatedArgs = getValidatedArgs(args, request, response);
		} catch (err) {
			return next(err);
		}

		const controller = new MatchesController();

		const promise = controller.createMatch.apply(controller, validatedArgs as any);
		promiseHandler(controller, promise, response, undefined, next);
	});
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.get('/api/matches/:id', function (request: any, response: any, next: any) {
		const args = {
			id: { in: 'path', name: 'id', required: true, dataType: 'string' },
		};

		// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

		let validatedArgs: any[] = [];
		try {
			validatedArgs = getValidatedArgs(args, request, response);
		} catch (err) {
			return next(err);
		}

		const controller = new MatchesController();

		const promise = controller.getMatch.apply(controller, validatedArgs as any);
		promiseHandler(controller, promise, response, undefined, next);
	});
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.get(
		'/api/matches/:id/server/round_backups',
		function (request: any, response: any, next: any) {
			const args = {
				id: { in: 'path', name: 'id', required: true, dataType: 'string' },
				count: { in: 'query', name: 'count', dataType: 'double' },
			};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = getValidatedArgs(args, request, response);
			} catch (err) {
				return next(err);
			}

			const controller = new MatchesController();

			const promise = controller.getRoundBackups.apply(controller, validatedArgs as any);
			promiseHandler(controller, promise, response, undefined, next);
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.post(
		'/api/matches/:id/server/round_backups/:file',
		function (request: any, response: any, next: any) {
			const args = {
				id: { in: 'path', name: 'id', required: true, dataType: 'string' },
				file: { in: 'path', name: 'file', required: true, dataType: 'string' },
			};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = getValidatedArgs(args, request, response);
			} catch (err) {
				return next(err);
			}

			const controller = new MatchesController();

			const promise = controller.loadRoundBackup.apply(controller, validatedArgs as any);
			promiseHandler(controller, promise, response, undefined, next);
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.post('/api/matches/:id', function (request: any, response: any, next: any) {
		const args = {
			id: { in: 'path', name: 'id', required: true, dataType: 'string' },
			requestBody: { in: 'body', name: 'requestBody', required: true, ref: 'IMatchChange' },
		};

		// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

		let validatedArgs: any[] = [];
		try {
			validatedArgs = getValidatedArgs(args, request, response);
		} catch (err) {
			return next(err);
		}

		const controller = new MatchesController();

		const promise = controller.changeMatch.apply(controller, validatedArgs as any);
		promiseHandler(controller, promise, response, undefined, next);
	});
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.delete('/api/matches/:id', function (request: any, response: any, next: any) {
		const args = {
			id: { in: 'path', name: 'id', required: true, dataType: 'string' },
		};

		// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

		let validatedArgs: any[] = [];
		try {
			validatedArgs = getValidatedArgs(args, request, response);
		} catch (err) {
			return next(err);
		}

		const controller = new MatchesController();

		const promise = controller.deleteMatch.apply(controller, validatedArgs as any);
		promiseHandler(controller, promise, response, undefined, next);
	});
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.get('/api/matches', function (request: any, response: any, next: any) {
		const args = {};

		// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

		let validatedArgs: any[] = [];
		try {
			validatedArgs = getValidatedArgs(args, request, response);
		} catch (err) {
			return next(err);
		}

		const controller = new MatchesController();

		const promise = controller.getAllMatches.apply(controller, validatedArgs as any);
		promiseHandler(controller, promise, response, undefined, next);
	});
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.post(
		'/api/matches/:id/server/log/:secret',
		function (request: any, response: any, next: any) {
			const args = {
				id: { in: 'path', name: 'id', required: true, dataType: 'string' },
				secret: { in: 'path', name: 'secret', required: true, dataType: 'string' },
				requestBody: { in: 'body', name: 'requestBody', required: true, dataType: 'any' },
			};

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = [];
			try {
				validatedArgs = getValidatedArgs(args, request, response);
			} catch (err) {
				return next(err);
			}

			const controller = new MatchesController();

			const promise = controller.receiveLog.apply(controller, validatedArgs as any);
			promiseHandler(controller, promise, response, undefined, next);
		}
	);
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

	function isController(object: any): object is Controller {
		return 'getHeaders' in object && 'getStatus' in object && 'setStatus' in object;
	}

	function promiseHandler(
		controllerObj: any,
		promise: any,
		response: any,
		successStatus: any,
		next: any
	) {
		return Promise.resolve(promise)
			.then((data: any) => {
				let statusCode = successStatus;
				let headers;
				if (isController(controllerObj)) {
					headers = controllerObj.getHeaders();
					statusCode = controllerObj.getStatus();
				}

				// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

				returnHandler(response, statusCode, data, headers);
			})
			.catch((error: any) => next(error));
	}

	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

	function returnHandler(response: any, statusCode?: number, data?: any, headers: any = {}) {
		Object.keys(headers).forEach((name: string) => {
			response.set(name, headers[name]);
		});
		if (
			data &&
			typeof data.pipe === 'function' &&
			data.readable &&
			typeof data._read === 'function'
		) {
			data.pipe(response);
		} else if (data !== null && data !== undefined) {
			response.status(statusCode || 200).json(data);
		} else {
			response.status(statusCode || 204).end();
		}
	}

	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

	function responder(response: any): TsoaResponse<HttpStatusCodeLiteral, unknown> {
		return function (status, data, headers) {
			returnHandler(response, status, data, headers);
		};
	}

	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

	function getValidatedArgs(args: any, request: any, response: any): any[] {
		const fieldErrors: FieldErrors = {};
		const values = Object.keys(args).map((key) => {
			const name = args[key].name;
			switch (args[key].in) {
				case 'request':
					return request;
				case 'query':
					return validationService.ValidateParam(
						args[key],
						request.query[name],
						name,
						fieldErrors,
						undefined,
						{ noImplicitAdditionalProperties: 'throw-on-extras' }
					);
				case 'path':
					return validationService.ValidateParam(
						args[key],
						request.params[name],
						name,
						fieldErrors,
						undefined,
						{ noImplicitAdditionalProperties: 'throw-on-extras' }
					);
				case 'header':
					return validationService.ValidateParam(
						args[key],
						request.header(name),
						name,
						fieldErrors,
						undefined,
						{ noImplicitAdditionalProperties: 'throw-on-extras' }
					);
				case 'body':
					return validationService.ValidateParam(
						args[key],
						request.body,
						name,
						fieldErrors,
						undefined,
						{ noImplicitAdditionalProperties: 'throw-on-extras' }
					);
				case 'body-prop':
					return validationService.ValidateParam(
						args[key],
						request.body[name],
						name,
						fieldErrors,
						'body.',
						{ noImplicitAdditionalProperties: 'throw-on-extras' }
					);
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
