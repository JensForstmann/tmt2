import axios from 'axios';
import { EMatchMapSate, ETeamAB, IMatchMap } from './interfaces/matchMap';
import { IPlayer } from './interfaces/player';
import { ITeam } from './interfaces/team';
import {
	EWebhookType,
	IChatWebhook,
	IElectionEndWebhook,
	IKnifeRoundEndWebhook,
	IMapEndWebhook,
	IMapStartWebhook,
	IMatchEndWebhook,
	IRoundEndWebhook,
	IWebhook,
} from './interfaces/webhook';
import * as Match from './match';

const send = (match: Match.Match, data: IWebhook) => {
	const url = match.data.webhookUrl;
	if (url?.startsWith('http')) {
		axios.post(url, data).catch((err) => {
			console.warn(
				`sending webhook ${data.type} of match ${data.matchId} to ${url} failed: ${err}`
			);
		});
	}
};

export const onElectionEnd = (match: Match.Match) => {
	const data: IElectionEndWebhook = {
		matchId: match.data.id,
		matchPassthrough: match.data.passthrough ?? null,
		type: EWebhookType.MAP_ELECTION_END,
		mapNames: match.data.matchMaps.map((matchMaps) => matchMaps.name),
	};
	send(match, data);
};

export const onKnifeRoundEnd = (match: Match.Match, matchMap: IMatchMap, winnerTeam: ITeam) => {
	const data: IKnifeRoundEndWebhook = {
		matchId: match.data.id,
		matchPassthrough: match.data.passthrough ?? null,
		type: EWebhookType.KNIFE_END,
		winnerTeam: winnerTeam,
	};
	send(match, data);
};

export const onRoundEnd = (match: Match.Match, matchMap: IMatchMap, winnerTeam: ITeam) => {
	const data: IRoundEndWebhook = {
		matchId: match.data.id,
		matchPassthrough: match.data.passthrough ?? null,
		type: EWebhookType.ROUND_END,
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
	const data: IChatWebhook = {
		matchId: match.data.id,
		matchPassthrough: match.data.passthrough ?? null,
		type: EWebhookType.CHAT,
		player: player,
		playerTeam: player.team ? Match.getTeamByAB(match, player.team) : null,
		message: message,
		isTeamChat: isTeamChat,
	};
	send(match, data);
};

export const onMatchEnd = (match: Match.Match, wonMapsTeamA: number, wonMapsTeamB: number) => {
	const data: IMatchEndWebhook = {
		matchId: match.data.id,
		matchPassthrough: match.data.passthrough ?? null,
		type: EWebhookType.MATCH_END,
		wonMapsTeamA: wonMapsTeamA,
		wonMapsTeamB: wonMapsTeamB,
		winnerTeam:
			wonMapsTeamA === wonMapsTeamB
				? null
				: wonMapsTeamA > wonMapsTeamB
				? match.data.teamA
				: match.data.teamB,
		mapResults: match.data.matchMaps
			.filter((map) => map.state === EMatchMapSate.FINISHED)
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
	const data: IMapStartWebhook = {
		matchId: match.data.id,
		matchPassthrough: match.data.passthrough ?? null,
		type: EWebhookType.MAP_START,
		mapIndex: match.data.currentMap,
		mapName: matchMap.name,
	};
	send(match, data);
};

export const onMapEnd = (match: Match.Match, matchMap: IMatchMap) => {
	const data: IMapEndWebhook = {
		matchId: match.data.id,
		matchPassthrough: match.data.passthrough ?? null,
		type: EWebhookType.MAP_END,
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
