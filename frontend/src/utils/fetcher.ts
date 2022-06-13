import { useLocation, useNavigate } from 'solid-app-router';
import { createResource } from 'solid-js';
import { IMatch, IMatchResponse, IMatchUpdateDto } from '../../../common';
import { sleep } from './sleep';

const API_HOST = import.meta.env.DEV ? 'http://localhost:8080' : '';

export const getToken = () => localStorage.getItem('token');

export const login = async (token: string): Promise<boolean> => {
	const response = await fetch(`${API_HOST}/api/login`, {
		method: 'POST',
		headers: {
			Authorization: token,
		},
	});
	if (response.status >= 200 && response.status <= 299) {
		localStorage.setItem('token', token);
		return true;
	}
	return false;
};

export const logout = () => {
	localStorage.removeItem('token');
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
				'Content-type': 'application/json; charset=UTF-8',
				...(tkn ? { Authorization: tkn } : {}),
				...init?.headers,
			},
			body: body ? JSON.stringify(body) : undefined,
		});

		const status = response.status;
		if (status === 401) {
			const { pathname, search, hash } = window.location;
			const encodedPath = encodeURIComponent(pathname + search + hash);
			// useNavigate()(`/login?path=${encodedPath}`);
			window.location.assign(`/login?path=${encodedPath}`);
			return;
		} else if (status === 204) {
			return;
		} else {
			return response.json();
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
