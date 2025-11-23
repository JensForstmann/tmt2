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
import { db } from './database';
import * as Match from './match';
import * as MatchService from './matchService';
import { Settings } from './settings';
import * as WebSocket from './webSocket';

const send = (match: Match.Match, data: Event, isSystemEvent?: boolean) => {
	// Storage
	saveEventToDb(data);

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
			console.warn(
				`Sending ${data.type} webhook for match ${match.data.id} to ${url} failed: ${err}`
			);
		});
	}
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
	pickerTeam: ITeam | null
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
	options: Omit<ElectionSideStep, 'mode' | 'type' | keyof BaseEvent> | null
) => {
	const data: ElectionSideStep = {
		...getBaseEvent(match, 'ELECTION_SIDE_STEP'),
		mode: mode,
		pickerTeam: options?.pickerTeam ?? null,
		pickerSide: options?.pickerSide ?? null,
		ctTeam: options?.ctTeam ?? null,
		tTeam: options?.tTeam ?? null,
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
		teamString: null,
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

const eventToDb = (event: Event): TDbEvent => {
	const copy: any = { ...event };
	delete copy.timestamp;
	delete copy.matchId;
	delete copy.matchPassthrough;
	delete copy.type;
	const payload = JSON.stringify(copy);
	return {
		timestamp: event.timestamp,
		matchId: event.matchId,
		matchPassthrough: event.matchPassthrough,
		type: event.type,
		payload: payload,
	};
};

const eventFromDb = (dbEvent: TDbEvent): Event => {
	return {
		...JSON.parse((dbEvent as any).payload),
		timestamp: dbEvent.timestamp,
		matchId: dbEvent.matchId,
		matchPassthrough: dbEvent.matchPassthrough,
		type: dbEvent.type,
	};
};

type TDbEvent = {
	timestamp: string;
	matchId: string;
	matchPassthrough: string | null;
	type: string;
	payload: string;
};

export const saveEventToDb = (event: Event) => {
	db.prepare<TDbEvent>(
		`INSERT INTO event (
			timestamp,
			matchId,
			matchPassthrough,
			type,
			payload
		) VALUEs (
			:timestamp,
			:matchId,
			:matchPassthrough,
			:type,
			:payload
	)`
	).run(eventToDb(event));
};

export const getLatestEventsFromDatabase = (matchId: string, numberOfEvents = 1000): Event[] => {
	const rows = db
		.prepare<
			{ matchId: string; numberOfEvents: number },
			TDbEvent
		>(`SELECT * FROM event WHERE matchId = :matchId ORDER BY id DESC LIMIT :numberOfEvents`)
		.all({ matchId: matchId, numberOfEvents: numberOfEvents });
	return rows.map(eventFromDb).reverse();
};
