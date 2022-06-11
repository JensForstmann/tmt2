import { Component, For } from 'solid-js';
import { IMatch } from '../../../common';
import { t } from '../utils/locale';
import { Link } from 'solid-app-router';

export const MatchList: Component<{ matches: IMatch[] }> = (props) => {
	return (
		<>
			<table>
				<thead>
					<tr>
						<th>{t('#')}</th>
						<th>{t('ID')}</th>
						<th>{t('Team A')}</th>
						<th>{t('Team B')}</th>
						<th>{t('Match State')}</th>
						<th>{t('Current Map')}</th>
						<th>{t('Map State')}</th>
						<th>{t('Score')}</th>
						<th>{t('Is Stopped')}</th>
						<th>{t('Link')}</th>
					</tr>
				</thead>
				<tbody>
					<For each={props.matches}>
						{(match, i) => (
							<tr>
								<td>{i() + 1}</td>
								<td>{match.id}</td>
								<td>{match.teamA.name}</td>
								<td>{match.teamB.name}</td>
								<td>{match.state}</td>
								<td>{match.currentMap + 1}</td>
								<td>{match.matchMaps[match.currentMap]?.state}</td>
								<td>
									{match.matchMaps[match.currentMap]?.score.teamA} :{' '}
									{match.matchMaps[match.currentMap]?.score.teamB}
								</td>
								<td>{match.isStopped ? 'stopped' : ''}</td>
								<td>
									<Link href={`/matches/${match.id}`}>{t('Open')}</Link>
								</td>
							</tr>
						)}
					</For>
				</tbody>
			</table>
		</>
	);
};
