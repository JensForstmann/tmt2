import { Component, For } from 'solid-js';
import { IMatch } from '../types/match';
import { t } from '../utils/locale';
import classes from './PlayerListCard.module.scss';

export const PlayerListCard: Component<{
	match: IMatch;
}> = (props) => {
	return (
		<>
			<div class={classes.card}>
				<h2>{t('Players')}</h2>
				<For each={props.match.players}>
					{(player) => (
						<p>
							{player.name}{' '}
							<a href={`https://steamcommunity.com/profiles/${player.steamId64}`}>
								Steam
							</a>
						</p>
					)}
				</For>
			</div>
		</>
	);
};
