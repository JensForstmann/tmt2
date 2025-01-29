import { For } from "solid-js";
import { Card } from "../components/Card";
import { StatsNavBar } from "../components/StatsNavBar";
import { t } from "../utils/locale";
import { useParams } from "@solidjs/router";
import { createEffect } from 'solid-js';
import { createFetcher } from '../utils/fetcher';
import { IPlayerStats, IMatchStats } from "../../../common";

//TODO: Sort tables properly

export const MatchesStatsPage = () => {
	const fetcher = createFetcher();
	let matches: IMatchStats[] = [];
	let loading = true;

	createEffect(() => {
		fetcher<IMatchStats[]>('GET', `/api/stats/matches`).then((data) => {
			matches = data ?? [];
			loading = false;
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
						<For each={matches}>
							{(match, i) => (
								<tr>
									<td>{match.matchId}</td>
									<td>{match.map}</td>
									<td>{match.teamA}</td>
									<td>{match.teamB}</td>
									<td>{match.teamAScore + ' / ' + match.teamBScore}</td> 
									<td>{match.winner}</td>
								</tr>
							)}
						</For>
					</tbody>
				</table>
			</Card>
		</>
	);
};

export const MatchStatsPage = () => {
	const matchId = useParams().id;
	
	return (
		<>
			<StatsNavBar />
			TODO
		</>
	);
};

export const PlayersStatsPage = () => {
	const fetcher = createFetcher();
	let players: IPlayerStats[] = [];
	let loading = true;

	createEffect(() => {
		fetcher<IPlayerStats[]>('GET', `/api/stats/players`).then((data) => {
			players = data ?? [];
			loading = false;
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
							<th>{t('Hits')}</th>
							<th>{t('Headshots')}</th>
							<th>{t('Headshot %')}</th>
							<th>{t('Rounds')}</th>
							<th>{t('Damages')}</th>
							<th>{t('ADR')}</th>
						</tr>
					</thead>
					<tbody>
						<For each={players}>
							{(player, i) => (
								<tr>
									<td>{player.name}</td>
									<td>{player.kills}</td>
									<td>{player.deaths}</td>
									<td>{player.assists}</td>
									<td>{player.diff}</td>
									<td>{player.hits}</td>
									<td>{player.headshots}</td>
									<td>{player.hsPct}</td>
									<td>{player.rounds}</td>
									<td>{player.damages}</td>
									<td>{player.adr}</td>
								</tr>
							)}
						</For>
					</tbody>
				</table>
			</Card>
		</>
	);
};

// export const PlayerStatsPage = () => {
// 	const steamId = useParams().id;
// 	return (
// 		<>
// 			<StatsNavBar />
// 			"specific player"
// 		</>
// 	);
// };
