import { useParams } from '@solidjs/router';
import { Component, createSignal, onMount } from 'solid-js';
import { ErrorComponent } from '../components/ErrorComponent';
import { GameServerCard } from '../components/GameServerCard';
import { RconServer } from '../components/Rcon';
import { createFetcher } from '../utils/fetcher';
import { t } from '../utils/locale';

export const GameServerPage: Component = () => {
	const params = useParams();
	const parts = params.ipPort.split(':', 2);
	const ip = parts[0];
	const port = Number.parseInt(parts[1]);
	const [serverPassword, setServerPassword] = createSignal('');
	const fetcher = createFetcher();

	onMount(() => {
		fetcher<string[]>('POST', `/api/gameservers/${ip}/${port}`, ['sv_password']).then(
			(response) => {
				const configVarPattern = new RegExp(`^sv_password = (.*)`);
				const configVarMatch = response?.[0]?.match(configVarPattern);
				if (configVarMatch) {
					setServerPassword(configVarMatch[1]);
				}
			}
		);
	});

	return Number.isNaN(port) ? (
		<ErrorComponent errorMessage={t('ip:port invalid')} />
	) : (
		<div class="space-y-5">
			<GameServerCard ipPort={ip + ':' + port} serverPassword={serverPassword()} />
			<RconServer ip={ip} port={port} />
		</div>
	);
};
