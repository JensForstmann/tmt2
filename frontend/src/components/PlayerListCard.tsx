import { Component, For } from 'solid-js';
import { IMatchResponse, IPlayer } from '../../../common';
import { t } from '../utils/locale';
import { Card } from './Card';

export const PlayerListCard: Component<{
	match: IMatchResponse;
}> = (props) => {
	return (
		<Card>
			<h2 class="text-lg font-bold">{t('Players')}</h2>
			<div class="flex basis-1/2 items-start justify-center space-x-5 text-left">
				<div class="flex-1 text-right">
					<h4 class="text-sm font-bold">{props.match.teamA.name}</h4>
					{List(props.match.players.filter((p) => p.team === 'TEAM_A'))}
				</div>
				<div class="flex-1">
					<h4 class="text-sm font-bold">{props.match.teamB.name}</h4>
					{List(props.match.players.filter((p) => p.team === 'TEAM_B'))}
				</div>
			</div>
			<div>
				<div>
					<h4 class="text-sm font-bold">{t('Not Assigned')}</h4>
					{List(props.match.players.filter((p) => !p.team))}
				</div>
			</div>
		</Card>
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
