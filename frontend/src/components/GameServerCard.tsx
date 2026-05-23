import { Component } from 'solid-js';
import { IMatch } from '../../../common';
import { SvgCopyAll, SvgOpenInNew } from '../assets/Icons';
import { copyToClipboard } from '../utils/copyToClipboard';
import { t } from '../utils/locale';
import { Card } from './Card';

export const GameServerCard: Component<{
	ipPort: string;
	serverPassword: string;
}> = (props) => {
	const steamUrl = () => `steam://connect/${props.ipPort}?appid=730/${props.serverPassword}`;
	const command = () =>
		(props.serverPassword ? `password "${props.serverPassword}"; ` : '') +
		`connect ${props.ipPort}`;

	return (
		<Card class="text-center">
			<h2 class="text-lg font-bold">{t('Game Server')}</h2>
			<p>
				<a href={steamUrl()}>
					{steamUrl()} <SvgOpenInNew class="inline-block" />
				</a>
				<br />
				<span class="align-middle">{command()}</span>
				<button class="btn ml-1 align-middle" onClick={() => copyToClipboard(command())}>
					<SvgCopyAll />
				</button>
			</p>
		</Card>
	);
};

export const MatchGameServerCard: Component<{
	match: IMatch;
}> = (props) => {
	return (
		<GameServerCard
			ipPort={`${props.match.gameServer.ip}:${props.match.gameServer.port}`}
			serverPassword={props.match.serverPassword}
		/>
	);
};
