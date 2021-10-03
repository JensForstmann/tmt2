import axios from 'axios';
import { IMatchMap } from './interfaces/matchMap';
import { IPlayer } from './interfaces/player';
import { ITeam } from './interfaces/team';
import {
	EWebhookType,
	IChatWebhook,
	IMapEndWebhook,
	IMatchEndWebhook,
	IRoundEndWebhook,
	IWebhook,
} from './interfaces/webhook';
import * as Match from './match';

const send = (match: Match.Match, data: IWebhook) => {
	if (match.data.webhookUrl?.startsWith('http')) {
		axios.post(match.data.webhookUrl, data).catch((err) => {
			console.warn(`send webhook failed: ${err}`);
		});
	}
};

export const onKnifeRoundEnd = (match: Match.Match, matchMap: IMatchMap, winnerTeam: ITeam) => {
	// TODO
};

export const onRoundEnd = (match: Match.Match, matchMap: IMatchMap, winnerTeam: ITeam) => {
	const data: IRoundEndWebhook = {
		matchId: match.data.id,
		matchPassthrough: match.data.passthrough,
		type: EWebhookType.ROUND_END,
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
		matchPassthrough: match.data.passthrough,
		type: EWebhookType.CHAT,
		player: player,
		message: message,
		isTeamChat: isTeamChat,
	};
	send(match, data);
};

export const onMatchEnd = (match: Match.Match, wonMapsTeamA: number, wonMapsTeamB: number) => {
	const data: IMatchEndWebhook = {
		matchId: match.data.id,
		matchPassthrough: match.data.passthrough,
		type: EWebhookType.MATCH_END,
		wonMapsTeamA: wonMapsTeamA,
		wonMapsTeamB: wonMapsTeamB,
	};
	send(match, data);
};
export const onMapEnd = (match: Match.Match, matchMap: IMatchMap) => {
	const data: IMapEndWebhook = {
		matchId: match.data.id,
		matchPassthrough: match.data.passthrough,
		type: EWebhookType.MAP_END,
		scoreTeamA: matchMap.score.teamA,
		scoreTeamB: matchMap.score.teamB,
	};
	send(match, data);
};
