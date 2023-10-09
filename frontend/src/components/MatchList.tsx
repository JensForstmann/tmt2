import { Link } from '@solidjs/router';
import { Component, For, Show } from 'solid-js';
import { IMatchResponse, getTotalNumberOfMaps } from '../../../common';
import { SvgNavigateNext } from '../assets/Icons';
import { t } from '../utils/locale';

const diffString = (createdAt: number) => {
	if (createdAt) {
		return Math.round((Date.now() - createdAt) / 1000 / 60) + 'min';
	}
	return '';
};

export const MatchList: Component<{ matches: IMatchResponse[] }> = (props) => {
	return (
		<table class="table-zebra table">
			<thead>
				<tr>
					<th>{t('#')}</th>
					<th>{t('Team A')}</th>
					<th>{t('Team B')}</th>
					<th>{t('Age')}</th>
					<th>{t('Best of')}</th>
					<th>{t('Match State')}</th>
					<th>{t('Current Map')}</th>
					<th>{t('Map State')}</th>
					<th>{t('Map Score')}</th>
					<th>{t('Details')}</th>
				</tr>
			</thead>
			<tbody>
				<For each={props.matches}>
					{(match, i) => (
						<tr>
							<td>{i() + 1}</td>
							<td>{match.teamA.name}</td>
							<td>{match.teamB.name}</td>
							<td>{diffString(match.createdAt)}</td>
							<td>{getTotalNumberOfMaps(match.electionSteps)}</td>
							<td>{match.state}</td>
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
							<td>{match.matchMaps[match.currentMap]?.state}</td>
							<td>
								{match.matchMaps[match.currentMap]?.score.teamA ?? 0}
								{' : '}
								{match.matchMaps[match.currentMap]?.score.teamB ?? 0}
							</td>
							<td>
								<Link
									href={`/matches/${match.id}`}
									class="btn btn-circle btn-outline"
								>
									<SvgNavigateNext class="inline-block" />
								</Link>
							</td>
						</tr>
					)}
				</For>
			</tbody>
		</table>
	);
};
