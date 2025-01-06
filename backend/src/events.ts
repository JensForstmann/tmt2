import {
	BaseEvent,
	ChatEvent,
	ElectionEndEvent,
	ElectionMapStep,
	ElectionSideStep,
	Event,
	EventType,
	IMatchMap,
	IPlayer,
	ITeam,
	KnifeRoundEndEvent,
	LogEvent,
	MapEndEvent,
	MapStartEvent,
	MatchCreateEvent,
	MatchEndEvent,
	MatchStopEvent,
	MatchUpdateEvent,
	RoundEndEvent,
	TMapMode,
	TSideMode,
	TTeamString,
} from '../../common';
import * as Match from './match';
import * as MatchService from './matchService';
import { Settings } from './settings';
import * as Storage from './storage';
import * as WebSocket from './webSocket';

const STORAGE_EVENTS_PREFIX = 'events_';
const STORAGE_EVENTS_SUFFIX = '.jsonl';

const send = (match: Match.Match, data: Event, isSystemEvent?: boolean) => {
	// Storage
	Storage.appendLineJson(STORAGE_EVENTS_PREFIX + match.data.id + STORAGE_EVENTS_SUFFIX, data);

	// WebSocket
	WebSocket.publish(data, isSystemEvent);

	// WebHook
	const url = match.data.webhookUrl;
	if (url?.startsWith('http') && Settings.WEBHOOK_EVENTS.includes(data.type)) {
		fetch(url, {
			method: 'POST',
			headers: {
				...match.data.webhookHeaders,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		}).catch((err) => {
			match.log(`Sending webhook ${data.type} to ${url} failed: ${err}`);
		});
	}
};

export const getEventsTail = async (matchId: string, numberOfLines = 1000): Promise<Event[]> => {
	return await Storage.readLinesJson(
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

export const onElectionMapStep = (
	match: Match.Match,
	mode: TMapMode,
	mapName: string,
	pickerTeam?: ITeam
) => {
	const data: ElectionMapStep = {
		...getBaseEvent(match, 'ELECTION_MAP_STEP'),
		mode: mode,
		mapName: mapName,
		pickerTeam: pickerTeam,
	};
	send(match, data);
};

export const onElectionSideStep = (
	match: Match.Match,
	mode: TSideMode,
	options?: Omit<ElectionSideStep, 'mode' | 'type' | keyof BaseEvent>
) => {
	const data: ElectionSideStep = {
		...getBaseEvent(match, 'ELECTION_SIDE_STEP'),
		mode: mode,
		pickerTeam: options?.pickerTeam,
		ctTeam: options?.ctTeam,
		tTeam: options?.tTeam,
	};
	send(match, data);
};

export const onKnifeRoundEnd = (match: Match.Match, matchMap: IMatchMap, winnerTeam: ITeam) => {
	const data: KnifeRoundEndEvent = {
		...getBaseEvent(match, 'KNIFE_END'),
		mapIndex: match.data.currentMap,
		mapName: matchMap.name,
		matchMapCount: match.data.matchMaps.length,
		winnerTeam: winnerTeam,
	};
	send(match, data);
};

export const onRoundEnd = (match: Match.Match, matchMap: IMatchMap, winnerTeam: ITeam) => {
	const data: RoundEndEvent = {
		...getBaseEvent(match, 'ROUND_END'),
		mapIndex: match.data.currentMap,
		mapName: matchMap.name,
		matchMapCount: match.data.matchMaps.length,
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
	isTeamChat: boolean,
	teamString: TTeamString
) => {
	const data: ChatEvent = {
		...getBaseEvent(match, 'CHAT'),
		player: player,
		playerTeam: player.team ? Match.getTeamByAB(match, player.team) : null,
		message: message,
		isTeamChat: isTeamChat,
		teamString: teamString,
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
		matchMapCount: match.data.matchMaps.length,
	};
	send(match, data);
};

export const onMapStart = (match: Match.Match, matchMap: IMatchMap) => {
	const data: MapStartEvent = {
		...getBaseEvent(match, 'MAP_START'),
		mapIndex: match.data.currentMap,
		mapName: matchMap.name,
		matchMapCount: match.data.matchMaps.length,
	};
	send(match, data);
};

export const onMapEnd = (match: Match.Match, matchMap: IMatchMap) => {
	const data: MapEndEvent = {
		...getBaseEvent(match, 'MAP_END'),
		mapIndex: match.data.currentMap,
		mapName: matchMap.name,
		matchMapCount: match.data.matchMaps.length,
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

export const onMatchCreate = (match: Match.Match) => {
	const data: MatchCreateEvent = {
		...getBaseEvent(match, 'MATCH_CREATE'),
		match: {
			...MatchService.hideRconPassword(match.data, false),
			isLive: true,
		},
	};
	send(match, data, true);
};

export const onMatchUpdate = (match: Match.Match, path: Array<string | number>, value: any) => {
	const data: MatchUpdateEvent = {
		...getBaseEvent(match, 'MATCH_UPDATE'),
		path: path,
		value: value,
	};
	// send as a system event if the match was created less than 10 seconds ago
	const sendAsSysEvent = match.data.createdAt + 10000 > Date.now();
	send(match, data, sendAsSysEvent);
};

export const onMatchStop = (match: Match.Match) => {
	const data: MatchStopEvent = getBaseEvent(match, 'MATCH_STOP');
	send(match, data);
};
