import Events from 'axios';
import {
	BaseEvent,
	ChatEvent,
	ElectionEndEvent,
	Event,
	EventType,
	IMatchMap,
	IPlayer,
	ITeam,
	KnifeRoundEndEvent,
	LogEvent,
	MapEndEvent,
	MapStartEvent,
	MatchEndEvent,
	RoundEndEvent,
} from '../../common';
import * as Match from './match';
import * as WebSocket from './webSocket';
import { Settings } from './settings';
import * as Storage from './storage';

const STORAGE_EVENTS_PREFIX = 'events_';
const STORAGE_EVENTS_SUFFIX = '.jsonl';

const send = (match: Match.Match, data: Event) => {
	// Storage
	Storage.appendLine(STORAGE_EVENTS_PREFIX + match.data.id + STORAGE_EVENTS_SUFFIX, data);

	// WebSocket
	WebSocket.publish(data);

	// WebHook
	const url = match.data.webhookUrl;
	if (url?.startsWith('http') && Settings.WEBHOOK_EVENTS.includes(data.type)) {
		Events.post(url, data).catch((err) => {
			match.log(`sending webhook ${data.type} to ${url} failed: ${err}`);
		});
	}
};

export const getEventsTail = async (matchId: string, numberOfLines = 100): Promise<Event[]> => {
	return await Storage.readLines(
		STORAGE_EVENTS_PREFIX + matchId + STORAGE_EVENTS_SUFFIX,
		[],
		numberOfLines
	);
};

const getBaseEvent = <T extends EventType>(
	match: Match.Match,
	type: T
): BaseEvent & { type: T } => {
	return {
		timestamp: new Date().toISOString(),
		matchId: match.data.id,
		matchPassthrough: match.data.passthrough ?? null,
		type: type,
	};
};

export const onElectionEnd = (match: Match.Match) => {
	const data: ElectionEndEvent = {
		...getBaseEvent(match, 'MAP_ELECTION_END'),
		mapNames: match.data.matchMaps.map((matchMaps) => matchMaps.name),
	};
	send(match, data);
};

export const onKnifeRoundEnd = (match: Match.Match, matchMap: IMatchMap, winnerTeam: ITeam) => {
	const data: KnifeRoundEndEvent = {
		...getBaseEvent(match, 'KNIFE_END'),
		mapIndex: match.data.currentMap,
		mapName: matchMap.name,
		winnerTeam: winnerTeam,
	};
	send(match, data);
};

export const onRoundEnd = (match: Match.Match, matchMap: IMatchMap, winnerTeam: ITeam) => {
	const data: RoundEndEvent = {
		...getBaseEvent(match, 'ROUND_END'),
		mapIndex: match.data.currentMap,
		mapName: matchMap.name,
		winnerTeam: winnerTeam,
		scoreTeamA: matchMap.score.teamA,
		scoreTeamB: matchMap.score.teamB,
	};
	send(match, data);
};

export const onPlayerSay = (
	match: Match.Match,
	player: IPlayer,
	message: string,
	isTeamChat: boolean
) => {
	const data: ChatEvent = {
		...getBaseEvent(match, 'CHAT'),
		player: player,
		playerTeam: player.team ? Match.getTeamByAB(match, player.team) : null,
		message: message,
		isTeamChat: isTeamChat,
	};
	send(match, data);
};

export const onConsoleSay = (match: Match.Match, message: string) => {
	const data: ChatEvent = {
		...getBaseEvent(match, 'CHAT'),
		player: null,
		playerTeam: null,
		message: message,
		isTeamChat: false,
	};
	send(match, data);
};

export const onMatchEnd = (match: Match.Match, wonMapsTeamA: number, wonMapsTeamB: number) => {
	const data: MatchEndEvent = {
		...getBaseEvent(match, 'MATCH_END'),
		wonMapsTeamA: wonMapsTeamA,
		wonMapsTeamB: wonMapsTeamB,
		winnerTeam:
			wonMapsTeamA === wonMapsTeamB
				? null
				: wonMapsTeamA > wonMapsTeamB
				? match.data.teamA
				: match.data.teamB,
		mapResults: match.data.matchMaps
			.filter((map) => map.state === 'FINISHED')
			.map((matchMap) => ({
				mapName: matchMap.name,
				scoreTeamA: matchMap.score.teamA,
				scoreTeamB: matchMap.score.teamB,
				winnerTeam:
					matchMap.score.teamA === matchMap.score.teamB
						? null
						: matchMap.score.teamA > matchMap.score.teamB
						? match.data.teamA
						: match.data.teamB,
			})),
	};
	send(match, data);
};

export const onMapStart = (match: Match.Match, matchMap: IMatchMap) => {
	const data: MapStartEvent = {
		...getBaseEvent(match, 'MAP_START'),
		mapIndex: match.data.currentMap,
		mapName: matchMap.name,
	};
	send(match, data);
};

export const onMapEnd = (match: Match.Match, matchMap: IMatchMap) => {
	const data: MapEndEvent = {
		...getBaseEvent(match, 'MAP_END'),
		mapIndex: match.data.currentMap,
		mapName: matchMap.name,
		scoreTeamA: matchMap.score.teamA,
		scoreTeamB: matchMap.score.teamB,
		winnerTeam:
			matchMap.score.teamA === matchMap.score.teamB
				? null
				: matchMap.score.teamA > matchMap.score.teamB
				? match.data.teamA
				: match.data.teamB,
	};
	send(match, data);
};

export const onLog = (match: Match.Match, message: string) => {
	const data: LogEvent = {
		...getBaseEvent(match, 'LOG'),
		message: message,
	};
	send(match, data);
};
