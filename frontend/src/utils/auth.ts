import { useNavigate } from '@solidjs/router';
import { createSignal } from 'solid-js';
import { API_HOST } from './fetcher';

export const [isLoggedIn, setIsLoggedIn] = createSignal<boolean>();

export const getToken = () => (isLoggedIn() ? localStorage.getItem('token') : null);

const isTokenOk = async (token: string | null): Promise<boolean> => {
	if (token === null) {
		return false;
	}
	const res = await fetch(`${API_HOST}/api/login`, {
		method: 'POST',
		headers: {
			Authorization: token,
		},
	});
	return res.status >= 200 && res.status <= 299;
};

setIsLoggedIn(await isTokenOk(localStorage.getItem('token')));

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
