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
} from 'tsoa';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MatchesController } from './match/matchesController';
import * as express from 'express';

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
	ITeam: {
		dataType: 'refObject',
		properties: {
			remoteId: { dataType: 'string' },
			name: { dataType: 'string', required: true },
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
		enums: ['TEAM_1', 'TEAM_2', 'TEAM_X', 'TEAM_Y'],
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
			'TEAM_1_CT',
			'TEAM_1_T',
			'TEAM_2_CT',
			'TEAM_2_T',
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
	IMatchInitData: {
		dataType: 'refObject',
		properties: {
			remoteId: { dataType: 'string' },
			mapPool: {
				dataType: 'array',
				array: { dataType: 'string' },
				required: true,
				validators: { minItems: { value: 1 } },
			},
			team1: { ref: 'ITeam', required: true },
			team2: { ref: 'ITeam', required: true },
			electionSteps: {
				dataType: 'array',
				array: { ref: 'IElectionStep' },
				required: true,
				validators: { minItems: { value: 1 } },
			},
			gameServer: {
				dataType: 'nestedObjectLiteral',
				nestedProperties: {
					rconPassword: { dataType: 'string', required: true },
					port: { dataType: 'double', required: true },
					ip: { dataType: 'string', required: true },
				},
				required: true,
			},
			webhookUrl: { dataType: 'string' },
			rcon: {
				dataType: 'nestedObjectLiteral',
				nestedProperties: {
					end: { dataType: 'array', array: { dataType: 'string' } },
					match: { dataType: 'array', array: { dataType: 'string' } },
					knife: { dataType: 'array', array: { dataType: 'string' } },
					init: { dataType: 'array', array: { dataType: 'string' } },
				},
			},
			canClinch: { dataType: 'boolean' },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IMatch: {
		dataType: 'refObject',
		properties: {
			matchInitData: { ref: 'IMatchInitData', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	EMatchSate: {
		dataType: 'refEnum',
		enums: ['ELECTION', 'MATCH_MAP', 'FINISHED'],
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IMatchChange: {
		dataType: 'refObject',
		properties: {
			state: { ref: 'EMatchSate' },
			currentMap: { dataType: 'double' },
			canClinch: { dataType: 'boolean' },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const validationService = new ValidationService(models);

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

export function RegisterRoutes(app: express.Express) {
	// ###########################################################################################################
	//  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
	//      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
	// ###########################################################################################################
	app.post('/api/matches', function (request: any, response: any, next: any) {
		const args = {
			requestBody: { in: 'body', name: 'requestBody', required: true, ref: 'IMatchInitData' },
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
		promiseHandler(controller, promise, response, next);
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
		promiseHandler(controller, promise, response, next);
	});
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.get('/api/matches/:id/server/round_backups', function (
		request: any,
		response: any,
		next: any
	) {
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
		promiseHandler(controller, promise, response, next);
	});
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.post('/api/matches/:id/server/round_backups/:file', function (
		request: any,
		response: any,
		next: any
	) {
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
		promiseHandler(controller, promise, response, next);
	});
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
		promiseHandler(controller, promise, response, next);
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
		promiseHandler(controller, promise, response, next);
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
		promiseHandler(controller, promise, response, next);
	});
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	app.post('/api/matches/:id/server/log/:secret', function (
		request: any,
		response: any,
		next: any
	) {
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
		promiseHandler(controller, promise, response, next);
	});
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

	function isController(object: any): object is Controller {
		return 'getHeaders' in object && 'getStatus' in object && 'setStatus' in object;
	}

	function promiseHandler(controllerObj: any, promise: any, response: any, next: any) {
		return Promise.resolve(promise)
			.then((data: any) => {
				let statusCode;
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
		} else if (data || data === false) {
			// === false allows boolean result
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
