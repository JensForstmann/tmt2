import { Component, createSignal } from 'solid-js';
import { IMatchResponse, IMatchUpdateDto } from '../../../common';
import { SvgCopyAll, SvgOpenInNew } from '../assets/Icons';
import { createFetcher } from '../utils/fetcher';
import { t } from '../utils/locale';
import { Card } from './Card';
import { CardMenu } from './CardMenu';
import { Modal } from './Modal';
import { TextInput } from './TextInput';

export const GameServerCard: Component<{
	match: IMatchResponse;
}> = (props) => {
	const ipPort = () => `${props.match.gameServer.ip}:${props.match.gameServer.port}`;
	const steamUrl = () => `steam://connect/${ipPort()}/${props.match.serverPassword}`;
	const command = () =>
		(props.match.serverPassword ? `password "${props.match.serverPassword}"; ` : '') +
		`connect ${ipPort()}`;
	let modalRef: HTMLDialogElement | undefined;

	return (
		<Card class="text-center">
			<CardMenu show entries={[[t('change game server'), () => modalRef?.showModal()]]} />
			<h2 class="text-lg font-bold">{t('Game Server')}</h2>
			<p>
				<a href={steamUrl()}>
					{steamUrl()} <SvgOpenInNew class="inline-block" />
				</a>
				<br />
				<span class="align-middle">{command()}</span>
				<button
					class="ml-1 align-middle"
					onClick={() => navigator.clipboard.writeText(command())}
				>
					<SvgCopyAll />
				</button>
			</p>
			<Modal ref={modalRef}>
				<GameServerChangeForm match={props.match} onClose={() => modalRef?.close()} />
			</Modal>
		</Card>
	);
};

const GameServerChangeForm: Component<{
	match: IMatchResponse;
	onClose: () => void;
}> = (props) => {
	const [ip, setIp] = createSignal(props.match.gameServer.ip);
	const [port, setPort] = createSignal(props.match.gameServer.port);
	const [rconPassword, setRconPassword] = createSignal(props.match.gameServer.rconPassword);

	const fetcher = createFetcher(props.match.tmtSecret);
	const changeGameServer = async () => {
		await fetcher('PATCH', `/api/matches/${props.match.id}`, {
			gameServer: {
				ip: ip(),
				port: port(),
				rconPassword: rconPassword(),
			},
		} as IMatchUpdateDto);
		props.onClose();
	};

	return (
		<>
			<div class="text-left">
				<TextInput
					label={t('IP Address')}
					value={ip()}
					onChange={(e) => setIp(e.currentTarget.value)}
					class="bg-base-300"
				/>
				<TextInput
					label={t('Port')}
					type="number"
					value={port()}
					onChange={(e) => setPort(parseInt(e.currentTarget.value))}
					class="bg-base-300"
				/>
				<TextInput
					label={t('Rcon Password')}
					value={rconPassword()}
					onChange={(e) => setRconPassword(e.currentTarget.value)}
					class="bg-base-300"
				/>
			</div>
			<div class="h-4" />
			<button class="btn btn-primary mr-4" onClick={changeGameServer}>
				{t('save')}
			</button>
			<button class="btn ml-4" onClick={props.onClose}>
				{t('cancel')}
			</button>
		</>
	);
};
