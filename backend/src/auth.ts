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

const getGlobalToken = (token?: string) => {
	if (!token) {
		return;
	}
	if (token.toLowerCase().startsWith('bearer ')) {
		token = token.substring(7);
	}
	return tokens.get(token);
};

const isValidMatchToken = (matchId: string, token?: string) => {
	if (!token) {
		return;
	}
	if (token.toLowerCase().startsWith('bearer ')) {
		token = token.substring(7);
	}
	const match = MatchService.get(matchId);
	if (!match) {
		return false;
	}
	return match?.data.tmtSecret === token;
};

export const expressAuthentication = (
	req: Request,
	securityName: string,
	scopes?: string[]
): Promise<IAuthResponse> => {
	if (securityName === 'bearer_token') {
		const bearerToken = req.get('Authorization');
		const token = getGlobalToken(bearerToken);

		if (token) {
			return Promise.resolve({
				type: 'GLOBAL',
				comment: token.comment,
			});
		}

		if (isValidMatchToken(req.params.id, bearerToken)) {
			return Promise.resolve({
				type: 'MATCH',
			});
		}
	}

	return Promise.reject({});
};
