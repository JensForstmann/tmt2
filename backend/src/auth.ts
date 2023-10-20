import { Request } from 'express';
import { generate as shortUuid } from 'short-uuid';
import * as MatchService from './matchService';
import * as Storage from './storage';

const tokens: Map<string, ITokenContent> = new Map();

export interface IAuthResponse {
	type: 'GLOBAL' | 'MATCH';
	comment?: string;
}

export type IAuthResponseOptional =
	| IAuthResponse
	| {
			type: 'UNAUTHORIZED';
	  };

interface ITokenContent {
	comment?: string;
}

interface IAccessTokens {
	[token: string]: ITokenContent;
}

export const setup = async () => {
	const randomKey = shortUuid();
	const firstToken: IAccessTokens = {
		[randomKey]: {
			comment: 'first auto generated access token',
		},
	};
	const tokensFromStorage = await Storage.read('access_tokens.json', firstToken);
	const tokenComments: string[] = [];
	Object.entries(tokensFromStorage).forEach(([token, content]) => {
		tokens.set(token, content);
		if (content.comment) {
			tokenComments.push(content.comment);
		}
	});
	if (tokens.has(randomKey)) {
		console.info(`First auto generated access token: ${randomKey}`);
	} else {
		console.info(
			`Access tokens: ${tokens.size} in total, ${
				tokens.size - tokenComments.length
			} without comment, ${tokenComments.length} with comment: ${tokenComments.join(', ')}`
		);
	}
};

export const getGlobalToken = (token?: string) => {
	if (!token) {
		return;
	}
	if (token.toLowerCase().startsWith('bearer ')) {
		token = token.substring(7);
	}
	return tokens.get(token);
};

export const isValidMatchToken = async (token?: string, matchId?: string) => {
	if (!token || !matchId) {
		return;
	}
	if (token.toLowerCase().startsWith('bearer ')) {
		token = token.substring(7);
	}

	const match = MatchService.get(matchId);
	if (match) {
		return match.data.tmtSecret === token;
	}

	const matchFromStorage = await MatchService.getFromStorage(matchId);
	if (matchFromStorage) {
		return matchFromStorage.tmtSecret === token;
	}

	return false;
};

export const expressAuthentication = async (
	req: Request,
	securityName: string,
	scopes?: string[]
): Promise<IAuthResponse | IAuthResponseOptional> => {
	if (securityName === 'bearer_token' || securityName === 'bearer_token_optional') {
		const bearerToken = req.get('Authorization');
		const result = await isAuthorized(bearerToken, req.params['id']);
		if (result) {
			return Promise.resolve(result);
		}
	}

	if (securityName === 'bearer_token_optional') {
		return Promise.resolve({
			type: 'UNAUTHORIZED',
		});
	}

	return Promise.reject({});
};

export const isAuthorized = async (
	token?: string,
	matchId?: string
): Promise<IAuthResponse | false> => {
	const t = getGlobalToken(token);
	if (t) {
		return {
			type: 'GLOBAL',
			comment: t.comment,
		};
	}

	if (await isValidMatchToken(token, matchId)) {
		return {
			type: 'MATCH',
		};
	}

	return false;
};
