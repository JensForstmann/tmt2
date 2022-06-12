import { Component, For, Index, Match, Show, Switch } from 'solid-js';
import { TLogUnion, TTeamAB } from '../../../common';
import { IMatch } from '../../../common';
import { IPlayer } from '../../../common';
import { t } from '../utils/locale';
import { getMapDraws, getMapScore } from '../utils/match';
import classes from './MatchCard.module.scss';

export const LogViewer: Component<{
	match: IMatch;
	logs: string[];
}> = (props) => {
	return (
		<>
			<div class={classes.card}>
				<h2>{t('Logs')}</h2>
				<For each={props.match.logs}>
					{(entry) => <span>{toText(entry, props.match.players)}</span>}
				</For>
				<Index each={props.logs}>{(entry, index) => <span>{entry()}</span>}</Index>
			</div>
		</>
	);
};

const toText = (log: TLogUnion, players: IPlayer[]): string => {
	const ts = new Date(log.timestamp);
	switch (log.type) {
		case 'CHAT':
			return `${ts}: ${getPlayerName(log.steamId64, players)} ${
				log.isTeamChat ? '(TEAM)' : '(ALL)'
			}: ${log.message}`;
		case 'SYSTEM':
			return `${ts}: ${log.category} - ${log.message}`;
	}
};

const getPlayerName = (steamId64: string, players: IPlayer[]) => {
	return players.find((player) => player.steamId64 === steamId64)?.name || 'Unknown Player';
};
