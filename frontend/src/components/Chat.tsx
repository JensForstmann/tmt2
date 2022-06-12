import { Component, For, Index } from 'solid-js';
import { ChatEvent, IMatch, IPlayer, LogEvent, TLogUnion } from '../../../common';
import { t } from '../utils/locale';
import classes from './Chat.module.scss';

export const Chat: Component<{
	messages: ChatEvent[];
}> = (props) => {
	return (
		<>
			<div class={classes.card}>
				<h2>{t('Chat')}</h2>
				<pre>
					<For each={props.messages}>{(msg) => eventToString(msg) + '\n'}</For>
				</pre>
			</div>
		</>
	);
};

const eventToString = (e: ChatEvent) => {
	return `${new Date(e.timestamp).toLocaleTimeString()}: (${e.isTeamChat ? 'TEAM' : 'ALL'}) [${
		e.playerTeam?.name ?? ''
	}] ${e.player.name} : ${e.message}`;
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

export const getPlayerName = (steamId64: string, players: IPlayer[]) => {
	return players.find((player) => player.steamId64 === steamId64)?.name || 'Unknown Player';
};
