import { Request } from 'express';
import { generate as shortUuid } from 'short-uuid';
import * as MatchService from './matchService';
import * as Storage from './storage';

const tokens: Map<string, ITokenContent> = new Map();

export interface IAuthResponse {
	type: 'GLOBAL' | 'MATCH';
	comment?: string;
}

interface ITokenContent {
	comment?: string;
}

interface IAccessTokens {
	[token: string]: ITokenContent;
}

export const setup = async () => {
	const firstToken: IAccessTokens = {
		[shortUuid()]: {
			comment: 'first auto generated token',
		},
	};
	const tokensFromStorage = await Storage.read('access_tokens.json', firstToken);
	Object.entries(tokensFromStorage).forEach(([token, content]) => {
		tokens.set(token, content);
	});
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
): Promise<IAuthResponse> => {
	if (securityName === 'bearer_token') {
		const bearerToken = req.get('Authorization');
		const result = await isAuthorized(bearerToken, req.params['id']);
		if (result) {
			return Promise.resolve(result);
		}
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
