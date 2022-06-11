import { Component } from 'solid-js';
import { IMatch } from '../../../common';
import { t } from '../utils/locale';
import classes from './GameServerCard.module.scss';

export const GameServerCard: Component<{
	match: IMatch;
}> = (props) => {
	const ipPort = `${props.match.gameServer.ip}:${props.match.gameServer.port}`;
	const password = ``;
	const steamUrl = `steam://connect/${ipPort}/${password}`;
	return (
		<>
			<div class={classes.card}>
				<h2>{t('Game Server')}</h2>
				<p>
					<a href={steamUrl}>{steamUrl}</a>
					<br />
					sv_password "{password}"; connect {ipPort};
				</p>
			</div>
		</>
	);
};
