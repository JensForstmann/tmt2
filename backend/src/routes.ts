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
	STeam: {
		dataType: 'refObject',
		properties: {
			id: { dataType: 'string', required: true },
			name: { dataType: 'string', required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	EWho: {
		dataType: 'refEnum',
		enums: ['TEAM_1', 'TEAM_2', 'TEAM_X', 'TEAM_Y'],
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
	ElectionStep: {
		dataType: 'refObject',
		properties: {
			map: {
				dataType: 'union',
				subSchemas: [
					{
						dataType: 'nestedObjectLiteral',
						nestedProperties: {
							fixed: { dataType: 'string', required: true },
							mode: { dataType: 'enum', enums: ['FIXED'], required: true },
						},
					},
					{
						dataType: 'nestedObjectLiteral',
						nestedProperties: {
							who: { ref: 'EWho', required: true },
							mode: {
								dataType: 'union',
								subSchemas: [
									{ dataType: 'enum', enums: ['BAN'] },
									{ dataType: 'enum', enums: ['RANDOM_BAN'] },
									{ dataType: 'enum', enums: ['PICK'] },
									{ dataType: 'enum', enums: ['RANDOM_PICK'] },
									{ dataType: 'enum', enums: ['AGREE'] },
								],
								required: true,
							},
						},
					},
				],
				required: true,
			},
			side: {
				dataType: 'union',
				subSchemas: [
					{
						dataType: 'nestedObjectLiteral',
						nestedProperties: {
							fixed: { ref: 'ESideFixed', required: true },
							mode: { dataType: 'enum', enums: ['FIXED'], required: true },
						},
					},
					{
						dataType: 'nestedObjectLiteral',
						nestedProperties: {
							who: { ref: 'EWho', required: true },
							mode: {
								dataType: 'union',
								subSchemas: [
									{ dataType: 'enum', enums: ['PICK'] },
									{ dataType: 'enum', enums: ['RANDOM'] },
									{ dataType: 'enum', enums: ['KNIFE'] },
								],
								required: true,
							},
						},
					},
				],
				required: true,
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	MatchInitData: {
		dataType: 'refObject',
		properties: {
			id: { dataType: 'string', required: true },
			mapPool: {
				dataType: 'array',
				array: { dataType: 'string' },
				required: true,
				validators: { minItems: { value: 1 } },
			},
			team1: { ref: 'STeam', required: true },
			team2: { ref: 'STeam', required: true },
			electionSteps: {
				dataType: 'array',
				array: { ref: 'ElectionStep' },
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
			rconInit: { dataType: 'array', array: { dataType: 'string' } },
			rconConfig: { dataType: 'array', array: { dataType: 'string' } },
			rconEnd: { dataType: 'array', array: { dataType: 'string' } },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IMatch: {
		dataType: 'refObject',
		properties: {
			matchInitData: { ref: 'MatchInitData', required: true },
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
			requestBody: { in: 'body', name: 'requestBody', required: true, ref: 'MatchInitData' },
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

		const promise = controller.getMatches.apply(controller, validatedArgs as any);
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
