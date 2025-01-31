import { Component, createSignal, For } from 'solid-js';
import { Card } from '../components/Card';
import { StatsNavBar } from '../components/StatsNavBar';
import { t } from '../utils/locale';
import { A, useParams } from '@solidjs/router';
import { createEffect } from 'solid-js';
import { createFetcher } from '../utils/fetcher';
import { IPlayerStats, IMatchStats } from '../../../common';
import { assemblePlayers } from '../utils/assemblePlayers';

//TODO: Add ability to sort tables by columns

const Loading: Component = () => (
	<div class="p-4">
		<div class="flex justify-center items-center h-full p-4">
			<span class="text-gray-500">Loading...</span>
		</div>
	</div>
);

export const MatchesStatsPage = () => {
	const fetcher = createFetcher();
	const [loading, setLoading] = createSignal(true);
	const [matches, setMatches] = createSignal<IMatchStats[]>([]);

	createEffect(() => {
		fetcher<IMatchStats[]>('GET', `/api/stats/matches`).then((data) => {
			if (data) {
				setMatches(data);
			}
			setLoading(false);
		});
	});

	return (
		<>
			<StatsNavBar />
			<Card>
				<table class="table-zebra table">
					<thead>
						<tr>
							<th>{t('ID')}</th>
							<th>{t('Map')}</th>
							<th>{t('Team A')}</th>
							<th>{t('Team B')}</th>
							<th>{t('Score')}</th>
							<th>{t('Winner Team')}</th>
						</tr>
					</thead>
					<tbody>
						<For each={matches()}>
							{(match, i) => (
								<tr>
									<td>{match.matchId}</td>
									<td>{match.map}</td>
									<td>{match.teamA}</td>
									<td>{match.teamB}</td>
									<td>{match.teamAScore + ' / ' + match.teamBScore}</td>
									<td>{match.winner}</td>
									<td class="w-24 p-2">
										<A
											href={`/stats/match/${match.matchId}`}
											class="btn btn-outline btn-sm w-full hover:no-underline"
										>
											{t('Details')}
										</A>
									</td>
								</tr>
							)}
						</For>
					</tbody>
				</table>
				{loading() && <Loading />}
			</Card>
		</>
	);
};

export const MatchStatsPage = () => {
	const matchId = useParams().id;
	const fetcher = createFetcher();
	const [loading, setLoading] = createSignal(true);
	const [match, setMatch] = createSignal<IMatchStats>();
	const [players, setPlayers] = createSignal<IPlayerStats[]>([]);
	const [assembledPlayers, setAssembledPlayers] = createSignal<IPlayerStats[]>([]);
	const [permap, setPermap] = createSignal(false);
	let [maps, setMaps] = createSignal<string[]>([]);

	createEffect(() => {
		fetcher<IMatchStats>('GET', `/api/stats/match?id=${matchId}`).then((data) => {
			if (data) setMatch(data);
		});
	});

	createEffect(() => {
		fetcher<IPlayerStats[]>('GET', `/api/stats/players/match?id=${matchId}`).then((data) => {
			if (data) {
				setPlayers(data);
				setAssembledPlayers(assemblePlayers(data));
				const uniqueMaps = new Set<string>();
				for (const player of data) {
					if (player.map) {
						uniqueMaps.add(player.map);
					}
				}
				setMaps(Array.from(uniqueMaps));
			}
			setLoading(false);
		});
	});

	return (
		<>
			<StatsNavBar />
			<Card>
				<div class="prose text-center mx-auto">
					<h2>{t('Match') + ' ' + matchId}</h2>
				</div>
				<div class="prose text-center mx-auto pt-4 flex justify-center items-center">
					<div class="flex-1 text-right pr-4">
						<h3 class="m-0">{match()?.teamA}</h3>
						{match()?.teamAScore}
					</div>
					<div class="border-r border-gray-300 h-16"></div>
					<div class="flex-1 text-left pl-4">
						<h3 class="m-0">{match()?.teamB}</h3>
						{match()?.teamBScore}
					</div>
				</div>
			</Card>
			<div class="h-8" />
			<Card>
				<div class="flex justify-center">
					<div class="mx-4">{t('Global')}</div>
					<input
						type="checkbox"
						class="toggle"
						onInput={(e) =>
							e.currentTarget.checked ? setPermap(true) : setPermap(false)
						}
					/>
					<div class="mx-4">{t('Per-map')}</div>
				</div>
				<div class="h-2" />
				<table class="table-zebra table">
					<thead>
						<tr>
							{permap() && <th>{t('Map')}</th>}
							<th>{t('Name')}</th>
							<th>{t('Kills')}</th>
							<th>{t('Deaths')}</th>
							<th>{t('Assists')}</th>
							<th>{t('Diff')}</th>
							<th>{t('Headshot %')}</th>
							<th>{t('ADR')}</th>
						</tr>
					</thead>
					<tbody>
						{permap() ? (
							<For each={maps()}>
								{(map) => (
									<>
										{players()
											.filter((player) => player.map === map)
											.map((player, index) => (
												<tr>
													<td>{index === 0 ? map : ''}</td>
													<td>{player.name}</td>
													<td>{player.kills}</td>
													<td>{player.deaths}</td>
													<td>{player.assists}</td>
													<td>{player.diff}</td>
													<td>{player.hsPct}</td>
													<td>{player.adr}</td>
												</tr>
											))}
									</>
								)}
							</For>
						) : (
							<>
								<For each={assembledPlayers()}>
									{(player, i) => (
										<tr>
											<td>{player.name}</td>
											<td>{player.kills}</td>
											<td>{player.deaths}</td>
											<td>{player.assists}</td>
											<td>{player.diff}</td>
											<td>{player.hsPct}</td>
											<td>{player.adr}</td>
										</tr>
									)}
								</For>
							</>
						)}
					</tbody>
				</table>
				{loading() && <Loading />}
			</Card>
		</>
	);
};

export const PlayersStatsPage = () => {
	const fetcher = createFetcher();
	const [loading, setLoading] = createSignal(true);
	const [players, setPlayers] = createSignal<IPlayerStats[]>([]);

	createEffect(() => {
		fetcher<IPlayerStats[]>('GET', `/api/stats/players`).then((data) => {
			if (data) {
				setPlayers(data);
			}
			setLoading(false);
		});
	});

	return (
		<>
			<StatsNavBar />
			<Card>
				<table class="table-zebra table">
					<thead>
						<tr>
							<th>{t('Name')}</th>
							<th>{t('Kills')}</th>
							<th>{t('Deaths')}</th>
							<th>{t('Assists')}</th>
							<th>{t('Diff')}</th>
							<th>{t('Headshot %')}</th>
							<th>{t('ADR')}</th>
						</tr>
					</thead>
					<tbody>
						<For each={players()}>
							{(player, i) => (
								<tr>
									<td>{player.name}</td>
									<td>{player.kills}</td>
									<td>{player.deaths}</td>
									<td>{player.assists}</td>
									<td>{player.diff}</td>
									<td>{player.hsPct}</td>
									<td>{player.adr}</td>
									<td class="w-24 p-2">
										<A
											href={`/stats/player/${player.steamId}`}
											class="btn btn-outline btn-sm w-full hover:no-underline"
										>
											{t('Details')}
										</A>
									</td>
								</tr>
							)}
						</For>
					</tbody>
				</table>
				{loading() && <Loading />}
			</Card>
		</>
	);
};

export const PlayerStatsPage = () => {
	const steamId = useParams().id;
	const fetcher = createFetcher();
	const [loading, setLoading] = createSignal(true);
	const [player, setPlayer] = createSignal<IPlayerStats>();
	const [playerData, setPlayerData] = createSignal<IPlayerStats[]>([]);

	createEffect(() => {
		fetcher<IPlayerStats>('GET', `/api/stats/player?id=${steamId}`).then((data) => {
			if (data) {
				setPlayer(data);
			}
		});
	});

	createEffect(() => {
		fetcher<IPlayerStats[]>('GET', `/api/stats/matches/player?id=${steamId}`).then((data) => {
			if (data) {
				setPlayerData(data);
			}
			setLoading(false);
		});
	});

	return (
		<>
			<StatsNavBar />
			<Card>
				<div class="prose text-center mx-auto">
					<h2 class="my-0">{t('Player') + ' ' + player()?.name}</h2>
					<span class="text-gray-500 text-sm">
						{t('steamID') + ': ' + player()?.steamId}
					</span>
				</div>
				<div class="prose text-center mx-auto pt-4 flex justify-center items-center">
					<div class="flex-1 text-center pr-4">
						<h3 class="m-0">{t('Kills')}</h3>
						{player()?.kills}
					</div>
					<div class="border-r border-gray-300 h-16"></div>
					<div class="flex-1 text-center px-4">
						<h3 class="m-0">{t('Deaths')}</h3>
						{player()?.deaths}
					</div>
					<div class="border-r border-gray-300 h-16"></div>
					<div class="flex-1 text-center px-4">
						<h3 class="m-0">{t('Assists')}</h3>
						{player()?.assists}
					</div>
					<div class="border-r border-gray-300 h-16"></div>
					<div class="flex-1 text-center px-4">
						<h3 class="m-0">{t('Diff')}</h3>
						{player()?.diff}
					</div>
					<div class="border-r border-gray-300 h-16"></div>
					<div class="flex-2 text-center px-4">
						<h3 class="m-0">{t('Headshot %')}</h3>
						{player()?.hsPct}
					</div>
					<div class="border-r border-gray-300 h-16"></div>
					<div class="flex-1 text-center pl-4">
						<h3 class="m-0">{t('ADR')}</h3>
						{player()?.adr}
					</div>
				</div>
			</Card>
			<div class="h-8" />
			<Card>
				<table class="table-zebra table">
					<thead>
						<tr>
							<th>{t('Match')}</th>
							<th>{t('Map')}</th>
							<th>{t('Kills')}</th>
							<th>{t('Deaths')}</th>
							<th>{t('Assists')}</th>
							<th>{t('Diff')}</th>
							<th>{t('Headshot %')}</th>
							<th>{t('ADR')}</th>
						</tr>
					</thead>
					<tbody>
						<For each={playerData()}>
							{(player, i) => (
								<tr>
									<td>{player.matchId}</td>
									<td>{player.map}</td>
									<td>{player.kills}</td>
									<td>{player.deaths}</td>
									<td>{player.assists}</td>
									<td>{player.diff}</td>
									<td>{player.hsPct}</td>
									<td>{player.adr}</td>
								</tr>
							)}
						</For>
					</tbody>
				</table>
				{loading() && <Loading />}
			</Card>
		</>
	);
};
