import { Component } from 'solid-js';
import { IMatch } from '../types/match';
import { ETeamAB, IMatchMap } from '../types/matchMap';
import { getCurrentTeamSideAndRoundSwitch } from '../utils/helper';
import { t } from '../utils/locale';
import classes from './MatchMapCard.module.scss';

export const MatchMapCard: Component<{
	match: IMatch;
	map: IMatchMap;
	isCurrent: boolean;
}> = (props) => {
	const teamA =
		getCurrentTeamSideAndRoundSwitch(props.map).currentCtTeamAB === ETeamAB.TEAM_A ? 'CT' : 'T';
	const teamB = teamA === 'CT' ? 'T' : 'CT';
	return (
		<>
			<div class={classes.card}>
				<p>
					<span class={classes.mapName}>{props.map.name}</span>
				</p>
				<p>
					<span class={classes.teamName}>
						({teamA}) {props.match.teamA.name}
					</span>
					<span>
						<span class={classes.score}>
							{props.map.score.teamA}
							{' : '}
							{props.map.score.teamB}
						</span>
					</span>
					<span class={classes.teamName}>
						{props.match.teamB.name} ({teamB})
					</span>
				</p>
				<p>
					<span class={classes.state}>{t(props.map.state)}</span>
				</p>
			</div>
		</>
	);
};
