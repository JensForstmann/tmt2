import { getToken, setIsLoggedIn } from './auth';
import { t } from './locale';

export const API_HOST = import.meta.env.DEV
	? `${window.location.protocol}//${window.location.hostname}:8080`
	: '';

type HttpMethods = 'GET' | 'PATCH' | 'POST' | 'DELETE' | 'PUT';
export const createFetcher = (token?: string) => {
	return async <T>(method: HttpMethods, path: string, body?: any): Promise<T | undefined> => {
		const tkn = getToken() ?? token;
		const response = await fetch(`${API_HOST}${path}`, {
			method: method,
			headers: {
				'Content-Type': 'application/json; charset=UTF-8',
				...(tkn ? { Authorization: tkn } : {}),
			},
			body: body ? JSON.stringify(body) : undefined,
		});

		if (response.status === 401) {
			setIsLoggedIn(false);
			const { pathname, search, hash } = window.location;
			const encodedPath = encodeURIComponent(pathname + search + hash);
			window.location.assign(`/login?path=${encodedPath}`);
			return undefined;
		} else if (
			response.status >= 400 &&
			response.headers.get('Content-Type')?.startsWith('application/json')
		) {
			const errRespObj = await response.json();
			if (errRespObj.name === 'ValidateError' && errRespObj.fields) {
				const errorStrings = [] as string[];
				Object.entries(errRespObj.fields as Record<string, { message: string }>).forEach(
					([key, { message }]) => errorStrings.push(key + ': ' + message)
				);
				const errorString = errorStrings.join(', ');
				console.error('Fetcher error:', errorString);
				throw (
					(errRespObj.fields.length === 1 ? t('Error') : t('Errors')) +
					': ' +
					errorStrings
				);
			} else {
				throw JSON.stringify(errRespObj);
			}
		} else if (response.status >= 400) {
			const text = await response.text();
			if (text) {
				throw text;
			} else {
				throw response.status.toLocaleString();
			}
		} else if (response.headers.get('Content-Type')?.startsWith('application/json')) {
			return response.json();
		} else {
			return undefined;
		}
	};
};
