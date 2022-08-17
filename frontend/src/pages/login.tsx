import { useNavigate, useSearchParams } from '@solidjs/router';
import { Component, createSignal } from 'solid-js';
import { TextInput } from '../components/TextInput';
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
			<TextInput
				type="password"
				value={token()}
				onInput={(e) => setToken(e.currentTarget.value)}
				onKeyDown={(e) => {
					if (e.key === 'Enter') {
						submit();
					}
				}}
			/>
			<button onClick={() => submit()}>{t('Login')}</button>
			<p>{msg()}</p>
		</>
	);
};
