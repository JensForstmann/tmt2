import { Component, For } from 'solid-js';
import { IMatchResponse, IPlayer } from '../../../common';
import { t } from '../utils/locale';
import { Card } from './Card';

export const PlayerListCard: Component<{
	match: IMatchResponse;
}> = (props) => {
	return (
		<Card>
			<h2 class="font-bold text-lg">{t('Players')}</h2>
			<div class="space-x-5 flex basis-1/2 justify-center items-start text-left">
				<div class="flex-1 text-right">
					<h4>{props.match.teamA.name}</h4>
					{List(props.match.players.filter((p) => p.team === 'TEAM_A'))}
				</div>
				<div class="flex-1">
					<h4>{props.match.teamB.name}</h4>
					{List(props.match.players.filter((p) => p.team === 'TEAM_B'))}
				</div>
			</div>
			<div>
				<div>
					<h4>{t('Not Assigned')}</h4>
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
