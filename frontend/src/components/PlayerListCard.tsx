import { Component, For } from 'solid-js';
import { IMatch, IPlayer } from '../../../common';
import { t } from '../utils/locale';
import classes from './PlayerListCard.module.scss';

export const PlayerListCard: Component<{
	match: IMatch;
}> = (props) => {
	return (
		<>
			<div class={classes.card}>
				<h2>{t('Players')}</h2>
				<div>
					<div class={classes.left}>
						<h4>{t('Team A')}</h4>
						{List(props.match.players.filter((p) => p.team === 'TEAM_A'))}
					</div>
					<div class={classes.right}>
						<h4>{t('Team B')}</h4>
						{List(props.match.players.filter((p) => p.team === 'TEAM_B'))}
					</div>
				</div>
				<div>
					<div>
						<h4>{t('Not Assigned')}</h4>
						{List(props.match.players.filter((p) => !p.team))}
					</div>
				</div>
			</div>
		</>
	);
};

const List = (players: IPlayer[]) => {
	return (
		<For each={players}>
			{(player) => (
				<>
					<a
						href={`https://steamcommunity.com/profiles/${player.steamId64}`}
						target="_blank"
					>
						{player.name}
					</a>
					<br />
				</>
			)}
		</For>
	);
};
