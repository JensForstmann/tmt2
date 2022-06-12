import { useLocation, useNavigate, useSearchParams } from 'solid-app-router';
import { Component, createSignal } from 'solid-js';
import { getToken, login } from '../utils/fetcher';
import { t } from '../utils/locale';

export const LoginPage: Component = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [token, setToken] = createSignal<string>(getToken() ?? '');
	const [msg, setMsg] = createSignal('');

	const submit = async () => {
		if (await login(token())) {
			navigate(searchParams.path ? decodeURIComponent(searchParams.path) : '/');
		} else {
			setMsg(t('Login failed'));
		}
	};

	return (
		<>
			<input
				type="password"
				value={token()}
				onInput={(e) => setToken(e.currentTarget.value)}
				onKeyDown={(e) => {
					if (e.key === 'Enter') {
						submit();
					}
				}}
			/>
			<input type="button" value={t('Login')} onClick={() => submit()} />
			<p>{msg()}</p>
		</>
	);
};
