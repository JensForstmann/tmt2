import { Component } from 'solid-js';
import { IMatch } from '../../../common';
import { TTeamAB, IMatchMap } from '../../../common';
import { getCurrentTeamSideAndRoundSwitch } from '../utils/helper';
import { t } from '../utils/locale';
import { Card } from './Card';

export const MatchMapCard: Component<{
	match: IMatch;
	map: IMatchMap;
	isCurrent: boolean;
}> = (props) => {
	const teamA = !props.isCurrent
		? ''
		: getCurrentTeamSideAndRoundSwitch(props.map).currentCtTeamAB === 'TEAM_A'
		? '(CT)'
		: '(T)';
	const teamB = !props.isCurrent ? '' : teamA === '(CT)' ? '(T)' : '(CT)';
	return (
		<Card>
			<h3 class="font-light text-base">{props.map.name}</h3>
			<p class="space-x-5 flex basis-1/3 justify-center items-center">
				<span class="text-right flex-1">
					{teamA} {props.match.teamA.name}
				</span>
				<span class="text-2xl text-center">
					{props.map.score.teamA}
					{' : '}
					{props.map.score.teamB}
				</span>
				<span class="text-left flex-1">
					{props.match.teamB.name} {teamB}
				</span>
			</p>
			<p>
				<span>{t(props.map.state)}</span>
			</p>
		</Card>
	);
};
