import { useNavigate } from '@solidjs/router';
import { createSignal } from 'solid-js';
import { t } from './locale';

const API_HOST = import.meta.env.DEV
	? `${window.location.protocol}//${window.location.hostname}:8080`
	: '';

export const getToken = () => localStorage.getItem('token');

const isTokenOk = async (token?: string): Promise<boolean> => {
	const tkn = token ?? getToken();
	const response = await fetch(`${API_HOST}/api/login`, {
		method: 'POST',
		headers: {
			...(tkn ? { Authorization: tkn } : {}),
		},
	});
	if (response.status >= 200 && response.status <= 299) {
		return true;
	}
	return false;
};

const [isLoggedIn, setIsLoggedIn] = createSignal<boolean>();
export { isLoggedIn };
isTokenOk().then((ok) => setIsLoggedIn(ok));

export const login = async (token: string): Promise<boolean> => {
	if (await isTokenOk(token)) {
		localStorage.setItem('token', token);
		setIsLoggedIn(true);
		return true;
	}
	return false;
};

export const logout = () => {
	localStorage.removeItem('token');
	setIsLoggedIn(false);
	useNavigate()('/');
};

type HttpMethods = 'GET' | 'PATCH' | 'POST' | 'DELETE' | 'PUT';
export const createFetcher = (token?: string) => {
	return async <T>(
		method: HttpMethods,
		path: string,
		body?: any,
		init?: RequestInit
	): Promise<T | undefined> => {
		const tkn = getToken() ?? token;
		const response = await fetch(`${API_HOST}${path}`, {
			...init,
			method: method,
			headers: {
				'Content-Type': 'application/json; charset=UTF-8',
				...(tkn ? { Authorization: tkn } : {}),
				...init?.headers,
			},
			body: body ? JSON.stringify(body) : undefined,
		});

		const status = response.status;
		if (status === 401) {
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
