import { createResource } from 'solid-js';
import { IMatch, IMatchUpdateDto } from '../../../common';
import { sleep } from './sleep';

const API_HOST = import.meta.env.DEV ? 'http://localhost:8080' : '';

export const fetcher = async <T>(path: string, host = API_HOST): Promise<T> => {
	return fetch(`${host}${path}`, {
		headers: {
			Authorization: '2Mgog6ATqAs495NtUQUsph',
		},
	}).then((response) => response.json());
};

export const fetchResource = <T>(path: string, host = API_HOST) => {
	return createResource(() => fetcher<T>(path, host));
};

export const fetchResource2 = <T>(source: any, path: any) => {
	return createResource(source, (x) => fetcher<T>(x));
};

export const patcher = async (path: string, body: any, host = API_HOST) => {
	return fetch(`${host}${path}`, {
		method: 'PATCH',
		headers: {
			Authorization: '2Mgog6ATqAs495NtUQUsph',
			'Content-type': 'application/json; charset=UTF-8',
		},
		body: JSON.stringify(body),
	}).then((response) => response.status >= 200 && response.status <= 299);
};

export const useMatch = (id: string) => {
	const [resource, { mutate, refetch }] = createResource(() =>
		fetcher<IMatch>(`/api/matches/${id}`)
	);
	return {
		resource,
		mutate,
		refetch,
		patcher: async (body: IMatchUpdateDto) => {
			await sleep(500);
			const successful2 = Math.random() > 0.5;
			if (successful2) {
				const successful = await patcher(`/api/matches/${id}`, body);
				// mutate({
				//     ...resource(),
				//     ...body,
				// } as IMatch);
				mutate(await fetcher<IMatch>(`/api/matches/${id}`));
				return successful;
			}
			return successful2;
		},
	};
};
