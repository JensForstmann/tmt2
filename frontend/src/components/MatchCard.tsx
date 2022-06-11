import { Component, Show } from 'solid-js';
import { IMatch } from '../../../common';
import { TTeamAB } from '../../../common';
import { t } from '../utils/locale';
import { getMapDraws, getMapScore } from '../utils/match';
import classes from './MatchCard.module.scss';

export const MatchCard: Component<{
	match: IMatch;
}> = (props) => {
	const scoreTeamA = getMapScore(props.match, 'TEAM_A');
	const scoreTeamB = getMapScore(props.match, 'TEAM_B');
	const mapDraws = getMapDraws(props.match);

	return (
		<>
			<div class={classes.card}>
				<p>
					<span class={classes.teamName}>{props.match.teamA.name}</span>
					<span>
						<span class={classes.score}>
							{scoreTeamA}
							{' : '}
							{scoreTeamB}
						</span>
						<Show when={mapDraws > 0}>
							<span class={classes.draws}>
								<br />
								{` (${mapDraws} ${t('draws')})`}
							</span>
						</Show>
					</span>
					<span class={classes.teamName}>{props.match.teamB.name}</span>
				</p>
				<p>
					<span class={classes.state}>{t(props.match.state)}</span>
				</p>
			</div>
		</>
	);
};
