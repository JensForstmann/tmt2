import { Component, For, Show } from 'solid-js';
import { IMatchResponse, IPlayer } from '../../../common';
import { t } from '../utils/locale';
import { Card } from './Card';

export const PlayerListCard: Component<{
	match: IMatchResponse;
}> = (props) => {
	return (
		<Card>
			<h2 class="text-lg font-bold text-center">{t('Players')}</h2>
			<div class="grid grid-cols-2 text-right gap-x-4">
				<div class="text-right">
					<div class="inline-grid grid-cols-[auto_auto_auto] items-baseline gap-x-2">
						<h4 class="text-sm font-bold">{props.match.teamA.name}</h4>
						<div></div>
						<div></div>
						<For each={props.match.players.filter((p) => p.team === 'TEAM_A')}>
							{(player) => (
								<>
									<Player player={player} />
									<Side player={player} />
									<Online player={player} />
								</>
							)}
						</For>
					</div>
				</div>
				<div class="text-left">
					<div class="inline-grid grid-cols-[auto_auto_auto] items-baseline gap-x-2">
						<div></div>
						<div></div>
						<h4 class="text-sm font-bold">{props.match.teamB.name}</h4>
						<For each={props.match.players.filter((p) => p.team === 'TEAM_B')}>
							{(player) => (
								<>
									<Online player={player} />
									<Side player={player} />
									<Player player={player} />
								</>
							)}
						</For>
					</div>
				</div>
				<div class="text-center col-span-2 pt-4">
					<div class="inline-grid grid-cols-[auto_auto_auto] items-baseline gap-x-2">
						<h4 class="text-sm font-bold col-span-3">{t('Not Assigned')}</h4>
						<For each={props.match.players.filter((p) => !p.team)}>
							{(player) => (
								<>
									<Online player={player} />
									<Side player={player} />
									<Player player={player} />
								</>
							)}
						</For>
					</div>
				</div>
			</div>
		</Card>
	);
};

const Player: Component<{ player: IPlayer }> = (props) => {
	return (
		<div>
			<a
				href={`https://steamcommunity.com/profiles/${props.player.steamId64}`}
				target="_blank"
			>
				{props.player.name}
			</a>
		</div>
	);
};

const Side: Component<{ player: IPlayer }> = (props) => {
	return (
		<Show when={props.player.side} fallback={<div></div>}>
			<div class="badge badge-neutral w-full">{props.player.side}</div>
		</Show>
	);
};

const Online: Component<{ player: IPlayer }> = (props) => {
	return (
		<div class="badge badge-neutral w-full">
			{props.player.online ? t('Online') : t('Offline')}
		</div>
	);
};
