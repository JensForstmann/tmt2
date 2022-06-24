import { Component, Show } from 'solid-js';
import { IMatchResponse } from '../../../common';
import { t } from '../utils/locale';
import { getMapDraws, getMapScore } from '../utils/match';
import { Card } from './Card';

export const MatchCard: Component<{
	match: IMatchResponse;
}> = (props) => {
	const scoreTeamA = getMapScore(props.match, 'TEAM_A');
	const scoreTeamB = getMapScore(props.match, 'TEAM_B');
	const mapDraws = getMapDraws(props.match);

	return (
		<Card>
			<h2 class="font-bold text-lg">{t('Map Wins')}</h2>
			<p class="space-x-5 flex basis-1/3 justify-center items-center">
				<span class="text-right flex-1">{props.match.teamA.name}</span>
				<span class="text-5xl">
					{scoreTeamA}
					{' : '}
					{scoreTeamB}
				</span>
				<span class="text-left flex-1">
					{props.match.teamB.name} {props.match.teamB.name}
					{props.match.teamB.name}
					{props.match.teamB.name}
					{props.match.teamB.name}
					{props.match.teamB.name}
				</span>
			</p>
			<Show when={mapDraws > 0}>
				<span class="shrink-0 grow">
					<br />
					{` (${mapDraws} ${t('draws')})`}
				</span>
			</Show>
			<p>
				<span>
					{t(props.match.state)}
					{!props.match.isLive && ` (${t('not live')})`}
				</span>
			</p>
		</Card>
	);
};
