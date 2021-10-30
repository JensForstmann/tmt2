import { IPlayer } from './player';
import { ITeam } from './team';

export enum EWebhookType {
	CHAT = 'CHAT',
	// MAP_ELECTION_STEP = 'MAP_ELECTION_STEP',
	MAP_ELECTION_END = 'MAP_ELECTION_END',
	// KNIFE_START = 'KNIFE_START',
	// KNIFE_RESTART = 'KNIFE_RESTART',
	KNIFE_END = 'KNIFE_END',
	ROUND_END = 'ROUND_END',
	MAP_START = 'MAP_START',
	MAP_END = 'MAP_END',
	MATCH_END = 'MATCH_END',
}

export interface IWebhook {
	matchId: string;
	matchPassthrough: string | null;
	type: EWebhookType;
}

export interface IChatWebhook extends IWebhook {
	type: EWebhookType.CHAT;
	player: IPlayer;
	playerTeam: ITeam | null;
	message: string;
	isTeamChat: boolean;
}

export interface IElectionEndWebhook extends IWebhook {
	type: EWebhookType.MAP_ELECTION_END;
	mapNames: string[];
}

export interface IRoundEndWebhook extends IWebhook {
	type: EWebhookType.ROUND_END;
	mapIndex: number;
	mapName: string;
	winnerTeam: ITeam;
	scoreTeamA: number;
	scoreTeamB: number;
}

export interface IMapEndWebhook extends IWebhook {
	type: EWebhookType.MAP_END;
	scoreTeamA: number;
	scoreTeamB: number;
	/** winner of the match or null if it's a draw */
	winnerTeam: ITeam | null;
}

export interface IMatchEndWebhook extends IWebhook {
	type: EWebhookType.MATCH_END;
	wonMapsTeamA: number;
	wonMapsTeamB: number;
	/** winner of the match or null if it's a draw */
	winnerTeam: ITeam | null;
	mapResults: {
		mapName: string;
		scoreTeamA: number;
		scoreTeamB: number;
		/** winner of the match or null if it's a draw */
		winnerTeam: ITeam | null;
	}[];
}

export interface IKnifeRoundEndWebhook extends IWebhook {
	type: EWebhookType.KNIFE_END;
	winnerTeam: ITeam;
}

export interface IMapStartWebhook extends IWebhook {
	type: EWebhookType.MAP_START;
	mapName: string;
}
