import { Component, For, Match, Show, Switch } from 'solid-js';
import { ELogType, ILogChat, TLogUnion } from '../types/log';
import { IMatch } from '../types/match';
import { ETeamAB } from '../types/matchMap';
import { IPlayer } from '../types/player';
import { t } from '../utils/locale';
import { getMapDraws, getMapScore } from '../utils/match';
import classes from './MatchCard.module.scss';

export const LogViewer: Component<{
	match: IMatch;
}> = (props) => {
	return (
		<>
			<div class={classes.card}>
				<h2>{t('Logs')}</h2>
				<For each={props.match.logs}>
					{(entry) => <span>{toText(entry, props.match.players)}</span>}
				</For>
			</div>
		</>
	);
};

const toText = (log: TLogUnion, players: IPlayer[]): string => {
	const ts = new Date(log.timestamp);
	switch (log.type) {
		case ELogType.CHAT:
			return `${ts}: ${getPlayerName(log.steamId64, players)} ${
				log.isTeamChat ? '(TEAM)' : '(ALL)'
			}: ${log.message}`;
		case ELogType.SYSTEM:
			return `${ts}: ${log.category} - ${log.message}`;
	}
};

const getPlayerName = (steamId64: string, players: IPlayer[]) => {
	return players.find((player) => player.steamId64 === steamId64)?.name || 'Unknown Player';
};
