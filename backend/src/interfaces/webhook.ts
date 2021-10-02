import { IPlayer } from './player';
import { ITeam } from './team';

export enum EWebhookType {
	CHAT = 'CHAT',
	MAP_ELECTION_STEP = 'MAP_ELECTION_STEP',
	MAP_ELECTION_END = 'MAP_ELECTION_END',
	KNIFE_START = 'KNIFE_START',
	KNIFE_RESTART = 'KNIFE_RESTART',
	KNIFE_END = 'KNIFE_END',
	ROUND_END = 'ROUND_END',
	MAP_END = 'MAP_END',
	MATCH_END = 'MATCH_END',
}

export interface IWebhook {
	matchId: string;
	matchPassthrough?: string;
	type: EWebhookType;
}

export interface IChatWebhook extends IWebhook {
	type: EWebhookType.CHAT;
	player: IPlayer;
	message: string;
	isTeamChat: boolean;
}

export interface IRoundEndWebhook extends IWebhook {
	type: EWebhookType.ROUND_END;
	winnerTeam: ITeam;
	scoreTeamA: number;
	scoreTeamB: number;
}

export interface IMapEndWebhook extends IWebhook {
	type: EWebhookType.MAP_END;
	scoreTeamA: number;
	scoreTeamB: number;
}

export interface IMatchEndWebhook extends IWebhook {
	type: EWebhookType.MATCH_END;
	wonMapsTeamA: number;
	wonMapsTeamB: number;
}
