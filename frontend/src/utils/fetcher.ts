import { useNavigate } from 'solid-app-router';
import { createResource, createSignal } from 'solid-js';
import { IMatchResponse, IMatchUpdateDto } from '../../../common';
import { sleep } from './sleep';

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

type HttpMethods = 'GET' | 'PATCH' | 'POST' | 'DELETE';
export const createFetcher = (token?: string) => {
	return async (method: HttpMethods, path: string, body?: any, init?: RequestInit) => {
		const tkn = token ?? getToken();
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
			return;
		} else if (response.headers.get('Content-Type')?.startsWith('application/json')) {
			return response.json();
		} else {
			return;
		}
	};
};

export const useMatch = (id: string, tmtSecret?: string) => {
	const fetcher = createFetcher(tmtSecret);
	const [resource, { mutate, refetch }] = createResource(
		() => fetcher('GET', `/api/matches/${id}`) as Promise<IMatchResponse>
	);
	return {
		fetcher,
		resource,
		mutate,
		refetch,
		patcher: async (body: IMatchUpdateDto) => {
			await sleep(500);
			const successful2 = Math.random() > 0.5;
			if (successful2) {
				const successful = await fetcher('PATCH', `/api/matches/${id}`, body);
				// mutate({
				//     ...resource(),
				//     ...body,
				// } as IMatch);
				mutate(await fetcher('GET', `/api/matches/${id}`));
				return successful;
			}
			return successful2;
		},
	};
};
