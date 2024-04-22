import { A } from '@solidjs/router';
import { Component, For, Show } from 'solid-js';
import { IMatchResponse, getTotalNumberOfMaps } from '../../../common';
import { SvgNavigateNext } from '../assets/Icons';
import { t } from '../utils/locale';

export const MatchTableColumns = [
	'TEAM_A',
	'TEAM_B',
	'ONLINE_PLAYER_COUNT',
	'AGE',
	'BEST_OF',
	'MATCH_STATE',
	'CURRENT_MAP',
	'MAP_STATE',
	'MAP_SCORE',
	'GAME_SERVER',
	'DETAILS',
] as const;

export const MatchTableColumnLabels: Record<TMatchTableColumns, string> = {
	TEAM_A: t('Team A'),
	TEAM_B: t('Team B'),
	ONLINE_PLAYER_COUNT: t('Online Players'),
	AGE: t('Age'),
	BEST_OF: t('Best of'),
	MATCH_STATE: t('Match State'),
	CURRENT_MAP: t('Current Map'),
	MAP_STATE: t('Map State'),
	MAP_SCORE: t('Map Score'),
	GAME_SERVER: t('Game Server'),
	DETAILS: t('Details'),
};

export type TMatchTableColumns = (typeof MatchTableColumns)[number];

export type TColumnsToShow = Partial<Record<TMatchTableColumns, boolean>>;

const diffString = (createdAt: number) => {
	if (createdAt) {
		return Math.round((Date.now() - createdAt) / 1000 / 60) + 'min';
	}
	return '';
};

export const MatchList: Component<{ matches: IMatchResponse[]; columnsToShow: TColumnsToShow }> = (
	props
) => {
	const cts = () => props.columnsToShow;
	return (
		<table class="table-zebra table">
			<thead>
				<tr>
					<th>{t('#')}</th>
					{cts().TEAM_A && <th>{MatchTableColumnLabels.TEAM_A}</th>}
					{cts().TEAM_B && <th>{MatchTableColumnLabels.TEAM_B}</th>}
					{cts().ONLINE_PLAYER_COUNT && (
						<th>{MatchTableColumnLabels.ONLINE_PLAYER_COUNT}</th>
					)}
					{cts().AGE && <th>{MatchTableColumnLabels.AGE}</th>}
					{cts().BEST_OF && <th>{MatchTableColumnLabels.BEST_OF}</th>}
					{cts().MATCH_STATE && <th>{MatchTableColumnLabels.MATCH_STATE}</th>}
					{cts().CURRENT_MAP && <th>{MatchTableColumnLabels.CURRENT_MAP}</th>}
					{cts().MAP_STATE && <th>{MatchTableColumnLabels.MAP_STATE}</th>}
					{cts().MAP_SCORE && <th>{MatchTableColumnLabels.MAP_SCORE}</th>}
					{cts().GAME_SERVER && <th>{MatchTableColumnLabels.GAME_SERVER}</th>}
					{cts().DETAILS && <th>{MatchTableColumnLabels.DETAILS}</th>}
				</tr>
			</thead>
			<tbody>
				<For each={[...props.matches].sort((a, b) => b.createdAt - a.createdAt)}>
					{(match, i) => (
						<tr>
							<td>{i() + 1}</td>
							{cts().TEAM_A && <td>{match.teamA.name}</td>}
							{cts().TEAM_B && <td>{match.teamB.name}</td>}
							{cts().ONLINE_PLAYER_COUNT && (
								<td>
									{match.isStopped || match.state === 'FINISHED'
										? ''
										: match.players.filter((player) => player.online).length}
								</td>
							)}
							{cts().AGE && <td>{diffString(match.createdAt)}</td>}
							{cts().BEST_OF && <td>{getTotalNumberOfMaps(match.electionSteps)}</td>}
							{cts().MATCH_STATE && <td>{match.state}</td>}
							{cts().CURRENT_MAP && (
								<td>
									<Show when={match.state === 'MATCH_MAP'}>
										{match.matchMaps[match.currentMap]?.name ?? ''}
										<Show when={getTotalNumberOfMaps(match.electionSteps) > 1}>
											{` (${match.currentMap + 1}/${getTotalNumberOfMaps(
												match.electionSteps
											)})`}
										</Show>
									</Show>
								</td>
							)}
							{cts().MAP_STATE && <td>{match.matchMaps[match.currentMap]?.state}</td>}
							{cts().MAP_SCORE && (
								<td>
									{match.matchMaps[match.currentMap]?.score.teamA ?? 0}
									{' : '}
									{match.matchMaps[match.currentMap]?.score.teamB ?? 0}
								</td>
							)}
							{cts().GAME_SERVER && (
								<td>
									{match.gameServer.ip}:{match.gameServer.port}
								</td>
							)}
							{cts().DETAILS && (
								<td>
									<A
										href={`/matches/${match.id}`}
										class="btn btn-circle btn-outline"
									>
										<SvgNavigateNext class="inline-block" />
									</A>
								</td>
							)}
						</tr>
					)}
				</For>
			</tbody>
		</table>
	);
};
