import { useNavigate, useSearchParams } from '@solidjs/router';
import { Component, createSignal } from 'solid-js';
import { getToken, login } from '../utils/fetcher';
import { t } from '../utils/locale';
import { Card } from '../components/Card';
import { TextInput } from '../components/Inputs';

export const LoginPage: Component = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [token, setToken] = createSignal<string>(getToken() ?? '');
	const [msg, setMsg] = createSignal('');

	const submit = async () => {
		if (await login(token())) {
			navigate(
				typeof searchParams.path === 'string' ? decodeURIComponent(searchParams.path) : '/'
			);
		} else {
			setMsg(t('Login failed'));
		}
	};

	return (
		<Card>
			<TextInput
				label={t('Password/Token')}
				type="password"
				value={token()}
				onInput={(e) => setToken(e.currentTarget.value)}
				onKeyDown={(e) => {
					if (e.key === 'Enter') {
						submit();
					}
				}}
			/>
			<div class="pt-4 text-center">
				<button onClick={() => submit()} class="btn btn-primary">
					{t('Login')}
				</button>
			</div>
			<p class="text-error">{msg()}</p>
		</Card>
	);
};
