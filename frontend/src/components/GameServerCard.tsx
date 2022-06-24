import { Component } from 'solid-js';
import { IMatch } from '../../../common';
import { t } from '../utils/locale';
import { Card } from './Card';

export const GameServerCard: Component<{
	match: IMatch;
}> = (props) => {
	const ipPort = `${props.match.gameServer.ip}:${props.match.gameServer.port}`;
	const password = ``;
	const steamUrl = `steam://connect/${ipPort}/${password}`;
	return (
		<Card>
			<h2 class="font-bold text-lg">{t('Game Server')}</h2>
			<p>
				<a href={steamUrl}>{steamUrl}</a>
				<br />
				sv_password "{password}"; connect {ipPort};
			</p>
		</Card>
	);
};
