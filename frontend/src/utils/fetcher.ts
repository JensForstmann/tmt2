import { useLocation, useNavigate } from 'solid-app-router';
import { createResource } from 'solid-js';
import { IMatch, IMatchUpdateDto } from '../../../common';
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

// export const fetcher = async (path: string, init?: RequestInit): Promise<any> => {
// 	const token = getToken();
// 	const response = await fetch(`${API_HOST}${path}`, {
// 		...init,
// 		headers: {
// 			...(token ? { Authorization: token } : {}),
// 			...init?.headers,
// 		},
// 	});
// 	if (response.status === 401) {
// 		const {pathname, search, hash} = useLocation();
// 		const encodedPath = encodeURIComponent(pathname + search + hash);
// 		useNavigate()(`/login?path=${encodedPath}`);
// 	}
// 	return response.json();
// };

type HttpMethods = 'GET' | 'PATCH' | 'POST' | 'DELETE';
export const createFetcher =
	(token?: string) =>
	async (method: HttpMethods, path: string, body?: any, init?: RequestInit) => {
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
		if (response.status === 401) {
			const { pathname, search, hash } = window.location;
			const encodedPath = encodeURIComponent(pathname + search + hash);
			// useNavigate()(`/login?path=${encodedPath}`);
			window.location.assign(`/login?path=${encodedPath}`);
		}
		return response.json();
	};

// export const patcher = async (path: string, body: any): Promise<any> => {
// 	return fetcher(path, {
// 		method: 'PATCH',
// 		headers: {
// 			'Content-type': 'application/json; charset=UTF-8',
// 		},
// 		body: JSON.stringify(body),
// 	});
// };

// export const poster = async (path: string, body: any): Promise<any> => {
// 	return fetcher(path, {
// 		method: 'POST',
// 		headers: {
// 			'Content-type': 'application/json; charset=UTF-8',
// 		},
// 		body: JSON.stringify(body),
// 	});
// };

export const useMatch = (id: string, tmtSecret?: string) => {
	const fetcher = createFetcher(tmtSecret);
	const [resource, { mutate, refetch }] = createResource(
		() => fetcher('GET', `/api/matches/${id}`) as Promise<IMatch>
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
