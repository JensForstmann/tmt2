import { IPlayer } from './player';
import { ITeam } from './team';

export type TWebhookType =
	| 'CHAT'
	// MAP_ELECTION_STEP = 'MAP_ELECTION_STEP',
	| 'MAP_ELECTION_END'
	// KNIFE_START = 'KNIFE_START',
	// KNIFE_RESTART = 'KNIFE_RESTART',
	| 'KNIFE_END'
	| 'ROUND_END'
	| 'MAP_START'
	| 'MAP_END'
	| 'MATCH_END';

export interface IWebhook {
	matchId: string;
	matchPassthrough: string | null;
	type: TWebhookType;
}

export interface IChatWebhook extends IWebhook {
	type: 'CHAT';
	player: IPlayer;
	playerTeam: ITeam | null;
	message: string;
	isTeamChat: boolean;
}

export interface IElectionEndWebhook extends IWebhook {
	type: 'MAP_ELECTION_END';
	mapNames: string[];
}

export interface IRoundEndWebhook extends IWebhook {
	type: 'ROUND_END';
	mapIndex: number;
	mapName: string;
	winnerTeam: ITeam;
	scoreTeamA: number;
	scoreTeamB: number;
}

export interface IMapEndWebhook extends IWebhook {
	type: 'MAP_END';
	mapIndex: number;
	mapName: string;
	scoreTeamA: number;
	scoreTeamB: number;
	/** winner of the match or null if it's a draw */
	winnerTeam: ITeam | null;
}

export interface IMatchEndWebhook extends IWebhook {
	type: 'MATCH_END';
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
	type: 'KNIFE_END';
	winnerTeam: ITeam;
}

export interface IMapStartWebhook extends IWebhook {
	type: 'MAP_START';
	mapIndex: number;
	mapName: string;
}
