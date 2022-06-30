import { Component, Show } from 'solid-js';
import { getMapDraws, getMapScore, IMatchResponse } from '../../../common';
import { t } from '../utils/locale';
import { Card } from './Card';
import { CardMenu } from './CardMenu';

export const MatchCard: Component<{
	match: IMatchResponse;
}> = (props) => {
	return (
		<Card>
			<CardMenu
				entries={[
					[t('stop'), () => {}],
					[t('restart election'), () => {}],
					[t('init'), () => {}],
					[t('setup'), () => {}],
				]}
			/>
			<h2 class="font-bold text-lg">{t('Map Wins')}</h2>
			<p class="space-x-5 flex basis-1/3 justify-center items-center">
				<span class="text-right flex-1">{props.match.teamA.name}</span>
				<span class="text-5xl">
					{getMapScore(props.match, 'TEAM_A')}
					{' : '}
					{getMapScore(props.match, 'TEAM_B')}
				</span>
				<span class="text-left flex-1">{props.match.teamB.name}</span>
			</p>
			<Show when={getMapDraws(props.match) > 0}>
				<span class="shrink-0 grow">
					<br />
					{` (${getMapDraws(props.match)} ${t('draws')})`}
				</span>
			</Show>
			<p>{t(props.match.state)}</p>
		</Card>
	);
};
