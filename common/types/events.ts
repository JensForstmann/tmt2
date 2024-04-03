import { TMapMode, TSideMode } from './electionStep';
import { IMatchResponse } from './match';
import { IPlayer } from './player';
import { TTeamSides } from './stuff';
import { ITeam, TTeamString } from './team';

export type EventType =
	| 'CHAT'
	| 'ELECTION_MAP_STEP'
	| 'ELECTION_SIDE_STEP'
	| 'MAP_ELECTION_END'
	// KNIFE_START = 'KNIFE_START',
	// KNIFE_RESTART = 'KNIFE_RESTART',
	| 'KNIFE_END'
	| 'ROUND_END'
	| 'MAP_START'
	| 'MAP_END'
	| 'MATCH_END'
	| 'LOG'
	| 'MATCH_CREATE'
	| 'MATCH_UPDATE';

export interface BaseEvent {
	/** ISO */
	timestamp: string;
	matchId: string;
	matchPassthrough: string | null;
	type: EventType;
}

export interface ChatEvent extends BaseEvent {
	type: 'CHAT';
	/** `null` when not a player (e.g. CONSOLE via rcon) */
	player: IPlayer | null;
	/** `null` when not a player (e.g. CONSOLE via rcon) */
	playerTeam: ITeam | null;
	message: string;
	isTeamChat: boolean;
	teamString?: TTeamString;
}

export interface ElectionEndEvent extends BaseEvent {
	type: 'MAP_ELECTION_END';
	mapNames: string[];
}

export interface RoundEndEvent extends BaseEvent {
	type: 'ROUND_END';
	mapIndex: number;
	mapName: string;
	/** number of maps that could be played */
	matchMapCount: number;
	winnerTeam: ITeam;
	scoreTeamA: number;
	scoreTeamB: number;
}

export interface MapEndEvent extends BaseEvent {
	type: 'MAP_END';
	mapIndex: number;
	mapName: string;
	/** number of maps that could be played */
	matchMapCount: number;
	scoreTeamA: number;
	scoreTeamB: number;
	/** winner of the map or null if it's a draw */
	winnerTeam: ITeam | null;
}

export interface MatchEndEvent extends BaseEvent {
	type: 'MATCH_END';
	/** number of maps team a has won including its advantage (if given) */
	wonMapsTeamA: number;
	/** number of maps team b has won including its advantage (if given) */
	wonMapsTeamB: number;
	/** winner of the match or null if it's a draw */
	winnerTeam: ITeam | null;
	/** all map results (but only for finished maps) */
	mapResults: {
		mapName: string;
		scoreTeamA: number;
		scoreTeamB: number;
		/** winner of the match or null if it's a draw */
		winnerTeam: ITeam | null;
	}[];
	/** number of maps that could have been played */
	matchMapCount: number;
}

export interface KnifeRoundEndEvent extends BaseEvent {
	type: 'KNIFE_END';
	mapIndex: number;
	mapName: string;
	/** number of maps that could be played */
	matchMapCount: number;
	winnerTeam: ITeam;
}

export interface MapStartEvent extends BaseEvent {
	type: 'MAP_START';
	mapIndex: number;
	mapName: string;
	/** number of maps that could be played */
	matchMapCount: number;
}

export interface LogEvent extends BaseEvent {
	type: 'LOG';
	message: string;
}

export interface ElectionMapStep extends BaseEvent {
	type: 'ELECTION_MAP_STEP';
	mode: TMapMode;
	mapName: string;
	pickerTeam?: ITeam;
}

export interface ElectionSideStep extends BaseEvent {
	type: 'ELECTION_SIDE_STEP';
	mode: TSideMode;
	pickerTeam?: ITeam;
	pickerSide?: TTeamSides;
	ctTeam?: ITeam;
	tTeam?: ITeam;
}

export interface MatchCreateEvent extends BaseEvent {
	type: 'MATCH_CREATE';
	match: IMatchResponse;
}

export interface MatchUpdateEvent extends BaseEvent {
	type: 'MATCH_UPDATE';
	path: Array<string | number>;
	value: any;
}

export type Event =
	| ChatEvent
	| ElectionEndEvent
	| RoundEndEvent
	| MapEndEvent
	| MatchEndEvent
	| KnifeRoundEndEvent
	| MapStartEvent
	| LogEvent
	| ElectionMapStep
	| ElectionSideStep
	| MatchCreateEvent
	| MatchUpdateEvent;
