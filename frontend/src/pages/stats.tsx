import { createSignal } from 'solid-js';
import { Card } from '../components/Card';
import { StatsNavBar } from '../components/StatsNavBar';
import { t } from '../utils/locale';
import { useParams } from '@solidjs/router';
import { createEffect } from 'solid-js';
import { createFetcher } from '../utils/fetcher';
import { IPlayerStats, IMatchStats } from '../../../common';
import { assemblePlayers } from '../utils/assemblePlayers';
import { StatsTable } from '../components/StatsTable';
import { TStatus } from '../../../common/types/status';

export const MatchesStatsPage = () => {
	const fetcher = createFetcher();
	const [status, setStatus] = createSignal<TStatus>('LOADING');
	const [matches, setMatches] = createSignal<IMatchStats[]>([]);

	createEffect(() => {
		fetcher<IMatchStats[]>('GET', `/api/stats/matches`)
			.then((data) => {
				if (data) {
					setMatches(data);
					setStatus('OK');
				} else {
					setStatus('ERROR');
				}
			})
			.catch((error) => {
				if (error.response?.status === 404) {
					setStatus('NOT_FOUND');
				} else {
					setStatus('ERROR');
				}
			});
	});

	return (
		<>
			<StatsNavBar />
			<Card>
				<StatsTable
					headers={[
						t('ID'),
						t('Map'),
						t('Team A'),
						t('Team B'),
						t('Score'),
						t('Winner Team'),
					]}
					data={matches()}
					columns={[
						'matchId',
						'map',
						'teamA',
						'teamB',
						'teamAScore| / |teamBScore',
						'winner',
					]}
					defaultSortColumn="matchId"
					status={status()}
					detailsPrefix="/stats/match/"
					detailsProp="matchId"
				/>
			</Card>
		</>
	);
};

export const MatchStatsPage = () => {
	const matchId = useParams().id;
	const fetcher = createFetcher();
	const [status, setStatus] = createSignal<TStatus>('LOADING');
	const [match, setMatch] = createSignal<IMatchStats>();
	const [players, setPlayers] = createSignal<IPlayerStats[]>([]);
	const [assembledPlayers, setAssembledPlayers] = createSignal<IPlayerStats[]>([]);
	const [permap, setPermap] = createSignal(false);
	let [maps, setMaps] = createSignal<string[]>([]);

	createEffect(() => {
		fetcher<IMatchStats>('GET', `/api/stats/match?id=${matchId}`)
			.then((data) => {
				if (data) {
					setMatch(data);
					setStatus('OK');
				} else {
					setStatus('ERROR');
				}
			})
			.catch((error) => {
				if (error === 'Not Found') {
					setStatus('NOT_FOUND');
				} else {
					setStatus('ERROR');
				}
			});
	});

	createEffect(() => {
		fetcher<IPlayerStats[]>('GET', `/api/stats/players/match?id=${matchId}`)
			.then((data) => {
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
				} else {
					setStatus('ERROR');
				}
			})
			.catch((error) => {
				if (error === 'Not Found') {
					setStatus('NOT_FOUND');
				} else {
					setStatus('ERROR');
				}
			});
	});

	return (
		<>
			<StatsNavBar />
			{status() === 'OK' && (
				<>
					<Card>
						<div class="prose text-center mx-auto">
							<h2>{t('Match') + ' ' + match()?.matchId}</h2>
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
				</>
			)}
			<Card>
				{status() === 'OK' && (
					<>
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
					</>
				)}
				{permap() ? (
					<StatsTable
						headers={[
							t('Map'),
							t('Name'),
							t('Kills'),
							t('Deaths'),
							t('Assists'),
							t('Diff'),
							t('Headshot %'),
							t('ADR'),
						]}
						data={players()}
						columns={[
							'map',
							'name',
							'kills',
							'deaths',
							'assists',
							'diff',
							'hsPct',
							'adr',
						]}
						defaultSortColumn="name"
						status={status()}
						groupBy="map"
					/>
				) : (
					<StatsTable
						headers={[
							t('Name'),
							t('Kills'),
							t('Deaths'),
							t('Assists'),
							t('Diff'),
							t('Headshot %'),
							t('ADR'),
						]}
						data={assembledPlayers()}
						columns={['name', 'kills', 'deaths', 'assists', 'diff', 'hsPct', 'adr']}
						defaultSortColumn="name"
						status={status()}
					/>
				)}
			</Card>
		</>
	);
};

export const PlayersStatsPage = () => {
	const fetcher = createFetcher();
	const [status, setStatus] = createSignal<TStatus>('LOADING');
	const [players, setPlayers] = createSignal<IPlayerStats[]>([]);

	createEffect(() => {
		fetcher<IPlayerStats[]>('GET', `/api/stats/players`)
			.then((data) => {
				if (data) {
					setPlayers(data);
					setStatus('OK');
				} else {
					setStatus('ERROR');
				}
			})
			.catch((error) => {
				if (error.response?.status === 404) {
					setStatus('NOT_FOUND');
				} else {
					setStatus('ERROR');
				}
			});
	});

	return (
		<>
			<StatsNavBar />
			<Card>
				<StatsTable
					headers={[
						t('Name'),
						t('Kills'),
						t('Deaths'),
						t('Assists'),
						t('Diff'),
						t('Headshot %'),
						t('ADR'),
					]}
					data={players()}
					columns={['name', 'kills', 'deaths', 'assists', 'diff', 'hsPct', 'adr']}
					defaultSortColumn="name"
					status={status()}
					detailsPrefix="/stats/player/"
					detailsProp="steamId"
				/>
			</Card>
		</>
	);
};

export const PlayerStatsPage = () => {
	const steamId = useParams().id;
	const fetcher = createFetcher();
	const [status, setStatus] = createSignal<TStatus>('LOADING');
	const [player, setPlayer] = createSignal<IPlayerStats>();
	const [playerData, setPlayerData] = createSignal<IPlayerStats[]>([]);
	const [matchIds, setMatchIds] = createSignal<string[]>([]);

	createEffect(() => {
		fetcher<IPlayerStats>('GET', `/api/stats/player?id=${steamId}`)
			.then((data) => {
				if (data) {
					setPlayer(data);
					setStatus('OK');
				} else {
					setStatus('ERROR');
				}
			})
			.catch((error) => {
				if (error === 'Not Found') {
					setStatus('NOT_FOUND');
				} else {
					setStatus('ERROR');
				}
			});
	});

	createEffect(() => {
		fetcher<IPlayerStats[]>('GET', `/api/stats/matches/player?id=${steamId}`)
			.then((data) => {
				if (data) {
					setPlayerData(data);
					const uniqueMatchIds = new Set<string>();
					for (const player of data) {
						if (player.matchId) {
							uniqueMatchIds.add(player.matchId);
						}
					}
					setMatchIds(Array.from(uniqueMatchIds));
				} else {
					setStatus('ERROR');
				}
			})
			.catch((error) => {
				if (error === 'Not Found') {
					setStatus('NOT_FOUND');
				} else {
					setStatus('ERROR');
				}
			});
	});

	return (
		<>
			<StatsNavBar />
			{status() === 'OK' && (
				<>
					<Card>
						<div class="prose text-center mx-auto">
							<h2 class="my-0">{t('Player') + ' ' + player()?.name}</h2>
							<span class="text-gray-500 text-sm">
								{t('steamID') + ': ' + player()?.steamId}
							</span>
						</div>
						<div class="prose text-center mx-auto pt-4 flex justify-center items-center">
							<div class="flex items-center">
								<div class="px-4">
									<h3 class="m-0">{t('Kills')}</h3>
									{player()?.kills}
								</div>
								<div class="border-r border-gray-300 h-16"></div>
								<div class="px-4">
									<h3 class="m-0">{t('Deaths')}</h3>
									{player()?.deaths}
								</div>
								<div class="border-r border-gray-300 h-16"></div>
								<div class="px-4">
									<h3 class="m-0">{t('Assists')}</h3>
									{player()?.assists}
								</div>
								<div class="border-r border-gray-300 h-16"></div>
								<div class="px-4">
									<h3 class="m-0">{t('Diff')}</h3>
									{player()?.diff}
								</div>
								<div class="border-r border-gray-300 h-16"></div>
								<div class="px-4">
									<h3 class="m-0">{t('Headshot %')}</h3>
									{player()?.hsPct}
								</div>
								<div class="border-r border-gray-300 h-16"></div>
								<div class="px-4">
									<h3 class="m-0">{t('ADR')}</h3>
									{player()?.adr}
								</div>
							</div>
						</div>
					</Card>
					<div class="h-8" />
				</>
			)}
			<Card>
				<StatsTable
					headers={[
						t('Match'),
						t('Map'),
						t('Kills'),
						t('Deaths'),
						t('Assists'),
						t('Diff'),
						t('Headshot %'),
						t('ADR'),
					]}
					data={playerData()}
					columns={[
						'matchId',
						'map',
						'kills',
						'deaths',
						'assists',
						'diff',
						'hsPct',
						'adr',
					]}
					defaultSortColumn="matchId"
					status={status()}
					groupBy="matchId"
				/>
			</Card>
		</>
	);
};
