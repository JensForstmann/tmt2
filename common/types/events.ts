import { IPlayer } from './player';
import { ITeam } from './team';

export type EventType =
	| 'CHAT'
	// MAP_ELECTION_STEP = 'MAP_ELECTION_STEP',
	| 'MAP_ELECTION_END'
	// KNIFE_START = 'KNIFE_START',
	// KNIFE_RESTART = 'KNIFE_RESTART',
	| 'KNIFE_END'
	| 'ROUND_END'
	| 'MAP_START'
	| 'MAP_END'
	| 'MATCH_END'
	| 'LOG';

export interface BaseEvent {
	/** ISO */
	timestamp: string;
	matchId: string;
	matchPassthrough: string | null;
	type: EventType;
}

export interface ChatEvent extends BaseEvent {
	type: 'CHAT';
	player: IPlayer | null;
	playerTeam: ITeam | null;
	message: string;
	isTeamChat: boolean;
}

export interface ElectionEndEvent extends BaseEvent {
	type: 'MAP_ELECTION_END';
	mapNames: string[];
}

export interface RoundEndEvent extends BaseEvent {
	type: 'ROUND_END';
	mapIndex: number;
	mapName: string;
	winnerTeam: ITeam;
	scoreTeamA: number;
	scoreTeamB: number;
}

export interface MapEndEvent extends BaseEvent {
	type: 'MAP_END';
	mapIndex: number;
	mapName: string;
	scoreTeamA: number;
	scoreTeamB: number;
	/** winner of the match or null if it's a draw */
	winnerTeam: ITeam | null;
}

export interface MatchEndEvent extends BaseEvent {
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

export interface KnifeRoundEndEvent extends BaseEvent {
	type: 'KNIFE_END';
	winnerTeam: ITeam;
}

export interface MapStartEvent extends BaseEvent {
	type: 'MAP_START';
	mapIndex: number;
	mapName: string;
}

export interface LogEvent extends BaseEvent {
	type: 'LOG';
	message: string;
}

export type Event =
	| ChatEvent
	| ElectionEndEvent
	| RoundEndEvent
	| MapEndEvent
	| MatchEndEvent
	| KnifeRoundEndEvent
	| MapStartEvent
	| LogEvent;
