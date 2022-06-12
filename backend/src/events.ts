import Events from 'axios';
import {
	ChatEvent,
	ElectionEndEvent,
	Event,
	IMatchMap,
	IPlayer,
	ITeam,
	KnifeRoundEndEvent,
	MapEndEvent,
	MapStartEvent,
	MatchEndEvent,
	RoundEndEvent,
} from '../../common';
import * as Match from './match';
import * as WebSocket from './webSocket';
import { Settings } from './settings';

const send = (match: Match.Match, data: Event) => {
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

export const onElectionEnd = (match: Match.Match) => {
	const data: ElectionEndEvent = {
		matchId: match.data.id,
		matchPassthrough: match.data.passthrough ?? null,
		type: 'MAP_ELECTION_END',
		mapNames: match.data.matchMaps.map((matchMaps) => matchMaps.name),
	};
	send(match, data);
};

export const onKnifeRoundEnd = (match: Match.Match, matchMap: IMatchMap, winnerTeam: ITeam) => {
	const data: KnifeRoundEndEvent = {
		matchId: match.data.id,
		matchPassthrough: match.data.passthrough ?? null,
		type: 'KNIFE_END',
		winnerTeam: winnerTeam,
	};
	send(match, data);
};

export const onRoundEnd = (match: Match.Match, matchMap: IMatchMap, winnerTeam: ITeam) => {
	const data: RoundEndEvent = {
		matchId: match.data.id,
		matchPassthrough: match.data.passthrough ?? null,
		type: 'ROUND_END',
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
		matchId: match.data.id,
		matchPassthrough: match.data.passthrough ?? null,
		type: 'CHAT',
		player: player,
		playerTeam: player.team ? Match.getTeamByAB(match, player.team) : null,
		message: message,
		isTeamChat: isTeamChat,
	};
	send(match, data);
};

export const onMatchEnd = (match: Match.Match, wonMapsTeamA: number, wonMapsTeamB: number) => {
	const data: MatchEndEvent = {
		matchId: match.data.id,
		matchPassthrough: match.data.passthrough ?? null,
		type: 'MATCH_END',
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
		matchId: match.data.id,
		matchPassthrough: match.data.passthrough ?? null,
		type: 'MAP_START',
		mapIndex: match.data.currentMap,
		mapName: matchMap.name,
	};
	send(match, data);
};

export const onMapEnd = (match: Match.Match, matchMap: IMatchMap) => {
	const data: MapEndEvent = {
		matchId: match.data.id,
		matchPassthrough: match.data.passthrough ?? null,
		type: 'MAP_END',
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
