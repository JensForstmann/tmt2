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
	const [showGameServerModal, setShowGameServerModal] = createSignal(false);

	return (
		<Card>
			<CardMenu
				show
				entries={[[t('change game server'), () => setShowGameServerModal(true)]]}
			/>
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
			<Modal
				show={showGameServerModal()}
				onBackdropClick={() => setShowGameServerModal(false)}
			>
				<GameServerChangeForm
					match={props.match}
					onClose={() => setShowGameServerModal(false)}
				/>
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
		const success = await fetcher<boolean>('PATCH', `/api/matches/${props.match.id}`, {
			gameServer: {
				ip: ip(),
				port: port(),
				rconPassword: rconPassword(),
			},
		} as IMatchUpdateDto);
		if (success) {
			props.onClose();
		}
	};

	return (
		<>
			<div class="text-left">
				{t('ip')}
				<TextInput value={ip()} onChange={(e) => setIp(e.currentTarget.value)} />
				{t('port')}
				<TextInput
					type="number"
					value={port()}
					onChange={(e) => setPort(parseInt(e.currentTarget.value))}
				/>
				{t('rcon password')}
				<TextInput
					value={rconPassword()}
					onChange={(e) => setRconPassword(e.currentTarget.value)}
				/>
			</div>
			<button class="mr-4" onClick={changeGameServer}>
				{t('save')}
			</button>
			<button class="ml-4" onClick={props.onClose}>
				{t('cancel')}
			</button>
		</>
	);
};
