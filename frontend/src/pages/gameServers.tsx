import { Component, Show, createEffect, createSignal } from 'solid-js';
import { createFetcher } from '../utils/fetcher';
import { createStore } from 'solid-js/store';
import {
	IManagedGameServer,
	IManagedGameServerCreateDto,
	IManagedGameServerUpdateDto,
} from '../../../common';
import { ManagedGameServerList } from '../components/ManagedGameServerList';
import { TextInput } from '../components/TextInput';
import { t } from '../utils/locale';

export const GameServersPage: Component = () => {
	const fetcher = createFetcher();
	const [data, setData] = createStore<{
		managedGameServers?: IManagedGameServer[];
	}>({});
	const [ip, setIp] = createSignal('');
	const [port, setPort] = createSignal(27015);
	const [rconPassword, setRconPassword] = createSignal('');
	const [canBeUsed, setCanBeUsed] = createSignal(true);

	createEffect(() => {
		fetcher<IManagedGameServer[]>('GET', `/api/gameservers`).then((managedGameServers) => {
			setData('managedGameServers', managedGameServers);
		});
	});

	const createGameServer = async () => {
		const response = await fetcher<IManagedGameServer>('POST', '/api/gameservers', {
			ip: ip(),
			port: port(),
			rconPassword: rconPassword(),
			canBeUsed: canBeUsed(),
		} as IManagedGameServerCreateDto);
		if (response) {
			setData('managedGameServers', (exi) => [...(exi ?? []), response]);
		}
	};

	const update = async (dto: IManagedGameServerUpdateDto) => {
		const response = await fetcher<IManagedGameServer>(
			'PATCH',
			`/api/gameservers/${dto.ip}/${dto.port}`,
			dto
		);
		if (response) {
			setData(
				'managedGameServers',
				(exi) => exi.ip === dto.ip && exi.port === dto.port,
				response
			);
		}
	};

	const remove = async (managedGameServer: IManagedGameServer) => {
		await fetcher<IManagedGameServer>(
			'DELETE',
			`/api/gameservers/${managedGameServer.ip}/${managedGameServer.port}`
		);
		setData('managedGameServers', (exi) =>
			exi?.filter(
				(exi) => exi.ip !== managedGameServer.ip || exi.port !== managedGameServer.port
			)
		);
	};

	return (
		<>
			<Show when={data.managedGameServers}>
				{(managedGameServers) => (
					<>
						<div class="pt-14">
							<ManagedGameServerList
								managedGameServers={managedGameServers()}
								update={update}
								delete={remove}
							/>
						</div>

						<h4>{t('game server ip')}</h4>
						<TextInput value={ip()} onInput={(e) => setIp(e.currentTarget.value)} />

						<h4>{t('game server port')}</h4>
						<TextInput
							type="number"
							value={port()}
							onInput={(e) => setPort(parseInt(e.currentTarget.value))}
						/>

						<h4>{t('game server rcon password')}</h4>
						<TextInput
							value={rconPassword()}
							onInput={(e) => setRconPassword(e.currentTarget.value)}
						/>
						<h4>{t('can be used')}</h4>
						<input
							type="checkbox"
							checked={canBeUsed()}
							onchange={(e) => setCanBeUsed(e.currentTarget.checked)}
						/>
						<div class="text-center">
							<button onClick={() => createGameServer()}>
								{t('add game server')}
							</button>
						</div>
					</>
				)}
			</Show>
		</>
	);
};
